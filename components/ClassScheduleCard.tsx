import { View, Text, Pressable } from 'react-native'
import React, { useContext, useState } from 'react'
import MECard from './MECard';
import { textStyles } from '../constants/Styles';
import { FontAwesome5 } from '@expo/vector-icons';
import Colors from '../constants/Colors';
import moment from 'moment';
import MEButton from './MEButton';
import { useNavigation } from '@react-navigation/native';
import { AbsentStasuses, DAYS_ARRAY, MAX_DISTACE, ScheduleOpenMethods, ScheduleStasuses } from '../constants/constants';
import { AuthContext, ProfileContext } from '../contexts';
import useGetDistance from '../hooks/useGetDistance';
import { createUpdateStudentPresenceFromCallout } from '../actions/scheduleActions';

export default function ClassScheduleCard({
  schedule,
  disableScanButton,
  classId
}: {
  schedule: any & {
    start: Date
  },
  classId: string,
  disableScanButton?: boolean
}) {
  const { profile } = useContext(ProfileContext);
  const { auth } = useContext(AuthContext);
  const navigation = useNavigation();
  const distance: number = useGetDistance(schedule?.location);

  const [geoPresenceLoading, setGeoPresenceLoading] = useState(false);
  async function handleGeolocationPresence() {
    setGeoPresenceLoading(true);
    await createUpdateStudentPresenceFromCallout({
      classId,
      scheduleId: schedule.id,
      schoolId: profile.schoolId,
      status: AbsentStasuses.PRESENT,
      studentId: auth.uid,
    });
    setGeoPresenceLoading(false);
  }

  return (
    <MECard
      style={{
        marginBottom: 16
      }} 
      onPress={() => {
        navigation.navigate("Root", {
          screen: "SchedulesPage",
          params: {
            screen: "ScheduleDetails",
            params: {
              classId: schedule.classId,
              scheduleId: schedule.id
            },
            initial: false,
          },
        })
      }}
    >
      <View
        style={{
          flexDirection: 'row',
          justifyContent: 'space-between',
          alignItems: 'center'
        }}
      >
        <Text 
          style={[
            textStyles.body3,
            { 
              flexDirection: 'row', 
              alignItems: 'center',
            }
          ]}
        >
          <Text
          >
            {DAYS_ARRAY[schedule.day]}
          </Text>
          
        </Text>
        <Text
        style={[
          textStyles.body3,
          { 
            flexDirection: 'row', 
            alignItems: 'center',
            color: Colors.light.grey,
          }
        ]}
        >
            Toleransi {schedule.tolerance} menit
      </Text>
      </View>
      <Text 
        style={[
          textStyles.body1,
          {
            marginVertical: 8,
            fontFamily: 'manrope-bold'
          }
        ]}
      >
        {moment(schedule.start.toDate()).format("HH:mm")} - {moment(schedule.end.toDate()).format("HH:mm")}
      </Text>
      {
        (disableScanButton === undefined || disableScanButton === false) && schedule.status === ScheduleStasuses.OPENED && !profile.currentScheduleId ? (
          <View
          style={{
              flexDirection: 'row',
              marginTop: 16
            }}
          >
            <View
              style={[
                { 
                  flex: 2,
                }
              ]}
            >
              <MEButton
                color='primary'
                variant='outline'
                onPress={() => {
                  navigation.navigate("ExcusePage", {
                    classId: schedule.classId,
                    scheduleId: schedule.id
                  })
                }}
              >
                  Izin
              </MEButton>
            </View>
            {
              schedule.openMethod !== ScheduleOpenMethods.CALLOUT && (
                <View
                  style={[
                    { 
                      flex: 3,
                      marginLeft: 8
                    }
                  ]}
                >
                  {
                    schedule.openMethod === ScheduleOpenMethods.QR_CODE ? (
                      <MEButton
                        iconStart="qrcode"
                        onPress={() => navigation.navigate('Scanner', {
                            scheduleId: schedule.id,
                            schedule
                        })}
                      >
                        Pindai QR Code
                      </MEButton>
                    ) : (
                      <MEButton
                        iconStart="check"
                        isLoading={geoPresenceLoading}
                        onPress={handleGeolocationPresence}
                        disabled={distance > MAX_DISTACE}
                      >
                        Hadir
                      </MEButton>
                    )
                  }
                </View>
              ) 
            }
          </View>
        ) : null
      }
    </MECard>
  )
}