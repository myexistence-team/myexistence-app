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
  Welcome: NavigatorScreenParams<WelcomeParamList> | undefined,
  Modal: undefined;
  NotFound: undefined;
};

export type WelcomeParamList = {
  WelcomeScreen: undefined,
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

export type RootTabParamList = {
  Home: undefined;
  Schedule: NavigatorScreenParams<ScheduleParamList> | undefined,
  Profile: { userId: string },
};

export type RootTabScreenProps<Screen extends keyof RootTabParamList> = CompositeScreenProps<
  BottomTabScreenProps<RootTabParamList, Screen>,
  NativeStackScreenProps<RootStackParamList>
>;
