import { View, Text } from 'react-native'
import React, { useContext, useState } from 'react'
import MEContainer from '../../components/MEContainer'
import { ProfileContext, SchoolContext } from '../../contexts';
import MEHeader from '../../components/MEHeader';
import { textStyles } from '../../constants/Styles';
import { RoleEnum } from '../../enums';
import { Profile, School } from '../../types';
import MELink from '../../components/MELink';
import MEButton from '../../components/MEButton';
import { signOut } from '../../actions/authActions';
import { useNavigation } from '@react-navigation/native';

export default function ProfilePage() {
  const { profile }: { profile: Profile } = useContext(ProfileContext);
  const { school }: { school: School } = useContext(SchoolContext);
  const navigation = useNavigation();
  const [isSigningOut, setIsSigningOut] = useState(false);

  function handleLogOut() {
    setIsSigningOut(true);
    signOut()
  }

  return (
    <MEContainer>
      <MEHeader
        title='Profile'
        onBackPress={() => {
          navigation.navigate('Root', {
            screen: 'Schedule'
          })
        }}
        disableBackButton
      />
      <Text style={[textStyles.heading4, { marginBottom: 16 }]}>Profil Anda</Text>
      <Text style={[textStyles.body2]}>Name</Text>
      <Text style={[textStyles.body1, { marginBottom: 16 }]}>
        {profile.displayName}
      </Text>
      <Text style={[textStyles.body2]}>Email</Text>
      <Text style={[textStyles.body1, { marginBottom: 16 }]}>
        {profile.email}
      </Text>
      <Text style={[textStyles.body2]}>Peran</Text>
      <Text style={[textStyles.body1, { marginBottom: 24 }]}>
        {RoleEnum[profile.role]}
      </Text>
      <Text style={[textStyles.heading4, { marginBottom: 16 }]}>Sekolah</Text>
      <Text style={[textStyles.body2]}>Nama Sekolah</Text>
      <Text style={[textStyles.body1, { marginBottom: 16 }]}>
        {school.name}
      </Text>
      <Text style={[textStyles.body2]}>Lokasi Sekolah</Text>
      <Text style={[textStyles.body1, { marginBottom: 16 }]}>
        {school.location}
      </Text>
      <MEButton
        onPress={handleLogOut}
        isLoading={isSigningOut}
        color='danger'
        variant='outline'
      >
        Log Out
      </MEButton>
    </MEContainer>
  )
}