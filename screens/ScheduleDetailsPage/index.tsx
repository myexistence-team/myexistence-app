import { View, Text } from 'react-native'
import React, { useContext, useEffect, useState } from 'react'
import MEContainer from '../../components/MEContainer'
import { ScheduleScreenProps } from '../../navTypes'
import { textStyles } from '../../constants/Styles'
import moment from 'moment'
import MEHeader from '../../components/MEHeader'
import { Schedule } from '../../types'
import MESpinner from '../../components/MESpinner'
import { collection, doc, getDoc, limit, onSnapshot, query, where } from 'firebase/firestore'
import { firestore } from '../../firebase'
import { AuthContext, ProfileContext } from '../../contexts'
import useCurrentScheduleTime from '../../hooks/useCurrentScheduleTime'
import MEButton from '../../components/MEButton'
import { useNavigation } from '@react-navigation/native'
import { DAYS_ARRAY, ProfileRoles, ScheduleStasuses } from '../../constants/constants'
import { closeSchedule, openSchedule } from '../../actions/scheduleActions'
import SvgQRCode from 'react-native-qrcode-svg';

export default function ScheduleDetailsPage({ route }: ScheduleScreenProps) {
  const { scheduleId, classId } = route.params;
  const navigation = useNavigation();

  const { profile } = useContext(ProfileContext);
  const { auth } = useContext(AuthContext);
  const [schedule, setSchedule] = useState<Schedule | any>(null);
  const [qrCode, setQRCode] = useState<any>(null);

  function loadData() {
    setSchedule(null);
    onSnapshot(doc(
      firestore, 
      'schools', 
      profile.schoolId,
      'classes',
      classId,
      'schedules',
      scheduleId
    ), (scheduleSnap) => {
      if (scheduleSnap.exists()) {
        getDoc(doc(
          firestore, 
          'schools', 
          profile.schoolId,
          'classes',
          classId
        )).then((classSnap) => {
          if (classSnap.exists()) {
            setSchedule({
              ...scheduleSnap.data(),
              className: classSnap.data().name,
              classDescription: classSnap.data().description,
            });
          }
        })
      }
    })
  } 

  function loadQRCodes() {
    onSnapshot(
      query(
        collection(
          firestore, 
          'schools',
          profile.schoolId || '',
          'classes',
          classId,
          'schedules',
          scheduleId,
          'qrCodes'
        ),
        where('scanned', '==', false),
        limit(1)
      ),
      (qrCodeSnaps) => {
        if (!qrCodeSnaps.empty) {
          setQRCode({
            ...qrCodeSnaps.docs[0].data(),
            id: qrCodeSnaps.docs[0].id
          });
        }
      }
    );
  }

  useEffect(() => {
    if (schedule) {
      if (schedule.status === ScheduleStasuses.OPENED) {
        loadQRCodes();
      } else {
        setQRCode(null);
      }
    }
  }, [schedule])

  useEffect(() => {
    loadData();
  }, [])

  const [changingStatus, setChangingStatus] = useState(false);
  function handleOpenOrCloseClass() {
    setChangingStatus(true);
    (schedule.status === ScheduleStasuses.CLOSED ? openSchedule : closeSchedule)(
      profile.schoolId,
      classId,
      scheduleId,
      auth.uid
    )
      .finally(() => {
        setChangingStatus(false);
      })
  }

  return (
    <MEContainer
      onRefresh={loadData}
      refreshing={!Boolean(schedule)}
    >
      <MEHeader
        title='Detail Jadwal'
      />
      {
        !schedule ? (
          <MESpinner/>
        ) : (
          <>
            <Text style={textStyles.body2}>Nama Kelas</Text>
            <Text style={[textStyles.body1, { fontFamily: 'manrope-bold', marginBottom: 16 }]}>
              {schedule.className}
            </Text>

            <Text style={textStyles.body2}>Deskripsi</Text>
            <Text style={[textStyles.body1, { fontFamily: 'manrope-bold', marginBottom: 16 }]}>
              {schedule.classDescription}
            </Text>

            <Text style={textStyles.body2}>Hari</Text>
            <Text style={[textStyles.body1, { fontFamily: 'manrope-bold', marginBottom: 16 }]}>
              {DAYS_ARRAY[schedule.day]}
            </Text>

            <View style={{ flexDirection: 'row' }}>
              <View style={{ flex: 1 }}>
                <Text style={textStyles.body2}>Jam Mulai</Text>
                <Text style={[textStyles.body1, { fontFamily: 'manrope-bold', marginBottom: 16 }]}>
                  {moment(schedule.start.toDate()).format("HH:mm")}
                </Text>
              </View>
              <View style={{ flex: 1 }}>
                <Text style={textStyles.body2}>Jam Selesai</Text>
                <Text style={[textStyles.body1, { fontFamily: 'manrope-bold', marginBottom: 16 }]}>
                  {moment(schedule.end.toDate()).format("HH:mm")}
                </Text>
              </View>
            </View>


            <Text style={textStyles.body2}>Toleransi</Text>
            <Text style={[textStyles.body1, { fontFamily: 'manrope-bold', marginBottom: 16 }]}>
              {schedule.tolerance} Menit
            </Text>
            {
              qrCode && (
                <View style={{ alignItems: 'center', paddingVertical: 24 }}>
                  <SvgQRCode
                    value={qrCode.id}
                    size={240}
                  />
                </View>
              )
            }
            {
              profile.role === ProfileRoles.STUDENT ? (
                <>                
                  {
                    schedule.status === ScheduleStasuses.OPENED ? (
                      <MEButton
                        iconStart="qrcode"
                        size='lg'
                        style={{
                          marginTop: 8
                        }}
                        onPress={() => navigation.navigate('Scanner', {
                          scheduleId: schedule.id,
                          schedule
                        })}
                      >
                        Pindai QR Code
                      </MEButton>
                    ) : null
                  }
                </>
              ) : (
                <>
                  <MEButton
                    size='lg'
                    style={{
                      marginTop: 8
                    }}
                    onPress={handleOpenOrCloseClass}
                    isLoading={changingStatus}
                  >
                    { schedule.status === ScheduleStasuses.CLOSED ? 'Buka Kelas' : 'Tutup Kelas' }
                  </MEButton>
                </>
              )
            }
          </>
        )
      }
    </MEContainer>
  )
}