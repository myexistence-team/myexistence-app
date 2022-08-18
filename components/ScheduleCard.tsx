import { View, Text } from 'react-native'
import React from 'react'
import MECard from './MECard';
import { textStyles } from '../constants/Styles';
import { FontAwesome5 } from '@expo/vector-icons';
import Colors from '../constants/Colors';
import moment from 'moment';
import MEButton from './MEButton';

export default function ScheduleCard(props: {
  schedule: any,
}) {
  const {
    schedule,
  } = props;

  const now: Date = new Date();
  const diffInMs = schedule.startTime - now.getTime();
  const diffToNowInMins = Math.floor(((diffInMs % 86400000) % 3600000) / 60000);

  return (
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
            {moment(schedule.startTime).format("HH:mm")} - {moment(schedule.endTime).format("HH:mm")}
          </Text>
          {' • '}
          <Text>
            Toleransi {schedule.tolerance} menit
          </Text>
        </Text>
        <Text style={textStyles.body3}>
          Dalam {diffToNowInMins} Menit
        </Text>
      </View>
      <Text 
        style={[
          textStyles.body1,
          {
            marginVertical: 8
          }
        ]}
      >
        {schedule.name}
      </Text>
      <Text style={[textStyles.body2]}>
        {schedule.location}
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
  )
}