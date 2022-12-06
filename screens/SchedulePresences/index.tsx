import { View, Text } from 'react-native'
import React, { useContext, useEffect, useState } from 'react'
import { NativeStackScreenProps } from '@react-navigation/native-stack'
import { ScheduleParamList } from '../../navTypes'
import MEContainer from '../../components/MEContainer'
import MEHeader from '../../components/MEHeader'
import { collection, documentId, getDocs, onSnapshot, query, where } from 'firebase/firestore'
import { firestore } from '../../firebase'
import { ClassesContext, ProfileContext, UsersContext } from '../../contexts'
import MESpinner from '../../components/MESpinner'
import StudentCard from '../../components/StudentCard'
import { textStyles } from '../../constants/Styles'
import { AbsentStasuses } from '../../constants/constants'
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
  const [studentLogs, setStudentLogs] = useState<{[key: string]: Log}>({});
  
  const {profile} = useContext(ProfileContext);
  const {users, setUsers} = useContext(UsersContext);
  const {classes} = useContext(ClassesContext);
  const classroom = classes?.find((c) => c.id === classId);
  const students = classroom?.studentIds?.map((sId) => users?.[sId]).filter((s) => s !== undefined) || [];

  function loadData() {
    setIsLoading(true);
    const notStoredIds: string[] = classroom?.studentIds.filter((sId: string) => !Object.keys(users).includes(sId)) || [];
    if (notStoredIds.length) {
      getDocs(
        query(collection(firestore,`users`),
        where(documentId(), 'in', notStoredIds)
      )).then((studentSnaps) => {
        const userObjs = studentSnaps.docs.reduce((a, b) => ({ ...a, [b.id]: { ...b.data(), id: b.id } }), {});
        setUsers((prevUsers: any) => ({ ...prevUsers, ...userObjs }));
        setIsLoading(false);
      })
    } else {
      setIsLoading(false);
    }
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

  return (
    <MEContainer
      refreshing={isLoading}
      onRefresh={loadData}
    >
      <MEHeader
        title={`Pelajar (${students.length})`}
      />
      <View style={{ flexDirection: 'row', marginBottom: 16 }}>
        <View style={{ flex: 1, alignItems: 'center' }}>
          <Text style={textStyles.body2}>Hadir</Text>
          <Text 
            style={[textStyles.body1]}
          >
            {presentCount}
          </Text>
        </View>
        <View style={{ flex: 1, alignItems: 'center' }}>
          <Text style={textStyles.body2}>Izin</Text>
          <Text 
            style={[textStyles.body1]}
          >
            {excusedCount}
          </Text>
        </View>
        <View style={{ flex: 1, alignItems: 'center' }}>
          <Text style={textStyles.body2}>Terlambat</Text>
          <Text 
            style={[textStyles.body1]}
          >
            {lateCount}
          </Text>
        </View>
        <View style={{ flex: 1, alignItems: 'center' }}>
          <Text style={textStyles.body2}>Absen</Text>
          <Text 
            style={[textStyles.body1]}
          >
            {absentCount}
          </Text>
        </View>
      </View>
      {
        isLoading && !students.length && Object.keys(studentLogs).length ? (
          <MESpinner/>
        ) : (
          <>
            {
              students.map((s, idx) => (
                <StudentCard 
                  key={idx} 
                  student={s} 
                  log={studentLogs[s.id]}
                  onPress={() => {
                    navigation.navigate('SchedulePresenceDetails', {
                      logId: studentLogs[s.id].id,
                      isStudentLog: true,
                      scheduleId,
                      classId,
                      studentId: s.id,
                      log: studentLogs[s.id]
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