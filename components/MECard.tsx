import { View, StyleSheet, Platform } from 'react-native'
import React from 'react'
import { ViewProps } from './Themed';

export const cardStyle = StyleSheet.create({
  card: {
    borderRadius: 16,
    shadowRadius: 8,
    shadowOffset: {
      width: 0,
      height: 8
    },
    shadowColor: "#000",
    shadowOpacity: 0.1,
    padding: 16,
    // marginHorizontal: Platform.OS === 'android'? 8 : 0,
    elevation: 7,
    backgroundColor: 'white',
  }
})

export default function MECard(props: ViewProps) {
  const { children, style, ...rest } = props;

  return (
    <View style={[cardStyle.card, style]} {...rest}>
      {children}
    </View>
  )
}