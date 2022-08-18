import { View, Text, StyleSheet } from 'react-native'
import React from 'react'
import { TextProps } from './Themed';
import { textStyles } from '../constants/Styles';

export default function METext(props: TextProps) {
  const { children, style, ...rest } = props;
  return (
    <Text style={[style]} { ...rest }>
      {children}
    </Text>
  )
}