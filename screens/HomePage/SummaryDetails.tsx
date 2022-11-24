import { View, Text, Dimensions } from 'react-native'
import React, { useState, useContext, useEffect } from 'react'
import MEContainer from '../../components/MEContainer'
import MEHeader from '../../components/MEHeader'
import MEButton from '../../components/MEButton'
import { getStartOfMonth, getStartOfWeek, getStartOfYear, groupBy } from '../../utils/utilFunctions'
import DateTimePicker from '@react-native-community/datetimepicker';
import Colors from '../../constants/Colors'
import { textStyles } from '../../constants/Styles'
import { collection, getDocs, orderBy, query, where } from 'firebase/firestore'
import { firestore } from '../../firebase'
import { AuthContext, ProfileContext } from '../../contexts'
import { AbsentStasuses } from '../../constants/constants'
import { PieChart } from 'react-native-chart-kit'
import MESpinner from '../../components/MESpinner'

export default function SummaryDetails() {
  const { auth } = useContext(AuthContext);
  const { profile } = useContext(ProfileContext);
  const [dateStart, setDateStart] = useState(getStartOfWeek());
  const [dateEnd, setDateEnd] = useState(new Date());
  const [isLoading, setIsLoading] = useState(false);
  const [logCounts, setLogCounts] = useState<{ [key: string]: any[] }>({});
  const [quickDate, setQuickDate] = useState<'WEEK' | 'MONTH' | 'YEAR' | null>('WEEK');

  function loadData() {
    setIsLoading(true);
    const studentLogsQuery = query(collection(
      firestore, 
      `schools/${profile.schoolId}/logs`),
      where('studentId', '==', auth.uid),
      orderBy('time', 'desc'),
      where('time', '>=', dateStart),
      where('time', '<=', dateEnd),
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
  }, [])

  function handleQuickDateChange(qDate: 'WEEK' | 'MONTH' | 'YEAR') {
    setQuickDate(qDate);
  }

  useEffect(() => {
    var dateStartA = getStartOfWeek();
    switch(quickDate) {
      case 'MONTH':
        dateStartA = getStartOfMonth();
        setDateStart(dateStartA);
        setDateEnd(new Date());
        break;
      case 'YEAR':
        dateStartA = getStartOfYear();
        setDateStart(dateStartA);
        setDateEnd(new Date());
        break;
      case 'WEEK':
        dateStartA = getStartOfWeek();
        setDateStart(dateStartA);
        setDateEnd(new Date());
        break;
      default:
        return;
    }
  }, [quickDate])

  function handleDateStartChange(date: Date) {
    setDateStart(date);
    setQuickDate(null);
  }

  function handleDateEndChange(date: Date) {
    setDateEnd(date);
    setQuickDate(null);
  }

  const pieChartData = [
    {legendFontSize: 12, legendFontColor: Colors.light.black, name: "Hadir", count: logCounts?.[AbsentStasuses.PRESENT]?.length || 0, color: Colors.light.green },
    {legendFontSize: 12, legendFontColor: Colors.light.black, name: "Absen", count: logCounts?.[AbsentStasuses.ABSENT]?.length || 0, color: Colors.light.red },
    {legendFontSize: 12, legendFontColor: Colors.light.black, name: "Terlambapnat", count: logCounts?.[AbsentStasuses.LATE]?.length || 0, color: Colors.light.orange },
    {legendFontSize: 12, legendFontColor: Colors.light.black, name: "Izin", count: logCounts?.[AbsentStasuses.EXCUSED]?.length || 0, color: Colors.light.yellow },
  ]

  return (
    <MEContainer>
      <MEHeader
        title='Detail Ringkasan'
      />
      <View style={{ flexDirection: 'row', marginBottom: 16 }}>
        <MEButton 
          fullWidth={false}
          style={{ marginLeft: 8 }}
          variant={quickDate === 'WEEK' ? undefined : 'outline'}
          onPress={() => handleQuickDateChange('WEEK')}
          size='sm'
        >
          Minggu Ini
        </MEButton>
        <MEButton 
          variant={quickDate === 'MONTH' ? undefined : 'outline'}
          style={{ marginLeft: 8 }}
          onPress={() => handleQuickDateChange('MONTH')}
          fullWidth={false}
          size='sm'
        >
          Bulan Ini
        </MEButton>
        <MEButton 
          variant={quickDate === 'YEAR' ? undefined : 'outline'}
          style={{ marginLeft: 8 }}
          onPress={() => handleQuickDateChange('YEAR')}
          fullWidth={false}
          size='sm'
        >
          Tahun Ini
        </MEButton>
      </View>
      <View style={{ flexDirection: 'row' }}>
        <View style={{ flex: 2 }}>
          <Text style={[textStyles.body3, { marginLeft: 8, marginBottom: 8 }]}>Dari</Text>
          <DateTimePicker
            mode='date'
            value={dateStart}
            themeVariant='light'
            maximumDate={new Date()}
            textColor={Colors.light.black}
            onChange={(_e, date) => date && handleDateStartChange(date)}
          />
        </View>
        <View style={{ flex: 2 }}>
          <Text style={[textStyles.body3, { marginLeft: 8, marginBottom: 8 }]}>Sampai</Text>
          <DateTimePicker
            mode='date'
            themeVariant='light'
            value={dateEnd}
            maximumDate={new Date()}
            style={{
              flex: 4,
            }}
            textColor={Colors.light.black}
            onChange={(_e, date) => date && handleDateEndChange(date)}
          />
        </View>
        <View style={{ flex: 2, paddingLeft: 8 }}>
          <Text style={[textStyles.body3, { marginLeft: 8, marginBottom: 8 }]}></Text>
          <MEButton
            size='sm'
            variant='outline'
            onPress={loadData}
          >
            Cari
          </MEButton>
        </View>
      </View>
      {
        isLoading ? (
          <MESpinner/>
        ) : (
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
        )
      }
    </MEContainer>
  )
}