import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { HistoryPageParamList } from "../../navTypes";
import React, { Fragment, useContext, useEffect, useState } from 'react';
import MEContainer from "../../components/MEContainer";
import { Text, View } from "react-native";
import { textStyles } from "../../constants/Styles";
import { Log, LogCountByClass, LogCountBySchedule, Profile } from "../../types";
import { AuthContext, ClassesContext, ProfileContext } from "../../contexts";
import { collection, collectionGroup, getDocs, orderBy, query, where } from "firebase/firestore";
import { firestore } from "../../firebase";
import MESpinner from "../../components/MESpinner";
import HistoryCard from "../../components/HistoryCard";
import HistoryDetailsPage from "../HistoryDetailsPage";
import { AbsentStasuses, DAYS_ARRAY, ProfileRoles } from "../../constants/constants";
import { groupBy } from "../../utils/utilFunctions";
import MECard from "../../components/MECard";
import moment from "moment";
import TeacherHistoryCard from "../../components/TeacherHistoryCard";

const Stack = createNativeStackNavigator<HistoryPageParamList>();

export default function HistoryPage() {
  return (
    <Stack.Navigator
      initialRouteName='History'
    >
      <Stack.Screen 
        name='History' 
        component={History} 
        options={{
          header: () => null
        }}
      />
      <Stack.Screen 
        name='HistoryDetails' 
        component={HistoryDetailsPage}
        options={{
          headerShown: false,
        }}
      />
    </Stack.Navigator>
  )
}

export function History() {
  const { profile } = useContext(ProfileContext);
  const { auth } = useContext(AuthContext);
  const { classes } = useContext(ClassesContext);

  const [logs, setLogs] = useState<(any | Log)[]>([]);
  const [currentLogs, setCurrentLogs] = useState<(any | Log)[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [groupedLogs, setGroupedLogs] = useState<LogCountByClass[]>([]);

  const studentLogsQuery = query(collection(
    firestore, 
    `schools/${profile.schoolId}/logs`),
    where('studentId', '==', auth.uid),
    orderBy('time', 'desc')
  );

  const teacherLogsQuery = query(collection(
    firestore, 
    `schools/${profile.schoolId}/logs`),
    where('teacherId', '==', auth.uid),
    orderBy('time', 'desc')
  );
  
  function loadStudentData() {
    if (profile.classIds?.length) {
      setIsLoading(true);
      getDocs(studentLogsQuery).then((docSnaps) => {
        const docsArr: any[] = [];
        docSnaps.forEach((doc) => {
          docsArr.push({ ...doc.data(), id: doc.id });
        })
        setIsLoading(false);
        setLogs(docsArr);
      })
      if (profile.currentScheduleId) {
        const currentScheduleQuery = query(
          collectionGroup(firestore, `schedules`), 
          where('id', '==', profile.currentScheduleId)
        );
        getDocs(currentScheduleQuery).then((scheduleSnaps) => {
          if (!scheduleSnaps.empty) {
            const scheduleSnap = scheduleSnaps.docs[0];
            const schedule = scheduleSnap.data();
            const currentLogsQuery = query(
              collection(
                firestore,
                'schools',
                profile.schoolId || '',
                'classes',
                schedule.classId,
                'schedules',
                scheduleSnap.id,
                'studentLogs'
              ), 
              where('studentId', '==', auth.uid)
            );
            getDocs(currentLogsQuery).then((logSnaps) => {
              const logsData: any[] = [];
              if (!logSnaps.empty) {
                logSnaps.docs.forEach((docData) => {
                  logsData.push({
                    ...docData.data(),
                    id: docData.id,
                    isCurrent: true,
                  })
                })
              }
              setCurrentLogs(logsData);
            })
          }
        })
      } else {
        setCurrentLogs([]);
      }
    } else {
      setIsLoading(false);
    }
  }

  function loadTeacherData() {
    if (profile.classIds?.length) {
      setIsLoading(true);
      getDocs(teacherLogsQuery).then((docSnaps) => {
        const docsArr: any[] = [];
        docSnaps.forEach((doc) => {
          docsArr.push({ ...doc.data(), id: doc.id });
        })
        const logsGroupedByClassCount: LogCountByClass[] = Object.entries(groupBy(docsArr, 'classId')).map((a: any) => {
          return {
            classId: a[0], 
            className: classes?.find((c) => c.id === a[0])?.name,
            counts: Object.entries(groupBy(a[1], 'scheduleId')).map((b: any) => ({
              scheduleId: b[0],
              schedule: b[1][0].schedule,
              presentCount: b[1].filter((log: Log) => log.status === AbsentStasuses.PRESENT).length,
              absentCount: b[1].filter((log: Log) => log.status === AbsentStasuses.ABSENT).length,
              lateCount: b[1].filter((log: Log) => log.status === AbsentStasuses.LATE).length,
              excusedCount: b[1].filter((log: Log) => log.status === AbsentStasuses.EXCUSED).length,
            }))
          }
        })
        setGroupedLogs(logsGroupedByClassCount);
        setIsLoading(false);
      })
    } else {
      setIsLoading(false);
    }
  }

  function loadData() {
    if (profile.role === ProfileRoles.STUDENT) {
      loadStudentData();
    } else {
      loadTeacherData();
    }
  }

  useEffect(() => {
    loadData();
  }, [])

  return (
    <MEContainer
      onRefresh={profile.classIds?.length ? loadData : undefined}
      refreshing={isLoading}
    >
      <>
        <Text
          style={[textStyles.heading3, { marginBottom: 16 }]}
        >
          Riwayat
        </Text>
        {
          profile.role === ProfileRoles.STUDENT ? (
            <>
              {
                currentLogs.length > 0 && (
                  <>            
                    <Text
                      style={[textStyles.heading4, { marginBottom: 16 }]}
                    >
                      Sedang Berlangsung
                    </Text>
                    {
                      currentLogs.map((l, idx) => (
                        <HistoryCard key={idx} history={l}/>
                      ))
                    }
                    <Text
                      style={[textStyles.heading4, { marginBottom: 16 }]}
                    >
                      Semua Riwayat
                    </Text>
                  </>
                )
              }
              {
                !profile.classIds?.length ? (
                  <Text style={[textStyles.body2]}>
                    Anda belum terdaftar di kelas apapun.
                  </Text>
                ) : isLoading ? (
                  <MESpinner/>
                ) : (
                  logs.map((l, idx) => (
                    <HistoryCard key={idx} history={l}/>
                  ))
                )
              }
            </>
          ) : (
            <>
              {
                groupedLogs.map((c, idx) => (
                  <View key={idx} style={{ marginBottom: 16 }}>
                    <Text style={[textStyles.heading4, { marginBottom: 16 }]}>
                      {c.className}
                    </Text>
                    {
                      c.counts.map((scheduleLog, slIdx) => {
                        return (
                          <TeacherHistoryCard
                            scheduleLog={scheduleLog}
                            key={slIdx}
                          />
                        )
                      })
                    }
                  </View>
                ))
              }
            </>
          )
        }
      </>
    </MEContainer>
  )
}