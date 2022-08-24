import { StyleSheet, Pressable, PressableProps, ViewStyle, Text, TextStyle, View, ActivityIndicator } from 'react-native'
import React from 'react'
import Colors from '../constants/Colors';
import { textStyles } from '../constants/Styles';
import { FontAwesome5 } from '@expo/vector-icons';

function getColorHex(color: string) {
  switch (color) {
    case 'primary':
      return Colors.light.blue;
    case 'secondary':
      return Colors.light.yellow;
    case 'danger':
      return Colors.light.red;
    case 'success':
      return Colors.light.blue;
    default:
      return color;
  }
}

function getTextStyleBySize(size: string) {
  switch (size) {
    case 'lg':
      return textStyles.buttonLg
    case 'sm':
      return textStyles.buttonSm
    default:
      return textStyles.buttonMd
  }
}

function getSpinnerSize(size: string) {
  switch (size) {
    case 'lg':
      return 33
    case 'sm':
      return 19
    default:
      return 25
  }
}

function getButtonStyleBySize(size: string) {
  switch (size) {
    case 'lg':
      return {
        paddingHorizontal: 24,
        paddingVertical: 8,
      }
    case 'sm':
      return {
        paddingHorizontal: 16,
        paddingVertical: 8,
      }
    default:
      return {
        paddingHorizontal: 20,
        paddingVertical: 8,
      }
  }
}

const getButtonStyles = (size: string, color: string) => StyleSheet.create({
  contained: {
    backgroundColor: getColorHex(color),
    color: '#fff',
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    width: '100%',
    borderRadius: 8,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4
    },
    shadowRadius: 8,
    shadowOpacity: 0.1,
    ...getButtonStyleBySize(size),
  },
  outline: {
    color: getColorHex(color),
    width: '100%',
    backgroundColor: '#fff',
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: getColorHex(color),
    borderRadius: 8,
    ...getButtonStyleBySize(size),
  },
  ghost: {
    width: '100%',
    color: getColorHex(color),
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    ...getButtonStyleBySize(size),
  },
  text: getTextStyleBySize(size)
})

export default function MEButton(props: PressableProps & {
  variant?: 'contained' | 'outline' | 'ghost',
  size?: 'sm' | 'md' | 'lg',
  color?: 'primary' | 'secondary' | 'danger' | 'success' | string,
  style?: ViewStyle,
  textStyle?: TextStyle,
  iconStart?: string,
  children?: string,
  isLoading?: boolean
}) {
  const {
    variant = 'contained',
    color = 'primary',
    size = 'md',
    style,
    children,
    textStyle,
    isLoading,
    iconStart,
    ...rest
  } = props;

  return (
    <Pressable 
      style={({ pressed }) => ([
        getButtonStyles(size, color)[variant], 
        pressed ? {
          opacity: 0.75,
          transform: [{ scale: 0.99 }]
        } : {},
        style,
      ])}
      {...rest} 
    >
      {
        isLoading ? (
          <ActivityIndicator
            color={getButtonStyles(size, color)[variant].color}
            // size={33}
            size={getSpinnerSize(size)}
          />
        ) : (
          <View 
            style={{
              flexDirection: 'row',
              alignItems: 'center',
            }}
          >
            <View
              style={{
                marginRight: 8,
              }}
            >
              <FontAwesome5
                name={iconStart}
                size={18}
                color={getButtonStyles(size, color)[variant].color}
              />
            </View>
            <Text 
              style={[
                getTextStyleBySize(size), 
                { 
                  color: getButtonStyles(size, color)[variant].color,
                  fontWeight: '700', 
                  flexDirection: 'row',
                },
                textStyle
              ]}
            >
              {children}
            </Text>
          </View>
        )
      }
    </Pressable>
  )
}