import { View, Text } from 'react-native'
import React from 'react'
import MECard from './MECard'
import { textStyles } from '../constants/Styles'
import StatusIcon from './StatusIcon'
import { Log } from '../types'
import moment from 'moment'
import { AbsentStasuses } from '../constants/constants'

export default function StudentCard({
  student,
  onPress,
  log
}: {
  student: {
    displayName: string
  },
  onPress?: Function,
  log?: Log,
}) {
  return (
    <MECard
      style={{
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 16
      }}
      onPress={onPress}
    >
      <Text style={[textStyles.body1, { fontFamily: 'manrope-bold' }]}>{student.displayName}</Text>
      {
        log && (
          <View style={{ flexDirection: 'row', alignItems: 'center' }}>
            {
              [AbsentStasuses.PRESENT, AbsentStasuses.LATE].includes(log.status) && (
                <Text style={[textStyles.body3, { marginRight: 8 }]}>{moment(log.time.toDate()).format("HH:mm")}</Text>
              )
            }
            <StatusIcon status={log.status}/>
          </View>
        )
      }
    </MECard>
  )
}