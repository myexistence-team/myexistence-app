import { Image, Text, View } from 'react-native'
import React, { Component, useContext, useState } from 'react'
import { ScreenContainer } from 'react-native-screens'
import MEContainer from '../../components/MEContainer'
import { textStyles } from '../../constants/Styles'
import MECard from '../../components/MECard'
import scheduleMocks from '../../mocks/scheduleMocks'
import Colors from '../../constants/Colors'
import moment from 'moment'
import { FontAwesome5 } from '@expo/vector-icons'
import NextSchedules from './NextSchedules'
import METextField from '../../components/METextInput'
import { RootTabScreenProps } from '../../navTypes'
import { ProfileContext } from '../../contexts'
import { Profile } from '../../types'
import MEButton from '../../components/MEButton'
import { signOut } from '../../actions/authActions'
import History from './History'
import { RoleEnum } from '../../enums'

export default function HomePage(props: RootTabScreenProps<"Home">) {
  const { profile }: { profile: Profile } = useContext(ProfileContext);

  return (
    <MEContainer>
      <Text style={textStyles.heading4} >Selamat datang!</Text>
      <MECard style={{
        marginTop: 16,
        marginBottom: 32,
      }}>
        <View style={{
          flexDirection: 'row',         
        }}>
          {
            profile.photoUrl ? (
              <Image
                source={{uri: profile.photoUrl}}
                style={{
                  width: 64,
                  height: 64,
                  marginRight: 16,
                  borderRadius: 32
                }}
              />
            ) : null
          }
          <View>
            <Text style={[
              textStyles.body1, 
              {marginBottom: 4}
              ]}>{profile.displayName}</Text>
            <Text style={textStyles.body3}>{RoleEnum[profile.role]}</Text>
          </View>
        </View>
        <View style={{
          flexDirection: 'row',  
          marginTop: 12,        
        }}>
          <View style={{
            flex: 1,
            marginRight: 12
          }}>
            <MEButton 
              variant="outline"
              onPress={() => {
                signOut()
              } }
            >
              Keluar
            </MEButton>
          </View>
          <View style={{
            flex: 1,
          }}>
          <MEButton>
            Pengaturan
          </MEButton>
          </View>
        </View>
      </MECard>
      <NextSchedules/>
      <History/>
    </MEContainer>
  )
}
