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
import { getStartOfMonth, getStartOfWeek, getStartOfYear, groupBy } from '../../utils/utilFunctions'
import moment from 'moment'
import { collection, getDocs, query, where } from 'firebase/firestore'
import { firestore } from '../../firebase'
import MESpinner from '../../components/MESpinner'
import { ProfileRoles } from '../../constants/constants'
import MEButton from '../../components/MEButton'

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
  const [dateStart, setDateStart] = useState(getStartOfWeek());
  const [isLoading, setIsLoading] = useState(false);
  const [logs, setLogs] = useState<Log[]>([]);
  const [logsByStudent, setLogsByStudent] = useState<any>(null);
  const [quickDate, setQuickDate] = useState<'WEEK' | 'MONTH' | 'YEAR' | null>('WEEK');

  function handleQuickDateChange(qDate: 'WEEK' | 'MONTH' | 'YEAR') {
    setQuickDate(qDate);
  }

  useEffect(() => {
    switch(quickDate) {
      case 'MONTH':
        setDateStart(getStartOfMonth());
        break;
      case 'YEAR':
        setDateStart(getStartOfYear());
        break;
      case 'WEEK':
        setDateStart(getStartOfWeek());
        break;
      default:
        return;
    }
  }, [quickDate])

  function loadData() {
    const logsQuery = query(
      collection(firestore, 'schools', profile.schoolId, 'logs'),
      where('classId', '==', classId),
      where('studentId', 'in', studentIds),
      where('time', '>=', dateStart)
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
    if (profile.role === ProfileRoles.TEACHER) loadData();
  }, [dateStart])

  return (
    <MEContainer
      refreshing={isLoading}
      onRefresh={loadData}
    >
      <MEHeader/>
      {
        profile.role === ProfileRoles.TEACHER && (
          <View style={{ flexDirection: 'row', marginBottom: 8 }}>
            <MEButton
              fullWidth={false}
              variant={quickDate === 'WEEK' ? undefined : 'outline'}
              onPress={() => handleQuickDateChange('WEEK')}
              size='sm'
            >
              Minggu Ini
            </MEButton>
            <MEButton 
              variant={quickDate === 'MONTH' ? undefined : 'outline'}
              style={{ marginLeft: 8 }}
              onPress={() => handleQuickDateChange('MONTH')}
              fullWidth={false}
              size='sm'
            >
              Bulan Ini
            </MEButton>
            <MEButton 
              variant={quickDate === 'YEAR' ? undefined : 'outline'}
              style={{ marginLeft: 8 }}
              onPress={() => handleQuickDateChange('YEAR')}
              fullWidth={false}
              size='sm'
            >
              Tahun Ini
            </MEButton>
          </View>
        )
      }
      {
        isLoading ? (
          <MESpinner/>
        ) : (
          <>
            {
              profile.role === ProfileRoles.TEACHER && (
                <Text style={[textStyles.body2, { marginBottom: 16 }]}>Data kehadiran dihitung dari {moment(dateStart).format('LL')}.</Text>
              )
            }
            {
              students?.map((s, sIdx) => (
                <ClassDetailsStudentCard
                  classId={classId}
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