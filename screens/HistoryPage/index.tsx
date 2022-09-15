import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { HistoryPageParamList, ScheduleParamList } from "../../navTypes";
import React, { useContext, useEffect, useState } from 'react';
import MEContainer from "../../components/MEContainer";
import { Text } from "react-native";
import { textStyles } from "../../constants/Styles";
import { Log, Profile } from "../../types";
import { AuthContext, ProfileContext } from "../../contexts";
import { collection, getDocs, query, where } from "firebase/firestore";
import { firestore } from "../../firebase";
import MESpinner from "../../components/MESpinner";
import HistoryCard from "../../components/HistoryCard";

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
      {/* <Stack.Screen 
        name='ScheduleDetails' 
        component={ScheduleDetailsPage}
        options={{
          headerShown: false,
        }}
      /> */}
    </Stack.Navigator>
  )
}

export function History() {
  const { profile } : { profile: Profile } = useContext(ProfileContext);
  const { auth } = useContext(AuthContext);

  const [logs, setLogs] = useState<(any | Log)[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const logsQuery = query(collection(
    firestore, 
    `schools/${profile.schoolId}/logs`),
    where('studentId', '==', auth.uid),
  );

  function loadData() {
    if (profile.classIds.length) {
      setIsLoading(true);
      getDocs(logsQuery).then((docSnaps) => {
        const docsArr: any[] = [];
        docSnaps.forEach((doc) => {
          docsArr.push({ ...doc.data(), id: doc.id });
        })
        setIsLoading(false);
        setLogs(docsArr);
      })
    } else {
      setIsLoading(false);
    }
  }

  useEffect(() => {
    loadData()
  }, [])

  return (
    <MEContainer
      onRefresh={profile.classIds.length ? loadData : undefined}
      refreshing={isLoading}
    >
      <>
        <Text
          style={[textStyles.heading3, { marginBottom: 16 }]}
        >
          Riwayat
        </Text>
        {
          !profile.classIds.length ? (
            <Text style={[textStyles.body2]}>
              Anda belum terdaftar di kelas apapun.
            </Text>
          ) : isLoading ? (
            <MESpinner/>
          ) : (
            logs.map((l) => (
              <HistoryCard history={l}/>
            ))
          )
        }
      </>
    </MEContainer>
  )
}