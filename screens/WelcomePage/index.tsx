import { View, Text, Image, ImageBackground } from 'react-native'
import React, { useContext, useEffect } from 'react'
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { WelcomeParamList } from '../../navTypes';
import LoginPage from './LoginPage';
import Colors from '../../constants/Colors';
import { textStyles } from '../../constants/Styles';
import MEButton from '../../components/MEButton';
import { useNavigation } from '@react-navigation/native';
import RegisterPage from './RegisterPage';
import iconWhite from '../../assets/images/icon-white.png';
import background from '../../assets/images/splash-screen-background.png';
import { AuthContext } from '../../contexts';
import * as Google from 'expo-auth-session/providers/google';
import * as WebBrowser from 'expo-web-browser';
import googleClientIds from '../../googleClientIds';
import { auth as fbAuth } from '../../firebase';
import { GoogleAuthProvider, signInWithCredential } from 'firebase/auth';

WebBrowser.maybeCompleteAuthSession();

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
  const { auth, setAuth } = useContext(AuthContext);
  const [accessToken, setAccessToken] = React.useState<any>();

  const [request, response, promptAsync] = Google.useAuthRequest({
    androidClientId: googleClientIds.androidClientId,
    iosClientId: googleClientIds.iosClientId,
    expoClientId: googleClientIds.expoClientId
  });

  React.useEffect(() => {
    if (response?.type === "success" && response.authentication?.accessToken) {
      setAccessToken(response.authentication.accessToken);
      const credential = GoogleAuthProvider.credential(
        null, response.authentication.accessToken
      )
      signInWithCredential(fbAuth, credential);
    }
  }, [response]);

  return (
    <ImageBackground
      source={background}
      style={{
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: Colors.light.blues.blue4,
      }}
    >
      <Image
        source={iconWhite}
        style={{
          width: 180,
          height: 180,
        }}
      />
      <Text
        style={[
          textStyles.heading1,
          {
            color: 'white',
            marginBottom: 48
          }
        ]}
      >
        Hadir
      </Text>
      <View
        style={{
          flexDirection: 'row',
          paddingHorizontal: 24,
        }}
      >
        <View
          style={{
            flex: 1,
            marginRight: 16
          }}
        >
          <MEButton
            color='white'
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
            color='white'
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
      <Text style={[textStyles.body2, { 
        color: 'white',
        marginBottom: 8,
        marginTop: 24,
      }]}>
        Atau gunakan
      </Text>
      <View
        style={{
          paddingHorizontal: 24,
          flexDirection: 'row'
        }}
      >
        <MEButton
          color='#DB4437'
          iconStart='google'
          onPress={() => {
            promptAsync({
              // useProxy: false,
              // showInRecents: true
            })
          }}
        >
          Google
        </MEButton>
      </View>
    </ImageBackground>
  )
}