import { View, Text, StyleSheet, StatusBar, ScrollView } from 'react-native'
import React from 'react'
import { ViewProps } from './Themed';
import { SafeAreaView } from 'react-native-safe-area-context';

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 24,
    paddingTop: (StatusBar.currentHeight !== undefined ? StatusBar.currentHeight : 0) + 64,
  }
})

export default function MEContainer(props: ViewProps) {
  const { children, style, ...rest } = props;
  return (
    <ScrollView style={[styles.container, style]} { ...rest }>
      {children}
    </ScrollView>
  )
}