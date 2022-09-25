import { View, Text } from 'react-native'
import React from 'react'
import { AbsentStasuses } from '../constants/constants';
import { getStatusColor } from '../utils/utilFunctions';
import { AntDesign, FontAwesome5 } from '@expo/vector-icons';

export default function StatusIcon({
  status,
  size
}: {
  status: string,
  size?: number
}) {
  const iconProps = {
    size: size || 24,
    color: getStatusColor(status),
  }
  switch (status) {
    case AbsentStasuses.PRESENT:
      return <FontAwesome5 name="check-circle" {...iconProps} />
    case AbsentStasuses.LATE:
      return <FontAwesome5 name="clock" {...iconProps} />
    case AbsentStasuses.EXCUSED:
      return <FontAwesome5 name="hand-paper" {...iconProps} />
    case AbsentStasuses.ABSENT:
      return <AntDesign name="close" {...iconProps} />
    default:
      return null
  }
}