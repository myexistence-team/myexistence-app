import { View, Text, Alert, Pressable, Modal } from 'react-native'
import React, { useContext, useEffect, useMemo, useState } from 'react'
import MEContainer from '../../components/MEContainer'
import { ScheduleScreenProps } from '../../navTypes'
import { textStyles } from '../../constants/Styles'
import moment from 'moment'
import MEHeader from '../../components/MEHeader'
import { Schedule } from '../../types'
import MESpinner from '../../components/MESpinner'
import { collection, collectionGroup, limit, onSnapshot, query, Unsubscribe, where } from 'firebase/firestore'
import { firestore } from '../../firebase'
import { AuthContext, ClassesContext, LocationContext, ProfileContext } from '../../contexts'
import MEButton from '../../components/MEButton'
import { useNavigation } from '@react-navigation/native'
import { AbsentStasuses, CALLOUT_TUTORIAL, DAYS_ARRAY, GEOLOCATION_TUTORIAL, MAX_DISTACE, ProfileRoles, QR_CODE_TUTORIAL, ScheduleOpenMethods, ScheduleStasuses } from '../../constants/constants'
import { closeSchedule, createUpdateStudentPresenceFromCallout, openSchedule } from '../../actions/scheduleActions'
import MEPressableText from '../../components/MEPressableText'
import ScheduleOpenQRCode from './ScheduleOpenQRCode'
import ScheduleOpenStudentCallouts from './ScheduleOpenStudentCallouts'
import HistoryCard from '../../components/HistoryCard'
import Colors from '../../constants/Colors'
import useGetDistance from '../../hooks/useGetDistance'
import { FontAwesome5 } from '@expo/vector-icons'
import HistoryDetailsModal from '../HistoryDetailsModal'

export default function ScheduleDetailsPage({ route }: ScheduleScreenProps) {
  const { scheduleId, classId, toggleOpen } = route.params;
  const navigation = useNavigation();

  const { profile } = useContext(ProfileContext);
  const { classes } = useContext(ClassesContext);
  const { auth } = useContext(AuthContext);
  const { location, getLocation, startForegroundLocation } = useContext(LocationContext);
  const [schedule, setSchedule] = useState<Schedule | null>(null);
  const [qrCode, setQRCode] = useState<any>(null);
  const [absentCount, setAbsentCount] = useState(0);
  const [studentIds, setStudentIds] = useState<string[]>([]);
  const [studentLogs, setStudentLogs] = useState<any[]>([]);

  function loadData() {
    setSchedule(null);
    setStudentLogs([]);
    const schedulesQuery = query(
      collectionGroup(firestore, 'schedules'),
      where('id', '==', scheduleId),
      limit(1)
    );
    var unsubStudentLogs: Unsubscribe | undefined = undefined;
    const unsubSchedule = onSnapshot(schedulesQuery, (scheduleSnaps) => {
      if (!scheduleSnaps.empty) {
        const scheduleData = scheduleSnaps.docs[0].data();
        const scheduleRef = scheduleSnaps.docs[0].ref;
        const classObj = classes?.find((c) => c.id === scheduleData.classId)
        const studentLogsRef = collection(firestore, scheduleRef.path, 'studentLogs');
        const studentLogsQuery = query(studentLogsRef);
        unsubStudentLogs = onSnapshot(studentLogsQuery, (docs) => {
          if (!docs.empty) {
            setStudentLogs(docs.docs.map((doc) => ({ 
              ...doc.data(), 
              id: doc.id,
              isCurrent: true
            })));
          } else {
            setStudentLogs([]);
          }
        });
        if (classObj) {
          setSchedule({
            ...scheduleData,
            classId: classObj.id,
            className: classObj?.name,
            classDescription: classObj?.description,
          });
          setStudentIds(classObj.studentIds || []);
        }
      }
    })

    return { unsubSchedule, unsubStudentLogs };
  } 

  function loadQRCodes() {
    setQRCode(null);
    const schedulePath = [
      profile.schoolId,
      'classes',
      schedule.classId,
      'schedules',
      scheduleId,
    ];
    return onSnapshot(
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
        if (schedule.openMethod === ScheduleOpenMethods.GEOLOCATION && schedule.location) {
          startForegroundLocation();
        }
        const unsubQRCodes = loadQRCodes();
        return () => unsubQRCodes();
      } else {
        setQRCode(null);
      }
    }
  }, [schedule, scheduleId])

  useEffect(() => {
    const { unsubSchedule, unsubStudentLogs } = loadData();
    return () => {
      if (unsubSchedule) unsubSchedule();
      if (unsubStudentLogs !== undefined) unsubStudentLogs();
    }
  }, [scheduleId])

  const [changingStatus, setChangingStatus] = useState<any>(null);
  async function handleOpenOrCloseClass(openMethod: ScheduleOpenMethods) {
    setChangingStatus(openMethod);
    var location = undefined;
    if (openMethod === ScheduleOpenMethods.GEOLOCATION) {
      location = await getLocation();
    }
    await (schedule && schedule?.status === ScheduleStasuses.OPENED ? closeSchedule : openSchedule)({
      schoolId: profile.schoolId,
      classId: schedule?.classId || classId,
      scheduleId,
      teacherId: auth.uid,
      openMethod,
      location
    })
    setChangingStatus(null);
  }

  const [geoPresenceLoading, setGeoPresenceLoading] = useState(false);
  async function handleGeolocationPresence() {
    setGeoPresenceLoading(true);
    await createUpdateStudentPresenceFromCallout({
      classId,
      scheduleId,
      schoolId: profile.schoolId,
      status: AbsentStasuses.PRESENT,
      studentId: auth.uid,
    });
    setGeoPresenceLoading(false);
  }

  function handleOpenOrCloseClassConfirm(openMethod: ScheduleOpenMethods) {
    Alert.alert(
      schedule?.status === ScheduleStasuses.OPENED ? 'Tutup Sesi' : 'Buka Sesi',
      `Apakah Anda yakin ingin ${schedule?.status === ScheduleStasuses.OPENED ? 'menutup' : 'membuka'} sesi kelas?`,
      [
        {
          text: 'Batal',
          style: 'cancel',
          onPress: () => {}
        },
        {
          text: 'Ya',
          onPress: () => {
            handleOpenOrCloseClass(openMethod);
          }
        }
      ]
    )
  }

  useEffect(() => {
    if (toggleOpen) {
      handleOpenOrCloseClass(toggleOpen);
    }
  }, [toggleOpen])

  const distance: number = useGetDistance(schedule?.location);

  const [showInfo, setShowInfo] = useState(false);

  const [selectedLogId, setSelectedLogId] = useState(null);
  const selectedLog = studentLogs?.find((l) => l.id === selectedLogId);

  return (
    <MEContainer
      onRefresh={loadData}
      refreshing={!Boolean(schedule)}
    >
      <HistoryDetailsModal
        log={selectedLog}
        setSelectedLogId={setSelectedLogId}
      />
      <MEHeader
        title='Detail Sesi'
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


            <View style={{ flexDirection: 'row' }}>
              <View style={{ flex: 1 }}>
                <Text style={textStyles.body2}>Hari</Text>
                <Text style={[textStyles.body1, { fontFamily: 'manrope-bold', marginBottom: 16 }]}>
                  {DAYS_ARRAY[schedule.day]}
                </Text>
              </View>
              <View style={{ flex: 1 }}>
                <Text style={textStyles.body2}>Jam</Text>
                <Text style={[textStyles.body1, { fontFamily: 'manrope-bold', marginBottom: 16 }]}>
                  {moment(schedule.start.toDate()).format("HH:mm")} - {moment(schedule.end.toDate()).format("HH:mm")}
                </Text>
              </View>
            </View>


            <Text style={textStyles.body2}>Toleransi</Text>
            <Text style={[textStyles.body1, { fontFamily: 'manrope-bold', marginBottom: 16 }]}>
              {schedule.tolerance} Menit
            </Text>
            {
              profile.currentScheduleId && scheduleId !== profile.currentScheduleId ? (
                <>
                  <Text style={[textStyles.body1, { textAlign: 'center', marginBottom: 8, color: Colors.light.grey }]}>Sudah ada sesi kelas yang berlangsung.</Text>
                  <MEPressableText 
                    style={[textStyles.body1, { textAlign: 'center', fontFamily: 'manrope-bold' }]}
                    onPress={() => {
                      navigation.navigate('Root', {
                        screen: 'SchedulesPage',
                        params: {
                          screen: 'ScheduleDetails',
                          params: {
                            classId: schedule.classId,
                            scheduleId: profile.currentScheduleId || '',
                          },
                          initial: false
                        },
                        initial: false
                      })
                    }}
                  >Lihat Sesi Kelas</MEPressableText>
                </>
              ) : (
                <>
                  {
                    profile.role === ProfileRoles.STUDENT ? (
                      <>
                        {
                          studentLogs.length > 0 ? studentLogs.map((studentLog, slIdx) => (
                            <HistoryCard
                              history={studentLog}
                              key={slIdx}
                              onPress={() => setSelectedLogId(studentLog.id)}
                            />
                          )) : (
                            <>                      
                              {
                                schedule.status === ScheduleStasuses.OPENED ? 
                                schedule.openMethod === ScheduleOpenMethods.QR_CODE ? (
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
                                ) : (
                                  <>
                                    <MEButton
                                      iconStart="check"
                                      size='lg'
                                      style={{
                                        marginTop: 8
                                      }}
                                      disabled={distance > MAX_DISTACE}
                                      onPress={handleGeolocationPresence}
                                      isLoading={geoPresenceLoading}
                                    >
                                      Hadir
                                    </MEButton>
                                    {
                                      distance > MAX_DISTACE && (
                                        <Text 
                                          style={[textStyles.body2, { 
                                            textAlign: 'center', 
                                            marginVertical: 8, 
                                            color: Colors.light.red 
                                          }]}
                                        >
                                          Anda sedang tidak ada di sekitar lokasi kelas!
                                        </Text>
                                      )
                                    }
                                  </>
                                ) : null
                              }
                              <MEButton
                                variant='outline'
                                style={{
                                  marginTop: 8
                                }}
                                onPress={() => navigation.navigate('ExcusePage', {
                                  classId: schedule.classId, scheduleId
                                })}
                              >
                                Izin Kelas
                              </MEButton>
                            </>
                          )
                        }                
                      </>
                    ) : (
                      <>
                        <Modal
                          animationType='slide'
                          presentationStyle='pageSheet'
                          onRequestClose={() => {
                            setShowInfo(false)
                          }}
                          onDismiss={() => {
                            setShowInfo(false)
                          }}
                          visible={showInfo}
                        >
                          <View
                            style={{
                              flex: 1,
                              padding: 24,
                              paddingTop: 48,
                            }}
                          >
                            <View style={{ marginBottom: 24 }}>
                              <FontAwesome5 name='map-marker-alt' size={36} />
                              <Text style={[textStyles.heading5, { marginVertical: 16, textAlign: 'justify' }]}>Deteksi Lokasi</Text>
                              <Text style={textStyles.body2}>{GEOLOCATION_TUTORIAL}</Text>
                            </View>
                            <View style={{ marginBottom: 24 }}>
                              <FontAwesome5 name='qrcode' size={36} />
                              <Text style={[textStyles.heading5, { marginVertical: 16, textAlign: 'justify' }]}>QR Code</Text>
                              <Text style={textStyles.body2}>{QR_CODE_TUTORIAL}</Text>
                            </View>
                            <View style={{ marginBottom: 24 }}>
                              <FontAwesome5 name='hand-paper' size={36} />
                              <Text style={[textStyles.heading5, { marginVertical: 16, textAlign: 'justify' }]}>Panggil Pelajar</Text>
                              <Text style={textStyles.body2}>{CALLOUT_TUTORIAL}</Text>
                            </View>
                            <MEButton
                              variant='outline'
                              onPress={() => setShowInfo(false)}
                            >
                              Dimengerti
                            </MEButton>
                          </View>
                        </Modal>
                        {
                          (schedule.status === ScheduleStasuses.OPENED)
                          ? schedule.openMethod === ScheduleOpenMethods.QR_CODE 
                          ? <ScheduleOpenQRCode
                            qrCode={qrCode}
                            scheduleId={scheduleId}
                            classId={schedule.classId}
                            absentCount={absentCount}
                            studentCount={studentIds.length}
                          /> : schedule.openMethod === ScheduleOpenMethods.CALLOUT ? (
                            <ScheduleOpenStudentCallouts
                              studentIds={studentIds}
                              scheduleId={scheduleId}
                              classId={schedule.classId}
                            />  
                          ) : null : null
                        }
                        {
                          schedule.status !== ScheduleStasuses.OPENED ? (
                            <>
                              <View style={{ flexDirection: 'row', justifyContent: 'center', alignItems: 'center', marginBottom: 16 }}>
                                <Text style={[textStyles.body2, { textAlign: 'center', marginRight: 8 }]}>Buka kelas dengan cara</Text>
                                <Pressable
                                  onPress={() => setShowInfo(true)}
                                >
                                  <FontAwesome5 name='info-circle' color={Colors.light.blue} size={16}/>
                                </Pressable>
                              </View>
                              <MEButton
                                size='lg'
                                style={{
                                  marginVertical: 8
                                }}
                                onPress={() => handleOpenOrCloseClassConfirm(ScheduleOpenMethods.GEOLOCATION)}
                                isLoading={changingStatus === ScheduleOpenMethods.GEOLOCATION}
                                iconStart='map-marker-alt'
                              >
                                Deteksi Lokasi
                              </MEButton>
                              <MEButton
                                size='lg'
                                style={{
                                  marginBottom: 8
                                }}
                                onPress={() => handleOpenOrCloseClassConfirm(ScheduleOpenMethods.QR_CODE)}
                                isLoading={changingStatus === ScheduleOpenMethods.QR_CODE}
                                iconStart='qrcode'
                              >
                                QR Code
                              </MEButton>
                              <MEButton
                                size='lg'
                                onPress={() => handleOpenOrCloseClassConfirm(ScheduleOpenMethods.CALLOUT)}
                                isLoading={changingStatus === ScheduleOpenMethods.CALLOUT}
                                iconStart='hand-paper'
                              >
                                Panggil Pelajar
                              </MEButton>
                            </>
                          ) : (
                            <>
                              <MEButton
                                onPress={() => {
                                  navigation.navigate('Root', {
                                    screen: 'SchedulesPage',
                                    params: {
                                      screen: 'SchedulePresences',
                                      params: {
                                        classId,
                                        schedule,
                                        scheduleId
                                      }
                                    }
                                  })
                                }}
                                variant='outline'
                              >
                                {`Lihat Pelajar (${studentLogs.length}/${studentIds.length})`}
                              </MEButton>
                              <MEButton
                                size='lg'
                                style={{
                                  marginVertical: 8
                                }}
                                onPress={() => handleOpenOrCloseClassConfirm(ScheduleOpenMethods.QR_CODE)}
                                isLoading={changingStatus !== null}
                                variant='outline'
                                color='danger'
                                iconStart='window-close'
                              >
                                Tutup Sesi
                              </MEButton>
                            </>
                          )
                        }
                      </>
                    )
                  }
                </>
              )
            }
          </>
        )
      }
    </MEContainer>
  )
}