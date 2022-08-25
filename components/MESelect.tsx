import { View, Text } from 'react-native'
import React, { useState } from 'react'
import DropDownPicker, { DropDownPickerProps } from 'react-native-dropdown-picker';
import Colors from '../constants/Colors';
import { textStyles } from '../constants/Styles';

export default function MESelect(props: DropDownPickerProps<any>) {
  return (
    <DropDownPicker
      { ...props }
      language='ID'
      listMode='MODAL'
      searchable
      theme="LIGHT"
      disableBorderRadius={true}
      style={{
        borderWidth: 0,
        borderBottomWidth: 1,
        borderRadius: 0,
        borderTopColor: 'none',
        paddingHorizontal: 0
      }}
      showTickIcon={false}
      containerStyle={{
        backgroundColor: 'white',
        borderColor: Colors.light.blues.blue1,
      }}
      modalContentContainerStyle={{
        margin: 24
      }}
      selectedItemContainerStyle={{
        backgroundColor: Colors.light.blues.blue1,
        borderRadius: 8
      }}
      selectedItemLabelStyle={{
        color: 'white'
      }}
    />
  )
}