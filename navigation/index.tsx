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
import { ProfileContext, SchoolContext, AuthContext, ClassesContext } from '../contexts';
import { useContext } from 'react';
import { getFirestore, doc, Firestore, onSnapshot, collection } from 'firebase/firestore';
import { Profile } from '../types';
import RegisterAccount from '../screens/WelcomePage/RegisterAccount';
import MESpinner from '../components/MESpinner';
import QRScanner from '../screens/QRScanner';
import ClassPage from '../screens/ClassPage';
import HistoryPage from '../screens/HistoryPage';
import ExcusePage from '../screens/ExcusePage';

const firestore: Firestore = getFirestore(app);
const fbAuth: Auth = getAuth(app);

export default function Navigation({ colorScheme }: { colorScheme: ColorSchemeName }) {
  const [isInitializing, setIsInitializing] = React.useState(true);
  const [auth, setAuth] = React.useState<any>(null);
  const [profile, setProfile] = React.useState<any>(null);
  const [school, setSchool] = React.useState<any>(null);
  const [classes, setClasses] = React.useState<any[]>([]);
  
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

  React.useEffect(() => {
    if (auth && auth.uid) {
      const unsubscrubeProfile = onSnapshot(doc(firestore, 'users', auth.uid), (docSnap) => {
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
      return () => unsubscrubeProfile();
    } else {
      setProfile(null);
    }
  }, [auth])
  
  React.useEffect(() => {
    if (profile && profile.schoolId) {
      const unsubProfile = onSnapshot(doc(firestore, 'schools', profile.schoolId), (docSnap) => {
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
        unsubProfile();
        unsubClasses();
      };
    } else {
      setSchool(null);
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
            <NavigationContainer
              linking={LinkingConfiguration}
              theme={METheme}>
              <RootNavigator/>
            </NavigationContainer>
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
          <Stack.Screen name="Root" component={BottomTabNavigator} options={{ headerShown: false }} />
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
