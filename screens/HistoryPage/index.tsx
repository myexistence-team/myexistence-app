import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { HistoryPageParamList } from "../../navTypes";
import React, { useContext, useEffect, useState } from 'react';
import MEContainer from "../../components/MEContainer";
import { Text } from "react-native";
import { textStyles } from "../../constants/Styles";
import { Log, Profile } from "../../types";
import { AuthContext, ProfileContext } from "../../contexts";
import { collection, collectionGroup, getDocs, orderBy, query, where } from "firebase/firestore";
import { firestore } from "../../firebase";
import MESpinner from "../../components/MESpinner";
import HistoryCard from "../../components/HistoryCard";
import HistoryDetailsPage from "../HistoryDetailsPage";

const Stack = createNativeStackNavigator<HistoryPageParamList>();

export default function HistoryPage() {
  return (
    <Stack.Navigator
      initialRouteName='History'
    >
      <Stack.Screen 
        name='History' 
        component={History} 
        options={{
          header: () => null
        }}
      />
      <Stack.Screen 
        name='HistoryDetails' 
        component={HistoryDetailsPage}
        options={{
          headerShown: false,
        }}
      />
    </Stack.Navigator>
  )
}

export function History() {
  const { profile } : { profile: Profile } = useContext(ProfileContext);
  const { auth } = useContext(AuthContext);

  const [logs, setLogs] = useState<(any | Log)[]>([]);
  const [currentLogs, setCurrentLogs] = useState<(any | Log)[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const logsQuery = query(collection(
    firestore, 
    `schools/${profile.schoolId}/logs`),
    where('studentId', '==', auth.uid),
    orderBy('time', 'desc')
  );

  
  function loadData() {
    if (profile.classIds?.length) {
      setIsLoading(true);
      getDocs(logsQuery).then((docSnaps) => {
        const docsArr: any[] = [];
        docSnaps.forEach((doc) => {
          docsArr.push({ ...doc.data(), id: doc.id });
        })
        setIsLoading(false);
        setLogs(docsArr);
      })
      if (profile.currentScheduleId) {
        const currentScheduleQuery = query(
          collectionGroup(firestore, `schedules`), 
          where('id', '==', profile.currentScheduleId)
        );
        getDocs(currentScheduleQuery).then((scheduleSnaps) => {
          if (!scheduleSnaps.empty) {
            const scheduleSnap = scheduleSnaps.docs[0];
            const schedule = scheduleSnap.data();
            const currentLogsQuery = query(
              collection(
                firestore,
                'schools',
                profile.schoolId || '',
                'classes',
                schedule.classId,
                'schedules',
                scheduleSnap.id,
                'studentLogs'
              ), 
              where('studentId', '==', auth.uid)
            );
            getDocs(currentLogsQuery).then((logSnaps) => {
              const logsData: any[] = [];
              if (!logSnaps.empty) {
                logSnaps.docs.forEach((docData) => {
                  logsData.push({
                    ...docData.data(),
                    id: docData.id,
                    isCurrent: true,
                  })
                })
              }
              setCurrentLogs(logsData);
            })
          }
        })
      } else {
        setCurrentLogs([]);
      }
    } else {
      setIsLoading(false);
    }
  }

  useEffect(() => {
    loadData()
  }, [])

  return (
    <MEContainer
      onRefresh={profile.classIds?.length ? loadData : undefined}
      refreshing={isLoading}
    >
      <>
        <Text
          style={[textStyles.heading3, { marginBottom: 16 }]}
        >
          Riwayat
        </Text>
        {
          currentLogs.length > 0 && (
            <>            
              <Text
                style={[textStyles.heading4, { marginBottom: 16 }]}
              >
                Sedang Berlangsung
              </Text>
              {
                currentLogs.map((l, idx) => (
                  <HistoryCard key={idx} history={l}/>
                ))
              }
              <Text
                style={[textStyles.heading4, { marginBottom: 16 }]}
              >
                Semua Riwayat
              </Text>
            </>
          )
        }
        {
          !profile.classIds?.length ? (
            <Text style={[textStyles.body2]}>
              Anda belum terdaftar di kelas apapun.
            </Text>
          ) : isLoading ? (
            <MESpinner/>
          ) : (
            logs.map((l, idx) => (
              <HistoryCard key={idx} history={l}/>
            ))
          )
        }
      </>
    </MEContainer>
  )
}