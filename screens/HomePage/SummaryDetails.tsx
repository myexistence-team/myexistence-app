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
import { LineChart, PieChart } from 'react-native-chart-kit'
import MESpinner from '../../components/MESpinner'
import { Log } from '../../types'
import { useForm } from 'react-hook-form'
import MEFirestoreSelect from '../../components/MEFirestoreSelect'
import moment from 'moment'
import MECard from '../../components/MECard'
import { useNavigation } from '@react-navigation/native'
import { Platform } from 'react-native'
import MEAndroidDateTimePicker from '../../components/MEAndroidDateTimePicker'

export default function SummaryDetails() {
  const navigation = useNavigation();
  const { auth } = useContext(AuthContext);
  const { profile } = useContext(ProfileContext);
  const [dateStart, setDateStart] = useState(getStartOfWeek());
  const [dateEnd, setDateEnd] = useState(new Date());
  const [isLoading, setIsLoading] = useState(false);
  const [logsCountByStatus, setLogsCountsByStatus] = useState<{ [key: string]: any[] }>({});
  const [logsCountByDate, setLogsCountsByDate] = useState<{ [key: string]: any[] }>({});
  const [quickDate, setQuickDate] = useState<'WEEK' | 'MONTH' | 'YEAR' | null>('WEEK');

  const { control, getValues, reset } = useForm();

  function loadData() {
    setIsLoading(true);
    const studentLogsQuery = query(collection(
      firestore, 
      `schools/${profile.schoolId}/logs`),
      where('studentId', '==', auth.uid),
      ...getValues('classId') ? [where('classId', '==', getValues('classId'))] : [],
      orderBy('time', 'asc'),
      where('time', '>=', dateStart),
      where('time', '<=', dateEnd),
    );
    getDocs(studentLogsQuery).then((docSnaps) => {
      const logs = docSnaps.docs.map((doc) => {
        const time: Date = doc.data().time.toDate();
        const timeString = `${time.getFullYear()}-${time.getMonth() + 1}-${time.getDate()}`;
        const timeStr = moment(time).format("D MMM");

        return {
          ...doc.data(), 
          id: doc.id,
          time: new Date(timeString),
          timeStr,
        }
      })
      var groupedByDate: any = groupBy(logs, 'timeStr');
      for (const groupedDateStr of Object.keys(groupedByDate)) {
        groupedByDate[groupedDateStr] = [
          groupedByDate[groupedDateStr].filter((l: Log) => l.status === AbsentStasuses.PRESENT).length,
          groupedByDate[groupedDateStr].filter((l: Log) => l.status === AbsentStasuses.ABSENT).length,
        ]
      }
      setLogsCountsByDate(groupedByDate);
      setLogsCountsByStatus(groupBy(logs, 'status'));
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
    {legendFontSize: 12, legendFontColor: Colors.light.black, name: "Hadir", count: logsCountByStatus?.[AbsentStasuses.PRESENT]?.length || 0, color: Colors.light.green },
    {legendFontSize: 12, legendFontColor: Colors.light.black, name: "Absen", count: logsCountByStatus?.[AbsentStasuses.ABSENT]?.length || 0, color: Colors.light.red },
    {legendFontSize: 12, legendFontColor: Colors.light.black, name: "Terlambat", count: logsCountByStatus?.[AbsentStasuses.LATE]?.length || 0, color: Colors.light.orange },
    {legendFontSize: 12, legendFontColor: Colors.light.black, name: "Izin", count: logsCountByStatus?.[AbsentStasuses.EXCUSED]?.length || 0, color: Colors.light.yellow },
  ]

  const data = {
    labels: Object.keys(logsCountByDate),
    datasets: [
      {
        data: Object.values(logsCountByDate).map((l) => l[0]),
        color: () => Colors.light.green,
        strokeWidth: 2,
      },
      {
        data: Object.values(logsCountByDate).map((l) => l[1]),
        color: () => Colors.light.red,
        strokeWidth: 2,
      },
    ],
    legend: ["Hadir", "Absen"]
  };

  const offsetMarginLeft = Platform.OS === 'ios' ? 8 : 0;

  return (
    <MEContainer>
      <MEHeader
        title='Detail Ringkasan'
      />
      <View style={{ flexDirection: 'row', marginLeft: offsetMarginLeft }}>
        <View style={{ flex: 1 }}>
          <MEFirestoreSelect
            control={control}
            name='classId'
            listName='classes'
            label={false}
            placeholder="Pilih Kelas"
          />
        </View>
        <View style={{
          marginTop: 8
        }}>
          <MEButton
            variant='ghost'
            size='sm'
            fullWidth={false}
            onPress={() => reset()}
          >
            ✖
          </MEButton>
        </View>
      </View>
      <View style={{ flexDirection: 'row', marginBottom: 16, marginLeft: offsetMarginLeft }}>
        <MEButton 
          fullWidth={false}
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
          <Text style={[textStyles.body3, { marginLeft: offsetMarginLeft, marginBottom: 8 }]}>Dari</Text>
          {
            Platform.OS === 'ios' ? (
              <DateTimePicker
                mode='date'
                value={dateStart}
                maximumDate={new Date()}
                textColor={Colors.light.black}
                onChange={(_e, date) => date && handleDateStartChange(date)}
              />
            ) : (
              <MEAndroidDateTimePicker
                mode='date'
                value={dateStart}
                maximumDate={new Date()}
                onChange={(_e, date) => date && handleDateStartChange(date)}
              />
            )
          }
        </View>
        <View style={{ flex: 2, marginLeft: Platform.OS === 'ios' ? 0 : 16 }}>
          <Text style={[textStyles.body3, { marginLeft: offsetMarginLeft, marginBottom: 8 }]}>Sampai</Text>
          {
            Platform.OS === 'ios' ? (
              <DateTimePicker
                mode='date'
                value={dateEnd}
                maximumDate={new Date()}
                textColor={Colors.light.black}
                onChange={(_e, date) => date && handleDateEndChange(date)}
              />
            ) : (
              <MEAndroidDateTimePicker
                mode='date'
                value={dateEnd}
                maximumDate={new Date()}
                onChange={(_e, date) => date && handleDateEndChange(date)}
              />
            )
          }
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
          <>
            <View style={{ marginVertical: 36 }}>
              <View style={{ flexDirection: 'row', marginBottom: 16 }}>
                <View style={{ flex: 1, marginRight: 8 }}>
                  <MECard
                    onPress={() => {
                      navigation.navigate('Root', {
                        screen: 'HistoryPage',
                        params: {
                          screen: 'History',
                          params: {
                            status: AbsentStasuses.PRESENT
                          }
                        }
                      })
                    }}
                  >
                    <Text style={[textStyles.heading5, { textAlign: 'center', color: Colors.light.green }]}>
                      Hadir
                    </Text>
                    <Text style={[textStyles.heading5, { textAlign: 'center' }]}>
                      {logsCountByStatus?.[AbsentStasuses.PRESENT]?.length || 0}
                    </Text>
                  </MECard>
                </View>
                <View style={{ flex: 1, marginLeft: 8 }}>
                  <MECard
                    onPress={() => {
                      navigation.navigate('Root', {
                        screen: 'HistoryPage',
                        params: {
                          screen: 'History',
                          params: {
                            status: AbsentStasuses.LATE
                          }
                        }
                      })
                    }}
                  >
                    <Text style={[textStyles.heading5, { textAlign: 'center', color: Colors.light.orange }]}>
                      Terlambat
                    </Text>
                    <Text style={[textStyles.heading5, { textAlign: 'center' }]}>
                      {logsCountByStatus?.[AbsentStasuses.LATE]?.length || 0}
                    </Text>
                  </MECard>
                </View>
              </View>
              <View style={{ flexDirection: 'row' }}>
                <View style={{ flex: 1, marginRight: 8 }}>
                  <MECard
                    onPress={() => {
                      navigation.navigate('Root', {
                        screen: 'HistoryPage',
                        params: {
                          screen: 'History',
                          params: {
                            status: AbsentStasuses.EXCUSED
                          }
                        }
                      })
                    }}
                  >
                    <Text style={[textStyles.heading5, { textAlign: 'center', color: Colors.light.yellows.yellow2 }]}>
                      Izin
                    </Text>
                    <Text style={[textStyles.heading5, { textAlign: 'center' }]}>
                      {logsCountByStatus?.[AbsentStasuses.EXCUSED]?.length || 0}
                    </Text>
                  </MECard>
                </View>
                <View style={{ flex: 1, marginLeft: 8 }}>
                  <MECard
                    onPress={() => {
                      navigation.navigate('Root', {
                        screen: 'HistoryPage',
                        params: {
                          screen: 'History',
                          params: {
                            status: AbsentStasuses.ABSENT
                          }
                        }
                      })
                    }}
                  >
                    <Text style={[textStyles.heading5, { textAlign: 'center', color: Colors.light.red }]}>
                      Absen
                    </Text>
                    <Text style={[textStyles.heading5, { textAlign: 'center' }]}>
                      {logsCountByStatus?.[AbsentStasuses.ABSENT]?.length || 0}
                    </Text>
                  </MECard>
                </View>
              </View>
            </View>
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
            {
              data.labels.length > 0 && (
                <LineChart
                  withHorizontalLabels={false}
                  withHorizontalLines={false}
                  verticalLabelRotation={15}
                  withOuterLines={false}
                  data={data}
                  width={Dimensions.get("window").width - 16}
                  height={220}
                  bezier
                  transparent
                  chartConfig={{
                    color: (opacity = 1) => Colors.light.black,
                    useShadowColorFromDataset: true,
                  }}
                  style={{
                    paddingRight: 0,
                    marginTop: 36
                  }}
                />
              )
            }
          </>
        )
      }
    </MEContainer>
  )
}