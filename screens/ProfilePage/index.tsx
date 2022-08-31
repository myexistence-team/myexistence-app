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
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { ProfileParamList } from '../../navTypes';
import EditProfile from './EditProfile';

const Stack = createNativeStackNavigator<ProfileParamList>();

export default function ProfilePage() {
  return (
    <Stack.Navigator
      initialRouteName='Profile'
    >
      <Stack.Screen
        name='Profile'
        component={ProfileScreen}
        options={{
          header: () => null
        }}
      />
      <Stack.Screen
        name='EditProfile'
        component={EditProfile}
        options={{
          header: () => null
        }}
      />
    </Stack.Navigator>
  )
}

export function ProfileScreen() {
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
            screen: 'SchedulesPage'
          })
        }}
        disableBackButton
      />
      <Text style={[textStyles.heading4, { marginBottom: 16 }]}>Profil Anda</Text>
      <Text style={[textStyles.body2]}>Nama</Text>
      <Text style={[textStyles.body1, { fontFamily: 'manrope-bold', marginBottom: 16 }]}>
        {profile.displayName}
      </Text>
      <Text style={[textStyles.body2]}>Deskripsi</Text>
      <Text style={[textStyles.body1, { fontFamily: 'manrope-bold', marginBottom: 16 }]}>
        {profile.description}
      </Text>
      <Text style={[textStyles.body2]}>Email</Text>
      <Text style={[textStyles.body1, { fontFamily: 'manrope-bold', marginBottom: 16 }]}>
        {profile.email}
      </Text>
      <Text style={[textStyles.body2]}>Peran</Text>
      <Text style={[textStyles.body1, { fontFamily: 'manrope-bold', marginBottom: 24 }]}>
        {RoleEnum[profile.role]}
      </Text>
      <Text style={[textStyles.heading4, { marginBottom: 16 }]}>Sekolah</Text>
      <Text style={[textStyles.body2]}>Nama Sekolah</Text>
      <Text style={[textStyles.body1, { fontFamily: 'manrope-bold', marginBottom: 16 }]}>
        {school.name}
      </Text>
      <Text style={[textStyles.body2]}>Lokasi Sekolah</Text>
      <Text style={[textStyles.body1, { fontFamily: 'manrope-bold', marginBottom: 16 }]}>
        {school.location}
      </Text>
      <MEButton
        // size='sm'
        onPress={handleLogOut}
        // isLoading={true} 
        color='danger'
        variant='outline'
      >
        Keluar
      </MEButton>
    </MEContainer>
  )
}