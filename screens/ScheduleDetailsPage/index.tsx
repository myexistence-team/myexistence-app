import { View, Text } from 'react-native'
import React from 'react'
import MEContainer from '../../components/MEContainer'
import MEHeader from '../../components/MEHeader'
import { ScheduleParamList, ScheduleScreenProps } from '../../types'
import scheduleMocks from '../../mocks/scheduleMocks'
import { textStyles } from '../../constants/Styles'
import moment from 'moment'

export default function ScheduleDetailsPage({ route }: ScheduleScreenProps) {
  const { scheduleId } = route.params;
  const schedule = scheduleMocks.find((s) => s.id === scheduleId);
  return (
    <MEContainer>
      <MEHeader
        title='Detail Jadwal'
      />
      <Text style={textStyles.body2}>Judul</Text>
      <Text style={[textStyles.body1, { marginBottom: 16 }]}>
        {schedule?.name}
      </Text>

      <Text style={textStyles.body2}>Lokasi</Text>
      <Text style={[textStyles.body1, { marginBottom: 16 }]}>
        {schedule?.location}
      </Text>

      <Text style={textStyles.body2}>Jam Mulai</Text>
      <Text style={[textStyles.body1, { marginBottom: 16 }]}>
        {moment(schedule?.startTime).format("HH:mm")}
      </Text>

      <Text style={textStyles.body2}>Jam Selesai</Text>
      <Text style={[textStyles.body1, { marginBottom: 16 }]}>
        {moment(schedule?.endTime).format("HH:mm")}
      </Text>
    </MEContainer>
  )
}