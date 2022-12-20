import { View, Text, ViewStyle } from 'react-native'
import React, { useContext } from 'react'
import { Log, Profile } from '../types'
import MECard from './MECard'
import { textStyles } from '../constants/Styles'
import Colors from '../constants/Colors'
import { AbsentStasuses, ProfileRoles } from '../constants/constants'
import { PieChart } from 'react-native-chart-kit'
import { percentage } from '../utils/utilFunctions'
import { useNavigation } from '@react-navigation/native'
import { ProfileContext } from '../contexts'

export default function ClassDetailsStudentCard({
  student,
  logs,
  classId,
  style,
}: {
  student: Profile,
  logs?: Log[],
  style: ViewStyle,
  classId: string,
}) {
  const pieChartData = logs && [
    {name: "Hadir", count: logs.filter((l) => l.status === AbsentStasuses.PRESENT)?.length, color: Colors.light.green },
    {name: "Absen", count: logs.filter((l) => l.status === AbsentStasuses.ABSENT)?.length, color: Colors.light.red },
    {name: "Terlambat", count: logs.filter((l) => l.status === AbsentStasuses.LATE)?.length, color: Colors.light.orange },
    {name: "Izin", count: logs.filter((l) => l.status === AbsentStasuses.EXCUSED)?.length, color: Colors.light.yellow },
  ];
  const navigation = useNavigation();
  const { profile } = useContext(ProfileContext);
  return (
    <MECard 
      onPress={profile.role === ProfileRoles.TEACHER ? () => {
        navigation.navigate('Root', {
          screen: 'ClassPage',
          params: {
            screen: 'ClassDetailsStudentDetails',
            params: {
              classId,
              studentId: student.id
            }
          }
        })
      } : undefined}
      style={{
        ...style,
        flexDirection: 'row'
      }}
    >
      <View style={{ flex: 1 }}>
        <Text style={[textStyles.body1, { fontFamily: 'manrope-bold' }]}>{student?.displayName}</Text>
        { student?.idNumber ? <Text style={[textStyles.body3, { fontFamily: 'manrope-bold' }]}>{student?.idNumber}</Text> : null}
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