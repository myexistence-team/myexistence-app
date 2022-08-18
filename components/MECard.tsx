import { View, StyleSheet } from 'react-native'
import React from 'react'
import { ViewProps } from './Themed';

const styles = StyleSheet.create({
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
    backgroundColor: "#fff",
  }
})

export default function MECard(props: ViewProps) {
  const { children, style, ...rest } = props;

  return (
    <View style={[styles.card, style]} {...rest}>
      {children}
    </View>
  )
}