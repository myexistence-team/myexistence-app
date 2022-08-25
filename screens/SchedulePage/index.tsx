import { Text, ActivityIndicator } from 'react-native'
import React, { useContext, useEffect, useState } from 'react'
import MEContainer from '../../components/MEContainer'
import ScheduleCard from '../../components/ScheduleCard';
import { textStyles } from '../../constants/Styles';
import { createNativeStackNavigator, NativeStackScreenProps } from '@react-navigation/native-stack';
import ScheduleDetailsPage from '../ScheduleDetailsPage';
import { ScheduleParamList } from '../../navTypes';
import { collection, collectionGroup, documentId, getDocs, query, where } from 'firebase/firestore';
import { firestore } from '../../utils/firebaseGetters';
import { ProfileContext } from '../../contexts';

const Stack = createNativeStackNavigator<ScheduleParamList>();

export default function SchedulePage() {
  return (
    <Stack.Navigator
      initialRouteName='Schedules'
    >
      <Stack.Screen 
        name='Schedules' 
        component={Schedules} 
        options={{
          header: () => null
        }}
      />
      <Stack.Screen 
        name='ScheduleDetails' 
        component={ScheduleDetailsPage}
        options={{
          headerShown: false
        }}
      />
    </Stack.Navigator>
  )
}

function Schedules({ }: NativeStackScreenProps<ScheduleParamList, "Schedules">) {
  const { profile } = useContext(ProfileContext);

  const [classes, setClasses] = useState<any[]>([]);
  const [schedules, setSchedules] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const classesQuery = query(collection(
    firestore, 
    `schools/${profile.schoolId}/classes`),
    where(documentId(), 'in', profile.classIds)
  );
  const schedulesQuery = query(
    collectionGroup(firestore, 'schedules'), 
    where('classId', 'in', profile.classIds)
  );

  function loadData() {    
    setIsLoading(true);
    getDocs(classesQuery)
    .then((docs) => {
      const docsArr: any[] = [];
      docs.forEach((doc) => {
        docsArr.push({ ...doc.data(), id: doc.id });
      })
      setClasses(docsArr);
      getDocs(schedulesQuery).then((docs) => {
        docs.forEach((doc) => {
          const docsArr: any[] = [];
          docs.forEach((doc) => {
            docsArr.push({ ...doc.data(), id: doc.id });
          })
          setSchedules(docsArr);
          setIsLoading(false);
        })
      })
    })
  }

  useEffect(() => {
    loadData();
  }, [])

  const schedulesClasses = schedules.map((s) => {
    const { name, description } = classes.find(({ id }) => id === s.classId);
    return {
      ...s,
      className: name,
      description,
      start: s.start.toDate(),
      end: s.end.toDate(),
    }
  })

  return (
    <MEContainer
      onRefresh={loadData}
      refreshing={isLoading}
    >
      <Text 
        style={[textStyles.heading3, { marginBottom: 16 }]}
      >
        Jadwal
      </Text>
      {
        isLoading ? (
          <ActivityIndicator/>
        ) : schedulesClasses.map((s, idx) => (
          <ScheduleCard schedule={s} key={idx}/>
        ))
      }
    </MEContainer>
  )
}