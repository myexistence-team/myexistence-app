import { View, Text, Dimensions } from 'react-native'
import React, { useContext, useEffect, useState } from 'react'
import MEContainer from '../../components/MEContainer'
import { NativeStackScreenProps } from '@react-navigation/native-stack'
import { ClassParamList } from '../../navTypes'
import { UsersContext } from '../../contexts'
import { textStyles } from '../../constants/Styles'
import MEHeader from '../../components/MEHeader'
import { useForm } from 'react-hook-form'
import MEFirestoreSelect from '../../components/MEFirestoreSelect'
import { collection, getDoc, getDocs, query, where } from 'firebase/firestore'
import { firestore } from '../../firebase'
import { Log } from '../../types'
import { AbsentStasuses } from '../../constants/constants'
import Colors from '../../constants/Colors'
import { PieChart } from 'react-native-chart-kit'
import { getStartOfMonth, getStartOfWeek, getStartOfYear } from '../../utils/utilFunctions'
import MEButton from '../../components/MEButton'
import MESpinner from '../../components/MESpinner'
import moment from 'moment'
import StudentDetailsLogCard from '../../components/StudentDetailsLogCard'
import MEControlledSelect from '../../components/MEControlledSelect'
import { PresenceStatusEnum } from '../../enums'
import HistoryDetailsModal from '../HistoryDetailsModal'

export default function ClassDetailsStudentDetails({
  route: {
    params: {
      classId: classIdParam,
      studentId
    }
  }
}: NativeStackScreenProps<ClassParamList, "ClassDetailsStudentDetails">) {
  const { users } = useContext(UsersContext)
  const student = users[studentId];
  const [isLoading, setIsLoading] = useState(false);
  const [logs, setLogs] = useState<Log[]>([])
  const [dateStart, setDateStart] = useState(getStartOfWeek());
  const [quickDate, setQuickDate] = useState<'WEEK' | 'MONTH' | 'YEAR' | null>('WEEK');

  const { control, watch, reset } = useForm({
    defaultValues: {
      classId: null,
      status: null
    }
  });

  function handleQuickDateChange(qDate: 'WEEK' | 'MONTH' | 'YEAR') {
    setQuickDate(qDate);
  }

  useEffect(() => {
    switch(quickDate) {
      case 'MONTH':
        setDateStart(getStartOfMonth());
        break;
      case 'YEAR':
        setDateStart(getStartOfYear());
        break;
      case 'WEEK':
        setDateStart(getStartOfWeek());
        break;
      default:
        return;
    }
  }, [quickDate])

  function loadData() {
    const logsQuery = query(
      collection(firestore, 'schools', student.schoolId, 'logs'),
      where('studentId', '==', studentId),
      where('time', '>=', dateStart)
    );
    setIsLoading(true);
    getDocs(logsQuery).then((docSnaps) => {
      if (!docSnaps.empty) {
        setLogs(docSnaps.docs.map((doc) => ({
          ...doc.data(), id: doc.id
        })))
      }
    }).finally(() => {
      setIsLoading(false);
    })
    
  }

  useEffect(() => {
    loadData();
  }, [dateStart])

  const filteredLogs = logs.filter((l) => (watch("status") ? l.status === watch("status") : true) && (watch("classId") ? l.classId === watch("classId") : true));
  const logsFilteredByClass = logs.filter((l) => watch("classId") ? l.classId === watch("classId") : true);
  const presentCount = logsFilteredByClass.filter((s: Log) => s.status === AbsentStasuses.PRESENT).length;
  const lateCount = logsFilteredByClass.filter((s: Log) => s.status === AbsentStasuses.LATE).length;
  const excusedCount = logsFilteredByClass.filter((s: Log) => s.status === AbsentStasuses.EXCUSED).length;
  const absentCount = logsFilteredByClass.length - presentCount - lateCount - excusedCount;

  const pieChartData = [
    {legendFontSize: 12, legendFontColor: Colors.light.black, name: "Hadir", count: presentCount || 0, color: Colors.light.green },
    {legendFontSize: 12, legendFontColor: Colors.light.black, name: "Absen", count: absentCount || 0, color: Colors.light.red },
    {legendFontSize: 12, legendFontColor: Colors.light.black, name: "Terlambat", count: lateCount || 0, color: Colors.light.orange },
    {legendFontSize: 12, legendFontColor: Colors.light.black, name: "Izin", count: excusedCount || 0, color: Colors.light.yellow },
  ];

  const [selectedLogId, setSelectedLogId] = useState(null);
  const selectedLog = logs?.find((l) => l.id === selectedLogId);

  return (
    <MEContainer>
      <HistoryDetailsModal
        log={selectedLog}
        setSelectedLogId={setSelectedLogId}
      />
      <MEHeader/>
      <Text style={[textStyles.heading3, { marginBottom: 8 }]}>{student.displayName}</Text>
      <Text style={[textStyles.body1]}>{student.idNumber}</Text>

      <Text style={[textStyles.body2, {marginTop: 16, marginBottom: 4}]}>Deskripsi</Text>
      <Text style={[textStyles.body1, { fontFamily: 'manrope-bold', marginBottom: 32 }]}>
        {student.description}
      </Text>

      <Text style={[textStyles.heading4, { marginBottom: 8 }]}>Kehadiran Kelas</Text>
      <MEFirestoreSelect
        control={control}
        name='classId'
        listName='classes'
        label={false}
        placeholder="Pilih Kelas"
      />
      <MEControlledSelect
        control={control}
        name='status'
        label={false}
        placeholder="Pilih Status"
        options={[
          { value: AbsentStasuses.PRESENT, label: PresenceStatusEnum[AbsentStasuses.PRESENT] },
          { value: AbsentStasuses.LATE, label: PresenceStatusEnum[AbsentStasuses.LATE] },
          { value: AbsentStasuses.EXCUSED, label: PresenceStatusEnum[AbsentStasuses.EXCUSED] },
          { value: AbsentStasuses.ABSENT, label: PresenceStatusEnum[AbsentStasuses.ABSENT] },
        ]}
      />
      {
        (watch('status') || watch('classId')) && (
          <MEButton
            size='sm'
            variant='outline'
            onPress={() => reset()}
            style={{ 
              marginBottom: 16
            }}
          >
            Bersihkan Filter
          </MEButton>
        )
      }
      <View style={{ flexDirection: 'row', marginBottom: 8 }}>
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
      <Text style={[textStyles.body2, { marginBottom: 16 }]}>Data kehadiran dihitung dari {moment(dateStart).format('LL')}.</Text>
      {
        isLoading ? (
          <MESpinner/>
        ) : (
          <>
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
              filteredLogs.map((l, lIdx) => (
                <StudentDetailsLogCard
                  key={lIdx}
                  log={l}
                  onPress={() => {
                    setSelectedLogId(l.id)
                  }}
                />
              ))
            }
          </>
        )
      }
    </MEContainer>
  )
}