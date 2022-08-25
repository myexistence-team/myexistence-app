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
  User,
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

initializeApp(firebaseConfig);

const firestore: Firestore = getFirestore(app);
const auth: Auth = getAuth(app);

export default function Navigation({ colorScheme }: { colorScheme: ColorSchemeName }) {
  const [isInitializing, setIsInitializing] = React.useState(true);
  const [authError, setAuthError] = React.useState(null);
  const [user, setUser] = React.useState<{
    user: User | null, profile: any, school: any
  }>();
  
  React.useEffect(() => {
    onAuthStateChanged(auth, user => {
      if (user !== null) {
        getDoc(doc(firestore, 'users', user.uid))
          .then((docSnap: DocumentSnapshot) => {
            if (docSnap.exists()) {
              const profile = docSnap.data();
              getDoc(doc(firestore, 'schools', profile.schoolId))
                .then((schoolSnap: DocumentSnapshot) => {
                  setIsInitializing(false);
                  setUser({
                    user,
                    profile,
                    school: schoolSnap.data()
                  })
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
          setUser({
            user: null,
            profile: null,
            school: null
          })
        }
        setIsInitializing(false);
    });
  }, [])

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
    <AuthContext.Provider value={user?.user}>
      <ProfileContext.Provider value={user?.profile}>
        <SchoolContext.Provider value={user?.school}>
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
  const [initializing, setInitializing] = React.useState(true);
  const user = useContext(AuthContext);

  // if (initializing) return null;

  return (
    <Stack.Navigator
      screenOptions={{
        contentStyle: {
          backgroundColor: "#fff"
        },
      }}
    >
      {
        user ? (
          <Stack.Screen name="Root" component={BottomTabNavigator} options={{ headerShown: false }} />
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
