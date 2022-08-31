import { View, Text } from 'react-native'
import React, { useContext, useEffect, useState } from 'react'
import MEContainer from '../../components/MEContainer'
import { ScheduleParamList, ScheduleScreenProps } from '../../navTypes'
import scheduleMocks from '../../mocks/scheduleMocks'
import { textStyles } from '../../constants/Styles'
import moment from 'moment'
import MEHeader from '../../components/MEHeader'
import { Schedule } from '../../types'
import MESpinner from '../../components/MESpinner'
import { doc, DocumentData, getDoc } from 'firebase/firestore'
import { firestore } from '../../firebase'
import { ProfileContext } from '../../contexts'
import useCurrentScheduleTime from '../../hooks/useCurrentScheduleTime'
import MEButton from '../../components/MEButton'
import { useNavigation } from '@react-navigation/native'
import { DAYS_ARRAY } from '../../constants/constants'

export default function ScheduleDetailsPage({ route }: ScheduleScreenProps) {
  const { scheduleId, classId } = route.params;
  const navigation = useNavigation();

  const { profile } = useContext(ProfileContext);
  const [schedule, setSchedule] = useState<Schedule | any>(null);

  function loadData() {
    setSchedule(null);
    getDoc(doc(
      firestore, 
      'schools', 
      profile.schoolId,
      'classes',
      classId,
      'schedules',
      scheduleId
    )).then((scheduleSnap) => {
      if (scheduleSnap.exists()) {
        getDoc(doc(
          firestore, 
          'schools', 
          profile.schoolId,
          'classes',
          classId
        )).then((classSnap) => {
          if (classSnap.exists()) {
            setSchedule({
              ...scheduleSnap.data(),
              className: classSnap.data().name,
              classDescription: classSnap.data().description,
              start: scheduleSnap.data().start.toDate(),
              end: scheduleSnap.data().end.toDate(),
            });
          }
        })
      }
    })
  } 

  useEffect(() => {
    loadData();
  }, [])

  const now: Date = useCurrentScheduleTime();
  const diffInMs = schedule ? schedule.start.getTime() - now.getTime() : 0;

  const diffToNowInMins = Math.floor(diffInMs/60000);
  const diffToNowInHours = Math.floor(diffInMs/3600000);

  return (
    <MEContainer
      onRefresh={loadData}
      refreshing={!Boolean(schedule)}
    >
      {
        !schedule ? (
          <MESpinner/>
        ) : (
          <>
            <MEHeader
              title='Detail Jadwal'
            />
            <Text style={textStyles.body2}>Nama Kelas</Text>
            <Text style={[textStyles.body1, { fontFamily: 'manrope-bold', marginBottom: 16 }]}>
              {schedule.className}
            </Text>

            <Text style={textStyles.body2}>Deskripsi</Text>
            <Text style={[textStyles.body1, { fontFamily: 'manrope-bold', marginBottom: 16 }]}>
              {schedule.classDescription}
            </Text>

            <Text style={textStyles.body2}>Hari</Text>
            <Text style={[textStyles.body1, { fontFamily: 'manrope-bold', marginBottom: 16 }]}>
              {DAYS_ARRAY[schedule.day]}
            </Text>

            <View style={{ flexDirection: 'row' }}>
              <View style={{ flex: 1 }}>
                <Text style={textStyles.body2}>Jam Mulai</Text>
                <Text style={[textStyles.body1, { fontFamily: 'manrope-bold', marginBottom: 16 }]}>
                  {moment(schedule.start).format("HH:mm")}
                </Text>
              </View>
              <View style={{ flex: 1 }}>
                <Text style={textStyles.body2}>Jam Selesai</Text>
                <Text style={[textStyles.body1, { fontFamily: 'manrope-bold', marginBottom: 16 }]}>
                  {moment(schedule.end).format("HH:mm")}
                </Text>
              </View>
            </View>


            <Text style={textStyles.body2}>Toleransi</Text>
            <Text style={[textStyles.body1, { fontFamily: 'manrope-bold', marginBottom: 16 }]}>
              {schedule.tolerance} Menit
            </Text>
            {
              diffToNowInMins <= 10 && diffToNowInMins > 0 ? (
                <MEButton
                  iconStart="qrcode"
                  size='lg'
                  style={{
                    marginTop: 8
                  }}
                  onPress={() => navigation.navigate('Scanner', {
                    scheduleId: schedule.id,
                    schedule
                  })}
                >
                  Pindai QR Code
                </MEButton>
              ) : null
            }
          </>
        )
      }
    </MEContainer>
  )
}