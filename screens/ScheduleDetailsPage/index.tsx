import { View, Text } from 'react-native'
import React, { Fragment, useContext, useEffect, useState } from 'react'
import MEContainer from '../../components/MEContainer'
import { ScheduleScreenProps } from '../../navTypes'
import { textStyles } from '../../constants/Styles'
import moment from 'moment'
import MEHeader from '../../components/MEHeader'
import { Schedule } from '../../types'
import MESpinner from '../../components/MESpinner'
import { collection, collectionGroup, doc, DocumentReference, getDoc, getDocs, limit, onSnapshot, query, Unsubscribe, where } from 'firebase/firestore'
import { firestore } from '../../firebase'
import { AuthContext, ClassesContext, ProfileContext } from '../../contexts'
import MEButton from '../../components/MEButton'
import { useNavigation } from '@react-navigation/native'
import { DAYS_ARRAY, ProfileRoles, ScheduleOpenMethods, ScheduleStasuses } from '../../constants/constants'
import { closeSchedule, openSchedule } from '../../actions/scheduleActions'
import MEPressableText from '../../components/MEPressableText'
import ScheduleOpenQRCode from './ScheduleOpenQRCode'
import ScheduleOpenStudentCallouts from './ScheduleOpenStudentCallouts'
import HistoryCard from '../../components/HistoryCard'

export default function ScheduleDetailsPage({ route }: ScheduleScreenProps) {
  const { scheduleId, classId, toggleOpen } = route.params;
  const navigation = useNavigation();

  const { profile } = useContext(ProfileContext);
  const { classes } = useContext(ClassesContext);
  const { auth } = useContext(AuthContext);
  const [schedule, setSchedule] = useState<Schedule | any>(null);
  const [qrCode, setQRCode] = useState<any>(null);
  const [absentCount, setAbsentCount] = useState(0);
  const [studentIds, setStudentIds] = useState<string[]>([]);
  const [studentLogs, setStudentLogs] = useState<any[]>([]);

  function loadData() {
    setSchedule(null);
    const schedulesQuery = query(
      collectionGroup(firestore, 'schedules'),
      where('id', '==', scheduleId),
      limit(1)
    );
    var unsubStudentLogs: Unsubscribe | null = null;
    const unsubSchedule = onSnapshot(schedulesQuery, (scheduleSnaps) => {
      if (!scheduleSnaps.empty) {
        const scheduleData = scheduleSnaps.docs[0].data();
        const scheduleRef = scheduleSnaps.docs[0].ref;
        const classObj = classes?.find((c) => c.id === scheduleData.classId)
        const studentLogsRef = collection(firestore, scheduleRef.path, 'studentLogs');
        const studentLogsQuery = query(studentLogsRef, where('studentId', '==', auth.uid));
        unsubStudentLogs = onSnapshot(studentLogsQuery, (docs) => {
          setStudentLogs(docs.docs.map((doc) => ({ ...doc.data(), id: doc.id })));
        });
        if (classObj) {
          setSchedule({
            ...scheduleData,
            classId: classObj.id,
            className: classObj.name,
            classDescription: classObj.description,
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
      if (unsubStudentLogs !== null) unsubStudentLogs();
    }
  }, [scheduleId])

  const [changingStatus, setChangingStatus] = useState<any>(null);
  function handleOpenOrCloseClass(openMethod: ScheduleOpenMethods) {
    setChangingStatus(openMethod);
    (schedule.status === ScheduleStasuses.CLOSED ? openSchedule : closeSchedule)(
      profile.schoolId,
      schedule.classId,
      scheduleId,
      auth.uid,
      openMethod
    )
      .finally(() => {
        setChangingStatus(null);
      })
  }

  useEffect(() => {
    if (toggleOpen) {
      handleOpenOrCloseClass(toggleOpen);
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
              profile.currentScheduleId && scheduleId !== profile.currentScheduleId ? (
                <>
                  <Text style={[textStyles.body1, { textAlign: 'center', marginBottom: 8 }]}>Anda sudah memiliki kelas yang aktif.</Text>
                  <MEPressableText 
                    style={[textStyles.body1, { textAlign: 'center' }]}
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
                  >Lihat Jadwal</MEPressableText>
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
                              clickable={false}
                            />
                          )) : (
                            <>                      
                              {
                                schedule.status === ScheduleStasuses.OPENED && (
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
                                )
                              }
                              <MEButton
                                size='lg'
                                variant='outline'
                                style={{
                                  marginTop: 8
                                }}
                                onPress={() => navigation.navigate('ExcusePage', {
                                  classId: schedule.classId, scheduleId
                                })}
                              >
                                Izin
                              </MEButton>
                            </>
                          )
                        }                
                      </>
                    ) : (
                      <>
                        {
                          (schedule.status === ScheduleStasuses.OPENED)
                          ? schedule.openMethod === ScheduleOpenMethods.QR_CODE 
                          ? <ScheduleOpenQRCode
                            qrCode={qrCode}
                            scheduleId={scheduleId}
                            classId={schedule.classId}
                            absentCount={absentCount}
                            studentCount={studentIds.length}
                          /> : studentIds.length > 0 && (
                            <ScheduleOpenStudentCallouts
                              studentIds={studentIds}
                              scheduleId={scheduleId}
                              classId={schedule.classId}
                            />  
                          ) : null
                        }
                        {
                          schedule.status === ScheduleStasuses.CLOSED && (
                            <Text style={[textStyles.body2, { textAlign: 'center' }]}>Buka kelas dengan cara</Text>
                          )
                        }
                        <MEButton
                          size='lg'
                          style={{
                            marginVertical: 8
                          }}
                          onPress={() => handleOpenOrCloseClass(ScheduleOpenMethods.QR_CODE)}
                          isLoading={changingStatus === ScheduleOpenMethods.QR_CODE}
                          variant={schedule.status === ScheduleStasuses.CLOSED ? 'contained' : 'outline'}
                          color={schedule.status === ScheduleStasuses.CLOSED ? 'primary' : 'danger'}
                          iconStart={schedule.status === ScheduleStasuses.CLOSED ? 'qrcode' : 'window-close'}
                        >
                          { schedule.status === ScheduleStasuses.CLOSED ? 'QR Code' : 'Tutup Kelas' }
                        </MEButton>
                        {
                          schedule.status !== ScheduleStasuses.OPENED && (
                            <MEButton
                              size='lg'
                              onPress={() => handleOpenOrCloseClass(ScheduleOpenMethods.CALLOUT)}
                              isLoading={changingStatus === ScheduleOpenMethods.CALLOUT}
                              iconStart='hand-paper'
                            >
                              Panggil Pelajar
                            </MEButton>
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