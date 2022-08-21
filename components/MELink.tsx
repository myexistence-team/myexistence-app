import { View, Text, TouchableOpacity } from 'react-native'
import React from 'react'
import { TextProps } from './Themed'
import Colors from '../constants/Colors'

export default function MELink({
  onPress,
  children,
  style
}: TextProps & {
  onPress?: Function
}) {
  return (
    <TouchableOpacity
      onPress={onPress}
    >
      <Text style={[style, {
        color: Colors.light.tint
      }]}>{children}</Text>
    </TouchableOpacity>
  )
}