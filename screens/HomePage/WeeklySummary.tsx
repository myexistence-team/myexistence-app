import { View, Text, Dimensions } from 'react-native'
import React, { useContext, useEffect, useState } from 'react'
import MESpinner from '../../components/MESpinner';
import { textStyles } from '../../constants/Styles';
import { AuthContext, ProfileContext } from '../../contexts';
import { collection, getDocs, orderBy, query, where } from 'firebase/firestore';
import { firestore } from '../../firebase';
import { getStartOfWeek, groupBy } from '../../utils/utilFunctions';
import { AbsentStasuses, ProfileRoles } from '../../constants/constants';
import { PieChart } from 'react-native-chart-kit';
import Colors from '../../constants/Colors';
import moment from 'moment';
import MEButton from '../../components/MEButton';
import { useNavigation } from '@react-navigation/native';

export default function WeeklySummary() {
  const navigation = useNavigation();
  const [isLoading, setIsLoading] = useState(false);
  const { auth } = useContext(AuthContext);
  const { profile } = useContext(ProfileContext);
  const [logCounts, setLogCounts] = useState<{ [key: string]: any[] }>({});
  const [firstDate, setFirstDate] = useState<Date | null>(null);
 
  
  function loadData() {
    setIsLoading(true);
    const firstDayOfWeek = getStartOfWeek();
    setFirstDate(firstDayOfWeek);
    const studentLogsQuery = query(collection(
      firestore, 
      `schools/${profile.schoolId}/logs`),
      where(profile.role === ProfileRoles.STUDENT ? 'studentId' : 'teacherId', '==', auth.uid),
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
    {legendFontSize: 12, legendFontColor: Colors.light.black, name: "Hadir", count: logCounts?.[AbsentStasuses.PRESENT]?.length || 0, color: Colors.light.green },
    {legendFontSize: 12, legendFontColor: Colors.light.black, name: "Absen", count: logCounts?.[AbsentStasuses.ABSENT]?.length || 0, color: Colors.light.red },
    {legendFontSize: 12, legendFontColor: Colors.light.black, name: "Terlambat", count: logCounts?.[AbsentStasuses.LATE]?.length || 0, color: Colors.light.orange },
    {legendFontSize: 12, legendFontColor: Colors.light.black, name: "Izin", count: logCounts?.[AbsentStasuses.EXCUSED]?.length || 0, color: Colors.light.yellow },
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
            />
            <MEButton
              variant='outline'
              onPress={() => {
                if (profile.role === ProfileRoles.STUDENT) {
                  navigation.navigate('Root', {
                    screen: 'HomePage',
                    params: {
                      screen: 'SummaryDetails'
                    }
                  })
                } else {
                  navigation.navigate('Root', {
                    screen: 'HistoryPage'
                  })
                }
              }}
            >
              Tampilkan {profile.role === ProfileRoles.STUDENT ? 'Detail' : 'Riwayat'}
            </MEButton>
          </>
        )
      }
    </View>
  )
}