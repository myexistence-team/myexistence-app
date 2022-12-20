import { View, Text } from 'react-native'
import React, { useContext, useEffect, useState } from 'react'
import { textStyles } from '../../constants/Styles'
import MEButton from '../../components/MEButton';
import ScheduleCard from '../../components/ScheduleCard';
import { useNavigation } from '@react-navigation/native';
import MESpinner from '../../components/MESpinner';
import { collectionGroup, getDocs, limit, orderBy, query, where } from 'firebase/firestore';
import { ClassesContext, ProfileContext } from '../../contexts';
import { firestore } from '../../firebase';

export default function NextSchedules() {
  const navigation = useNavigation();
  const { profile } = useContext(ProfileContext);
  const { classes } = useContext(ClassesContext);
  const [schedules, setSchedules] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  function loadData() {
    setIsLoading(true);
    const todayInt = (new Date()).getDay();
    const schedulesQuery = query(
      collectionGroup(firestore, 'schedules'), 
      where('classId', 'in', profile.classIds),
      where('day', '==', todayInt),
      orderBy('day', 'asc'),
      orderBy('start', 'asc'),
      limit(profile.currentScheduleId ? 5 : 5),
    );
    getDocs(schedulesQuery).then((docs) => {
      const docsArr: any[] = [];
      docs.forEach((doc) => {
        const classObj = classes.find((c) => c.id === doc.data().classId);
        docsArr.push({ 
          ...doc.data(),
          id: doc.id,
          className: classObj?.name,
          classDescription: classObj?.description,
          class: null
        });
      })
      setSchedules(docsArr.filter((s) => s.id !== profile.currentScheduleId));
    }).finally(() => {
      setIsLoading(false);
    })
  }

  useEffect(() => {
    loadData();
  }, []);

  return (
    <View
      style={{
        paddingBottom: 64
      }}
    >
      {
        isLoading ? (
          <MESpinner/>
        ) : (
          <>
            <Text 
              style={[textStyles.heading3, { marginBottom: 16 }]}
            >
              Berikutnya
            </Text>
            {
              schedules.length === 0? (<Text
                style={[textStyles.body2, { marginBottom: 16 }]}
              >
                Sudah tidak ada sesi kelas hari ini
              </Text>) :
              schedules.map((s, idx) => (
                <ScheduleCard schedule={s} key={idx}/>
              ))
            }
            <MEButton
              variant='outline'
              onPress={() => {
                navigation.navigate('Root', {
                  screen: "SchedulesPage", 
                  params: {
                    screen: "Schedules"
                  }
                })
              }}
            >
              Tampilkan Lebih Banyak
            </MEButton>
          </>
        )
      }
    </View>
  )
}