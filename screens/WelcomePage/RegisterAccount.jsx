import { View, Text } from 'react-native'
import React, { useContext } from 'react'
import { AuthContext } from '../../contexts'

export default function RegisterAccount() {
  const { auth } = useContext(AuthContext);
  console.log(auth)
  return (
    <View>
      <Text>RegisterAccount</Text>
    </View>
  )
}