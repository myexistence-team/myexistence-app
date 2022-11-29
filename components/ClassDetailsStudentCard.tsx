import { View, Text, ViewStyle } from 'react-native'
import React from 'react'
import { Log, Profile } from '../types'
import MECard from './MECard'
import { textStyles } from '../constants/Styles'
import Colors from '../constants/Colors'
import { AbsentStasuses } from '../constants/constants'
import { PieChart } from 'react-native-chart-kit'
import { percentage } from '../utils/utilFunctions'

export default function ClassDetailsStudentCard({
  student,
  logs,
  style,
}: {
  student: Profile,
  logs?: Log[],
  style: ViewStyle
}) {
  const pieChartData = logs && [
    {name: "Hadir", count: logs.filter((l) => l.status === AbsentStasuses.PRESENT)?.length, color: Colors.light.green },
    {name: "Absen", count: logs.filter((l) => l.status === AbsentStasuses.ABSENT)?.length, color: Colors.light.red },
    {name: "Terlambat", count: logs.filter((l) => l.status === AbsentStasuses.LATE)?.length, color: Colors.light.orange },
    {name: "Izin", count: logs.filter((l) => l.status === AbsentStasuses.EXCUSED)?.length, color: Colors.light.yellow },
  ];
  return (
    <MECard style={{
      ...style,
      flexDirection: 'row'
    }}>
      <View style={{ flex: 1 }}>
        <Text style={[textStyles.body1, { fontFamily: 'manrope-bold' }]}>{student?.displayName}</Text>
        {
          logs && (
            <Text style={[textStyles.body2, { marginTop: 8 }]}>{percentage(logs.filter((l) => l.status === AbsentStasuses.PRESENT)?.length, logs?.length)}% Hadir</Text>
          )
        }
      </View>
      {
        pieChartData && (
          <PieChart
            backgroundColor='transparent'
            accessor='count'
            width={60}
            height={60}
            data={pieChartData}
            chartConfig={{
              color: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
            }}
            absolute
            center={[15, 0]}
            hasLegend={false}
          />
        )
      }
    </MECard>
  )
}