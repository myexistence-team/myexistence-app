/**
 * Learn more about using TypeScript with React Navigation:
 * https://reactnavigation.org/docs/typescript/
 */

import { BottomTabScreenProps } from '@react-navigation/bottom-tabs';
import { CompositeScreenProps, NavigatorScreenParams } from '@react-navigation/native';
import { NativeStackNavigationProp, NativeStackScreenProps } from '@react-navigation/native-stack';

declare global {
  namespace ReactNavigation {
    interface RootParamList extends RootStackParamList {}
  }
}

export type RootStackParamList = {
  Root: NavigatorScreenParams<RootTabParamList> | undefined;
  WelcomePage: NavigatorScreenParams<WelcomeParamList> | undefined,
  RegisterAccount: undefined,
  Modal: undefined;
  NotFound: undefined;
};

export type WelcomeParamList = {
  Welcome: undefined,
  Register: { role: string },
  Login: undefined
}

export type RootStackScreenProps<Screen extends keyof RootStackParamList> = NativeStackScreenProps<
  RootStackParamList,
  Screen
>;

export type ScheduleScreenProps = NativeStackScreenProps<ScheduleParamList, "ScheduleDetails">

export type ScheduleParamList = {
  Schedules: undefined,
  ScheduleDetails: { scheduleId: string },
}

export type ProfileParamList = {
  Profile: undefined,
  EditProfile: undefined,
}

export type RootTabParamList = {
  Home: undefined;
  SchedulesPage: NavigatorScreenParams<ScheduleParamList> | undefined,
  Scanner: { scheduleId: string },
  ProfilePage: NavigatorScreenParams<ProfileParamList> | undefined,
};

export type RootTabScreenProps<Screen extends keyof RootTabParamList> = CompositeScreenProps<
  BottomTabScreenProps<RootTabParamList, Screen>,
  NativeStackScreenProps<RootStackParamList>
>;
