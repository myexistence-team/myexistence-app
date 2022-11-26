/**
 * Learn more about using TypeScript with React Navigation:
 * https://reactnavigation.org/docs/typescript/
 */

import { BottomTabScreenProps } from '@react-navigation/bottom-tabs';
import { CompositeScreenProps, NavigatorScreenParams } from '@react-navigation/native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { Timestamp } from 'firebase/firestore';
import { AbsentStasuses, ScheduleOpenMethods } from './constants/constants';
import { Schedule } from './types';

declare global {
  namespace ReactNavigation {
    interface RootParamList extends RootStackParamList {}
  }
}

export type RootStackParamList = {
  Root: NavigatorScreenParams<RootTabParamList> | undefined;
  WelcomePage: NavigatorScreenParams<WelcomeParamList> | undefined,
  Scanner: { 
    scheduleId: string,
    schedule: Schedule
  },
  ExcusePage: {
    scheduleId: string,
    classId: string,
  },
  RegisterAccount: undefined,
  AdminReferralPage: undefined,
  NotVerified: undefined,
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
export type HistoryScreenProps = NativeStackScreenProps<HistoryPageParamList, "HistoryDetails">
export type ClassScreenProps = NativeStackScreenProps<ClassParamList, "ClassDetails">
export type ExcusePageScreenProps = NativeStackScreenProps<RootStackParamList, "ExcusePage">

export type ScheduleParamList = {
  Schedules: undefined,
  ScheduleDetails: { 
    classId: string,
    scheduleId: string,
    toggleOpen?: ScheduleOpenMethods
  },
  ScheduleStudentCallouts: {
    studentIds: string[]
  },
  SchedulePresences: { 
    classId: string,
    scheduleId: string 
  },
  SchedulePresenceDetails: {
    isStudentLog?: boolean,
    logId: string,
    classId: string,
    scheduleId: string,
    presence?: {
      studentName: string,
      studentId: string,
      className: string,
      classId: string,
      status: string,
      start: Timestamp,
      end: Timestamp,
      time: Timestamp,
      excuse?: any
    }
  }
}

export type ProfileParamList = {
  Profile: undefined,
  EditProfile: undefined,
}

export type HistoryPageParamList = {
  History: {
    status?: AbsentStasuses,
    classId?: string,
  } | undefined,
  HistoryScheduleDetails: {
    classId: string,
    scheduleId: string,
  },  
  HistoryLogsDetails: {
    schedule: Schedule,
    classId: string,
    logsCounts: {
      dateStr: string,
      openedAt: Timestamp,
      closedAt: Timestamp,
      presentCount: number,
      absentCount: number,
      excusedCount: number,
      lateCount: number,
      totalCount: number,
    }
  },
  HistoryDetails: {
    logId: string,
    isCurrent?: boolean,
    classId: string,
  }
}

export type HomePageParamList = {
  Home: undefined,
  SummaryDetails: undefined,
}

export type RootTabParamList = {
  HomePage: NavigatorScreenParams<HomePageParamList> | undefined;
  SchedulesPage: NavigatorScreenParams<ScheduleParamList> | undefined,
  HistoryPage: NavigatorScreenParams<HistoryPageParamList> | undefined,
  ProfilePage: NavigatorScreenParams<ProfileParamList> | undefined,
  ClassPage: NavigatorScreenParams<ClassParamList> | undefined,
};

export type ClassParamList ={
  Classes: undefined,
  ClassDetails: {
    classId: string,
  }
}

export type RootTabScreenProps<Screen extends keyof RootTabParamList> = CompositeScreenProps<
  BottomTabScreenProps<RootTabParamList, Screen>,
  NativeStackScreenProps<RootStackParamList>
>;
