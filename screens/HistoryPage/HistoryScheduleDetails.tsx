import { View, Text } from 'react-native'
import React, { useContext, useEffect, useState } from 'react'
import { NativeStackScreenProps } from '@react-navigation/native-stack'
import { HistoryPageParamList } from '../../navTypes'
import { ClassesContext, ProfileContext } from '../../contexts'
import { Log, Schedule } from '../../types'
import { collection, doc, getDoc, getDocs, orderBy, query, where } from 'firebase/firestore'
import { firestore } from '../../firebase'
import moment from 'moment'
import { groupBy, percentage } from '../../utils/utilFunctions'
import { AbsentStasuses } from '../../constants/constants'
import MEContainer from '../../components/MEContainer'
import MEHeader from '../../components/MEHeader'
import MECard from '../../components/MECard'
import { textStyles } from '../../constants/Styles'
import MESpinner from '../../components/MESpinner'
import { useNavigation } from '@react-navigation/native'
import MEPressableText from '../../components/MEPressableText'

export default function HistoryScheduleDetails({
  route: {
    params: {
      classId,
      scheduleId,
    }
  }
}: NativeStackScreenProps<HistoryPageParamList, 'HistoryScheduleDetails'>) {
  const navigation = useNavigation();
  const { classes } = useContext(ClassesContext);
  const { profile } = useContext(ProfileContext);
  const classroom = classes.find((c) => c.id === classId);
  const [isLoading, setIsLoading] = useState(false);
  const [schedule, setSchedule] = useState<Schedule | null>(null);
  const [scheduleLogsGroup, setScheduleLogsGroup] = useState<any[]>([]);

  function loadData() {
    setIsLoading(true);
    getDoc(doc(
      firestore, 
      'schools',
      profile.schoolId,
      'classes',
      classId,
      'schedules',
      scheduleId,
    )).then((doc) => {
      setSchedule(doc.data());
      getDocs(query(
        collection(
          firestore,
          'schools',
          profile.schoolId,
          'logs'
        ),
        where('scheduleId', '==', scheduleId),
        where('classId', '==', classId),
        orderBy('time', 'desc')
      )).then((docSnaps) => {
        const groupedLogs = docSnaps.docs.map((doc) => ({
          ...doc.data(),
          dateStr: moment(doc.data().time.toDate()).format('LL'),
        }));
        const groupedByDate = Object.entries(groupBy(groupedLogs, 'dateStr')).map((a) => ({
          dateStr: a[0],
          presentCount: a[1].filter((b: Log) => b.status === AbsentStasuses.PRESENT).length,
          totalCount: a[1].length,
        }));
        setScheduleLogsGroup(groupedByDate);
      }).finally(() => {
        setIsLoading(false);
      })
    })
  }

  useEffect(() => {
    loadData();
  }, [])

  return (
    <MEContainer>
      <MEHeader/>
      {
        isLoading ? (
          <MESpinner/>
        ) : (
          <>
            <Text style={textStyles.body2}>Kelas</Text>
            <MEPressableText 
              onPress={() => {
                navigation.navigate('Root', {
                  screen: 'ClassPage',
                  params: {
                    screen: 'ClassDetails',
                    params: {
                      classId
                    }
                  }
                })
              }}
              style={[textStyles.body1, { fontFamily: 'manrope-bold', marginBottom: 16 }]}
            >
              {classroom?.name}
            </MEPressableText>
            <View style={{ flexDirection: 'row' }}>
              <View style={{ flex: 1 }}>
                <Text style={textStyles.body2}>Jam Mulai</Text>
                <Text style={[textStyles.body1, { fontFamily: 'manrope-bold', marginBottom: 16 }]}>
                  {moment(schedule?.start?.toDate()).format("HH:mm")}
                </Text>
              </View>
              <View style={{ flex: 1 }}>
                <Text style={textStyles.body2}>Jam Selesai</Text>
                <Text style={[textStyles.body1, { fontFamily: 'manrope-bold', marginBottom: 16 }]}>
                  {moment(schedule?.end?.toDate()).format("HH:mm")}
                </Text>
              </View>
            </View>
            {
              scheduleLogsGroup.map((l, lIdx) => (
                <MECard
                  key={lIdx}
                  style={{
                    flexDirection: 'row',
                    justifyContent: 'space-between',
                    marginBottom: 16
                  }}
                  onPress={() => {
                    navigation.navigate('Root', {
                      screen: 'HistoryPage',
                      params: {
                        screen: 'HistoryLogsDetails',
                        params: {
                          scheduleId,
                          classId
                        }
                      }
                    })
                  }}
                >
                  <Text style={[textStyles.body1, { fontFamily: 'manrope-bold' }]}>{l.dateStr}</Text>
                  <Text style={[textStyles.body1]}>{percentage(l.presentCount, l.totalCount)}% Hadir</Text>
                </MECard>
              ))
            }
          </>
        )
      }
    </MEContainer>
  )
}