import { Text } from 'react-native'
import React, { useState } from 'react'
import { signOut } from '../actions/authActions';
import MEContainer from '../components/MEContainer';
import { FontAwesome5 } from '@expo/vector-icons';
import Colors from '../constants/Colors';
import { textStyles } from '../constants/Styles';
import MEButton from '../components/MEButton';

export default function NotVerified() {
  const [signingOut, setIsSigningOut] = useState(false);

  function handleLogOut() {
    setIsSigningOut(true);
    signOut();
  }

  return (
    <MEContainer
      style={{
        alignItems: 'center',
        marginTop: 48
      }}
    >
      <FontAwesome5 name="clock" size={64} color={Colors.light.blue} />
      <Text style={[textStyles.body1, { textAlign: 'center', fontFamily: 'manrope-bold', marginVertical: 16 }]}>Belum Terverifikasi.</Text>
      <Text style={[textStyles.body2, { textAlign: 'center' }]}>Akun Anda belum terverifikasi di sekolah yang Anda pilih. Mohon hubungi administrator sekolah.</Text>
      <MEButton
        style={{
          marginTop: 24,
        }}
        color='danger'
        variant='outline'
        onPress={handleLogOut}
        isLoading={signingOut}
      >
        Keluar
      </MEButton>
    </MEContainer>  
  )
}