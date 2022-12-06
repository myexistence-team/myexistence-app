import { View, Text } from 'react-native'
import React, { useContext } from 'react'
import { Timestamp } from 'firebase/firestore'
import MECard from './MECard'
import { ClassesContext, UsersContext } from '../contexts'
import { Log } from '../types'
import { textStyles } from '../constants/Styles'
import moment from 'moment'
import StatusIcon from './StatusIcon'
import { useNavigation } from '@react-navigation/native'

export default function StudentDetailsLogCard({
  log,
  showClass = true,
  showSchedule = false,
  onPress
}: {
  log: Log,
  showClass?: boolean,
  showSchedule?: boolean,
  onPress?: Function
}) {
  const {
    id: logId,
    classId,
    schedule: {
      start, end
    },
    scheduleId,
    time,
    status
  } = log;
  const { classes } = useContext(ClassesContext);
  const classroom = classes?.find((c) => c.id === classId);
  const navigation = useNavigation();

  return (
    <MECard 
      style={{ 
        marginBottom: 16
      }}
      onPress={onPress}
    >
      <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
        <Text style={[textStyles.body2, { fontFamily: 'manrope-bold', marginBottom: 8 }]}>{moment(time.toDate()).format("LL")}</Text>
        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
          <Text style={[textStyles.body3, { marginRight: 8 }]}>{moment(time.toDate()).format("HH:mm")}</Text>
          <StatusIcon status={status}/>
        </View>
      </View>
      <Text style={[textStyles.body3]}>
        { showClass ? classroom?.name : "" }
        { showClass && showSchedule ? " • " : ""}
        { showSchedule ? `${moment(start.toDate()).format("HH:mm")} - ${moment(end.toDate()).format("HH:mm")}` : ""}
      </Text>
    </MECard>
  )
}