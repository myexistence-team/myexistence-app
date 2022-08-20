import { View, Text, Pressable } from 'react-native'
import React from 'react'
import { useNavigation } from '@react-navigation/native'
import { FontAwesome5 } from '@expo/vector-icons';
import { textStyles } from '../constants/Styles';

export default function MEHeader({
  title
}: {
  title: string
}) {
  const navigation = useNavigation();
  return (
    <View
      style={{
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 24
      }}
    >
      {navigation.canGoBack() && (
        <Pressable
          style={{
            marginRight: 16
          }}
          onPress={() => navigation.goBack()}
        >
          <FontAwesome5 name='chevron-left' size={18}/>
        </Pressable>
      )}
      <Text style={[textStyles.heading3]}>{title}</Text>
    </View>
  )
}