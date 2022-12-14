import { Text, TextInputProps } from 'react-native'
import { Control, Controller } from 'react-hook-form';
import React from 'react'
import METextInput from './METextInput';

export default function MEControlledTextInput(props: {
  control: any,
  name: string,
  helperText?: string,
  label?: string
} & TextInputProps) {
  const {
    control,
    name,
    helperText,
    label,
    ...rest
  } = props;

  return (
    <Controller
      control={control}
      name={name}
      render={({
          field: {
            onChange,
            onBlur,
            value,
            name,
          },
          fieldState: {
            error
          }
        }) => {
        return (
          <METextInput
            label={label}
            value={value}
            onChangeText={onChange}
            onBlur={onBlur}
            helperText={helperText}
            name={name}
            error={error}
            {...rest}
          />
        )
      }}
    />
  )
}