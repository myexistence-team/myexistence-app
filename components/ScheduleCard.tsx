import { View, Text, Pressable } from 'react-native'
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
  disableScanButton
}: {
  schedule: any & {
    start: Date
  },
  disableScanButton?: boolean
}) {
  const navigation = useNavigation();

  const now: Date = useCurrentScheduleTime();
  const diffInMs = schedule.start.getTime() - now.getTime();

  const diffToNowInMins = Math.floor(diffInMs/60000);
  const diffToNowInHours = Math.floor(diffInMs/3600000);

  return (
    <Pressable
      style={({ pressed }) => ({
        opacity: pressed ? 0.75 : 1
      })}
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
      <MECard
        style={{
          marginBottom: 16
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
              {moment(schedule.start).format("HH:mm")} - {moment(schedule.end).format("HH:mm")}
            </Text>
            {' • '}
            <Text>
              Toleransi {schedule.tolerance} menit
            </Text>
          </Text>
          {
            diffToNowInHours < 24 ? (
              <Text style={textStyles.body3}>
                Dalam {diffToNowInMins > 60 ? diffToNowInHours : diffToNowInMins} {diffToNowInMins > 60 ? 'Jam' : 'Menit'}
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
          (disableScanButton === undefined || disableScanButton === false) && diffToNowInMins <= 10 && diffToNowInMins > 0 ? (
            <MEButton
              iconStart="qrcode"
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
      </MECard>
    </Pressable>
  )
}