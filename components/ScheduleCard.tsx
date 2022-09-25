import { View, Text } from 'react-native'
import React from 'react'
import MECard from './MECard';
import { textStyles } from '../constants/Styles';
import { FontAwesome5 } from '@expo/vector-icons';
import Colors from '../constants/Colors';
import moment from 'moment';
import MEButton from './MEButton';
import { useNavigation } from '@react-navigation/native';
import useCurrentScheduleTime from '../hooks/useCurrentScheduleTime';

export default function ScheduleCard({
  schedule,
  disableScanButton,
  disableCountdown
}: {
  schedule: any & {
    start: Date
  },
  disableScanButton?: boolean,
  disableCountdown?: boolean,
}) {
  const navigation = useNavigation();

  const now: Date = useCurrentScheduleTime();
  const diffInMs = schedule.start.toDate().getTime() - now.getTime();

  const diffToNowInMins = Math.abs(Math.floor(diffInMs/60000));
  const diffToNowInHours = Math.floor(diffToNowInMins/60);

  return (
    <MECard
      style={{
        marginBottom: 16
      }} 
      onPress={() => {
        navigation.navigate("Root", {
          screen: "SchedulesPage",
          params: {
            screen: "ScheduleDetails",
            params: {
              classId: schedule.classId,
              scheduleId: schedule.id
            },
            initial: false,
          },
        })
      }}
    >
      <View
        style={{
          flexDirection: 'row',
          justifyContent: 'space-between',
          alignItems: 'center'
        }}
      >
        <Text 
          style={[
            textStyles.body3,
            { 
              flexDirection: 'row', 
              alignItems: 'center',
              color: Colors.light.grey,
            }
          ]}
        >
          <FontAwesome5 size={12} name='clock'/>{'  '}
          <Text
          >
            {moment(schedule.start.toDate()).format("HH:mm")} - {moment(schedule.end.toDate()).format("HH:mm")}
          </Text>
          {' • '}
          <Text>
            Toleransi {schedule.tolerance} menit
          </Text>
        </Text>
        {
          (disableCountdown === undefined || disableCountdown === false) && diffToNowInHours < 24 ? (
            <Text style={textStyles.body3}>
              {diffInMs > 0 ? 'Dalam' : 'Terlambat'} {diffToNowInMins > 60 ? diffToNowInHours : diffToNowInMins} {diffToNowInMins > 60 ? 'Jam' : 'Menit'}
            </Text>
          ) : null
        }
      </View>
      <Text 
        style={[
          textStyles.body1,
          {
            marginVertical: 8,
            fontFamily: 'manrope-bold'
          }
        ]}
      >
        {schedule.className}
      </Text>
      <Text style={[textStyles.body3]}>
        {schedule.classDescription}
      </Text>
      {
        (disableScanButton === undefined || disableScanButton === false) && schedule.status === 'OPENED' ? (
          <View
            style={{
              flexDirection: 'row',
              marginTop: 16
            }}
          >
            <View
              style={[
                { 
                  flex: 2,
                  marginRight: 8
                }
              ]}
            >
              <MEButton
                color='primary'
                variant='outline'
                onPress={() => {
                  navigation.navigate('ExcusePage', {
                    scheduleId: schedule.id,
                    classId: schedule.classId
                  })
                }}
              >
                  Izin
              </MEButton>
            </View>
            <View
              style={[
                { 
                  flex: 3
                }
              ]}
            >
              <MEButton
              iconStart="qrcode"
              style={[
                { 
                  marginLeft: 4
                }
              ]}
              onPress={() => navigation.navigate('Scanner', {
                  scheduleId: schedule.id,
                  schedule
              })}
              >
              Pindai QR Code
              </MEButton>
            </View>
          </View>
        ) : null
      }
    </MECard>
  )
}