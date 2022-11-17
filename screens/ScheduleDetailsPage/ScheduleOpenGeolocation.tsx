import { View, Text } from 'react-native'
import React, { useContext, useEffect, useState } from 'react'
import { collection, onSnapshot } from 'firebase/firestore';
import { firestore } from '../../firebase';
import { ProfileContext } from '../../contexts';
import { textStyles } from '../../constants/Styles';
import MEPressableText from '../../components/MEPressableText';
import { useNavigation } from '@react-navigation/native';

export default function ScheduleOpenGeolocation({
  classId,
  scheduleId,
  studentIds
} : {
  studentIds: string[],
  scheduleId: string,
  classId: string,
}) {
  const { profile } = useContext(ProfileContext);
  const navigation = useNavigation();

  const [studentLogs, setStudentLogs] = useState<any[]>([]);
  const studentLogsRef = collection(
    firestore, 
    "schools", 
    profile.schoolId, 
    "classes", 
    classId, 
    "schedules", 
    scheduleId, 
    "studentLogs"
  );

  useEffect(() => {
    const unsub = onSnapshot(studentLogsRef, (docs) => {
      setStudentLogs(docs.docs.map((doc) => ({
        ...doc.data(),
        id: doc.id
      })));
    })
    return () => unsub();
  }, [])
  return (
    <View>
      <Text style={[textStyles.body2, { marginBottom: 8 }]}>Pelajar Tercatat</Text>
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
            }
          })
        }}
        style={[textStyles.body1, { marginBottom: 16, fontFamily: 'manrope-bold' }]}
      >
        {studentLogs.length}/{studentIds.length}
      </MEPressableText>
    </View>
  )
}