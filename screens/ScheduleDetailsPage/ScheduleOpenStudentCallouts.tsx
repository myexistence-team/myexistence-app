import { FontAwesome5 } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { collection, documentId, getDocs, onSnapshot, query, where } from 'firebase/firestore';
import React, { useContext, useEffect, useState } from 'react'
import { Image, Modal, Pressable, Text, View } from 'react-native';
import { createUpdateStudentPresenceFromCallout, studentExcuseStatusChange } from '../../actions/scheduleActions';
import MEButton from '../../components/MEButton';
import MEPressableText from '../../components/MEPressableText';
import MESpinner from '../../components/MESpinner';
import Colors from '../../constants/Colors';
import { AbsentStasuses, ExcuseStatuses } from '../../constants/constants';
import { textStyles } from '../../constants/Styles';
import { ProfileContext, SchoolContext } from '../../contexts';
import { ExcuseStatusesEnum } from '../../enums';
import { firestore } from '../../firebase';

export default function ScheduleOpenStudentCallouts({
  studentIds = [],
  scheduleId,
  classId,
} : {
  studentIds: string[],
  scheduleId: string,
  classId: string,
}) {
  const navigation = useNavigation();
  const [students, setStudents] = useState<any[]>([]);
  const [studentLogsState, setStudentLogs] = useState<any[]>([]);
  const { profile } = useContext(ProfileContext);

  const studentsQuery = query(
    collection(firestore,"users"),
    where(documentId(), "in", studentIds)
  );
  const studentLogsRef = collection(firestore, "schools", profile.schoolId, "classes", classId, "schedules", scheduleId, "studentLogs");

  function loadData() {
    getDocs(studentsQuery).then((docs) => {
      setStudents(docs.docs.map((doc) => ({
        ...doc.data(),
        id: doc.id
      })))
    })
  }

  useEffect(() => {
    loadData();
    const unsub = onSnapshot(studentLogsRef, (docs) => {
      setStudentLogs(docs.docs.map((doc) => ({
        ...doc.data(),
        id: doc.id
      })));
    })
    return () => unsub();
  }, []);
  
  const studentLogs = studentLogsState.filter((sl) => sl.excuseStatus !== ExcuseStatuses.WAITING);
  const waitingForPresences = studentLogs.filter((sl) => sl.status !== AbsentStasuses.EXCUSED || sl?.excuseStatus !== ExcuseStatuses.WAITING);

  const [currentIdx, setCurrentIdx] = useState(Math.max(0, studentLogs.length - 1));

  // useEffect(() => {
  //     if (studentLogs.length === students.length) {
  //       setCurrentIdx(-1);
  //     } else {
  //       setCurrentIdx(Math.max(0, studentLogs.length - 1));
  //     }
  // }, [studentLogsState.length, students.length])

  const currentStudent = students[currentIdx];
  const currentStudentLogIdx = studentLogsState.findIndex((sl) => sl.studentId === currentStudent?.id);
  const currentStudentLog = studentLogsState[currentStudentLogIdx];
  const studentExcuse = studentLogsState.find((sl) => sl.studentId === currentStudent?.id && sl?.status === AbsentStasuses.EXCUSED);

  const [loading, setLoading] = useState<any>(null);

  async function handleCreatePresence(status: AbsentStasuses) {
    setLoading(status);
    await createUpdateStudentPresenceFromCallout({ 
      scheduleId, 
      studentId: currentStudent.id, 
      classId, 
      schoolId: profile.schoolId,
      status,
      studentLogId: currentStudentLog?.id
    })
    setCurrentIdx((idx) => idx + 1)
    setShowExcuse(false);
    setLoading(null);
  }

  const [showExcuse, setShowExcuse] = useState(false);
  const [excuseStatusLoading, setExcuseStatusLoading] = useState<any>(null);

  async function handleExcuseStatusChange(excuseStatus: ExcuseStatuses) {
    setExcuseStatusLoading(excuseStatus);
    await studentExcuseStatusChange({
      scheduleId, 
      classId, 
      schoolId: profile.schoolId,
      studentLogId: studentExcuse.id,
      excuseStatus,
    })
    setCurrentIdx((idx) => idx + 1)
    setShowExcuse(false);
    setExcuseStatusLoading(null);
  }
  
  return (
    <View 
      style={{
        alignItems: 'center',
        marginBottom: 16
      }}
    >
      <MEPressableText 
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
        style={[textStyles.body1, { marginBottom: 16 }]}
      >
        {Math.min(currentIdx + 1, students.length)}/{students.length}
      </MEPressableText>
      {
        students.length === 0 ? (
          <MESpinner/>
        ) : currentStudent ? (
          <>
            <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'center' }}>
              <View style={{ flex: 1, alignItems: 'center' }}>
                {
                  currentIdx > 0 && (
                    <Pressable
                      onPress={() => setCurrentIdx((idx) => idx - 1)}
                      style={{
                        width: 48,
                        height: 120,
                        justifyContent: 'center',
                        alignItems: 'center',
                      }}
                    >
                      <FontAwesome5 name='chevron-left' size={24} color={Colors.light.blue}/>
                    </Pressable>
                  )
                }
              </View>
              <View style={{ flex: 4, alignItems: 'center' }}>
                <Image
                  source={{uri: currentStudent.photoUrl}}
                  style={{
                    width: 128,
                    height: 128,
                    marginRight: 16,
                    borderRadius: 64
                  }}
                />
                <Text style={[textStyles.heading4, { marginTop: 16 }]}>
                  {currentStudent.displayName}
                </Text>
                <Text style={[textStyles.body2, { marginTop: 16, marginBottom: 24 }]}>
                  Tercatat {waitingForPresences.length}/{students.length}
                </Text>
              </View>
              <View style={{ flex: 1, alignItems: 'center' }}>
                {
                  currentIdx < studentLogs.length && (
                    <Pressable
                      onPress={() => setCurrentIdx((idx) => idx + 1)}
                      style={{
                        width: 48,
                        height: 120,
                        justifyContent: 'center',
                        alignItems: 'center',
                      }}
                    >
                      <FontAwesome5 name='chevron-right' size={24} color={Colors.light.blue}/>
                    </Pressable>
                  )
                }
              </View>
            </View>
            {
              studentExcuse ? (
                <View
                  style={{
                    width: '100%'
                  }}
                >
                  <Modal
                    animationType='slide'
                    presentationStyle='pageSheet'
                    onRequestClose={() => {
                      setShowExcuse(false)
                    }}
                    onDismiss={() => {
                      setShowExcuse(false)
                    }}
                    visible={showExcuse}
                  >
                    <View
                      style={{
                        flex: 1,
                        justifyContent: "center",
                        padding: 16
                      }}
                    >
                      <Text style={textStyles.body2}>Alasan</Text>
                      <Text style={[textStyles.body1, { fontFamily: 'manrope-bold', marginBottom: 16 }]}>
                        {studentExcuse.excuse.message}
                      </Text>

                      <Text style={[textStyles.body2, { marginBottom: 4 }]}>Bukti</Text>
                      <Image
                        source={{uri: studentExcuse.excuse.proofUrl}}
                        style={{
                          width: "100%",
                          height: 400,
                          marginBottom: 16
                        }}
                      />

                      <View style={{
                        flexDirection: 'row',
                        marginBottom: 16,
                        marginTop: 16
                      }}>
                        <View style={{
                          flex: 1,
                          marginRight: 8
                        }}>
                          <MEButton
                            color='danger'
                            variant={studentExcuse.excuseStatus !== ExcuseStatuses.REJECTED ? 'outline' : undefined}
                            iconStart={studentExcuse.excuseStatus === ExcuseStatuses.REJECTED ? 'check' : undefined}
                            isLoading={excuseStatusLoading === ExcuseStatuses.REJECTED}
                            onPress={() => handleExcuseStatusChange(ExcuseStatuses.REJECTED)}
                          >
                            Tolak
                          </MEButton>
                        </View>
                        <View style={{
                          flex: 1
                        }}>
                          <MEButton
                            variant={studentExcuse.excuseStatus !== ExcuseStatuses.ACCEPTED ? 'outline' : undefined}
                            iconStart={studentExcuse.excuseStatus === ExcuseStatuses.ACCEPTED ? 'check' : undefined}
                            isLoading={excuseStatusLoading === ExcuseStatuses.ACCEPTED}
                            onPress={() => handleExcuseStatusChange(ExcuseStatuses.ACCEPTED)}
                          >
                            Terima
                          </MEButton>
                        </View>
                      </View>
                    </View>
                  </Modal>
                  <MEButton
                    onPress={() => setShowExcuse(true)}
                  >
                    {`Lihat Izin ${studentExcuse.excuseStatus === ExcuseStatuses.WAITING ? null : studentExcuse.excuseStatus === ExcuseStatuses.ACCEPTED ? "(Diterima)" : "(Ditolak)"}`}
                  </MEButton>
                </View>
              ) : (
                <View style={{
                  flexDirection: 'row',
                }}>
                  <View style={{
                    flex: 1,
                    marginRight: 8
                  }}>
                    <MEButton
                      color='danger'
                      variant={currentStudentLog?.status !== AbsentStasuses.ABSENT ? 'outline' : undefined}
                      iconStart={currentStudentLog?.status === AbsentStasuses.ABSENT ? 'check' : undefined}
                      onPress={() => handleCreatePresence(AbsentStasuses.ABSENT)}
                      isLoading={loading === AbsentStasuses.ABSENT}
                    >
                      Absen
                    </MEButton>
                  </View>
                  <View style={{
                    flex: 1
                  }}>
                    <MEButton
                      variant={currentStudentLog?.status !== AbsentStasuses.PRESENT ? 'outline' : undefined}
                      iconStart={currentStudentLog?.status === AbsentStasuses.PRESENT ? 'check' : undefined}
                      onPress={() => handleCreatePresence(AbsentStasuses.PRESENT)}
                      isLoading={loading === AbsentStasuses.PRESENT}
                    >
                      Hadir
                    </MEButton>
                  </View>
                </View>
              )
            }
          </>
        ) : (
          <>
            <Text style={[textStyles.heading5, { marginVertical: 16 }]}>Kehadiran semua pelajar telah tercatat! 👍</Text>
            <MEButton
              onPress={() => setCurrentIdx(0)}
              variant='outline'
            >Ulang Pencatatan</MEButton>
          </>
        )
      }
    </View>
  )
}
