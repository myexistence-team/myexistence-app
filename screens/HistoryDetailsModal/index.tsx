import { View, Text, Modal, Image, Alert, ScrollView } from 'react-native'
import React, { useContext, useState } from 'react'
import { Log } from '../../types'
import MEPressableText from '../../components/MEPressableText'
import { useNavigation } from '@react-navigation/native'
import { ClassesContext, ProfileContext, UsersContext } from '../../contexts'
import { textStyles } from '../../constants/Styles'
import { AbsentStasuses, DAYS_ARRAY, ExcuseStatuses, ProfileRoles } from '../../constants/constants'
import { ExcuseStatusesEnum, ExcuseTypeEnum, PresenceStatusEnum } from '../../enums'
import { getStatusColor } from '../../utils/utilFunctions'
import moment from 'moment'
import { deleteStudentExcuse } from '../../actions/scheduleActions'
import MEButton from '../../components/MEButton'

export default function HistoryDetailsModal({
  log,
  setSelectedLogId,
  isStudentLog=false,
}: {
  log?: Log,
  setSelectedLogId: Function,
  isStudentLog?: boolean,
}) {
  const navigation = useNavigation();
  const { profile } = useContext(ProfileContext);
  const { classes } = useContext(ClassesContext);
  const { users } = useContext(UsersContext);
  const classroom = classes.find((c) => c.id === log?.classId);

  const teacher = users?.[log?.teacherId];
  const student = users?.[log?.studentId];

  const [isCancelling, setIsCancelling] = useState(false);
  function handleCancelExcuse() {
    if (log && log.excuse) {
      Alert.alert(
        "Batalkan Perizinan", 
        "Apakah Anda yakin ingin membatalkan permintaan izin?", 
        [
          {
            style:'cancel',
            text: 'Batal'
          },
          {
            style: 'destructive',
            text: 'Ya',
            onPress: () => {
              setIsCancelling(true);
              deleteStudentExcuse({
                classId: log.classId,
                scheduleId: log.scheduleId,
                schoolId: profile.schoolId,
                studentLogId: log.id
              })
                .then(() => {
                  setSelectedLogId(null);
                })
                .finally(() => {
                  setIsCancelling(false);
                })
            }
          },
        ]
      );
    }
  }

  return (
    <Modal
      animationType='slide'
      presentationStyle='pageSheet'
      onRequestClose={() => {
        setSelectedLogId(null)
      }}
      onDismiss={() => {
        setSelectedLogId(null)
      }}
      visible={Boolean(log)}
    >
      <View style={{ padding: 32 }}>
        {
          log && (
            <ScrollView>
              <MEPressableText 
                style={[{
                  fontFamily: 'manrope-bold', 
                  marginBottom: 4, 
                  fontSize: 30
                }]}
                onPress={() => {
                  navigation.navigate('Root', {
                    screen: 'ClassPage',
                    params: {
                      screen: 'ClassDetails',
                      params: {
                        classId: log.classId
                      },
                      initial: false
                    }
                  });
                  setSelectedLogId(null);
                }}
              >
                {classroom?.name}
              </MEPressableText>
              <Text style={[textStyles.body1, {marginBottom: 32}]}>{classroom?.description}</Text>

              <Text style={[textStyles.heading4, { marginBottom: 16 }]}>Sesi Kelas</Text>

              <View style={{ flexDirection: 'row' }}>
                <View style={{ flex: 1 }}>
                  <Text style={textStyles.body2}>Hari</Text>
                  <Text style={[textStyles.body1, { fontFamily: 'manrope-bold', marginBottom: 16 }]}>
                    {DAYS_ARRAY[log.schedule.start.toDate().getDay()]}
                  </Text>
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={textStyles.body2}>Jam</Text>
                  <Text style={[textStyles.body1, { fontFamily: 'manrope-bold', marginBottom: 16 }]}>
                    {moment(log.schedule.start.toDate()).format("HH:mm")} - {moment(log.schedule.end.toDate()).format("HH:mm")}
                  </Text>
                </View>
              </View>

              <Text style={textStyles.body2}>Toleransi</Text>
              <Text style={[textStyles.body1, { fontFamily: 'manrope-bold', marginBottom: 16 }]}>
                {log.schedule.tolerance} Menit
              </Text>

              {
                log.schedule.openedAt && log.teacherId && (
                  <>
                    <Text style={textStyles.body2}>Pengajar</Text>
                    <Text style={[textStyles.body1, { fontFamily: 'manrope-bold', marginBottom: 16 }]}>
                      {teacher?.displayName}
                    </Text>
                    <View style={{ flexDirection: 'row' }}>
                      <View style={{ flex: 1 }}>
                        <Text style={textStyles.body2}>Tanggal Dibuka</Text>
                        <Text style={[textStyles.body1, { fontFamily: 'manrope-bold', marginBottom: 16 }]}>
                          {moment(log.schedule.openedAt.toDate()).format("LL HH:mm")}
                        </Text>
                      </View>
                    </View> 
                  </>
                )
              }

              <Text style={[textStyles.heading4, { marginBottom: 16, marginTop: 24 }]}>Kehadiran</Text>
              <View style={{ flexDirection: 'row' }}>
                <View style={{ flex: 1 }}>
                  <Text style={textStyles.body2}>Status</Text>
                  <Text style={[textStyles.body1, { 
                    fontFamily: 'manrope-bold', 
                    marginBottom: 16,
                    color: getStatusColor(log.status)
                  }]}>
                    {PresenceStatusEnum[log.status]}
                  </Text>
                </View>
                {
                  (log.status === AbsentStasuses.PRESENT || log.status === AbsentStasuses.LATE) && (
                    <View style={{ flex: 1 }}>
                      <Text style={textStyles.body2}>Jam Kehadiran</Text>
                      <Text style={[textStyles.body1, { fontFamily: 'manrope-bold', marginBottom: 16 }]}>
                        {moment(log.time.toDate()).format("HH:mm")}
                      </Text>
                    </View>
                  )
                }
              </View>
              {
                log.status === AbsentStasuses.EXCUSED && log.excuse && (
                  <View style={{ flex: 1 }}>
                    <Text style={textStyles.body2}>Tipe Perizinan</Text>
                    <Text style={[textStyles.body1, { 
                      fontFamily: 'manrope-bold', 
                      marginBottom: 16,
                    }]}>
                      {ExcuseTypeEnum[log.excuse.type]}
                    </Text>

                    <Text style={textStyles.body2}>Pesan</Text>
                    <Text style={[textStyles.body1, { 
                      fontFamily: 'manrope-bold', 
                      marginBottom: 16,
                    }]}>
                      {log.excuse.message}
                    </Text>

                    <Text style={textStyles.body2}>Bukti</Text>
                    <Image
                      source={{
                        uri: log.excuse.proofUrl
                      }}
                      style={{
                        width: '100%',
                        height: 400,
                        marginTop: 8,
                        marginBottom: 16
                      }}
                    />

                    <Text style={textStyles.body2}>Status Perizinan</Text>
                    <Text style={[textStyles.body1, { 
                      fontFamily: 'manrope-bold', 
                      marginBottom: 16,
                    }]}>
                      {ExcuseStatusesEnum[log.excuseStatus]}
                    </Text>

                    {
                      profile.role === ProfileRoles.STUDENT && log.excuseStatus === ExcuseStatuses.WAITING && isStudentLog === true &&(
                        <MEButton
                          color='danger'
                          variant='outline'
                          onPress={handleCancelExcuse}
                          isLoading={isCancelling}
                        >
                          Batalkan Permintaan Izin
                        </MEButton>
                      )
                    }
                  </View>
                )
              }
            </ScrollView>
          )
        }
      </View>
    </Modal>
  )
}