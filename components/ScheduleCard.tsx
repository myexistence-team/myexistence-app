import { View, Text, Pressable } from 'react-native'
import React from 'react'
import MECard from './MECard';
import { textStyles } from '../constants/Styles';
import { FontAwesome5 } from '@expo/vector-icons';
import Colors from '../constants/Colors';
import moment from 'moment';
import MEButton from './MEButton';
import { useNavigation } from '@react-navigation/native';
import { nowScheduleDate } from '../constants/constants';

export default function ScheduleCard({
  schedule
}: {
  schedule: any & {
    start: Date
  },
}) {
  const navigation = useNavigation();

  const now: Date = nowScheduleDate;
  const diffInMs = schedule.start.getTime() - now.getTime();

  const diffToNowInMins = Math.floor(diffInMs/60000);
  const diffToNowInHours = Math.floor(diffInMs/3600000);

  return (
    <Pressable
      // style={({ pressed }) => ({
      //   opacity: pressed && 0.75
      // })}
      style={({ pressed }) => ({
        opacity: pressed ? 0.75 : 1
      })}
      onPress={() => {
        navigation.navigate("Root", {
          screen: "Schedule",
          // params: {
          //   screen: "ScheduleDetails",
          //   params: {
          //     scheduleId: schedule.id
          //   }
          // }
        });
        navigation.navigate("Root", {
          screen: "Schedule",
          params: {
            screen: "ScheduleDetails",
            params: {
              scheduleId: schedule.id
            }
          }
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
              fontWeight: '700',
            }
          ]}
        >
          {schedule.className}
        </Text>
        <Text style={[textStyles.body3]}>
          {schedule.description}
        </Text>
        {
          diffToNowInMins < 10 && (
            <MEButton
              iconStart="qrcode"
              style={{
                marginTop: 8
              }}
            >
              Pindai QR Code
            </MEButton>
          )
        }
      </MECard>
    </Pressable>
  )
}