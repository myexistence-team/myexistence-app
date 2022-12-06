import { View, Text } from 'react-native'
import React from 'react'
import SvgQRCode from 'react-native-qrcode-svg';
import { textStyles } from '../../constants/Styles';
import MEPressableText from '../../components/MEPressableText';
import { useNavigation } from '@react-navigation/native';
import { Schedule } from '../../types';
import MEButton from '../../components/MEButton';

export default function ScheduleOpenQRCode({
  qrCode, scheduleId, classId, absentCount = 0, studentCount = 0
} : {
  qrCode: any,
  scheduleId: string,
  classId: string,
  absentCount: number,
  studentCount: number,
}) {
  const navigation = useNavigation();
  return (
    <>
      {
        qrCode ? (
          <View style={{ alignItems: 'center', padding: 24,  }}>
            <SvgQRCode
              value={qrCode.id}
              size={240}
            />
            <Text style={[textStyles.body3, { textAlign: 'center', marginTop: 8 }]}>Berikan QR Code kepada pelajar untuk mereka pindai</Text>
          </View>
        ) : null
      }
      {/* {
        studentCount > 0 && absentCount > 0 && (
          <MEButton
            onPress={() => {
              navigation.navigate('Root', {
                screen: 'SchedulesPage',
                params: {
                  screen: 'SchedulePresences',
                  params: {
                    scheduleId,
                    classId
                  },  
                  initial: false
                }
              })
            }}
            variant='outline'
          >
            {`Lihat Pelajar (${studentCount - absentCount}/${studentCount})`}
          </MEButton>
        )
      } */}
    </>
  )
}