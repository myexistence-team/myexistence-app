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
import { DAYS_ARRAY, ScheduleStasuses } from '../constants/constants';

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
          {moment(schedule.start.toDate()).format("HH:mm")} - {moment(schedule.end.toDate()).format("HH:mm")}
        </Text>
        {
          (disableScanButton === undefined || disableScanButton === false) && schedule.status === ScheduleStasuses.OPENED ? (
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
                >
                    Izin
                </MEButton>
              </View>
              <View
                style={[
                  { 
                    flex: 3,
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