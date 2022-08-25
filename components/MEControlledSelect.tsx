import { View, Text, ActivityIndicator } from 'react-native'
import React, { useState } from 'react'
import { Picker, PickerIOS } from '@react-native-picker/picker'
import DropDownPicker, { DropDownPickerProps, ItemType } from 'react-native-dropdown-picker'
import { Controller } from 'react-hook-form'
import MESelect from './MESelect'
import { capitalCase } from 'change-case'
import { textStyles } from '../constants/Styles'
import Colors from '../constants/Colors'

export type MEControlledSelectProps =  {
  options?: ItemType<string | number>[],
  control: any,
  key?: any,
  name: string,
  defaultValue?: string | number,
  label?: string | boolean,
  helperText?: string,
  isLoading?: boolean,
  multiple?: boolean
}

export default function MEControlledSelect({
  options = [],
  control,
  name,
  isLoading,
  defaultValue,
  label,
  helperText,
  multiple,
  ...rest
}: MEControlledSelectProps) {
  const [open, setOpen] = useState(false);
  const [_val, setVal] = useState(null);
  
  return (
    <View
      style={{
        marginBottom: 16
      }}
    >
      <Controller
        // key={key}
        control={control}
        name={name}
        defaultValue={defaultValue}
        render={(controlProps) => {
          const { 
            field: {
              onChange, value, name, ref, onBlur
            }, 
            fieldState: {
              error
            }, 
            formState
          } = controlProps;

          return (
            <>
              {
                typeof label === 'string' && (label || name) ? (
                  <Text 
                    style={[
                      textStyles.body1,
                      { marginBottom: 8 }
                    ]}
                  >
                    {label || capitalCase(name)}
                  </Text>
                ) : null
              }
              {
                isLoading ? (
                  <ActivityIndicator/>
                ) : (
                  <MESelect
                    {...rest}
                    items={options}
                    open={open}
                    setOpen={setOpen}
                    setValue={setVal}
                    multiple={false}
                    value={value}
                    onSelectItem={({value}) => onChange(value)}
                  />
                )
              }
              {
                error && (
                  <Text 
                    style={[
                      textStyles.body2,
                      {
                        color: Colors.light.red
                      }
                    ]}
                  >
                    {error.message}
                  </Text>
                )
              }
              {
                helperText && (
                  <Text style={[textStyles.body2]}>
                    {helperText}
                  </Text>
                )
              }
            </>
          )
        }}
      />
    </View>
  )
}