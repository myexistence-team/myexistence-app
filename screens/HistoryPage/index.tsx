import { createNativeStackNavigator, NativeStackScreenProps } from "@react-navigation/native-stack";
import { HistoryPageParamList } from "../../navTypes";
import React, { useContext, useState } from 'react';
import MEContainer from "../../components/MEContainer";
import { Text } from "react-native";
import { textStyles } from "../../constants/Styles";
import { ProfileContext } from "../../contexts";
import { ProfileRoles } from "../../constants/constants";
import StudentHistory from "./StudentHistory";
import TeacherHistory from "./TeacherHistory";
import MESpinner from "../../components/MESpinner";
import HistoryScheduleDetails from "./HistoryScheduleDetails";
import HistoryLogsDetails from "./HistoryLogsDetails";

const Stack = createNativeStackNavigator<HistoryPageParamList>();

export default function HistoryPage() {
  const { profile } = useContext(ProfileContext);

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
      {
        profile.role === ProfileRoles.TEACHER && (
          <>
            <Stack.Screen
              name="HistoryScheduleDetails"
              component={HistoryScheduleDetails}
              options={{
                headerShown: false,
              }}
            />
            <Stack.Screen
              name="HistoryLogsDetails"
              component={HistoryLogsDetails}
              options={{
                headerShown: false,
              }}
            />
          </>
        )
      }
    </Stack.Navigator>
  )
}


export function History({
  route
}: NativeStackScreenProps<HistoryPageParamList, 'History'>) {
  const { profile } = useContext(ProfileContext);
  const [isLoading, setIsLoading] = useState(false);

  function handleRefresh() {
    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
    }, 1);
  }

  return (
    <MEContainer
      onRefresh={profile.classIds?.length ? handleRefresh : undefined}
      refreshing={isLoading}
    >
      <>
        <Text
          style={[textStyles.heading3, { marginBottom: 16 }]}
        >
          Riwayat
        </Text>
        {
          isLoading ? (
            <MESpinner/>
          ) : (
            <>
              {
                profile.role === ProfileRoles.STUDENT ? (
                  <StudentHistory status={route.params?.status} classId={route.params?.classId}/>
                ) : (
                  <TeacherHistory/>
                )
              }
            </>
          )
        }
      </>
    </MEContainer>
  )
}