/**
 * If you are not familiar with React Navigation, refer to the "Fundamentals" guide:
 * https://reactnavigation.org/docs/getting-started
 *
 */
import { FontAwesome } from '@expo/vector-icons';
import {
  Auth,
  getAuth,
  onAuthStateChanged,
  UserCredential,
  // FacebookAuthProvider,
  // signInWithCredential,
} from 'firebase/auth';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { NavigationContainer, DefaultTheme, DarkTheme, useNavigation } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import * as React from 'react';
import { ActivityIndicator, Alert, ColorSchemeName, Pressable, Text, View } from 'react-native';
import Colors from '../constants/Colors';
import { METheme } from '../constants/Themes';
import useColorScheme from '../hooks/useColorScheme';
import HomePage from '../screens/HomePage';
import ModalScreen from '../screens/ModalScreen';
import NotFoundScreen from '../screens/NotFoundScreen';
import ProfilePage from '../screens/ProfilePage';
import SchedulePage from '../screens/SchedulePage';
import { RootStackParamList, RootTabParamList, RootTabScreenProps } from '../navTypes';
import LinkingConfiguration from './LinkingConfiguration';
import WelcomePage from '../screens/WelcomePage';
import { initializeApp } from 'firebase/app';
import { app, firebaseConfig } from '../firebase';
import { ProfileContext, SchoolContext, AuthContext } from '../contexts';
import { useContext } from 'react';
import { getFirestore, setDoc, doc, Firestore, getDoc, DocumentSnapshot, FirestoreError } from 'firebase/firestore';
import { textStyles } from '../constants/Styles';
import { Profile } from '../types';
import RegisterAccount from '../screens/WelcomePage/RegisterAccount';

initializeApp(firebaseConfig);

const firestore: Firestore = getFirestore(app);
const fbAuth: Auth = getAuth(app);

export default function Navigation({ colorScheme }: { colorScheme: ColorSchemeName }) {
  const [isInitializing, setIsInitializing] = React.useState(true);
  const [authError, setAuthError] = React.useState(null);
  const [auth, setAuth] = React.useState<any>(null);
  const [profile, setProfile] = React.useState<any>(null);
  const [school, setSchool] = React.useState<any>(null);
  
  React.useEffect(() => {
    onAuthStateChanged(fbAuth, user => {
      if (user !== null) {
        setAuth(user);
      } else {
        setAuth(null);
      }
      setIsInitializing(false);
    });
  }, [])

  React.useEffect(() => {
    if (auth && auth.uid) {
      setIsInitializing(true);
      getDoc(doc(firestore, 'users', auth.uid))
      .then((docSnap: DocumentSnapshot) => {
        if (docSnap.exists()) {
          const profile = docSnap.data();
          getDoc(doc(firestore, 'schools', profile.schoolId))
            .then((schoolSnap: DocumentSnapshot) => {
              setIsInitializing(false);
              setProfile(profile);
              setSchool(schoolSnap.data());
            })
        }
      })
      .catch((e: FirestoreError) => {
        var message: string = '';
        switch (e.code) {
          case 'resource-exhausted':
            message = 'Kuota Anda sudah habis. Mohon coba lagi nanti.'
          default:
            message = 'Terjadi kesalahan. Mohon coba lagi nanti.'
        }
        Alert.alert(
          "Oops!",
          message
        )
      })
    } else {
      setProfile(null);
      setSchool(null);
    }
  }, [auth])

  if (isInitializing) {
    return (
      <View
        style={{
          flex: 1,
          alignItems: 'center',
          justifyContent: 'center'
        }}
      >
        <ActivityIndicator size={'large'} color={Colors.light.tint}/>
        <Text style={[textStyles.body2, { marginTop: 16 }]}>Sedang Memuat...</Text>
      </View>
    )
  }

  return (
    <AuthContext.Provider value={{ auth, setAuth }}>
      <ProfileContext.Provider value={{ profile, setProfile }}>
        <SchoolContext.Provider value={{ school, setSchool }}>
          <NavigationContainer
            linking={LinkingConfiguration}
            theme={colorScheme === 'dark' ? DarkTheme : METheme}>
            <RootNavigator/>
          </NavigationContainer>
        </SchoolContext.Provider>
      </ProfileContext.Provider>
    </AuthContext.Provider>
  );
}

/**
 * A root stack navigator is often used for displaying modals on top of all other content.
 * https://reactnavigation.org/docs/modal
 */
const Stack = createNativeStackNavigator<RootStackParamList>();

function RootNavigator(props: any) {
  const { auth }: { auth: UserCredential } = useContext(AuthContext);
  const { profile }: { profile: Profile } = useContext(ProfileContext);

  return (
    <Stack.Navigator
      screenOptions={{
        contentStyle: {
          backgroundColor: "#fff"
        },
      }}
    >
      {
        auth && profile ? (
          <Stack.Screen name="Root" component={BottomTabNavigator} options={{ headerShown: false }} />
        ) : auth && !profile ? (
          <Stack.Screen name="RegisterAccount" component={RegisterAccount} options={{ headerShown: false }}/>
        ) : (
          <Stack.Screen name="Welcome" component={WelcomePage} options={{ headerShown: false }}/>
        )
      }
      <Stack.Screen name="NotFound" component={NotFoundScreen} options={{ title: 'Oops!' }} />
      <Stack.Group screenOptions={{ presentation: 'modal' }}>
        <Stack.Screen name="Modal" component={ModalScreen} />
      </Stack.Group>
    </Stack.Navigator>
  );
}

/**
 * A bottom tab navigator displays tab buttons on the bottom of the display to switch screens.
 * https://reactnavigation.org/docs/bottom-tab-navigator
 */
const BottomTab = createBottomTabNavigator<RootTabParamList>();

function BottomTabNavigator() {
  const colorScheme = useColorScheme();

  return (
    <BottomTab.Navigator
      initialRouteName="Home"
      screenOptions={{
        tabBarActiveTintColor: Colors[colorScheme].tint,
      }}>
      <BottomTab.Screen
        name="Home"
        component={HomePage}
        options={({ navigation }: RootTabScreenProps<'Home'>) => ({
          title: 'Home',
          tabBarIcon: ({ color }) => <TabBarIcon name="home" color={color} />,
          headerShown: false,
        })}
      />
      <BottomTab.Screen
        name="Schedule"
        component={SchedulePage}
        options={({ navigation }: RootTabScreenProps<'Schedule'>) => ({
          title: 'Schedule',
          tabBarIcon: ({ color }) => <TabBarIcon name="calendar" color={color} />,
          headerShown: false,
        })}
      />
      <BottomTab.Screen
        name="Profile"
        component={ProfilePage}
        options={({ navigation }: RootTabScreenProps<'Profile'>) => ({
          title: 'Profile',
          tabBarIcon: ({ color }) => <TabBarIcon name="user" color={color} />,
          headerShown: false,
        })}
      />
    </BottomTab.Navigator>
  );
}

/**
 * You can explore the built-in icon families and icons on the web at https://icons.expo.fyi/
 */
function TabBarIcon(props: {
  name: React.ComponentProps<typeof FontAwesome>['name'];
  color: string;
}) {
  return <FontAwesome size={30} style={{ marginBottom: -3 }} {...props} />;
}
