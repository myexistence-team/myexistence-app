import { View, Text } from 'react-native'
import React from 'react'
import MEContainer from '../../components/MEContainer'
import scheduleMocks from '../../mocks/scheduleMocks';
import ScheduleCard from '../../components/ScheduleCard';
import { textStyles } from '../../constants/Styles';
import { createNativeStackNavigator, NativeStackScreenProps } from '@react-navigation/native-stack';
import ScheduleDetailsPage from '../ScheduleDetailsPage';
import { ScheduleParamList } from '../../navTypes';

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
  const schedules = scheduleMocks;

  return (
    <MEContainer>
      <Text 
        style={[textStyles.heading3, { marginBottom: 16 }]}
      >
        Jadwal
      </Text>
      {schedules.map((s, idx) => (
        <ScheduleCard schedule={s} key={idx}/>
      ))}
    </MEContainer>
  )
}