import { View, Text, Dimensions } from 'react-native'
import React, { useContext } from 'react'
import { NativeStackScreenProps } from '@react-navigation/native-stack'
import { HistoryPageParamList } from '../../navTypes'
import { ClassesContext } from '../../contexts'
import MEContainer from '../../components/MEContainer'
import MEHeader from '../../components/MEHeader'
import { textStyles } from '../../constants/Styles'
import MEPressableText from '../../components/MEPressableText'
import moment from 'moment'
import { DAYS_ARRAY } from '../../constants/constants'
import { useNavigation } from '@react-navigation/native'
import Colors from '../../constants/Colors'
import { PieChart } from 'react-native-chart-kit'

export default function HistoryLogsDetails({
  route: {
    params: {
      schedule,
      classId,
      logsCounts
    }
  }
}: NativeStackScreenProps<HistoryPageParamList, 'HistoryLogsDetails'>) {
  const navigation = useNavigation();
  const { classes } = useContext(ClassesContext);
  const classroom = classes.find((c) => c.id === classId);

  const pieChartData = [
    {legendFontSize: 12, legendFontColor: Colors.light.black, name: "Hadir", count: logsCounts.presentCount || 0, color: Colors.light.green },
    {legendFontSize: 12, legendFontColor: Colors.light.black, name: "Absen", count: logsCounts.absentCount || 0, color: Colors.light.red },
    {legendFontSize: 12, legendFontColor: Colors.light.black, name: "Terlambat", count: logsCounts.lateCount || 0, color: Colors.light.orange },
    {legendFontSize: 12, legendFontColor: Colors.light.black, name: "Izin", count: logsCounts.excusedCount || 0, color: Colors.light.yellow },
  ];

  return (
    <MEContainer>
      <MEHeader/>
      <Text style={[textStyles.heading4, { marginBottom: 16 }]}>Jadwal</Text>
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

      <Text style={textStyles.body2}>Hari</Text>
      <Text style={[textStyles.body1, { fontFamily: 'manrope-bold', marginBottom: 16 }]}>
        {DAYS_ARRAY[schedule?.start?.toDate().getDay()]}
      </Text>
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
      <Text style={textStyles.body2}>Toleransi</Text>
      <Text style={[textStyles.body1, { fontFamily: 'manrope-bold', marginBottom: 16 }]}>
        {schedule?.tolerance} Menit
      </Text>

      <Text style={[textStyles.heading4, { marginTop: 24, marginBottom: 16 }]}>Sesi Kelas</Text>
      <View style={{ flexDirection: 'row' }}>
        <View style={{ flex: 1 }}>
          <Text style={textStyles.body2}>Jam Dibuka</Text>
          <Text style={[textStyles.body1, { fontFamily: 'manrope-bold', marginBottom: 16 }]}>
            {moment(logsCounts?.openedAt?.toDate()).format("HH:mm")}
          </Text>
        </View>
        <View style={{ flex: 1 }}>
          <Text style={textStyles.body2}>Jam Ditutup</Text>
          <Text style={[textStyles.body1, { fontFamily: 'manrope-bold', marginBottom: 16 }]}>
            {moment(logsCounts?.closedAt?.toDate()).format("HH:mm")}
          </Text>
        </View>
      </View>
      <Text style={[textStyles.heading4, { marginTop: 24 }]}>Kehadiran Kelas</Text>
      <PieChart
        backgroundColor='transparent'
        accessor='count'
        width={Dimensions.get("window").width}
        height={240}
        data={pieChartData}
        fromZero
        chartConfig={{
          color: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
          labelColor: Colors.light.black,
        }}
      />
    </MEContainer>
  )
}