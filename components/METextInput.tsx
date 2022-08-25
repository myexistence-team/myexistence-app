import { View, Text, TextInput, StyleSheet, TextInputProps } from 'react-native'
import React from 'react'
import { textStyles } from '../constants/Styles';
import Colors from '../constants/Colors';
import { capitalCase } from 'change-case';
import { FieldError } from 'react-hook-form';

const styles = (error: boolean) => StyleSheet.create({
  input: {
    borderBottomColor: error ? Colors.light.red : Colors.light.text,
    borderBottomWidth: 1,
    paddingVertical: 4,
    fontSize: 18,
    marginBottom: 4
  }
})

export default function METextInput(props: {
  label?: string | boolean,
  helperText?: string,
  name?: string,
  error?: FieldError,
 } & TextInputProps) {
  const {
    label,
    helperText,
    name,
    error,
    ...rest
  } = props;

  return (
    <View
      style={{
        marginBottom: 16
      }}
    >
      {
        typeof label === 'string' && (label || name) ? (
          <Text 
            style={[
              textStyles.body1,
            ]}
          >
            {label || capitalCase(name || '')}
          </Text>
        ) : null
      }
      <TextInput style={[styles(Boolean(error)).input]} {...rest}/>
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
    </View>
  )
}