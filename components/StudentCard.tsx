import { View, Text } from 'react-native'
import React from 'react'
import MECard from './MECard'
import { textStyles } from '../constants/Styles'
import StatusIcon from './StatusIcon'

export default function StudentCard({
  student,
  status
}: {
  student: {
    displayName: string
  },
  status?: string
}) {
  return (
    <MECard
      style={{
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 16
      }}
    >
      <Text style={[textStyles.body1, { fontFamily: 'manrope-bold' }]}>{student.displayName}</Text>
      {
        status && (
          <StatusIcon status={status}/>
        )
      }
    </MECard>
  )
}