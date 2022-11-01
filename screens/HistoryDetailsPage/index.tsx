import { View, Text } from 'react-native'
import React, { useContext, useEffect, useState } from 'react'
import { HistoryScreenProps } from '../../navTypes'
import { useNavigation } from '@react-navigation/native';
import { ProfileContext } from '../../contexts';
import { Class, Log } from '../../types';
import { doc, getDoc } from 'firebase/firestore';
import { firestore } from '../../firebase';
import MEContainer from '../../components/MEContainer';
import MEHeader from '../../components/MEHeader';
import MESpinner from '../../components/MESpinner';
import { textStyles } from '../../constants/Styles';
import { DAYS_ARRAY, AbsentStasuses } from '../../constants/constants';
import moment from 'moment';
import Colors from '../../constants/Colors';
import { ExcuseStatusesEnum, PresenceStatusEnum } from '../../enums';
import MEPressableText from '../../components/MEPressableText';
import { getStatusColor } from '../../utils/utilFunctions';

export default function HistoryDetailsPage({ 
  route: { 
    params: { 
      logId,
      isCurrent,
      classId,
    } 
  }
}: HistoryScreenProps) {
  const navigation = useNavigation();
  const { profile } = useContext(ProfileContext);
  const [log, setLog] = useState<Log | any>(null);
  const [classroom, setClassroom] = useState<Class | any>(null);
  const [teacher, setTeacher] = useState<any>(null);

  function loadData() {
    setLog(null);
    var currentLogRef
    if (isCurrent && profile.currentScheduleId) {
      currentLogRef = doc(
        firestore,
        'schools',
        profile.schoolId,
        'classes',
        classId,
        'schedules',
        profile.currentScheduleId,
        'studentLogs',
        logId
      )
    } else {
      currentLogRef = doc(
        firestore, 
        'schools', 
        profile.schoolId,
        'logs',
        logId,
      )
    }
    getDoc(currentLogRef).then((logSnap) => {
      if (logSnap.exists()) {
        setLog(logSnap.data());
        getDoc(doc(
          firestore, 
          'schools', 
          profile.schoolId,
          'classes',
          logSnap.data().classId
        )).then((classSnap) => {
          if (classSnap.exists()) {
            setClassroom(classSnap.data());
          }
        })
        getDoc(doc(
          firestore, 
          'users', 
          logSnap.data().teacherId,
        )).then((teacherSnap) => {
          if (teacherSnap.exists()) {
            setTeacher(teacherSnap.data());
          }
        })
      }
    })
  }

  useEffect(() => {
    loadData();
  }, [])

  return (
    <MEContainer
      onRefresh={loadData}
      refreshing={!Boolean(log)}
    >
      <MEHeader
        title='Detail Riwayat'
      />
      {
        !log ? (
          <MESpinner/>
        ) : (
          <>
            <MEPressableText 
              style={[{
                fontFamily: 'manrope-bold', 
                marginBottom: 4, 
                fontSize: 30
              }]}
              onPress={() => {
                navigation.navigate('Root', {
                  screen: 'ClassPage',
                  params: {
                    screen: 'ClassDetails',
                    params: {
                      classId: log.classId
                    },
                    initial: false
                  }
                })
              }}
            >
              {classroom?.name}
            </MEPressableText>
            <Text style={[textStyles.body1, {marginBottom: 32}]}>{classroom?.description}</Text>

            <Text style={[textStyles.heading4, { marginBottom: 16 }]}>Jadwal</Text>

            <Text style={textStyles.body2}>Hari</Text>
            <Text style={[textStyles.body1, { fontFamily: 'manrope-bold', marginBottom: 16 }]}>
              {DAYS_ARRAY[log.schedule.start.toDate().getDay()]}
            </Text>

            <View style={{ flexDirection: 'row' }}>
              <View style={{ flex: 1 }}>
                <Text style={textStyles.body2}>Jam Mulai</Text>
                <Text style={[textStyles.body1, { fontFamily: 'manrope-bold', marginBottom: 16 }]}>
                  {moment(log.schedule.start.toDate()).format("HH:mm")}
                </Text>
              </View>
              <View style={{ flex: 1 }}>
                <Text style={textStyles.body2}>Jam Selesai</Text>
                <Text style={[textStyles.body1, { fontFamily: 'manrope-bold', marginBottom: 16 }]}>
                  {moment(log.schedule.end.toDate()).format("HH:mm")}
                </Text>
              </View>
            </View>

            <Text style={textStyles.body2}>Toleransi</Text>
            <Text style={[textStyles.body1, { fontFamily: 'manrope-bold', marginBottom: 32 }]}>
              {log.schedule.tolerance} Menit
            </Text>

            <Text style={[textStyles.heading4, { marginBottom: 16 }]}>Sesi Kelas</Text>
            <Text style={textStyles.body2}>Guru</Text>
            <Text style={[textStyles.body1, { fontFamily: 'manrope-bold', marginBottom: 16 }]}>
              {teacher?.displayName}
            </Text>
            <View style={{ flexDirection: 'row' }}>
              <View style={{ flex: 1 }}>
                <Text style={textStyles.body2}>Tanggal Dibuka</Text>
                <Text style={[textStyles.body1, { fontFamily: 'manrope-bold', marginBottom: 16 }]}>
                  {moment(log.schedule.openedAt.toDate()).format("LL HH:mm")}
                </Text>
              </View>
            </View>

            <Text style={[textStyles.heading4, { marginBottom: 16, marginTop: 24 }]}>Kehadiran Anda</Text>
            <View style={{ flexDirection: 'row' }}>
              <View style={{ flex: 1 }}>
                <Text style={textStyles.body2}>Status</Text>
                <Text style={[textStyles.body1, { 
                  fontFamily: 'manrope-bold', 
                  marginBottom: 16,
                  color: getStatusColor(log.status)
                }]}>
                  {PresenceStatusEnum[log.status]}
                </Text>
              </View>
              {
                log.status === AbsentStasuses.EXCUSED && (
                  <View style={{ flex: 1 }}>
                    <Text style={textStyles.body2}>Status Perizinan</Text>
                    <Text style={[textStyles.body1, { 
                      fontFamily: 'manrope-bold', 
                      marginBottom: 16,
                    }]}>
                      {ExcuseStatusesEnum[log.excuseStatus]}
                    </Text>
                  </View>
                )
              }
              {
                (log.status === AbsentStasuses.PRESENT || log.status === AbsentStasuses.LATE) && (
                  <View style={{ flex: 1 }}>
                    <Text style={textStyles.body2}>Jam Masuk</Text>
                    <Text style={[textStyles.body1, { fontFamily: 'manrope-bold', marginBottom: 16 }]}>
                      {moment(log.time.toDate()).format("HH:mm")}
                    </Text>
                  </View>
                )
              }
            </View>
          </>
        )
      }
    </MEContainer>
  )
}