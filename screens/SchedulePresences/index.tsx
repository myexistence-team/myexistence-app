import { View, Text } from 'react-native'
import React, { useContext, useEffect, useState } from 'react'
import { NativeStackScreenProps } from '@react-navigation/native-stack'
import { ScheduleParamList } from '../../navTypes'
import MEContainer from '../../components/MEContainer'
import MEHeader from '../../components/MEHeader'
import { collection, doc, documentId, getDoc, getDocs, onSnapshot, query, where } from 'firebase/firestore'
import { firestore } from '../../firebase'
import { ProfileContext } from '../../contexts'
import MESpinner from '../../components/MESpinner'
import StudentCard from '../../components/StudentCard'
import { textStyles } from '../../constants/Styles'
import MEPressableText from '../../components/MEPressableText'
import { AbsentStasuses } from '../../constants/constants'
import Colors from '../../constants/Colors'
import { Log } from '../../types'

export default function SchedulePresences({
  route: {
    params: {
      classId,
      scheduleId
    }
  },
  navigation
}: NativeStackScreenProps<ScheduleParamList, "ScheduleDetails">) {
  const [isLoading, setIsLoading] = useState(false);
  const [classroom, setClassroom] = useState<any>(null);
  const [status, setStatus] = useState<null | string>(null);
  const [students, setStudents] = useState<any[]>([]);
  const [filteredStudents, setFilteredStudents] = useState<any[]>([]);
  const [studentLogs, setStudentLogs] = useState<{[key: string]: Log}>({});

  const {profile} = useContext(ProfileContext);

  useEffect(() => {
    if (status && Object.keys(studentLogs).length) {
      var filteredStudentIds: string[] = []
      if (status === AbsentStasuses.ABSENT) {
        filteredStudentIds = students.map((s) => s.id).filter((sId) => !Object.keys(studentLogs).includes(sId));
      } else {
        filteredStudentIds = Object.entries(studentLogs).filter((l) => l[1].status === status).map((l) => l[0]);
      }
      setFilteredStudents(students.filter((s) => filteredStudentIds.includes(s.id)));
    } else {
      setFilteredStudents(students);
    }
  }, [studentLogs, students, status])

  function loadData() {
    setIsLoading(true);
    getDoc(doc(
      firestore, 
      'schools',
      profile.schoolId,
      'classes',
      classId
    )).then((classSnap) => {
      if (classSnap.exists()) {
        setClassroom({ ...classSnap.data(), id: classSnap.id });
        getDocs(query(collection(
          firestore,
          'users',
        ), where(
          documentId(), 
          'in', 
          classSnap.data().studentIds
        ))).then((studentSnaps) => {
          if (!studentSnaps.empty) {
            setStudents(studentSnaps.docs.map((doc) => ({ ...doc.data(), id: doc.id })));
            setIsLoading(false);
          }
        })
      }
    });
    return onSnapshot(collection(
      firestore,
      'schools',
      profile.schoolId,
      'classes',
      classId,
      'schedules',
      scheduleId,
      'studentLogs'
    ), (logSnaps) => {
      var studentLogsData: any = {};
      logSnaps.docs.forEach((l) => { 
        studentLogsData[l.data().studentId] = {...l.data(), id: l.id};
      });
      setStudentLogs(studentLogsData);
    });
  }

  const studentLogsArr = Object.values(studentLogs);
  const presentCount = studentLogsArr.filter((s: Log) => s.status === AbsentStasuses.PRESENT).length;
  const lateCount = studentLogsArr.filter((s: Log) => s.status === AbsentStasuses.LATE).length;
  const excusedCount = studentLogsArr.filter((s: Log) => s.status === AbsentStasuses.EXCUSED).length;
  const absentCount = Math.max(0, students.length - presentCount - lateCount - excusedCount);

  useEffect(() => {
    const unsub = loadData();
    return () => unsub();
  }, [])

  function handleChangeStatus(stat: string) {
    setStatus((prevStatus) => (prevStatus === stat ? null : stat));
  }

  return (
    <MEContainer
      refreshing={isLoading}
      onRefresh={loadData}
    >
      <MEHeader
        title={`Pelajar (${students.length})`}
      />
      <View style={{ flexDirection: 'row' }}>
        <View style={{ flex: 1, alignItems: 'center' }}>
          <Text style={textStyles.body2}>Hadir</Text>
          <MEPressableText 
            style={[textStyles.body1, { 
              fontFamily: 'manrope-bold', 
              marginBottom: 16,
              ...status === AbsentStasuses.PRESENT ? {
                color: Colors.light.black 
              } : {}
            }]}
            onPress={() => handleChangeStatus(AbsentStasuses.PRESENT)}
          >
            {presentCount}
          </MEPressableText>
        </View>
        <View style={{ flex: 1, alignItems: 'center' }}>
          <Text style={textStyles.body2}>Izin</Text>
          <MEPressableText 
            style={[textStyles.body1, { 
              fontFamily: 'manrope-bold', 
              marginBottom: 16,
              ...status === AbsentStasuses.EXCUSED ? {
                color: Colors.light.black 
              } : {}
            }]}
            onPress={() => handleChangeStatus(AbsentStasuses.EXCUSED)}
          >
            {excusedCount}
          </MEPressableText>
        </View>
        <View style={{ flex: 1, alignItems: 'center' }}>
          <Text style={textStyles.body2}>Terlambat</Text>
          <MEPressableText 
            style={[textStyles.body1, { 
              fontFamily: 'manrope-bold', 
              marginBottom: 16,
              ...status === AbsentStasuses.LATE ? {
                color: Colors.light.black 
              } : {}
            }]}
            onPress={() => handleChangeStatus(AbsentStasuses.LATE)}
          >
            {lateCount}
          </MEPressableText>
        </View>
        <View style={{ flex: 1, alignItems: 'center' }}>
          <Text style={textStyles.body2}>Absen</Text>
          <MEPressableText 
            style={[textStyles.body1, { 
              fontFamily: 'manrope-bold', 
              marginBottom: 16,
              ...status === AbsentStasuses.ABSENT ? {
                color: Colors.light.black 
              } : {}
            }]}
            onPress={() => handleChangeStatus(AbsentStasuses.ABSENT)}
          >
            {absentCount}
          </MEPressableText>
        </View>
      </View>
      {
        isLoading && filteredStudents.length ? (
          <MESpinner/>
        ) : (
          <>
            {
              filteredStudents.map((s, idx) => (
                <StudentCard 
                  key={idx} 
                  student={s} 
                  status={studentLogs[s.id]?.status}
                  onPress={!studentLogs[s.id] ? undefined : () => {
                    navigation.navigate('SchedulePresenceDetails', {
                      logId: studentLogs[s.id].id,
                      isStudentLog: true,
                      scheduleId,
                      classId,
                      presence: {
                        studentName: s.displayName,
                        studentId: s.id,
                        className: classroom.name,
                        classId: studentLogs[s.id]?.classId,
                        status: studentLogs[s.id]?.status,
                        start: studentLogs[s.id]?.schedule.start,
                        end: studentLogs[s.id]?.schedule.end,
                        time: studentLogs[s.id]?.time,
                        excuse: studentLogs[s.id]?.excuse,
                      }
                    })
                  }}
                />
              ))
            }
          </>
        )
      }
    </MEContainer>
  )
}