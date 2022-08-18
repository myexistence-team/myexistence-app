import { View, Text } from 'react-native'
import React from 'react'
import { textStyles } from '../../constants/Styles'
import scheduleMocks from '../../mocks/scheduleMocks';
import MECard from '../../components/MECard';
import { FontAwesome5 } from '@expo/vector-icons';
import moment from 'moment';
import Colors from '../../constants/Colors';
import MEButton from '../../components/MEButton';
import ScheduleCard from '../../components/ScheduleCard';
import { useNavigation } from '@react-navigation/native';

export default function NextSchedules() {
  const navigation = useNavigation();
  const schedules = scheduleMocks;

  return (
    <View>{}
      <Text 
        style={[
          textStyles.heading3,
          {
            marginBottom: 16
          }
        ]}
      >
        Berikutnya
      </Text>
      {
        schedules.map((s, idx) => (
          <ScheduleCard schedule={s} key={idx}/>
        ))
      }
      <MEButton
        variant='outline'
        onPress={() => {
          navigation.navigate('SchedulePage')
        }}
      >
        Tampilkan Lebih Banyak
      </MEButton>
    </View>
  )
}