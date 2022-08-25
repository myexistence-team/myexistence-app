import { View, Text } from 'react-native'
import React, { useState } from 'react'
import DropDownPicker, { DropDownPickerProps } from 'react-native-dropdown-picker';
import Colors from '../constants/Colors';
import { textStyles } from '../constants/Styles';

export default function MESelect(props: DropDownPickerProps<any>) {
  return (
    <DropDownPicker
      { ...props }
      searchable
      theme="LIGHT"
    />
  )
}