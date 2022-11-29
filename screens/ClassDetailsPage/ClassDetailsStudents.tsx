import { View, Text } from 'react-native'
import React, { useContext, useEffect, useState } from 'react'
import { NativeStackScreenProps } from '@react-navigation/native-stack'
import { ClassParamList } from '../../navTypes'
import { Log, Profile } from '../../types'
import { ProfileContext, UsersContext } from '../../contexts'
import MEContainer from '../../components/MEContainer'
import ClassDetailsStudentCard from '../../components/ClassDetailsStudentCard'
import MEHeader from '../../components/MEHeader'
import { textStyles } from '../../constants/Styles'
import { getStartOfWeek, groupBy } from '../../utils/utilFunctions'
import moment from 'moment'
import { collection, getDocs, query, where } from 'firebase/firestore'
import { firestore } from '../../firebase'
import MESpinner from '../../components/MESpinner'

export default function ClassDetailsStudents({
  route: {
    params: {
      classId,
      studentIds
    }
  }
}: NativeStackScreenProps<ClassParamList, "ClassDetailsStudents">) {
  const { users } = useContext(UsersContext);
  const { profile } = useContext(ProfileContext);
  const students: Profile[] = studentIds.map((sId) => (users?.[sId]));
  const startOfWeek = getStartOfWeek();
  const [isLoading, setIsLoading] = useState(false);
  const [logs, setLogs] = useState<Log[]>([]);
  const [logsByStudent, setLogsByStudent] = useState<any>(null);


  function loadData() {
    const logsQuery = query(
      collection(firestore, 'schools', profile.schoolId, 'logs'),
      where('classId', '==', classId),
      where('studentId', 'in', studentIds),
      where('time', '>=', startOfWeek)
    );
    setIsLoading(true);
    getDocs(logsQuery).then((docSnaps) => {
      setLogsByStudent(
        groupBy(docSnaps.docs.map((doc) => ({
          ...doc.data(), id: doc.id
        })), 'studentId')
      );
    })
    .finally(() => {
      setIsLoading(false);
    })
  }

  useEffect(() => {
    loadData();
  }, [])

  return (
    <MEContainer
      refreshing={isLoading}
      onRefresh={loadData}
    >
      <MEHeader/>
      {
        isLoading ? (
          <MESpinner/>
        ) : (
          <>
            <Text style={[textStyles.body2, { marginBottom: 16 }]}>Data kehadiran dihitung dari {moment(startOfWeek).format('LL')}.</Text>
            {
              students?.map((s, sIdx) => (
                <ClassDetailsStudentCard
                  key={sIdx}
                  style={{
                    marginBottom: 16
                  }}
                  student={s}
                  logs={logsByStudent?.[s.id]}
                />
              ))
            }
          </>
        )
      }
    </MEContainer>
  )
}