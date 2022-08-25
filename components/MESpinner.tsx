import { View, Text, ActivityIndicator, ViewProps } from 'react-native'
import React from 'react'
import Colors from '../constants/Colors'
import { textStyles } from '../constants/Styles'

export default function MESpinner({
  style,
  activityIndicatorColor,
  activityIndicatorSize,
  ...rest
}: ViewProps & {
  activityIndicatorColor?: string,
  activityIndicatorSize?: number | 'small' | 'large',
}) {
  return (
    <View
      style={{
        justifyContent: 'center',
        alignItems: 'center',
        height: 240
      }}
    >
      <ActivityIndicator
        size={activityIndicatorSize || 'large'}
        color={activityIndicatorColor || Colors.light.tint}
      />
      <Text style={[textStyles.body2, { marginTop: 16 }]}>
        Sedang Memuat...
      </Text>
    </View>
  )
}