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
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import * as React from 'react';
import { ColorSchemeName, View } from 'react-native';
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
import { app } from '../firebase';
import { ProfileContext, SchoolContext, AuthContext, ClassesContext, UsersContext, LocationContext } from '../contexts';
import { useContext } from 'react';
import { getFirestore, doc, Firestore, onSnapshot, collection } from 'firebase/firestore';
import { Profile } from '../types';
import RegisterAccount from '../screens/WelcomePage/RegisterAccount';
import MESpinner from '../components/MESpinner';
import QRScanner from '../screens/QRScanner';
import ClassPage from '../screens/ClassPage';
import HistoryPage from '../screens/HistoryPage';
import ExcusePage from '../screens/ExcusePage';
import { ProfileRoles } from '../constants/constants';
import AdminReferralPage from '../screens/AdminReferralPage';
import * as Location from 'expo-location';
import { defineTask, isTaskDefined } from 'expo-task-manager';
import NotVerified from '../screens/NotVerified';

const firestore: Firestore = getFirestore(app);
const fbAuth: Auth = getAuth(app);

let foregroundSubscription: any = null;
const TASK_NAME = "BACKGROUND_LOCATION_TASK";

// Defining task for location tracking
defineTask(TASK_NAME, async ({ data, error }) => {
  if (error) {
    console.error(error);
    return;
  }
  if (data) {
		/* Data object example:
      {
        locations: [
          {
            coords: {
              accuracy: 22.5,
              altitude: 61.80000305175781,
              altitudeAccuracy: 1.3333333730697632,
              heading: 0,
              latitude: 36.7384187,
              longitude: 3.3464008,
              speed: 0,
            },
            timestamp: 1640286402303,
          },
        ],
      };
    */
    const { locations } = data;
    const location = locations[0];

    if (location) {
      // Do something with location...
      console.log("BACKGROUND LOCATION", location);
    }
  }
});

export default function Navigation({ colorScheme }: { colorScheme: ColorSchemeName }) {
  const [isInitializing, setIsInitializing] = React.useState(true);
  const [auth, setAuth] = React.useState<any>(null);
  const [profile, setProfile] = React.useState<any>(null);
  const [school, setSchool] = React.useState<any>(null);
  const [classes, setClasses] = React.useState<any[]>([]);
  const [users, setUsers] = React.useState<{[key: string]: any}>({});
  const [backgroundStatus, requestBackgroundPermission] = Location.useBackgroundPermissions();
  const [foregroundStatus, requestForegroundPermission] = Location.useForegroundPermissions();
  const [location, setLocation] = React.useState<any>(null);
  
  // Subscribe to auth changes
  React.useEffect(() => {
    const unsubAuth = onAuthStateChanged(fbAuth, user => {
      setIsInitializing(true);
      if (user !== null) {
        setAuth(user);
      } else {
        setAuth(null);
        setIsInitializing(false);
      }
    }, (e) => {
      alert(e.message);
    });
    return () => unsubAuth();
  }, [])

  // Subscribe changes to profile
  React.useEffect(() => {
    if (auth && auth.uid) {
      const unsubsProfile = onSnapshot(doc(firestore, 'users', auth.uid), (docSnap) => {
        if (docSnap.exists()) {
          const profile = docSnap.data();
          setProfile({
            ...profile,
            id: auth.uid
          });
        } else {
          setProfile(null);
          setIsInitializing(false);
        }
      })
      return () => unsubsProfile();
    } else {
      setProfile(null);
    }
  }, [auth])
  
  // Subscribe changes to school and classes
  React.useEffect(() => {
    if (profile && profile.schoolId) {
      const unsubSchool = onSnapshot(doc(firestore, 'schools', profile.schoolId), (docSnap) => {
        if (docSnap.exists()) {
          const school = docSnap.data();
          setSchool({
            ...school,
            id: docSnap.id
          });
          setIsInitializing(false);
        } else {
          setSchool(null);
        }
      })
      const unsubClasses = onSnapshot(collection(firestore, 'schools', profile.schoolId, 'classes'), (snaps) => {
        if (!snaps.empty) {
          setClasses(snaps.docs.map((doc) => ({ ...doc.data(), id: doc.id })))
        } else {
          setClasses([]);
        }
      })
      return () => {
        unsubSchool();
        unsubClasses();
      };
    } else {
      setClasses([]);
      setSchool(null);
    }
  }, [profile])

  React.useEffect(() => {
    const requestPermissions = async () => {
      const foreground = await Location.requestForegroundPermissionsAsync();
      if (foreground.granted) await Location.requestBackgroundPermissionsAsync();
    }
    requestPermissions();
  }, [])

  async function startForegroundLocation() {
    const { granted } = await Location.getForegroundPermissionsAsync();
    if (!granted) {
      console.log("Location tracking denied!");
      return;
    }
    if (foregroundSubscription) stopForegroundLocation();
    foregroundSubscription = await Location.watchPositionAsync(
      { 
        accuracy: Location.Accuracy.BestForNavigation,
        distanceInterval: 1
      }, 
      (location) => {
        const { coords: { latitude, longitude } } = location;
        setLocation({ latitude, longitude });
      }
    )
  }

  function stopForegroundLocation() {
    foregroundSubscription.remove();
    setLocation(null);
  }

  async function startBackgroundLocation() {
    // Don't track position if permission is not granted
    const { granted } = await Location.getBackgroundPermissionsAsync()
    if (!granted) {
      console.log("Location tracking denied");
      const newBackgroundPermission = await Location.requestBackgroundPermissionsAsync();
      if (newBackgroundPermission.status !== 'granted') {
        return;
      }
    }

    // Make sure the task is defined otherwise do not start tracking
    const taskDefined = isTaskDefined(TASK_NAME);
    if (!taskDefined) {
      console.log("Task is not defined");
      return;
    }

    // Don't track if it is already running in background
    const hasStarted = await Location.hasStartedLocationUpdatesAsync(TASK_NAME)
    if (hasStarted) {
      console.log("Background location update already started");
      return;
    }

    await Location.startLocationUpdatesAsync(TASK_NAME, {
      accuracy: Location.Accuracy.Balanced,
      showsBackgroundLocationIndicator: true,
      timeInterval: 5000,
      foregroundService: {
        notificationTitle: "Hadir sedang melacak lokasi Anda",
        notificationBody: "Hadir memastikan Anda ada di sekitar kelas selama jadwal berlangsung.",
        notificationColor: Colors.light.blue,
      },
    })
  }

  async function stopBackgroundLocation() {
    const hasStarted = await Location.hasStartedLocationUpdatesAsync(TASK_NAME);
    if (hasStarted) {
      await Location.stopLocationUpdatesAsync(TASK_NAME);
      console.log("Location tracking stopped");
    }
  }

  async function getLocation() {
    const loc = await Location.getCurrentPositionAsync();
    const newLoc = { 
      latitude: loc.coords.latitude, 
      longitude: loc.coords.longitude, 
    }
    setLocation(newLoc);
    return newLoc;
  }

  React.useEffect(() => {
    if (profile?.role === ProfileRoles.STUDENT && profile?.currentScheduleId) {
      startForegroundLocation();
    }
  }, [profile])

  if (isInitializing) {
    return (
      <View
        style={{
          flex: 1,
          alignItems: 'center',
          justifyContent: 'center'
        }}
      >
        <MESpinner/>
      </View>
    )
  }

  return (
    <AuthContext.Provider value={{ auth, setAuth }}>
      <ProfileContext.Provider value={{ profile, setProfile }}>
        <SchoolContext.Provider value={{ school, setSchool }}>
          <ClassesContext.Provider value={{ classes, setClasses }}>
            <UsersContext.Provider value={{ users, setUsers }}>
              <LocationContext.Provider 
                value={{ 
                  location, 
                  setLocation,
                  startBackgroundLocation,
                  startForegroundLocation,
                  stopBackgroundLocation,
                  stopForegroundLocation,
                  getLocation,
                }}
              >
                <NavigationContainer
                  linking={LinkingConfiguration}
                  theme={METheme}>
                  <RootNavigator/>
                </NavigationContainer>
              </LocationContext.Provider>
            </UsersContext.Provider>
          </ClassesContext.Provider>
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
  const { auth }: { auth: User } = useContext(AuthContext);
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
          <>
            {
              [ProfileRoles.ADMIN, ProfileRoles.SUPER_ADMIN].includes(ProfileRoles[profile.role]) ? 
                <Stack.Screen name='AdminReferralPage' component={AdminReferralPage} options={{ headerShown: false }}/> 
                : !profile.isVerified 
                ? <Stack.Screen name="NotVerified" component={NotVerified} options={{ headerShown: false }} />
                : <Stack.Screen name="Root" component={BottomTabNavigator} options={{ headerShown: false }} />
            }
          </>
        ) : auth && !profile ? (
          <Stack.Screen name="RegisterAccount" component={RegisterAccount} options={{ headerShown: false }}/>
        ) : (
          <Stack.Screen name="WelcomePage" component={WelcomePage} options={{ headerShown: false }}/>
        )
      }
      <Stack.Screen name="Scanner" component={QRScanner} options={{ headerShown: false }} />
      <Stack.Screen name="ExcusePage" component={ExcusePage} options={{ headerShown: false }} />
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
        tabBarActiveTintColor: Colors.light.tint,
      }}>
      <BottomTab.Screen
        name="Home"
        component={HomePage}
        options={({ navigation }: RootTabScreenProps<'Home'>) => ({
          title: 'Beranda',
          tabBarIcon: ({ color }) => <TabBarIcon name="home" color={color} />,
          headerShown: false,
        })}
      />
      <BottomTab.Screen
        name="SchedulesPage"
        component={SchedulePage}
        options={({ navigation }: RootTabScreenProps<'SchedulesPage'>) => ({
          title: 'Jadwal',
          tabBarIcon: ({ color }) => <TabBarIcon name="calendar" color={color} />,
          headerShown: false,
        })}
      />
      <BottomTab.Screen
        name="HistoryPage"
        component={HistoryPage}
        options={({ navigation }: RootTabScreenProps<'HistoryPage'>) => ({
          title: 'Riwayat',
          tabBarIcon: ({ color }) => <TabBarIcon name="clock-o" color={color} />,
          headerShown: false,
        })}
      />
      <BottomTab.Screen
        name="ClassPage"
        component={ClassPage}
        options={({ navigation }: RootTabScreenProps<'ClassPage'>) => ({
          title: 'Kelas',
          tabBarIcon: ({ color }) => <TabBarIcon name="book" color={color} />,
          headerShown: false,
        })}
      />
      <BottomTab.Screen
        name="ProfilePage"
        component={ProfilePage}
        options={({ navigation }: RootTabScreenProps<'ProfilePage'>) => ({
          title: 'Profil',
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
