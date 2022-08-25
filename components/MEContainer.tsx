import { View, Text, StyleSheet, StatusBar, ScrollView, RefreshControl } from 'react-native'
import React from 'react'
import { ViewProps } from './Themed';

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 24,
    paddingTop: (StatusBar.currentHeight !== undefined ? StatusBar.currentHeight : 0) + 64,
    paddingBottom: 16,
  }
})

export default function MEContainer(props: ViewProps & {
  onRefresh?: () => void,
  refreshing?: boolean
}) {
  const { children, style, onRefresh, refreshing, ...rest } = props;
  return (
    <ScrollView 
      style={{
        flex: 1
      }}
      contentContainerStyle={[styles.container, style]}
      refreshControl={
        onRefresh && refreshing !== undefined ? (
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
          />
        ) : undefined
      }
      { ...rest }
    >
      {children}
    </ScrollView>
  )
}