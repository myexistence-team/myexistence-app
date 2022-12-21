import { FirebaseError } from "firebase/app";
import { addDoc, collection, deleteDoc, doc, GeoPoint, getDoc, getDocs, getFirestore, query, setDoc, updateDoc, where, writeBatch } from "firebase/firestore";
import { getDownloadURL, getStorage, ref, uploadBytes } from "firebase/storage";
import { Alert } from "react-native";
import { AbsentStasuses, ExcuseStatuses, ScheduleOpenMethods, ScheduleStasuses } from "../constants/constants";
import { QRCodesErrors, SchedulesError } from "../errors";
import { app, firestore } from "../firebase";
import { QRCode, Schedule } from "../types";
import { getBlob } from "../utils/utilFunctions";

export async function createPresenceInSchedule(
  studentId: string,
  schoolId: string, 
  classId:string, 
  scheduleId: string, 
  qrCodeId?: string
) {
  const schedulePath = [
    schoolId,
    'classes',
    classId,
    'schedules',
    scheduleId,
  ]
  const userRef = doc(firestore, 'users', studentId);
  const scheduleRef = doc(firestore, 'schools', ...schedulePath);
  let qrCodeRef;
  if (qrCodeId) {
    qrCodeRef = doc(
      firestore, 
      'schools', 
      ...[...schedulePath, 'qrCodes', qrCodeId]
    );
  }
  const studentLogsRef = collection(
    firestore, 
    'schools', 
    ...[...schedulePath, 'studentLogs']
  );

  const studentLogsQuery = query(
    studentLogsRef,
    where('studentId', '==', studentId)
  )

  const scheduleSnap = await getDoc(scheduleRef);
  if (scheduleSnap.exists()) {
    const schedule: Schedule | any = scheduleSnap.data();
    const now = new Date();
    const tolSchedule = schedule.start.toDate();
    const scheduleNow = new Date();
    scheduleNow.setHours(tolSchedule.getHours());
    scheduleNow.setMinutes(tolSchedule.getMinutes());
    scheduleNow.setSeconds(tolSchedule.getSeconds());
    const milliTolerance = schedule.tolerance * 1000 * 60
    const scheduleNowDate = new Date(scheduleNow.getTime() + milliTolerance)
    const studentLogPayload = {
      schedule: {
        start: schedule.start,
        end: schedule.end,
        tolerance: schedule.tolerance,
        openedAt: schedule.openedAt || null,
      },
      scheduleId: scheduleSnap.id,
      studentId,
      schoolId,
      classId,
      teacherId: schedule.openedBy,
      status: now > scheduleNowDate?AbsentStasuses.LATE : AbsentStasuses.PRESENT,
      time: new Date(),
    }
    if (schedule.status !== ScheduleStasuses.OPENED) {
      throw new FirebaseError(
        SchedulesError.SCHDEULE_HAS_NOT_OPENED,
        'Sesi kelas belum dibuka atau sudah berakhir.'
      )
    } else {
      await updateDoc(userRef, {
        currentScheduleId: scheduleId
      })
      const studentLogsSnap = await getDocs(studentLogsQuery);
      if (!studentLogsSnap.empty) {
        throw new FirebaseError(
          SchedulesError.SCHDEULE_ALREADY_LOGGED,
          'Anda sudah hadir untuk jadwal ini.'
        )
      }
      if (qrCodeRef) {
        const qrCodeSnap = await getDoc(qrCodeRef);
        if (qrCodeSnap.exists()) {
          const qrCode: QRCode | any = qrCodeSnap.data();
          if (qrCode.scanned) {
            throw new FirebaseError(
              QRCodesErrors.QRCODE_ALREADY_SCANNED,
              'QR code sudah pernah dipindai. Mohon coba lagi.'
            );
          } else {
            await updateDoc(qrCodeRef, {
              scanned: true
            })
            await addDoc(studentLogsRef, studentLogPayload)
            Promise.resolve();
          }
        } else {
          throw new FirebaseError(
            QRCodesErrors.QRCODE_NOT_FOUND,
            'QR Code tidak ditemukan. Mohon coba lagi.'
          );
        }
      } else {
        await addDoc(studentLogsRef, studentLogPayload)
      }
    }
  } else {
    throw new FirebaseError(
      SchedulesError.SCHDEULE_NOT_FOUND,
      'Sesi kelas tidak ditemukan.'
    )
  }
}

export async function createExcuseRequest(
  studentId: string,
  schoolId: string, 
  classId:string, 
  scheduleId: string,
  excuse: {
    type: 'SICK' | 'OTHER' | string,
    message: string,
    proofUri: string,
  },
) {
  const schedulePath = [
    schoolId,
    'classes',
    classId,
    'schedules',
    scheduleId,
  ];
  const scheduleRef = doc(firestore, 'schools', ...schedulePath);
  const studentLogsRef = collection(
    firestore, 
    'schools', 
    ...[...schedulePath, 'studentLogs']
  );

  const userRef = doc(firestore, 'users', studentId);
  const scheduleSnap = await getDoc(scheduleRef);
  if (scheduleSnap.exists()) {
    const storage = getStorage();
    const storageRef = ref(storage, `proofPhotos/${studentId}-${scheduleId}`); 
    const blob: any = await getBlob(excuse.proofUri)
    const uploadSnap = await uploadBytes(storageRef, blob);
    const proofUrl = await getDownloadURL(uploadSnap.ref);
    const schedule: Schedule | any = scheduleSnap.data();
    const payload = {
      schedule: {
        start: schedule.start,
        end: schedule.end,
        tolerance: schedule.tolerance,
        ...schedule.openedAt ? { openedAt: schedule.openedAt } : {}
      },
      scheduleId: scheduleSnap.id,
      schoolId,
      studentId,
      classId,
      ...schedule.openedBy ? {teacherId: schedule.openedBy} : {},
      status: AbsentStasuses.EXCUSED,
      time: new Date(),
      excuse: {
        message: excuse.message,
        type: excuse.type,
        proofUrl
      },
      excuseStatus: ExcuseStatuses.WAITING
    }
    await addDoc(studentLogsRef, payload);
    if (schedule.openedAt && schedule.openedBy) {
      await updateDoc(userRef, {
        currentScheduleId: scheduleId
      })
    }
  } else {
    throw new FirebaseError(
      SchedulesError.SCHDEULE_NOT_FOUND,
      'Sesi kelas tidak ditemukan.'
    )
  }
}

export async function openSchedule(args: {
  schoolId: string,
  classId: string,
  scheduleId: string,
  teacherId: string,
  openMethod: ScheduleOpenMethods,
  location?: {
    latitude: number,
    longitude: number,
  }
}) {
  const {
    scheduleId, schoolId, classId, openMethod, teacherId, location
  } = args;

  if (!location && openMethod === ScheduleOpenMethods.GEOLOCATION) {
    Alert.alert(
      "Lokasi Tidak Terdeteksi",
      "Mohon aktifkan lokasi Anda untuk membuka kelas menggunakan geolocation",
      [
        {
          text: "Coba Lagi",
          onPress: () => {
            return;
          }
        }, {
          text: "OK",
          onPress: () => {
            openSchedule(args);
          }
        },
      ]
    )
    return;
  }
  
  const batch = writeBatch(firestore);
  const schedulePath = [
    schoolId,
    'classes',
    classId,
    'schedules',
    scheduleId,
  ];

  const classSnap = await getDoc(
    doc(
      firestore,
      'schools',
      schoolId,
      'classes',
      classId
    )
  );
  
  if (classSnap.exists()) {
    const classObj = classSnap.data();
  
    if (classObj.studentIds?.length) {
      classObj.studentIds.forEach((studentId: string) => {
        batch.set(
          doc(collection(
            firestore,
            'schools',
            ...schedulePath,
            'qrCodes',
          )), {
            scanned: false
          }
        )
      })
    } 
  
    await batch.commit();
    
    await updateDoc(
      doc(
        firestore,
        'schools',
        ...schedulePath
      ), {
        status: ScheduleStasuses.OPENED,
        openMethod,
        openedAt: new Date(),
        openedBy: teacherId,
        ...location ? {
          location: new GeoPoint(location.latitude, location.longitude),
        } : {}
      }
    )

    await updateDoc(doc(firestore, 'users', teacherId), {
      currentScheduleId: scheduleId
    })
  } else {
    throw new FirebaseError(
      SchedulesError.SCHDEULE_NOT_FOUND,
      'Sesi kelas tidak ditemukan!'
    )
  }
}

export async function closeSchedule({ classId,scheduleId,schoolId,teacherId }: {
  schoolId: string,
  classId: string,
  scheduleId: string,
  teacherId: string
}) {
  const schedulePath = [
    schoolId,
    'classes',
    classId,
    'schedules',
    scheduleId,
  ];
  await updateDoc(
    doc(
      firestore,
      'schools',
      ...schedulePath
    ), {
      status: ScheduleStasuses.CLOSED,
      location: null
    }
  );
  const batch = writeBatch(firestore);
  
  const studentLogsRef = collection(
    firestore,
    'schools',
    ...schedulePath,
    'studentLogs'
  );
  const qrCodesRef = collection(
    firestore,
    'schools',
    ...schedulePath,
    'qrCodes'
  );
  const classRef = doc(
    firestore,
    'schools',
    schoolId,
    'classes',
    classId
  );
  const logsRef = collection(
    firestore,
    'schools',
    schoolId,
    'logs'
  );
  const scheduleRef = doc(firestore, 'schools', ...schedulePath);

  
  // Deletes all QR Codes
  const qrCodeSnaps = await getDocs(qrCodesRef);
  if (!qrCodeSnaps.empty) {
    qrCodeSnaps.docs.forEach((snap) => {
      batch.delete(snap.ref);
    })
  }

  const classSnap = await getDoc(classRef);
  if (classSnap.exists()) {
    const presentStudentIds: string[] = [];
    const classStudentIds = classSnap.data().studentIds;
    
    // Delete and add to (move) studentLogs to logs collection
    const studentLogSnaps = await getDocs(studentLogsRef);
    if (!studentLogSnaps.empty) {
      studentLogSnaps.docs.forEach((snap) => {
        const studentLog = snap.data();
        presentStudentIds.push(studentLog.studentId);
        batch.delete(snap.ref);
        batch.set(doc(logsRef), studentLog);
      });
    }
    
    // Add logs data for absent students
    const absentStudentIds: string[] = classStudentIds.filter((sId: string) => !presentStudentIds.includes(sId));
    if (absentStudentIds.length) {
      const scheduleSnap = await getDoc(scheduleRef);
      if (scheduleSnap.exists()) {
        const schedule = scheduleSnap.data();
        absentStudentIds.forEach((studentId) => {
          batch.set(doc(logsRef), {
            schedule: {
              start: schedule.start,
              end: schedule.end,
              tolerance: schedule.tolerance,
              openedAt: schedule.openedAt,
            },
            scheduleId: scheduleSnap.id,
            studentId,
            classId,
            teacherId: schedule.openedBy,
            status: AbsentStasuses.ABSENT,
            time: new Date()
          })
        })
      }
    }
  }

  await batch.commit();

  await updateDoc(
    doc(firestore, 'users', teacherId), {
      currentScheduleId: null
    }
  )
}

export async function createUpdateStudentPresenceFromCallout({
  scheduleId,
  studentId,
  classId,
  schoolId,
  status,
  studentLogId,
  forceStatus = false,
}: {
  scheduleId: string,
  studentId: string,
  classId: string,
  schoolId: string,
  status: AbsentStasuses,
  studentLogId?: string,
  forceStatus?: boolean
}
) {
  const studentRef = doc(firestore, 'users', studentId);
  const scheduleRef = doc(firestore, "schools", schoolId, "classes", classId, "schedules", scheduleId);
  const studentLogsRef = collection(firestore, scheduleRef.path, "studentLogs");

  const scheduleSnap = await getDoc(scheduleRef);
  const schedule = scheduleSnap.data();

  if (schedule && schedule.status === ScheduleStasuses.OPENED) {
    const now = new Date();
    const tolSchedule = schedule.start.toDate();
    const scheduleNow = new Date();
    scheduleNow.setHours(tolSchedule.getHours());
    scheduleNow.setMinutes(tolSchedule.getMinutes());
    scheduleNow.setSeconds(tolSchedule.getSeconds());
    const milliTolerance = schedule.tolerance * 1000 * 60
    const scheduleNowDate = new Date(scheduleNow.getTime() + milliTolerance)
    const newLog = {
      schedule: {
        start: schedule.start,
        end: schedule.end,
        tolerance: schedule.tolerance,
        openedAt: schedule.openedAt,
      },
      scheduleId: scheduleSnap.id,
      schoolId,
      studentId,
      classId,
      teacherId: schedule.openedBy,
      status: forceStatus ? status : status === AbsentStasuses.PRESENT ? 
        now > scheduleNowDate? AbsentStasuses.LATE : 
        AbsentStasuses.PRESENT : AbsentStasuses.ABSENT,
      time: new Date(),
    }

    if (studentLogId) {
      const studentLogRef = doc(firestore, studentLogsRef.path, studentLogId);
      await updateDoc(studentLogRef, newLog);
    } else {
      await addDoc(studentLogsRef, newLog);
    }

    await updateDoc(studentRef, {
      currentScheduleId: schedule.id
    })
  } else {
    Alert.alert('Sesi Kelas Sudah Ditutup', 'Sesi kelas sudah ditutup. Mohon pilih sesi lainnya.')
  }
}

export async function studentExcuseStatusChange({
  scheduleId,
  classId,
  schoolId,
  studentLogId,
  excuseStatus,
  updatedById,
}: {
  scheduleId: string,
  classId: string,
  schoolId: string,
  studentLogId: string,
  updatedById: string,
  excuseStatus: ExcuseStatuses
}) {
  const studentLogRef = doc(
    firestore, 
    "schools", 
    schoolId, 
    "classes", 
    classId, 
    "schedules", 
    scheduleId, 
    "studentLogs", 
    studentLogId
  );

  const studentLogSnap = await getDoc(studentLogRef);
  const studentLog = studentLogSnap.data();
  const newStudentLog = { ...studentLog, excuseStatus, updatedBy: updatedById, updatedAt: new Date() };
  await updateDoc(studentLogRef, newStudentLog);
}

export async function deleteStudentExcuse({
  classId,
  scheduleId,
  schoolId,
  studentLogId
}: {
  scheduleId: string,
  classId: string,
  schoolId: string,
  studentLogId: string,
}) {
  const studentLogRef = doc(
    firestore, 
    "schools", 
    schoolId, 
    "classes", 
    classId, 
    "schedules", 
    scheduleId, 
    "studentLogs", 
    studentLogId
  );
  await deleteDoc(studentLogRef);
}