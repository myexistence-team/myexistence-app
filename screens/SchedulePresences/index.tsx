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

export default function SchedulePresences({
  route: {
    params: {
      classId,
      scheduleId
    }
  }
}: NativeStackScreenProps<ScheduleParamList, "ScheduleDetails">) {
  const [isLoading, setIsLoading] = useState(false);
  const [status, setStatus] = useState(null);
  const [students, setStudents] = useState<any[]>([]);
  const [studentLogs, setStudentLogs] = useState<any>({});

  const {profile} = useContext(ProfileContext);

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
    onSnapshot(collection(
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
        studentLogsData[l.data().studentId] = l.data().status;
      });
      setStudentLogs(studentLogsData);
    });
  }

  useEffect(() => {
    loadData();
  }, [])

  return (
    <MEContainer
      refreshing={isLoading}
      onRefresh={loadData}
    >
      <MEHeader
        title={`Pelajar (${students.length})`}
      />
      {
        isLoading ? (
          <MESpinner/>
        ) : (
          <>
            {
              students.map((s, idx) => (
                <StudentCard key={idx} student={s} status={studentLogs[s.id]}/>
              ))
            }
          </>
        )
      }
    </MEContainer>
  )
}