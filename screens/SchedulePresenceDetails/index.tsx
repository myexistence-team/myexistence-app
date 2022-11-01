import { View, Text, Image } from 'react-native'
import React, { useContext, useEffect, useState } from 'react'
import { NativeStackScreenProps } from '@react-navigation/native-stack'
import { ScheduleParamList } from '../../navTypes'
import MEContainer from '../../components/MEContainer';
import MEHeader from '../../components/MEHeader';
import { textStyles } from '../../constants/Styles';
import moment from 'moment';
import { getStatusColor } from '../../utils/utilFunctions';
import { PresenceStatusEnum } from '../../enums';
import { AbsentStasuses, ExcuseStatuses } from '../../constants/constants';
import MEButton from '../../components/MEButton';
import { studentExcuseStatusChange } from '../../actions/scheduleActions';
import { ProfileContext } from '../../contexts';
import { doc, onSnapshot } from 'firebase/firestore';
import { firestore } from '../../firebase';

export default function SchedulePresenceDetails({
  route: {
    params: {
      logId,
      classId,
      scheduleId,
      isStudentLog,
      presence: presenceProp
    }
  }
}: NativeStackScreenProps<ScheduleParamList, "SchedulePresenceDetails">) {
  const { profile } = useContext(ProfileContext);
  const [presence, setPresence] = useState<any>(presenceProp)
  const {
    className,
    end,
    start,
    status,
    studentName,
    time,
    excuse,
    excuseStatus
  } = presence;

  const studentLogRef = doc(
    firestore, 
    'schools',
    profile.schoolId,
    'classes',
    classId,
    'schedules',
    scheduleId,
    'studentLogs',
    logId
  );
  function loadData() {
    if (logId) {
      onSnapshot(studentLogRef, (doc) => {
        setPresence((prev: any) => ({ ...prev, ...doc.data(), id: doc.id }));
      })
    }
  }

  useEffect(() => {
    loadData();
    // if (!presence) {
    // }
  }, [])

  const [excuseStatusLoading, setExcuseStatusLoading] = useState<any>(null);

  async function handleExcuseStatusChange(excuseStatus: ExcuseStatuses) {
    setExcuseStatusLoading(excuseStatus);
    await studentExcuseStatusChange({
      scheduleId, 
      classId: presence.classId, 
      schoolId: profile.schoolId,
      studentLogId: logId,
      excuseStatus,
    })
    setExcuseStatusLoading(null);
  }

  return (
    <MEContainer>
      <MEHeader
        title='Detail Kehadiran'
      />
      <Text style={textStyles.body2}>Nama</Text>
      <Text style={[textStyles.body1, { fontFamily: 'manrope-bold', marginBottom: 16 }]}>
        {studentName}
      </Text>
      <Text style={textStyles.body2}>Kelas</Text>
      <Text style={[textStyles.body1, { fontFamily: 'manrope-bold', marginBottom: 16 }]}>
        {className}
      </Text>
      <View style={{ flexDirection: 'row' }}>
        <View style={{ flex: 1 }}>
          <Text style={textStyles.body2}>Jam Mulai</Text>
          <Text style={[textStyles.body1, { fontFamily: 'manrope-bold', marginBottom: 16 }]}>
            {moment(start.toDate()).format("HH:mm")}
          </Text>
        </View>
        <View style={{ flex: 1 }}>
          <Text style={textStyles.body2}>Jam Selesai</Text>
          <Text style={[textStyles.body1, { fontFamily: 'manrope-bold', marginBottom: 16 }]}>
            {moment(end.toDate()).format("HH:mm")}
          </Text>
        </View>
      </View>
      <View style={{ flexDirection: 'row' }}>
        <View style={{ flex: 1 }}>
          <Text style={textStyles.body2}>Jam Mulai</Text>
          <Text style={[textStyles.body1, { fontFamily: 'manrope-bold', marginBottom: 16, color: getStatusColor(status) }]}>
            {PresenceStatusEnum[status]}
          </Text>
        </View>
        <View style={{ flex: 1 }}>
          <Text style={textStyles.body2}>Jam Kehadiran</Text>
          <Text style={[textStyles.body1, { fontFamily: 'manrope-bold', marginBottom: 16 }]}>
            {moment(time.toDate()).format("HH:mm")}
          </Text>
        </View>
      </View>
      {
        status === AbsentStasuses.EXCUSED && excuse && (
          <>
            <Text style={textStyles.body2}>Alasan Izin</Text>
            <Text style={[textStyles.body1, { fontFamily: 'manrope-bold', marginBottom: 16 }]}>
              {excuse.message}
            </Text>
            <Text style={textStyles.body2}>Bukti Izin</Text>
            <Image
              source={{
                uri: excuse.proofUrl
              }}
              style={{
                width: '100%',
                height: 400,
                marginTop: 8
              }}
            />
            <View style={{ flexDirection: 'row', marginTop: 16 }}>
              <View style={{ flex: 1, marginRight: 16 }}>
                <MEButton 
                  color='danger'
                  variant={excuseStatus !== ExcuseStatuses.REJECTED ? 'outline' : undefined}
                  iconStart={excuseStatus === ExcuseStatuses.REJECTED ? 'check' : undefined}
                  isLoading={excuseStatusLoading === ExcuseStatuses.REJECTED}
                  onPress={() => handleExcuseStatusChange(ExcuseStatuses.REJECTED)}
                >
                  Tolak
                </MEButton>
              </View>
              <View style={{ flex: 1 }}>
                <MEButton 
                  variant={excuseStatus !== ExcuseStatuses.ACCEPTED ? 'outline' : undefined}
                  iconStart={excuseStatus === ExcuseStatuses.ACCEPTED ? 'check' : undefined}
                  isLoading={excuseStatusLoading === ExcuseStatuses.ACCEPTED}
                  onPress={() => handleExcuseStatusChange(ExcuseStatuses.ACCEPTED)}
                >
                  Terima
                </MEButton>
              </View>
            </View>
          </>
        )
      }
    </MEContainer>
  )
}