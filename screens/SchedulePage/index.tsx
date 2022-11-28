import { Text, ActivityIndicator } from 'react-native'
import React, { Fragment, useContext, useEffect, useState } from 'react'
import MEContainer from '../../components/MEContainer'
import ScheduleCard from '../../components/ScheduleCard';
import { textStyles } from '../../constants/Styles';
import { createNativeStackNavigator, NativeStackScreenProps } from '@react-navigation/native-stack';
import ScheduleDetailsPage from '../ScheduleDetailsPage';
import { ScheduleParamList } from '../../navTypes';
import { collection, collectionGroup, documentId, getDocs, orderBy, query, Timestamp, where } from 'firebase/firestore';
import { ProfileContext } from '../../contexts';
import MESpinner from '../../components/MESpinner';
import { DAYS_ARRAY } from '../../constants/constants';
import { groupBy } from '../../utils/utilFunctions';
import { firestore } from '../../firebase';
import { Profile } from '../../types';
import Colors from '../../constants/Colors';
import useCurrentScheduleTime from '../../hooks/useCurrentScheduleTime';
import SchedulePresences from '../SchedulePresences';
import SchedulePresenceDetails from '../SchedulePresenceDetails';

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
          headerShown: false,
        }}
      />
      <Stack.Screen 
        name='SchedulePresences' 
        component={SchedulePresences}
        options={{
          headerShown: false,
        }}
      />
      <Stack.Screen 
        name='SchedulePresenceDetails' 
        component={SchedulePresenceDetails}
        options={{
          headerShown: false,
        }}
      />
    </Stack.Navigator>
  )
}

function Schedules({ }: NativeStackScreenProps<ScheduleParamList, "Schedules">) {
  const { profile } : { profile: Profile } = useContext(ProfileContext);
  const todayInt = (new Date()).getDay();

  const nowScheduleDate = useCurrentScheduleTime();
  const [schedules, setSchedules] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const classesQuery = query(
    collection(firestore, `schools/${profile.schoolId}/classes`),
    ...profile.classIds?.length ? [where(documentId(), 'in', profile.classIds)] : []
  );
  const schedulesQuery = query(
    collectionGroup(firestore, 'schedules'), 
    ...profile.classIds?.length ? [where('classId', 'in', profile.classIds)] : [],
    where('day', '>=', todayInt),
    orderBy('day', 'asc'),
    orderBy('start', 'asc'),
  );

  function loadData() {    
    if (profile.classIds?.length) {
      setIsLoading(true);
      getDocs(classesQuery).then((docs) => {
        const classObjs: any = {};
        docs.forEach((doc) => {
          classObjs[doc.id] = doc.data();
        })
        getDocs(schedulesQuery).then((docs) => {
          const docsArr: any[] = [];
          docs.forEach((doc) => {
            const classObj = classObjs[doc.data().classId];
            docsArr.push({ 
              ...doc.data(),
              id: doc.id,
              className: classObj?.name,
              classDescription: classObj?.description,
            });
          })
          setSchedules(docsArr);
          setIsLoading(false);
        })
      }) 
    } else {
    setIsLoading(false);
    }
  }

  useEffect(() => {
    loadData();
  }, [])

  const schedulesGroupedByDay = groupBy(schedules, 'day');
  const schedulesGroupedByDayArr = Object.entries(schedulesGroupedByDay);

  return (
    <MEContainer
      onRefresh={profile.classIds?.length ? loadData : undefined}
      refreshing={isLoading}
    >
      <Text 
        style={[textStyles.heading3, { marginBottom: 16 }]}
      >
        Jadwal
      </Text>
      {
        !profile.classIds?.length ? (          
          <Text style={[textStyles.body2]}>
            Anda belum terdaftar di kelas apapun.
          </Text>
        ) : isLoading ? (
          <MESpinner/>
        ) : !schedules.length ? (
          <Text style={[textStyles.body2]}>
            Anda sudah tidak ada kelas lagi untuk minggu ini.
          </Text>
        ) : schedulesGroupedByDayArr.map((sd: any[], dIdx: number) => (
          <Fragment key={dIdx}>
            <Text style={[textStyles.heading4, { marginBottom: 16 }]}>
              {
                nowScheduleDate.getDay() === parseInt(sd[0]) ? 
                  'Hari Ini' : parseInt(sd[0]) - nowScheduleDate.getDay() === 1 ?
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