import { View, Text, TextProps, PressableProps, Pressable } from 'react-native'
import React from 'react'
import Colors from '../constants/Colors'

export default function MEPressableText({
  style,
  onPress,
  children
}: TextProps) {
  return (
    <Pressable
      onPress={onPress}
    >
      <Text
        style={[
          {
            color: Colors.light.blue
          }, style
        ]}
      >
        {children}
      </Text>
    </Pressable>
  )
}