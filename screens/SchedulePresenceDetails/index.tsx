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
import { AbsentStasuses, ExcuseStatuses, ProfileRoles } from '../../constants/constants';
import MEButton from '../../components/MEButton';
import { createUpdateStudentPresenceFromCallout, studentExcuseStatusChange } from '../../actions/scheduleActions';
import { ClassesContext, ProfileContext, UsersContext } from '../../contexts';
import { doc, onSnapshot } from 'firebase/firestore';
import { firestore } from '../../firebase';
import Colors from '../../constants/Colors';
import { Log } from '../../types';

export default function SchedulePresenceDetails({
  route: {
    params: {
      classId,
      logId,
      scheduleId,
      studentId,
      isStudentLog,
      log: logProp,
    }
  }
}: NativeStackScreenProps<ScheduleParamList, "SchedulePresenceDetails">) {
  const { profile } = useContext(ProfileContext);
  const { classes } = useContext(ClassesContext);
  const { users } = useContext(UsersContext);
  const classroom = classes.find((c) => c.id === classId);
  const student = users?.[studentId];
  console.log(users)
  const [log, setLog] = useState<Log | undefined>(logProp);
  
  function loadData() {
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
    if (logId) {
      const unsubLog = onSnapshot(studentLogRef, (doc) => {
        setLog((prev: any) => ({ ...prev, ...doc.data(), id: doc.id }));
      })
      return unsubLog;
    }
  }

  useEffect(() => {
    const unsub = loadData();
    if (unsub) return () => unsub();
  }, [])

  const [excuseStatusLoading, setExcuseStatusLoading] = useState<any>(null);
  const [presenceLoading, setPresenceLoading] = useState<any>(null);

  async function handleExcuseStatusChange(excuseStatus: ExcuseStatuses) {
    setExcuseStatusLoading(excuseStatus);
    await studentExcuseStatusChange({
      scheduleId, 
      classId, 
      schoolId: profile.schoolId,
      studentLogId: logId,
      excuseStatus,
    })
    setExcuseStatusLoading(null);
  }

  async function handleCreatePresence(status: AbsentStasuses) {
    setPresenceLoading(status);
    await createUpdateStudentPresenceFromCallout({ 
      scheduleId, 
      studentId: studentId, 
      classId, 
      schoolId: profile.schoolId,
      status,
      studentLogId: logId
    })
    setPresenceLoading(null);
  }

  return (
    <MEContainer>
      <MEHeader
        title='Detail Kehadiran'
      />
      <Text style={textStyles.body2}>Nama</Text>
      <Text style={[textStyles.body1, { fontFamily: 'manrope-bold', marginBottom: 16 }]}>
        {student?.displayName}
      </Text>
      <Text style={textStyles.body2}>Kelas</Text>
      <Text style={[textStyles.body1, { fontFamily: 'manrope-bold', marginBottom: 16 }]}>
        {classroom?.name}
      </Text>
      <View style={{ flexDirection: 'row' }}>
        <View style={{ flex: 1 }}>
          <Text style={textStyles.body2}>Jam Mulai</Text>
          <Text style={[textStyles.body1, { fontFamily: 'manrope-bold', marginBottom: 16 }]}>
            {moment(log?.schedule?.start?.toDate()).format("HH:mm")}
          </Text>
        </View>
        <View style={{ flex: 1 }}>
          <Text style={textStyles.body2}>Jam Selesai</Text>
          <Text style={[textStyles.body1, { fontFamily: 'manrope-bold', marginBottom: 16 }]}>
            {moment(log?.schedule?.end?.toDate()).format("HH:mm")}
          </Text>
        </View>
      </View>
      {
        profile.role === ProfileRoles.STUDENT ? (
          <View style={{ flexDirection: 'row' }}>
            <View style={{ flex: 1 }}>
              <Text style={textStyles.body2}>Kehadiran</Text>
              <Text style={[textStyles.body1, { fontFamily: 'manrope-bold', marginBottom: 16, color: getStatusColor(status) }]}>
                {PresenceStatusEnum[log?.status]}
              </Text>
            </View>
            <View style={{ flex: 1 }}>
              <Text style={textStyles.body2}>Jam Kehadiran</Text>
              <Text style={[textStyles.body1, { fontFamily: 'manrope-bold', marginBottom: 16 }]}>
                {moment(log?.time.toDate()).format("HH:mm")}
              </Text>
            </View>
          </View>
        ) : (
          <View>
            {
              log?.status === AbsentStasuses.EXCUSED && log?.excuse ? (
                <>
                  <Text style={textStyles.body2}>Alasan Izin</Text>
                  <Text style={[textStyles.body1, { fontFamily: 'manrope-bold', marginBottom: 16 }]}>
                    {log?.excuse?.message}
                  </Text>
                  <Text style={textStyles.body2}>Bukti Izin</Text>
                  <Image
                    source={{
                      uri: log?.excuse?.proofUrl
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
                        variant={log?.excuseStatus !== ExcuseStatuses.REJECTED ? 'outline' : undefined}
                        iconStart={log?.excuseStatus === ExcuseStatuses.REJECTED ? 'check' : undefined}
                        isLoading={excuseStatusLoading === ExcuseStatuses.REJECTED}
                        onPress={() => handleExcuseStatusChange(ExcuseStatuses.REJECTED)}
                      >
                        Tolak
                      </MEButton>
                    </View>
                    <View style={{ flex: 1 }}>
                      <MEButton
                        color='success' 
                        variant={log?.excuseStatus !== ExcuseStatuses.ACCEPTED ? 'outline' : undefined}
                        iconStart={log?.excuseStatus === ExcuseStatuses.ACCEPTED ? 'check' : undefined}
                        isLoading={excuseStatusLoading === ExcuseStatuses.ACCEPTED}
                        onPress={() => handleExcuseStatusChange(ExcuseStatuses.ACCEPTED)}
                      >
                        Terima
                      </MEButton>
                    </View>
                  </View>
                </>
              ) : (
                <>
                  <MEButton 
                    color='danger'
                    variant={log?.status !== AbsentStasuses.ABSENT ? 'outline' : undefined}
                    iconStart={log?.status === AbsentStasuses.ABSENT ? 'check' : undefined}
                    isLoading={presenceLoading === AbsentStasuses.ABSENT}
                    onPress={() => handleCreatePresence(AbsentStasuses.ABSENT)}
                  >
                    Absen
                  </MEButton>
                  <MEButton 
                    color={Colors.light.yellows.yellow3}
                    style={{ marginVertical: 16 }}
                    variant={log?.status !== AbsentStasuses.LATE ? 'outline' : undefined}
                    iconStart={log?.status === AbsentStasuses.LATE ? 'check' : undefined}
                    isLoading={presenceLoading === AbsentStasuses.LATE}
                    onPress={() => handleCreatePresence(AbsentStasuses.LATE)}
                  >
                    Terlambat
                  </MEButton>
                  <MEButton   
                    color='success'
                    variant={log?.status !== AbsentStasuses.PRESENT ? 'outline' : undefined}
                    iconStart={log?.status === AbsentStasuses.PRESENT ? 'check' : undefined}
                    isLoading={presenceLoading === AbsentStasuses.PRESENT}
                    onPress={() => handleCreatePresence(AbsentStasuses.PRESENT)}
                  >
                    Hadir
                  </MEButton>
                </>
              )
            }
          </View>
        )
      }
    </MEContainer>
  )
}