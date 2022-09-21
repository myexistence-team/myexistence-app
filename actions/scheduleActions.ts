import { FirebaseError } from "firebase/app";
import { addDoc, collection, doc, getDoc, getDocs, query, updateDoc, where } from "firebase/firestore";
import { getDownloadURL, getStorage, ref, uploadBytes } from "firebase/storage";
import { AbsentStasuses, ExcuseStatuses, ScheduleStasuses } from "../constants/constants";
import { QRCodesErrors, SchedulesError } from "../errors";
import { firestore } from "../firebase";
import { QRCode, Schedule } from "../types";
import { getBlob } from "../utils/utilFunctions";

export async function createPresenceInSchedule(
  studentId: string,
  schoolId: string, 
  classId:string, 
  scheduleId: string, 
  qrCodeId: string
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
  console.log(classId, scheduleId, qrCodeId);
  const qrCodeRef = doc(
    firestore, 
    'schools', 
    ...[...schedulePath, 'qrCodes', qrCodeId]
  );
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
    if (schedule.status !== ScheduleStasuses.OPENED) {
      throw new FirebaseError(
        SchedulesError.SCHDEULE_HAS_NOT_OPENED,
        'Jadwal belum dibuka atau sudah berakhir.'
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
          const payload = {
            schedule: {
              start: schedule.start,
              end: schedule.end,
              tolerance: schedule.tolerance,
              openedAt: schedule.openedAt,
            },
            studentId,
            classId,
            teacherId: schedule.openedBy,
            status: AbsentStasuses.PRESENT,
            time: new Date(),
          }
          await addDoc(studentLogsRef, payload)
          Promise.resolve();
        }
      } else {
        throw new FirebaseError(
          QRCodesErrors.QRCODE_NOT_FOUND,
          'QR Code tidak ditemukan. Mohon coba lagi.'
        );
      }
    }
  } else {
    throw new FirebaseError(
      SchedulesError.SCHDEULE_NOT_FOUND,
      'Jadwal tidak ditemukan.'
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
  }
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
        openedAt: schedule.openedAt,
      },
      studentId,
      classId,
      teacherId: schedule.openedBy,
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
    await updateDoc(userRef, {
      currentScheduleId: scheduleId
    })
  } else {
    throw new FirebaseError(
      SchedulesError.SCHDEULE_NOT_FOUND,
      'Jadwal tidak ditemukan.'
    )
  }
}