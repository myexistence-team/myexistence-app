import { View, Text, StyleSheet, StatusBar, Platform } from 'react-native'
import React, { useEffect, useState } from 'react'
import { RootStackScreenProps } from '../../navTypes'
import MEContainer from '../../components/MEContainer';
import MEHeader from '../../components/MEHeader';
import { BarCodeScanner } from 'expo-barcode-scanner';
import ScheduleCard from '../../components/ScheduleCard';

export default function QRScanner({ route }: RootStackScreenProps<'Scanner'>) {
  const { scheduleId, schedule } = route.params;

  const [hasPermission, setHasPermission] = useState<boolean | null>(null);
  const [scanned, setScanned] = useState(false);

  useEffect(() => {
    const getBarCodeScannerPermissions = async () => {
      const { status } = await BarCodeScanner.requestPermissionsAsync();
      setHasPermission(status === 'granted');
    };

    getBarCodeScannerPermissions();
  }, []);

  const handleBarCodeScanned = ({ type, data } : any) => {
    setScanned(true);
    alert(`Bar code with type ${type} and data ${data} has been scanned!`);
  };

  return (
    <View
      style={{
        flex: 1
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
        hasPermission === true ? (
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
    </View>
  )
}