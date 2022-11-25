import { View, Text } from 'react-native'
import React, { useContext, useEffect, useState } from 'react'
import { Log, LogCountByClass } from '../../types';
import { textStyles } from '../../constants/Styles';
import TeacherHistoryCard from '../../components/TeacherHistoryCard';
import { collection, getDocs, orderBy, query, where } from 'firebase/firestore';
import { firestore } from '../../firebase';
import { AuthContext, ClassesContext, ProfileContext } from '../../contexts';
import { getStartOfMonth, getStartOfWeek, getStartOfYear, groupBy } from '../../utils/utilFunctions';
import { AbsentStasuses } from '../../constants/constants';
import MESpinner from '../../components/MESpinner';
import MEButton from '../../components/MEButton';
import moment from 'moment';

export default function TeacherHistory() {
  const { profile } = useContext(ProfileContext);
  const { auth } = useContext(AuthContext);
  const [groupedLogs, setGroupedLogs] = useState<LogCountByClass[]>([]);
  const { classes } = useContext(ClassesContext);
  const [isLoading, setIsLoading] = useState(true);
  const [dateStart, setDateStart] = useState(getStartOfWeek());
  const [quickDate, setQuickDate] = useState<'WEEK' | 'MONTH' | 'YEAR' | null>('WEEK');

  function loadTeacherData() {
    if (profile.classIds?.length) {
      const teacherLogsQuery = query(collection(
        firestore, 
        `schools/${profile.schoolId}/logs`),
        where('teacherId', '==', auth.uid),
        where('time', '>=', dateStart),
      );
      setIsLoading(true);
      getDocs(teacherLogsQuery).then((docSnaps) => {
        const docsArr: any[] = [];
        docSnaps.forEach((doc) => {
          docsArr.push({ ...doc.data(), id: doc.id });
        })
        console.log(docsArr)
        const logsGroupedByClassCount: LogCountByClass[] = Object.entries(groupBy(docsArr, 'classId')).map((a: any) => {
          return {
            classId: a[0], 
            className: classes?.find((c) => c.id === a[0])?.name,
            counts: Object.entries(groupBy(a[1], 'scheduleId')).map((b: any) => ({
              scheduleId: b[0],
              schedule: b[1][0].schedule,
              presentCount: b[1].filter((log: Log) => log.status === AbsentStasuses.PRESENT).length,
              absentCount: b[1].filter((log: Log) => log.status === AbsentStasuses.ABSENT).length,
              lateCount: b[1].filter((log: Log) => log.status === AbsentStasuses.LATE).length,
              excusedCount: b[1].filter((log: Log) => log.status === AbsentStasuses.EXCUSED).length,
            }))
          }
        })
        setGroupedLogs(logsGroupedByClassCount);
        setIsLoading(false);
      })
    } else {
      setIsLoading(false);
    }
  }

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

  useEffect(() => {
    loadTeacherData()
  }, [dateStart])

  return (
    <>
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
      <Text style={[textStyles.body2, { marginBottom: 16 }]}>Dihitung mulai tanggal {moment(dateStart).format("LL")}</Text>
      {
        isLoading ? (
          <MESpinner/>
        ) : (
          <>
            {
              groupedLogs.map((c, idx) => (
                <View key={idx} style={{ marginBottom: 16 }}>
                  <Text style={[textStyles.heading4, { marginBottom: 16 }]}>
                    {c.className}
                  </Text>
                  {
                    c.counts.map((scheduleLog, slIdx) => {
                      return (
                        <TeacherHistoryCard
                          scheduleLog={scheduleLog}
                          key={slIdx}
                        />
                      )
                    })
                  }
                </View>
              ))
            }
          </>
        )
      }
    </>
  )
}