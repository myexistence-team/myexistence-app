import { View, Text, Pressable } from 'react-native'
import React from 'react'
import { AndroidNativeProps, DateTimePickerAndroid } from '@react-native-community/datetimepicker';
import { textStyles } from '../constants/Styles';
import moment from 'moment';

export default function MEAndroidDateTimePicker(pickerProp: AndroidNativeProps) {
  function handleOpenPicker() {
    DateTimePickerAndroid.open(pickerProp);
  }

  return (
    <Pressable
      onPress={handleOpenPicker}
      style={{
        borderBottomWidth: 1,
        paddingVertical: 4,
        marginBottom: 4
      }}
    >
      <Text
        style={textStyles.body1}
      >
        {moment(pickerProp.value).format("LL")}
      </Text>
    </Pressable>
  )
}