import { View, Text, Image, ImageBackground } from 'react-native'
import React, { useContext } from 'react'
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { WelcomeParamList } from '../../navTypes';
import LoginPage from './LoginPage';
import Colors from '../../constants/Colors';
import { textStyles } from '../../constants/Styles';
import MEButton from '../../components/MEButton';
import { useNavigation } from '@react-navigation/native';
import RegisterPage from './RegisterPage';
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
      source={require('../../assets/images/splash-screen-background.png')}
      style={{
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: Colors.light.blues.blue4,
      }}
    >
      <Text
        style={[
          textStyles.heading4,
          {
            color: 'white',
            marginBottom: 36
          }
        ]}
      >
        Selamat Datang!
      </Text>
      <Image
        source={require('../../assets/images/icon-white.png')}
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
            onPress={() => navigation.navigate('WelcomePage', {
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
            onPress={() => navigation.navigate('WelcomePage', {
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