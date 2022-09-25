import { View, StyleSheet, Platform, Pressable } from 'react-native'
import React from 'react'
import { ViewProps } from './Themed';

export const cardStyle = StyleSheet.create({
  card: {
    borderRadius: 16,
    shadowRadius: 8,
    shadowOffset: {
      width: 0,
      height: 8
    },
    shadowColor: "#000",
    shadowOpacity: 0.1,
    padding: 16,
    // marginHorizontal: Platform.OS === 'android'? 8 : 0,
    elevation: 7,
    backgroundColor: 'white',
  }
})

export default function MECard(props: ViewProps & { onPress?: Function }) {
  const { onPress, style, ...rest } = props;
  console.log(onPress)

  if (onPress) {
    return (
      <Pressable 
        onPress={() => onPress()} 
        style={({ pressed }) => ([
          cardStyle.card, 
          {
            opacity: pressed ? 0.75 : 1
          },
          style
        ])} 
        {...rest}
      />
    );
  } else {
    return (
      <View style={[cardStyle.card, style]} {...rest}/>
    );
  }
}