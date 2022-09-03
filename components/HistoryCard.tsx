import { FontAwesome, FontAwesome5 } from '@expo/vector-icons'
import moment from 'moment'
import React from 'react'
import { Text } from 'react-native'
import Colors from '../constants/Colors'
import { textStyles } from '../constants/Styles'
import { PresenceStatusEnum } from '../enums'
import MECard from './MECard'
import { View } from './Themed'

function getStatusColor(status:string) {
    switch (status) {
        case "PRESENT":
            return Colors.light.green
        case "ABSENT":
            return Colors.light.red
        case "LATE":
            return Colors.light.orange
        case "EXCUSED":
            return Colors.light.yellows.yellow3
        default:
            return Colors.light.black
    }
}

export default function HistoryCard(props: {
    history: {
        id: string,
      name: string,
      location: string,
      dateTime: Date,
      status: 'PRESENT' | 'ABSENT' | 'LATE' | 'EXCUSED' | string,
    }
}) {
    const {history} = props;

    return (
        <MECard
        style={{
            marginBottom: 16
          }} 
        >
            <View
            style={{
                flexDirection: 'row',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginBottom: 8,
              }}
            >
                <View
                style={{
                    flexDirection: 'row',
                    alignItems: 'center',
                    flex: 2,
                  }}
                >
                    <FontAwesome5 
                    size={12} 
                    name='calendar'
                    color={Colors.light.grey}
                    />
                    <Text style={[textStyles.body3, {
                        marginLeft: 8,
                        color: Colors.light.grey,                        
                        }]}>
                    {moment(history.dateTime).format("LL - HH:mm")}
                    </Text>
                </View>
                <View
                style={{
                    flexDirection: 'row',
                    justifyContent: 'flex-end',
                    alignItems: 'center',
                    flex: 1,
                  }}
                >
                    <FontAwesome
                        size={12} 
                        name='circle' 
                        color={getStatusColor(history.status)}
                        />
                    <Text 
                    style={[textStyles.body3, {
                        marginLeft: 4,
                        fontFamily: 'manrope-bold',
                        color: getStatusColor(history.status)
                      }]} 
                    >
                        {PresenceStatusEnum[history.status]}
                    </Text>
                </View>
            </View>
            <Text
            style={[textStyles.body1, {
                fontFamily: 'manrope-bold'
             }]}
            >{history.name}</Text>
        </MECard>
    )
}