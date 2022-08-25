import { View, Text, StyleSheet, StatusBar, ScrollView } from 'react-native'
import React from 'react'
import { ViewProps } from './Themed';

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 24,
    paddingTop: (StatusBar.currentHeight !== undefined ? StatusBar.currentHeight : 0) + 64,
    paddingBottom: 16,
  }
})

export default function MEContainer(props: ViewProps) {
  const { children, style, ...rest } = props;
  return (
    <ScrollView style={[styles.container, style]} { ...rest }>
      <View
        style={{
          paddingBottom: 64
        }}
      >
        {children}
      </View>
    </ScrollView>
  )
}