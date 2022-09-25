import { View, Text, StyleSheet, StatusBar, ScrollView, RefreshControl } from 'react-native'
import React from 'react'
import { ViewProps } from './Themed';
import Colors from '../constants/Colors';

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 24,
    paddingTop: (StatusBar.currentHeight !== undefined ? StatusBar.currentHeight : 0) + 64,
    paddingBottom: 40
  }
})

export default function MEContainer(props: ViewProps & {
  onRefresh?: () => void,
  refreshing?: boolean,
  refreshEnabled?: boolean
}) {
  const { children, style, onRefresh, refreshing, refreshEnabled, ...rest } = props;
  return (
    <ScrollView 
      contentContainerStyle={[styles.container, style]}
      refreshControl={
        onRefresh && refreshing !== undefined ? (
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            progressViewOffset={32}
            colors={[Colors.light.tint]}
            enabled={refreshEnabled}
          />
        ) : undefined
      }
      { ...rest }
    >
      {children}
    </ScrollView>
  )
}