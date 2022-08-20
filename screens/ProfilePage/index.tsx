import { View, Text } from 'react-native'
import React, { useContext } from 'react'
import MEContainer from '../../components/MEContainer'
import { UserContext } from '../../contexts';

export default function ProfilePage() {
  const { user, profile } = useContext(UserContext);
  console.log(user);

  return (
    <MEContainer>
      <Text>ProfilePage</Text>
    </MEContainer>
  )
}