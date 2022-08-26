import { Text, ActivityIndicator } from 'react-native'
import React, { Fragment, useContext, useEffect, useState } from 'react'
import MEContainer from '../../components/MEContainer'
import ScheduleCard from '../../components/ScheduleCard';
import { textStyles } from '../../constants/Styles';
import { createNativeStackNavigator, NativeStackScreenProps } from '@react-navigation/native-stack';
import ScheduleDetailsPage from '../ScheduleDetailsPage';
import { ScheduleParamList } from '../../navTypes';
import { collection, collectionGroup, documentId, getDocs, query, where } from 'firebase/firestore';
import { ProfileContext } from '../../contexts';
import MESpinner from '../../components/MESpinner';
import { DAYS_ARRAY, nowSchedule } from '../../constants/constants';
import { groupBy } from '../../utils/utilFunctions';
import { firestore } from '../../firebase';

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
    where('classId', 'in', profile.classIds),
    where('start', '>', nowSchedule),
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
    const classObj = classes?.find(({ id }) => id === s.classId);
    return {
      ...s,
      className: classObj?.name,
      description: classObj?.description,
      start: s.start.toDate(),
      end: s.end.toDate(),
    }
  })

  const schedulesGroupedByDay = groupBy(schedulesClasses, 'day');
  const schedulesGroupedByDayArr = Object.entries(schedulesGroupedByDay);

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
          <MESpinner/>
        ) : schedulesGroupedByDayArr.map((sd: any[], dIdx: number) => (
          <Fragment key={dIdx}>
            <Text style={[textStyles.heading4, { marginBottom: 16 }]}>
              {
                nowSchedule.getDay() === parseInt(sd[0]) ? 
                  'Hari Ini' : parseInt(sd[0]) - nowSchedule.getDay() === 1 ?
                  'Besok' : DAYS_ARRAY[sd[0]]
              }
            </Text>
            {
              sd[1].map((s: any, idx: number) => (
                <ScheduleCard schedule={s} key={idx}/>
              ))
            }
          </Fragment>
        ))
        
      }
    </MEContainer>
  )
}