import { View, Text, Alert } from 'react-native'
import React, { useContext, useState } from 'react'
import MECard from './MECard';
import { textStyles } from '../constants/Styles';
import { FontAwesome5 } from '@expo/vector-icons';
import Colors from '../constants/Colors';
import moment from 'moment';
import MEButton from './MEButton';
import { useNavigation } from '@react-navigation/native';
import useCurrentScheduleTime from '../hooks/useCurrentScheduleTime';
import { AuthContext, LocationContext, ProfileContext } from '../contexts';
import { AbsentStasuses, MAX_DISTACE, ProfileRoles, ScheduleOpenMethods } from '../constants/constants';
import { createUpdateStudentPresenceFromCallout } from '../actions/scheduleActions';
import { getLocationDistance } from '../utils/utilFunctions';

export default function ScheduleCard({
  schedule,
  disableScanButton,
  disableCountdown
}: {
  schedule: any & {
    start: Date
  },
  disableScanButton?: boolean,
  disableCountdown?: boolean,
}) {
  const { profile } = useContext(ProfileContext);
  const { auth } = useContext(AuthContext);
  const { getLocation } = useContext(LocationContext);
  const navigation = useNavigation();

  const now: Date = useCurrentScheduleTime();
  const diffInMs = schedule.start.toDate().getTime() - now.getTime();

  const diffToNowInMins = Math.abs(Math.floor(diffInMs/60000));
  const diffToNowInHours = Math.floor(diffToNowInMins/60);

  const [geoPresenceLoading, setGeoPresenceLoading] = useState(false);
  async function handleGeolocationPresence() {
    if (schedule.location) {
      setGeoPresenceLoading(true);
      const location = await getLocation();
      const distance = getLocationDistance(schedule?.location, location);
      if (distance < MAX_DISTACE) {
        await createUpdateStudentPresenceFromCallout({
          classId: schedule.classId,
          scheduleId: schedule.id,
          schoolId: profile.schoolId,
          status: AbsentStasuses.PRESENT,
          studentId: auth.uid,
        });
      } else {
        Alert.alert(
          'Anda Terlalu Jauh', 
          'Lokasi Anda terlalu jauh dari lokasi kelas. Jika ini adalah sebuah kesalahan, mohon hubungi pengajar.',
          [
            {
              text: 'OK'
            }
          ]
        )
      }
      setGeoPresenceLoading(false);
    }
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
              color: Colors.light.grey,
            }
          ]}
        >
          <FontAwesome5 size={12} name='clock'/>{'  '}
          <Text
          >
            {moment(schedule.start.toDate()).format("HH:mm")} - {moment(schedule.end.toDate()).format("HH:mm")}
          </Text>
          {' • '}
          <Text>
            Toleransi {schedule.tolerance} menit
          </Text>
        </Text>
        {
          (disableCountdown === undefined || disableCountdown === false) && diffToNowInHours < 24 ? (
            <Text style={textStyles.body3}>
              {diffInMs > 0 ? 'Dalam' : 'Terlambat'} {diffToNowInMins > 60 ? diffToNowInHours : diffToNowInMins} {diffToNowInMins > 60 ? 'Jam' : 'Menit'}
            </Text>
          ) : null
        }
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
        {schedule.className}
      </Text>
      <Text style={[textStyles.body3]}>
        {schedule.classDescription}
      </Text>
      {
        profile.currentScheduleId && schedule.id === profile.currentScheduleId ? (
          <Text style={[textStyles.body2, { textAlign: 'center', marginTop: 8, fontFamily: 'manrope-bold' }]}>Sesi kelas sedang berlangsung</Text>
        ) : !profile.currentScheduleId ? (
          <>
            {
              profile.role === ProfileRoles.STUDENT ? (
                <>
                  {
                    (disableScanButton === undefined || disableScanButton === false) && schedule.status === 'OPENED' ? (
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
                              marginRight: 8
                            }
                          ]}
                        >
                          <MEButton
                            color='primary'
                            variant='outline'
                            onPress={() => {
                              navigation.navigate('ExcusePage', {
                                scheduleId: schedule.id,
                                classId: schedule.classId
                              })
                            }}
                          >
                              Izin
                          </MEButton>
                        </View>
                        <View
                          style={[
                            { 
                              flex: 3
                            }
                          ]}
                        >
                          {
                            schedule.openMethod === ScheduleOpenMethods.QR_CODE ? (
                              <MEButton
                              iconStart="qrcode"
                              style={[
                                { 
                                  marginLeft: 4
                                }
                              ]}
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
                              >
                                Hadir
                              </MEButton>
                            )
                          }
                        </View>
                      </View>
                    ) : null
                  }
                </>
              ) : (
                null
                // <>
                //   {
                //     schedule.status === 'CLOSED' && (
                //       <View style={{ marginTop: 16, flexDirection: 'row' }}>
                //         <View style={{ flex: 1, marginRight: 8 }}>
                //           <MEButton
                //             iconStart='map-marker-alt'
                //             onPress={() => {
                //               navigation.navigate("Root", {
                //                 screen: "SchedulesPage",
                //                 params: {
                //                   screen: "ScheduleDetails",
                //                   params: {
                //                     classId: schedule.classId,
                //                     scheduleId: schedule.id,
                //                     toggleOpen: ScheduleOpenMethods.GEOLOCATION
                //                   },
                //                   initial: false,
                //                 },
                //               })
                //             }}
                //           />
                //         </View>
                //         <View style={{ flex: 1, marginHorizontal: 8 }}>
                //           <MEButton
                //             iconStart='qrcode'
                //             onPress={() => {
                //               navigation.navigate("Root", {
                //                 screen: "SchedulesPage",
                //                 params: {
                //                   screen: "ScheduleDetails",
                //                   params: {
                //                     classId: schedule.classId,
                //                     scheduleId: schedule.id,
                //                     toggleOpen: ScheduleOpenMethods.QR_CODE
                //                   },
                //                   initial: false,
                //                 },
                //               })
                //             }}
                //           />
                //         </View>
                //         <View style={{ flex: 1, marginLeft: 8 }}>
                //           <MEButton
                //             iconStart='hand-paper'
                //             onPress={() => {
                //               navigation.navigate("Root", {
                //                 screen: "SchedulesPage",
                //                 params: {
                //                   screen: "ScheduleDetails",
                //                   params: {
                //                     classId: schedule.classId,
                //                     scheduleId: schedule.id,
                //                     toggleOpen: ScheduleOpenMethods.CALLOUT
                //                   },
                //                   initial: false,
                //                 },
                //               })
                //             }}
                //           />
                //         </View>
                //       </View>
                //     )
                //   }
                // </>
              )
            }
          </>
        ) : null
      }
    </MECard>
  )
}