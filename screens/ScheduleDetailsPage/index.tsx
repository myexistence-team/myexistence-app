import { View, Text } from 'react-native'
import React, { useContext, useEffect, useState } from 'react'
import MEContainer from '../../components/MEContainer'
import { ScheduleScreenProps } from '../../navTypes'
import { textStyles } from '../../constants/Styles'
import moment from 'moment'
import MEHeader from '../../components/MEHeader'
import { Schedule } from '../../types'
import MESpinner from '../../components/MESpinner'
import { collection, doc, getDoc, onSnapshot, query, where } from 'firebase/firestore'
import { firestore } from '../../firebase'
import { AuthContext, ProfileContext } from '../../contexts'
import MEButton from '../../components/MEButton'
import { useNavigation } from '@react-navigation/native'
import { DAYS_ARRAY, ProfileRoles, ScheduleStasuses } from '../../constants/constants'
import { closeSchedule, openSchedule } from '../../actions/scheduleActions'
import SvgQRCode from 'react-native-qrcode-svg';
import MEPressableText from '../../components/MEPressableText'

export default function ScheduleDetailsPage({ route }: ScheduleScreenProps) {
  const { scheduleId, classId, toggleOpen } = route.params;
  const navigation = useNavigation();

  const { profile } = useContext(ProfileContext);
  const { auth } = useContext(AuthContext);
  const [schedule, setSchedule] = useState<Schedule | any>(null);
  const [qrCode, setQRCode] = useState<any>(null);
  const [absentCount, setAbsentCount] = useState(0);

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
              studentCount: classSnap.data().studentIds?.length || 0
            });
          }
        })
      }
    })
  } 

  function loadQRCodes() {
    const schedulePath = [
      profile.schoolId,
      'classes',
      classId,
      'schedules',
      scheduleId,
    ];
    onSnapshot(
      query(
        collection(
          firestore, 
          'schools',
          ...schedulePath,
          'qrCodes'
        ),
        where('scanned', '==', false),
      ),
      (qrCodeSnaps) => {
        setAbsentCount(qrCodeSnaps.size);
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

  useEffect(() => {
    if (toggleOpen) {
      handleOpenOrCloseClass();
    }
  }, [toggleOpen])

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
                  {
                    schedule.status === ScheduleStasuses.OPENED && (
                      <>
                        {
                          qrCode && (
                            <View style={{ alignItems: 'center', padding: 24,  }}>
                              <SvgQRCode
                                value={qrCode.id}
                                size={240}
                              />
                              <Text style={[textStyles.body3, { textAlign: 'center', marginTop: 8 }]}>Berikan QR Code kepada pelajar untuk mereka pindai</Text>
                            </View>
                          )
                        }
                        <Text style={[textStyles.body2, { textAlign: 'center' }]}>Pelajar Hadir</Text>
                        <MEPressableText 
                          style={[textStyles.body1, { 
                            fontFamily: 'manrope-bold', 
                            marginBottom: 16,
                            textAlign: 'center'
                          }]}
                          onPress={() => {
                            navigation.navigate('Root', {
                              screen: 'SchedulesPage',
                              params: {
                                screen: 'SchedulePresences',
                                params: {
                                  scheduleId,
                                  classId
                                },  
                                initial: false
                              }
                            })
                          }}
                        >
                          {schedule.studentCount - absentCount}/{schedule.studentCount}
                        </MEPressableText>
                      </>
                    )
                  }
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