import { Text, View } from 'react-native'
import React, { Component, useState } from 'react'
import { ScreenContainer } from 'react-native-screens'
import MEContainer from '../../components/MEContainer'
import { textStyles } from '../../constants/Styles'
import MECard from '../../components/MECard'
import scheduleMocks from '../../mocks/scheduleMocks'
import Colors from '../../constants/Colors'
import moment from 'moment'
import { FontAwesome5 } from '@expo/vector-icons'
import NextSchedules from './NextSchedules'
import METextField from '../../components/METextInput'
import { RootTabScreenProps } from '../../navTypes'

export default function HomePage(props: RootTabScreenProps<"Home">) {

  const {
    navigation
  } = props;
  const schedules = scheduleMocks;

  const [value, setValue] = useState('');

  return (
    <MEContainer>
      <NextSchedules/>
    </MEContainer>
  )
}
