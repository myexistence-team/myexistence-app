import { createNativeStackNavigator, NativeStackScreenProps } from "@react-navigation/native-stack";
import { HistoryPageParamList } from "../../navTypes";
import React, { useContext } from 'react';
import MEContainer from "../../components/MEContainer";
import { Text } from "react-native";
import { textStyles } from "../../constants/Styles";
import { ProfileContext } from "../../contexts";
import HistoryDetailsPage from "../HistoryDetailsPage";
import { ProfileRoles } from "../../constants/constants";
import StudentHistory from "./StudentHistory";
import TeacherHistory from "./TeacherHistory";

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

export function History({
  route
}: NativeStackScreenProps<HistoryPageParamList, 'History'>) {
  const { profile } = useContext(ProfileContext);

  return (
    <MEContainer
      // onRefresh={profile.classIds?.length ? loadData : undefined}
      // refreshing={isLoading}
    >
      <>
        <Text
          style={[textStyles.heading3, { marginBottom: 16 }]}
        >
          Riwayat
        </Text>
        {
          profile.role === ProfileRoles.STUDENT ? (
            <StudentHistory status={route.params?.status} classId={route.params?.classId}/>
          ) : (
            <TeacherHistory/>
          )
        }
      </>
    </MEContainer>
  )
}