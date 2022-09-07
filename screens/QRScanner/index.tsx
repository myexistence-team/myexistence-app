import { View, Text, StyleSheet, StatusBar, Platform, Alert } from 'react-native'
import React, { useContext, useEffect, useState } from 'react'
import { RootStackScreenProps } from '../../navTypes'
import MEContainer from '../../components/MEContainer';
import MEHeader from '../../components/MEHeader';
import { BarCodeScanner } from 'expo-barcode-scanner';
import ScheduleCard from '../../components/ScheduleCard';
import { Schedule } from '../../types';
import { textStyles } from '../../constants/Styles';
import MEButton from '../../components/MEButton';
import { useNavigation } from '@react-navigation/native';
import { createPresenceInSchedule } from '../../actions/scheduleActions';
import { AuthContext, SchoolContext } from '../../contexts';
import { FirebaseError } from 'firebase/app';
import MESpinner from '../../components/MESpinner';
import { FontAwesome5 } from '@expo/vector-icons';
import Colors from '../../constants/Colors';

export function QRScanSuccess({
  schedule
}: {
  schedule: Schedule
}) {
  const navigation = useNavigation();
  return (
    <MEContainer
      style={{
        alignItems: 'center',
        justifyContent: 'center'
      }}
    >
      <FontAwesome5
        name='check-circle'
        size={180}
        color={Colors.light.tint}
      />
      <Text style={[textStyles.heading3, { textAlign: 'center', marginVertical: 32 }]}>
        Berhasil hadir!
      </Text>
      <MEButton
        onPress={() => {
          navigation.navigate('Root', {
            screen: 'Home'
          })
        }}
      >
        Kembali ke Home
      </MEButton>
    </MEContainer>
  )
}

export default function QRScanner({ route }: RootStackScreenProps<'Scanner'>) {
  const { scheduleId, schedule } = route.params;
  console.log(schedule);
  const {school} = useContext(SchoolContext);
  const {auth} = useContext(AuthContext);
  const [hasPermission, setHasPermission] = useState<boolean | null>(null);
  const [scanned, setScanned] = useState(false);
  const [scanning, setScanning] = useState(false);
  const [succeed, setSucceed] = useState(true);

  useEffect(() => {
    const getBarCodeScannerPermissions = async () => {
      const { status } = await BarCodeScanner.requestPermissionsAsync();
      setHasPermission(status === 'granted');
    };

    getBarCodeScannerPermissions();
  }, []);

  const handleBarCodeScanned = ({ type, data } : any) => {
    setScanned(true);
    setScanning(true);
    createPresenceInSchedule(
      auth.uid,
      school.id, 
      schedule.classId, 
      scheduleId, 
      data
    ).then(() => {
        setScanning(false);
        setSucceed(true);
      })
      .catch((e: FirebaseError) => {
        console.log("ERROR", e.code)
        Alert.alert(
          'Oops!',
          e.message,
          [
            { 
              text: "OK", 
              onPress: () => {
                setScanned(false)
              } 
            }
          ]
        )
      })
  };

  return (
    <View
      style={{
        flex: succeed? 0 : 1,
      }}
    >
      <MEContainer>
        <MEHeader
          title='Pindai QR Code'
        />
        {
          hasPermission === null ? (
            <Text>Mohon berikan izin menggunakan kamera.</Text>
          ) : hasPermission === false ? (
            <Text>Tidak mendapatkan izin menggunakan kamera.</Text>
          ) : null
        }
      </MEContainer>
      {
        !succeed ? (
          <>
            {
              scanning ? (
                <View
                  style={{
                    flex: 1
                  }}
                >
                  <MESpinner/>
                </View>
              ) : hasPermission === true ? (
                <BarCodeScanner
                  onBarCodeScanned={scanned ? undefined : handleBarCodeScanned}
                  style={[
                    {
                      flex: 1,
                      height: '100%',
                      position: 'absolute',
                      top: Platform.OS === 'android' ? 80 : 128,
                      left: 0,
                      bottom: 0,
                      right: 0
                    }
                  ]}
                />
              ) : null
            }
            <View
              style={{
                padding: 24
              }}
            >
              <ScheduleCard
                schedule={schedule}
                disableScanButton={true}
              />
            </View>
          </>
        ) : (
          <QRScanSuccess
            schedule={schedule}
          />
        )
      }
    </View>
  )
}