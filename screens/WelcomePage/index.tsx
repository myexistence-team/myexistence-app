import { View, Text } from 'react-native'
import React from 'react'
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { WelcomeParamList } from '../../navTypes';
import LoginPage from './LoginPage';
import Colors from '../../constants/Colors';
import { textStyles } from '../../constants/Styles';
import MEButton from '../../components/MEButton';
import { useNavigation } from '@react-navigation/native';
import RegisterPage from './RegisterPage';

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
      <Stack.Screen
        name='Register'
        component={RegisterPage}
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
            onPress={() => navigation.navigate('Welcome', {
              screen: 'Register', 
              params: {
                role: "STUDENT"
              }
            })}
          >
            Daftar
          </MEButton>
        </View>
      </View>
    </View>
  )
}