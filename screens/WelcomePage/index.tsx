import { View, Text } from 'react-native'
import React from 'react'
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { WelcomeParamList } from '../../types';
import LoginPage from './LoginPage';
import Colors from '../../constants/Colors';
import { textStyles } from '../../constants/Styles';
import MEButton from '../../components/MEButton';
import { useNavigation } from '@react-navigation/native';

const Stack = createNativeStackNavigator<WelcomeParamList>();

export default function WelcomePage() {
  return (
    <Stack.Navigator
      initialRouteName='WelcomeScreen'
    >
      <Stack.Screen
        name='WelcomeScreen'
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
  const navigation = useNavigation();
  return (
    <View
      style={{
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: Colors.light.tint
      }}
    >
      <Text
        style={[
          textStyles.heading1,
          {
            color: 'white',
            marginBottom: 48
          }
        ]}
      >
        HADIR
      </Text>
      <View
        style={{
          flexDirection: 'row',
          paddingHorizontal: 24,
        }}
      >
        <View
          style={{
            flex: 1
          }}
        >
          <MEButton
            variant='outline'
            onPress={() => navigation.navigate('Welcome', {
              screen: 'Login'
            })}
          >
            Masuk
          </MEButton>
        </View>
        <View
          style={{
            flex: 1
          }}
        >
          <MEButton
            variant='outline'
          >
            Daftar
          </MEButton>
        </View>
      </View>
    </View>
  )
}