import { View, Text, Pressable } from 'react-native'
import React from 'react'
import MECard from './MECard';
import { textStyles } from '../constants/Styles';
import { FontAwesome5 } from '@expo/vector-icons';
import Colors from '../constants/Colors';
import moment from 'moment';
import MEButton from './MEButton';
import { useNavigation } from '@react-navigation/native';
import useCurrentScheduleTime from '../hooks/useCurrentScheduleTime';
import { DAYS_ARRAY } from '../constants/constants';

export default function ClassScheduleCard({
  schedule,
  disableScanButton
}: {
  schedule: any & {
    start: Date
  },
  disableScanButton?: boolean
}) {
  const navigation = useNavigation();

  const now: Date = useCurrentScheduleTime();
  const diffInMs = schedule.start.getTime() - now.getTime();

  const diffToNowInMins = Math.floor(diffInMs/60000);
  const diffToNowInHours = Math.floor(diffInMs/3600000);

  return (
    <Pressable
      style={({ pressed }) => ({
        opacity: pressed ? 0.75 : 1
      })}
      
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
      <MECard
        style={{
          marginBottom: 16
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
          {moment(schedule.start).format("HH:mm")} - {moment(schedule.end).format("HH:mm")}
        </Text>
        {
          (disableScanButton === undefined || disableScanButton === false) && (diffToNowInMins <= 30 && diffToNowInMins >= -15) ? (
            <View
            style={{
                // flex: 1,
                // flexDirection: 'row',
                // justifyContent: 'center',
                // width: 167,
                flex: 1,
                flexDirection: 'row',
                justifyContent: 'space-between'
              }}
            >
              <View
                style={[
                  { 
                    width: '40%',
                  }
                ]}
              >
                <MEButton
                color='white'
                style={[
                    { 
                      borderWidth: 1,
                      borderColor: Colors.light.blue,
                    }
                  ]}
                >
                    Izin
                </MEButton>
              </View>
              <View
                style={[
                  { 
                    width: '60%',
                  }
                ]}
              >
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
              </View>
            </View>
          ) : null
        }
      </MECard>
    </Pressable>
  )
}