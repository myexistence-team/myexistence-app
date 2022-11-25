import { Text } from 'react-native'
import React, { useContext, useEffect, useState } from 'react'
import { Log } from '../../types';
import { textStyles } from '../../constants/Styles';
import HistoryCard from '../../components/HistoryCard';
import { AuthContext, ProfileContext } from '../../contexts';
import MESpinner from '../../components/MESpinner';
import { collection, collectionGroup, getDocs, orderBy, query, where } from 'firebase/firestore';
import { firestore } from '../../firebase';
import { useForm } from 'react-hook-form';
import { View } from '../../components/Themed';
import MEControlledSelect from '../../components/MEControlledSelect';
import { AbsentStasuses } from '../../constants/constants';
import { PresenceStatusEnum } from '../../enums';
import MEFirestoreSelect from '../../components/MEFirestoreSelect';
import MEButton from '../../components/MEButton';

export default function StudentHistory({
  status,
  classId
}: {
  status?: AbsentStasuses,
  classId?: string
}) {
  const { profile } = useContext(ProfileContext);
  const { auth } = useContext(AuthContext);
  const [currentLogs, setCurrentLogs] = useState<(any | Log)[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [logs, setLogs] = useState<(any | Log)[]>([]);

  const { control, getValues, watch, reset, setValue } = useForm();
  useEffect(() => {
    setValue('status', status);
    setValue('classId', classId);
    return () => {
      reset();
    }
  }, [status, classId])

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

  useEffect(() => {
    loadStudentData();
  }, [])

  return (
    <>
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
  )
}