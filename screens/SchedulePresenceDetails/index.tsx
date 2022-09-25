import { View, Text, Image } from 'react-native'
import React, { useEffect, useState } from 'react'
import { NativeStackScreenProps } from '@react-navigation/native-stack'
import { ScheduleParamList } from '../../navTypes'
import MEContainer from '../../components/MEContainer';
import MEHeader from '../../components/MEHeader';
import { textStyles } from '../../constants/Styles';
import moment from 'moment';
import { getStatusColor } from '../../utils/utilFunctions';
import { PresenceStatusEnum } from '../../enums';
import { AbsentStasuses } from '../../constants/constants';
import MEButton from '../../components/MEButton';

export default function SchedulePresenceDetails({
  route: {
    params: {
      logId,
      isStudentLog,
      presence: presenceProp
    }
  }
}: NativeStackScreenProps<ScheduleParamList, "SchedulePresenceDetails">) {
  const [presence, setPresence] = useState<any>(presenceProp)
  const {
    className,
    end,
    start,
    status,
    studentName,
    time,
    excuse
  } = presence;

  const [isLoading, setIsLoading] = useState(false);
  function loadData() {
    setIsLoading(true);
    setIsLoading(false);
  }

  useEffect(() => {
    if (!presence) {
      loadData();
    }
  }, [presence])

  return (
    <MEContainer>
      <MEHeader
        title='Detail Kehadiran'
      />
      <Text style={textStyles.body2}>Nama</Text>
      <Text style={[textStyles.body1, { fontFamily: 'manrope-bold', marginBottom: 16 }]}>
        {studentName}
      </Text>
      <Text style={textStyles.body2}>Kelas</Text>
      <Text style={[textStyles.body1, { fontFamily: 'manrope-bold', marginBottom: 16 }]}>
        {className}
      </Text>
      <View style={{ flexDirection: 'row' }}>
        <View style={{ flex: 1 }}>
          <Text style={textStyles.body2}>Jam Mulai</Text>
          <Text style={[textStyles.body1, { fontFamily: 'manrope-bold', marginBottom: 16 }]}>
            {moment(start.toDate()).format("HH:mm")}
          </Text>
        </View>
        <View style={{ flex: 1 }}>
          <Text style={textStyles.body2}>Jam Selesai</Text>
          <Text style={[textStyles.body1, { fontFamily: 'manrope-bold', marginBottom: 16 }]}>
            {moment(end.toDate()).format("HH:mm")}
          </Text>
        </View>
      </View>
      <View style={{ flexDirection: 'row' }}>
        <View style={{ flex: 1 }}>
          <Text style={textStyles.body2}>Jam Mulai</Text>
          <Text style={[textStyles.body1, { fontFamily: 'manrope-bold', marginBottom: 16, color: getStatusColor(status) }]}>
            {PresenceStatusEnum[status]}
          </Text>
        </View>
        <View style={{ flex: 1 }}>
          <Text style={textStyles.body2}>Jam Kehadiran</Text>
          <Text style={[textStyles.body1, { fontFamily: 'manrope-bold', marginBottom: 16 }]}>
            {moment(time.toDate()).format("HH:mm")}
          </Text>
        </View>
      </View>
      {
        status === AbsentStasuses.EXCUSED && excuse && (
          <>
            <Text style={textStyles.body2}>Alasan Izin</Text>
            <Text style={[textStyles.body1, { fontFamily: 'manrope-bold', marginBottom: 16 }]}>
              {excuse.message}
            </Text>
            <Text style={textStyles.body2}>Bukti Izin</Text>
            <Image
              source={{
                uri: excuse.proofUrl
              }}
              style={{
                width: '100%',
                height: 400,
                marginTop: 8
              }}
            />
            <View style={{ flexDirection: 'row', marginTop: 16 }}>
              <View style={{ flex: 1, marginRight: 16 }}>
                <MEButton variant='outline' color='danger'>
                  Tolak
                </MEButton>
              </View>
              <View style={{ flex: 1 }}>
                <MEButton>
                  Terima
                </MEButton>
              </View>
            </View>
          </>
        )
      }
    </MEContainer>
  )
}