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
import { NavigationContainer, DefaultTheme, DarkTheme } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import * as React from 'react';
import { ColorSchemeName, Pressable } from 'react-native';
import Colors from '../constants/Colors';
import { METheme } from '../constants/Themes';
import useColorScheme from '../hooks/useColorScheme';
import HomePage from '../screens/HomePage';
import ModalScreen from '../screens/ModalScreen';
import NotFoundScreen from '../screens/NotFoundScreen';
import ProfilePage from '../screens/ProfilePage';
import SchedulePage from '../screens/SchedulePage';
import { RootStackParamList, RootTabParamList, RootTabScreenProps } from '../types';
import LinkingConfiguration from './LinkingConfiguration';
import WelcomePage from '../screens/WelcomePage';
import { initializeApp } from 'firebase/app';
import { app, firebaseConfig } from '../firebase';
import { UserContext } from '../contexts';
import { useContext } from 'react';
import { getFirestore, setDoc, doc, Firestore, getDoc, DocumentSnapshot } from 'firebase/firestore';

initializeApp(firebaseConfig);

const firestore: Firestore = getFirestore(app);
const auth: Auth = getAuth(app);

export default function Navigation({ colorScheme }: { colorScheme: ColorSchemeName }) {
  return (
    <NavigationContainer
      linking={LinkingConfiguration}
      theme={colorScheme === 'dark' ? DarkTheme : METheme}>
      <RootNavigator />
    </NavigationContainer>
  );
}

/**
 * A root stack navigator is often used for displaying modals on top of all other content.
 * https://reactnavigation.org/docs/modal
 */
const Stack = createNativeStackNavigator<RootStackParamList>();

function RootNavigator() {
  const [initializing, setInitializing] = React.useState(true);
  const [user, setUser] = React.useState<User>();

  onAuthStateChanged(auth, user => {
    if (user !== null) {
      console.log("HELLO");
      setUser(user);
      getDoc(doc(firestore, 'users', user.uid))
        .then((docSnap: DocumentSnapshot) => {
          console.log(docSnap.data());
        })
      setDoc(doc(firestore, 'users', "HELLO"), {
        displayName: "Hello There"
      })
        .then(() => {
          console.log("DATA SAVED");
        })
    }
  });

  // if (initializing) return null;

  return (
    <UserContext.Provider value={user}>
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
    </UserContext.Provider>
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
