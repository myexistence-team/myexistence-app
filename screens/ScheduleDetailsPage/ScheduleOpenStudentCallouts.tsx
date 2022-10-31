import { collection, documentId, getDocs, onSnapshot, query, where } from 'firebase/firestore';
import React, { useContext, useEffect, useState } from 'react'
import { Image, Text, View } from 'react-native';
import { createStudentPresenceFromCallout } from '../../actions/scheduleActions';
import MEButton from '../../components/MEButton';
import MESpinner from '../../components/MESpinner';
import { AbsentStasuses } from '../../constants/constants';
import { textStyles } from '../../constants/Styles';
import { ProfileContext, SchoolContext } from '../../contexts';
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
  const [students, setStudents] = useState<any[]>([]);
  const [studentLogs, setStudentLogs] = useState<any[]>([]);
  const { profile } = useContext(ProfileContext);

  const studentsQuery = query(
    collection(firestore,"users"),
    where(documentId(), "in", studentIds)
  );
  const studentLogsRef = collection(firestore, "schools", profile.schoolId, "classes", classId, "schedules", scheduleId, "studentLogs");

  async function loadData() {
    onSnapshot(studentLogsRef, (docs) => {
      setStudentLogs(docs.docs.map((doc) => ({
        ...doc.data(),
        id: doc.id
      })));
    })
    getDocs(studentsQuery).then((docs) => {
      setStudents(docs.docs.map((doc) => ({
        ...doc.data(),
        id: doc.id
      })))
    })
  }
  useEffect(() => {
    loadData();
  }, []);
  
  console.log(studentLogs);

  const currentStudent = students?.filter((s) => !studentLogs.map((sl) => sl.studentId).includes(s.id))?.[0];

  const [loading, setLoading] = useState<any>(null);

  async function handleCreatePresence(status: AbsentStasuses) {
    setLoading(status);
    await createStudentPresenceFromCallout({ 
      scheduleId, 
      studentId: currentStudent.id, 
      classId, 
      schoolId: profile.schoolId,
      status
    })
    setLoading(null);
  }
  
  return (
    <View 
      style={{
        alignItems: 'center',
      }}
    >
      {
        students.length === 0 ? (
          <MESpinner/>
        ) : currentStudent ? (
          <>
            <Image
              source={{uri: currentStudent.photoUrl}}
              style={{
                width: 128,
                height: 128,
                marginRight: 16,
                borderRadius: 64
              }}
            />
            <Text style={[textStyles.heading4, { marginVertical: 16 }]}>
              {currentStudent.displayName}
            </Text>
            <View style={{
              flexDirection: 'row',
              marginBottom: 16
            }}>
              <View style={{
                flex: 1,
                marginRight: 8
              }}>
                <MEButton
                  color='danger'
                  variant='outline'
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
                  onPress={() => handleCreatePresence(AbsentStasuses.PRESENT)}
                  isLoading={loading === AbsentStasuses.PRESENT}
                >
                  Hadir
                </MEButton>
              </View>
            </View>
          </>
        ) : (
          <Text style={[textStyles.heading5, { marginVertical: 16 }]}>Kehadiran semua pelajar telah tercatat! 👍</Text>
        )
      }
    </View>
  )
}
