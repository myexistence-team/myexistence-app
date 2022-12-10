import { View, Text, Image } from 'react-native'
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
import { Alert } from 'react-native';

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

  function handleLogOut() {
    Alert.alert(
      'Log Out', 
      'Apakah Anda yakin ingin keluar dari akun?',
      [
        {
          text: 'Batal',
          style: 'default'
        },
        {
          text: 'Ya',
          style: 'destructive',
          onPress: () => {
            signOut();
          }
        },
      ]
    );
  }

  return (
    <MEContainer>
      <MEHeader
        title='Profil Anda'
        onBackPress={() => {
          navigation.navigate('Root', {
            screen: 'SchedulesPage'
          })
        }}
        disableBackButton
      />
      {
        profile.photoUrl && (
          <Image
            source={{
              uri: profile.photoUrl
            }}
            style={{
              width: 120,
              height: 120,
              borderRadius: 500,
              alignSelf: 'center',
              marginBottom: 16
            }}
          />
        )
      }
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
      <Text style={[textStyles.body2]}>Nomor Induk</Text>
      <Text style={[textStyles.body1, { fontFamily: 'manrope-bold', marginBottom: 16 }]}>
        {profile.idNumber}
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
        style={{
          marginBottom: 16
        }}
        onPress={() => {
          navigation.navigate('Root', {
            screen: 'ProfilePage',
            params: {
              screen: 'EditProfile',
              initial: false
            },
          })
        }}
        // isLoading={true} 
        color='primary'
        variant='outline'
      >
        Pengaturan
      </MEButton>
      {
        !profile.currentScheduleId && (
          <MEButton
            onPress={handleLogOut}
            color='danger'
            variant='outline'
          >
            Keluar
          </MEButton>
        )
      }
    </MEContainer>
  )
}