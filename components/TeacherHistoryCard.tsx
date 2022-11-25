import { View, Text } from 'react-native'
import React from 'react'
import { LogCountBySchedule } from '../types'
import MECard from './MECard'
import moment from 'moment'
import { textStyles } from '../constants/Styles'
import { DAYS_ARRAY } from '../constants/constants'
import Colors from '../constants/Colors'
import { FontAwesome5 } from '@expo/vector-icons'
import {
  PieChart,
} from "react-native-chart-kit";
import { useNavigation } from '@react-navigation/native'

export default function TeacherHistoryCard({
  scheduleLog
} : {
  scheduleLog: LogCountBySchedule
}) {
  const navigation = useNavigation();
  return (
    <MECard 
      style={{ 
        marginBottom: 16,
        flexDirection: "row",
        justifyContent: 'space-between'
      }}
      onPress={() => {
        navigation.navigate('Root', {
          screen: 'HistoryPage',
          params: {
            screen: 'HistoryScheduleDetails',
            params: {
              scheduleId: scheduleLog.scheduleId,
              classId: scheduleLog.classId,
            }
          }
        })
      }}
    >
      <View>
        <View
          style={{
            flexDirection: "row",
            alignItems: "center",
          }}
        >
          <FontAwesome5 size={12} name="calendar" color={Colors.light.grey} />
          <Text 
            style={[
              textStyles.body2,
              {
                marginLeft: 8,
                color: Colors.light.grey,
              },
            ]}
          >
            {DAYS_ARRAY[scheduleLog.schedule.start.toDate().getDay()]}
          </Text>
        </View>
        <Text style={[
          textStyles.body1,
          {
            marginTop: 8,
            fontFamily: 'manrope-bold'
          }
        ]}>
          {moment(scheduleLog.schedule.start.toDate()).format("HH:mm")}{" - "}
          {moment(scheduleLog.schedule.end.toDate()).format("HH:mm")}
        </Text>
      </View>
      <PieChart
        backgroundColor='transparent'
        accessor='count'
        width={60}
        height={60}
        data={[
          {name: "Hadir", count: scheduleLog.presentCount, color: Colors.light.green },
          {name: "Absen", count: scheduleLog.absentCount, color: Colors.light.red },
          {name: "Terlambat", count: scheduleLog.lateCount, color: Colors.light.orange },
          {name: "Izin", count: scheduleLog.excusedCount, color: Colors.light.yellow },
        ]}
        chartConfig={{
          color: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
        }}
        absolute
        center={[15, 0]}
        hasLegend={false}
      />
    </MECard>
  )
}