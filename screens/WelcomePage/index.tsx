import { View, Text } from 'react-native'
import React from 'react'
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { WelcomeParamList } from '../../types';
import LoginPage from './LoginPage';

const Stack = createNativeStackNavigator<WelcomeParamList>();

export default function WelcomePage() {
  return (
    <Stack.Navigator
      initialRouteName='Welcome'
    >
      <Stack.Screen
        name='Welcome'
        component={Welcome}
        options={{
          headerShown: false
        }}
      />
      <Stack.Screen
        name='Login'
        component={LoginPage}
        options={{
          headerShown: false
        }}
      />
    </Stack.Navigator>
  )
}

function Welcome() {
  return (
    <View
      style={{
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center'
      }}
    >
      Welcome!
    </View>
  )
}