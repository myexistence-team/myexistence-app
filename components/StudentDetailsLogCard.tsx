import { View, Text } from 'react-native'
import React, { useContext } from 'react'
import { Timestamp } from 'firebase/firestore'
import MECard from './MECard'
import { ClassesContext, UsersContext } from '../contexts'
import { Log } from '../types'
import { textStyles } from '../constants/Styles'
import moment from 'moment'
import StatusIcon from './StatusIcon'

export default function StudentDetailsLogCard({
  log: {
    classId,
    schedule: {
      start, end
    },
    time,
    status
  }
}: {
  log: Log
}) {
  const { classes } = useContext(ClassesContext);
  const classroom = classes?.find((c) => c.id === classId);

  return (
    <MECard style={{ 
      marginBottom: 16
    }}>
      <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
        <Text style={[textStyles.body2, { fontFamily: 'manrope-bold', marginBottom: 8 }]}>{moment(time.toDate()).format("LL")}</Text>
        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
          <Text style={[textStyles.body3, { marginRight: 8 }]}>{moment(time.toDate()).format("HH:mm")}</Text>
          <StatusIcon status={status}/>
        </View>
      </View>
      <Text style={[textStyles.body3]}>{classroom?.name} • {moment(start.toDate()).format("HH:mm")} - {moment(end.toDate()).format("HH:mm")}</Text>
    </MECard>
  )
}