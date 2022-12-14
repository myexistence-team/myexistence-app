import { StyleSheet, Pressable, PressableProps, ViewStyle, Text, TextStyle, View, ActivityIndicator, Platform } from 'react-native'
import React from 'react'
import Colors from '../constants/Colors';
import { textStyles } from '../constants/Styles';
import { FontAwesome5 } from '@expo/vector-icons';

function getColorHex(color: string) {
  switch (color) {
    case 'primary':
      return Colors.light.blue;
    case 'secondary':
      return Colors.light.yellows.yellow3;
    case 'danger':
      return Colors.light.red;
    case 'success':
      return Colors.light.green;
    case 'disabled':
      return Colors.light.grey;
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
      return Platform.OS === 'android' ? 28 : 33
    case 'sm':
      return Platform.OS === 'android' ? 17 : 19.5
    default:
      return Platform.OS === 'android' ? 21 : 24.5
  }
}

function getButtonStyleBySize(size: string) {
  switch (size) {
    case 'lg':
      return {
        paddingHorizontal: 8,
        paddingVertical: 8,
      }
    case 'sm':
      return {
        paddingHorizontal: 8,
        paddingVertical: 8,
      }
    default:
      return {
        paddingHorizontal: 8,
        paddingVertical: 8,
      }
  }
}

const getButtonStyles = (size: string, color: string, fullWidth: boolean) => StyleSheet.create({
  contained: {
    backgroundColor: getColorHex(color),
    color: color === 'white' ? Colors.light.tint : '#fff',
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    width: fullWidth ? '100%' : undefined,
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
    width: fullWidth ? '100%' : undefined,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: getColorHex(color),
    borderRadius: 8,
    ...getButtonStyleBySize(size),
  },
  ghost: {
    width: fullWidth ? '100%' : undefined,
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
  color?: 'primary' | 'secondary' | 'danger' | 'success' | 'white' | string,
  fullWidth?: boolean,
  style?: ViewStyle,
  textStyle?: TextStyle,
  iconStart?: string,
  children?: string,
  isLoading?: boolean
}) {
  var {
    variant = 'contained',
    color = 'primary',
    size = 'md',
    style,
    children,
    textStyle,
    isLoading,
    iconStart,
    disabled,
    fullWidth = true,
    ...rest
  } = props;

  if (disabled !== undefined && disabled) {
    color = 'disabled';
  }

  return (
    <View
      style={{
        borderRadius: 8,
        overflow: 'hidden',
        width: fullWidth ? '100%' : undefined
      }}
    >
      <Pressable 
        style={({ pressed }) => ([
          getButtonStyles(size, color, fullWidth)[variant], 
          pressed ? {
            opacity: 0.75,
            transform: [{ scale: 0.99 }]
          } : {},
          style,
        ])}
        disabled={disabled || isLoading}
        android_ripple={{
          color: 'white'
        }}
        {...rest} 
      >
        {
          isLoading ? (
            <ActivityIndicator
              color={getButtonStyles(size, color, fullWidth)[variant].color}
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
              {
                iconStart ? (
                  <View
                    style={{
                      marginRight: 8,
                    }}
                  >
                    <FontAwesome5
                      name={iconStart}
                      size={18}
                      color={getButtonStyles(size, color, fullWidth)[variant].color}
                    />
                  </View>
                ) : null
              }
              <Text 
                style={[
                  getTextStyleBySize(size), 
                  { 
                    color: getButtonStyles(size, color, fullWidth)[variant].color,
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
    </View>
  )
}