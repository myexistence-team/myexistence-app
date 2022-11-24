import { createNativeStackNavigator, NativeStackScreenProps } from "@react-navigation/native-stack";
import { HistoryPageParamList, HistoryScreenProps } from "../../navTypes";
import React, { useContext, useEffect, useState } from 'react';
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
import TeacherHistoryCard from "../../components/TeacherHistoryCard";
import { useForm } from "react-hook-form";
import MEControlledSelect from "../../components/MEControlledSelect";
import { PresenceStatusEnum } from "../../enums";
import MEFirestoreSelect from "../../components/MEFirestoreSelect";
import MEButton from "../../components/MEButton";

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

export function History({
  route
}: NativeStackScreenProps<HistoryPageParamList, 'History'>) {
  const { profile } = useContext(ProfileContext);
  const { auth } = useContext(AuthContext);
  const { classes } = useContext(ClassesContext);

  const [logs, setLogs] = useState<(any | Log)[]>([]);
  const [currentLogs, setCurrentLogs] = useState<(any | Log)[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [groupedLogs, setGroupedLogs] = useState<LogCountByClass[]>([]);

  const { control, getValues, watch, reset, setValue } = useForm();

  useEffect(() => {
    setValue('status', route?.params?.status);
    setValue('classId', route?.params?.classId);
    return () => {
      reset();
    }
  }, [route?.params])


  function loadStudentData() {
    const studentLogsQuery = query(collection(
      firestore, 
      `schools/${profile.schoolId}/logs`),
      where('studentId', '==', auth.uid),
      ...getValues('status') ? [where('status', '==', getValues('status'))] : [],
      ...getValues('classId') ? [where('classId', '==', getValues('classId'))] : [],
      orderBy('time', 'desc')
    );

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
      const teacherLogsQuery = query(collection(
        firestore, 
        `schools/${profile.schoolId}/logs`),
        where('teacherId', '==', auth.uid),
        orderBy('time', 'desc')
      );
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
  }, [watch('status'), watch('classId')])

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
        <View style={{ marginBottom: 24 }}>
          <MEControlledSelect
            control={control}
            name='status'
            label='Filter'
            placeholder="Pilih Status"
            options={[
              { value: AbsentStasuses.PRESENT, label: PresenceStatusEnum[AbsentStasuses.PRESENT] },
              { value: AbsentStasuses.LATE, label: PresenceStatusEnum[AbsentStasuses.LATE] },
              { value: AbsentStasuses.EXCUSED, label: PresenceStatusEnum[AbsentStasuses.EXCUSED] },
              { value: AbsentStasuses.ABSENT, label: PresenceStatusEnum[AbsentStasuses.ABSENT] },
            ]}
          />
          <MEFirestoreSelect
            control={control}
            name='classId'
            listName='classes'
            label={false}
            placeholder="Pilih Kelas"
          />
          {
            (watch('status') || watch('classId')) && (
              <MEButton
                size='sm'
                variant='outline'
                onPress={() => reset()}
              >
                Bersihkan Filter
              </MEButton>
            )
          }
        </View>
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