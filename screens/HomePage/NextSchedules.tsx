import { View, Text } from 'react-native'
import React from 'react'
import { textStyles } from '../../constants/Styles'
import MEButton from '../../components/MEButton';
import ScheduleCard from '../../components/ScheduleCard';
import { useNavigation } from '@react-navigation/native';
import { Schedule } from '../../types';
import MESpinner from '../../components/MESpinner';
import Colors from '../../constants/Colors';

export default function NextSchedules({
  schedules,
}: {
  schedules: Schedule[],
}) {
  const navigation = useNavigation();

  return (
    <View
      style={{
        paddingBottom: 64
      }}
    >
      <Text 
        style={[textStyles.heading3, { marginBottom: 16 }]}
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
          navigation.navigate('Root', {
            screen: "SchedulesPage", 
            params: {
              screen: "Schedules"
            }
          })
        }}
      >
        Tampilkan Lebih Banyak
      </MEButton>
    </View>
  )
}