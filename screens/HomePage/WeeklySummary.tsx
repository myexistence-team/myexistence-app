import { View, Text, Dimensions } from 'react-native'
import React, { useContext, useEffect, useState } from 'react'
import MESpinner from '../../components/MESpinner';
import { textStyles } from '../../constants/Styles';
import { AuthContext, ProfileContext } from '../../contexts';
import { collection, getDocs, orderBy, query, where } from 'firebase/firestore';
import { firestore } from '../../firebase';
import { getDays, groupBy } from '../../utils/utilFunctions';
import { AbsentStasuses } from '../../constants/constants';
import { PieChart } from 'react-native-chart-kit';
import Colors from '../../constants/Colors';
import moment from 'moment';
import MEButton from '../../components/MEButton';

export default function WeeklySummary() {
  const [isLoading, setIsLoading] = useState(false);
  const { auth } = useContext(AuthContext);
  const { profile } = useContext(ProfileContext);
  const [logCounts, setLogCounts] = useState<{ [key: string]: any[] }>({});
  const [firstDate, setFirstDate] = useState<Date | null>(null);

  
  function loadData() {
    setIsLoading(true);
    const firstDayOfWeek = new Date();
    const todayDate = firstDayOfWeek.getDate();
    const todayInt = firstDayOfWeek.getDay();
    var lastWeekDate = todayDate - todayInt;
    if (lastWeekDate < 1) {
      lastWeekDate += getDays(firstDayOfWeek.getFullYear(), firstDayOfWeek.getMonth());
      var prevMonth = firstDayOfWeek.getMonth() - 1;
      if (prevMonth < 0) prevMonth = 12;
      firstDayOfWeek.setMonth(prevMonth);
    }
    firstDayOfWeek.setHours(0);
    firstDayOfWeek.setMinutes(0);
    firstDayOfWeek.setSeconds(0);
    firstDayOfWeek.setDate(lastWeekDate);
    setFirstDate(firstDayOfWeek);
    const studentLogsQuery = query(collection(
      firestore, 
      `schools/${profile.schoolId}/logs`),
      where('studentId', '==', auth.uid),
      orderBy('time', 'desc'),
      where('time', '>=', firstDayOfWeek)
    );
    getDocs(studentLogsQuery).then((docSnaps) => {
      const docsData = docSnaps.docs.map((doc) => ({
        ...doc.data(), id: doc.id
      }))
      const logsGrouped = groupBy(docsData, 'status');
      setLogCounts(logsGrouped);
    }).finally(() => {
      setIsLoading(false);
    })
  }

  useEffect(() => {
    loadData();
  }, []);

  const pieChartData = [
    {legendFontSize: 12, legendFontColor: "#000000", name: "Hadir", count: logCounts?.[AbsentStasuses.PRESENT]?.length || 0, color: Colors.light.green },
    {legendFontSize: 12, legendFontColor: "#000000", name: "Absen", count: logCounts?.[AbsentStasuses.ABSENT]?.length || 0, color: Colors.light.red },
    {legendFontSize: 12, legendFontColor: "#000000", name: "Terlambat", count: logCounts?.[AbsentStasuses.LATE]?.length || 0, color: Colors.light.orange },
    {legendFontSize: 12, legendFontColor: "#000000", name: "Izin", count: logCounts?.[AbsentStasuses.EXCUSED]?.length || 0, color: Colors.light.yellow },
  ]

  return (
    <View style={{ paddingBottom: 64 }}>
      {
        isLoading ? (
          <MESpinner/>
        ) : (
          <>
            <Text style={[textStyles.heading3, { marginBottom: 8 }]}>Ringkasan Minggu Ini</Text>
            <Text style={[textStyles.body2, { marginBottom: 16 }]}>Dihitung mulai tanggal {moment(firstDate).format("LL")}</Text>
            <PieChart
              backgroundColor='transparent'
              accessor='count'
              width={Dimensions.get("window").width}
              height={240}
              data={pieChartData}
              chartConfig={{
                color: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
                labelColor: Colors.light.black,
              }}
              // absolute
              // center={[110, 0]}
              // hasLegend={false}
            />
            <MEButton
              variant='outline'
            >
              Tampilkan Detil
            </MEButton>
          </>
        )
      }
    </View>
  )
}