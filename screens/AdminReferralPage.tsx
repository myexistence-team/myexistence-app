import { View, Text, Linking } from 'react-native'
import React, { useState } from 'react'
import MEContainer from '../components/MEContainer'
import { textStyles } from '../constants/Styles'
import MEButton from '../components/MEButton'
import { FontAwesome5 } from '@expo/vector-icons'
import Colors from '../constants/Colors'
import { signOut } from '../actions/authActions'

export default function AdminReferralPage() {
  const [signingOut, setIsSigningOut] = useState(false);

  function handleLogOut() {
    setIsSigningOut(true);
    signOut();
  }

  async function handleVisitWebApp() {
    await Linking.openURL('https://myexistance-c4881.web.app/');
  }

  return (
    <MEContainer
      style={{
        alignItems: 'center',
        marginTop: 48
      }}
    >
      <FontAwesome5 name="praying-hands" size={64} color={Colors.light.blue} />
      <Text style={[textStyles.body1, { textAlign: 'center', fontFamily: 'manrope-bold', marginVertical: 16 }]}>Mohon maaf.</Text>
      <Text style={[textStyles.body2, { textAlign: 'center' }]}>Sebagai Admin, Anda hanya diizinkan untuk menggunakan aplikasi web Hadir.</Text>
      <MEButton
        style={{
          marginTop: 24,
          marginBottom: 16,
        }}
        onPress={handleVisitWebApp}
      >
        Kunjungi Hadir Web
      </MEButton>
      <MEButton
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