import { Image, ImageBackground, Platform, RefreshControl, ScrollView, StatusBar, Text, View } from 'react-native'
import React, { useContext, useEffect, useState } from 'react'
import { textStyles } from '../../constants/Styles'
import MECard from '../../components/MECard'
import NextSchedules from './NextSchedules'
import { HomePageParamList, RootTabScreenProps } from '../../navTypes'
import { ProfileContext } from '../../contexts'
import { Class, Profile } from '../../types'
import MEButton from '../../components/MEButton'
import { signOut } from '../../actions/authActions'
import History from './History'
import { collectionGroup, doc, getDoc, getDocs, query, updateDoc, where } from 'firebase/firestore'
import { firestore } from '../../firebase'
import Colors from '../../constants/Colors'
import ScheduleCard from '../../components/ScheduleCard'
import MESpinner from '../../components/MESpinner'
import { ScheduleStasuses } from '../../constants/constants'
import { useNavigation } from '@react-navigation/native'
import WeeklySummary from './WeeklySummary'
import { createNativeStackNavigator, NativeStackScreenProps } from '@react-navigation/native-stack'
import SummaryDetails from './SummaryDetails'

const Stack = createNativeStackNavigator<HomePageParamList>();

export default function HomePage({}: RootTabScreenProps<"HomePage">) {
  return (
    <Stack.Navigator
      initialRouteName='Home'
    >
      <Stack.Screen
        name='Home'
        component={Home}
        options={{
          header: () => null
        }}
      />
      <Stack.Screen
        name='SummaryDetails'
        component={SummaryDetails}
        options={{
          header: () => null
        }}
      />
    </Stack.Navigator>
  )
}

export function Home({
}: NativeStackScreenProps<HomePageParamList, 'Home'>) {
  const { profile }: { profile: Profile } = useContext(ProfileContext);
  const navigation = useNavigation();

  const [currentSchedule, setCurrentSchedule] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);
  
  
  function loadHomePageData() {    
    console.log("LOADING")
    setIsLoading(true);
    if (profile.classIds?.length) {
      if (profile.currentScheduleId) {
        const currentScheduleQuery = query(
          collectionGroup(firestore, 'schedules'),
          where('id', '==', profile.currentScheduleId),
        );
        getDocs(currentScheduleQuery)
        .then((docs) => {
          const schedule: any = docs.docs[0].data();
          if (schedule.status === ScheduleStasuses.CLOSED) {
            updateDoc(doc(firestore, 'users', profile.id), {
              currentScheduleId: null
            })
          } else {
            // excludedScheduleId = profile.currentScheduleId;
            getDoc(doc(firestore, `schools/${profile.schoolId}/classes/${schedule.classId}`)).then((classSnap) => {
              const classObj: Class | any = classSnap.data();
              const convertedSchedule = {
                ...schedule,
                className: classObj.name,
                classDescription: classObj.description,
                class: null
              }
              setCurrentSchedule(convertedSchedule);
              setIsLoading(false);
            })
          }
        })
      } else {
        setCurrentSchedule(null);
        setTimeout(() => {
          setIsLoading(false);
        }, 300)
      }
    } else {
      setIsLoading(false);
    }
  }

  useEffect(() => {
    loadHomePageData();
  }, [profile])

  return (
    <ScrollView
      contentContainerStyle={{
        paddingBottom: 16,
      }}
      refreshControl={
        <RefreshControl
          refreshing={isLoading}
          onRefresh={loadHomePageData}
          progressViewOffset={32}
          colors={[Colors.light.tint]}
          enabled={Boolean(profile.classIds?.length)}
        />
      }
    >
      <ImageBackground
        source={require('../../assets/images/homepage-hero-background.png')}
        resizeMode='cover'
        resizeMethod='resize'
        style={{
          paddingHorizontal: 24,
          paddingTop: (StatusBar.currentHeight !== undefined ? StatusBar.currentHeight : 0) + 64,
        }}
        imageStyle={{
          alignSelf: 'flex-start',
          height:Platform.OS === 'ios' ? 540 : 200,
          top: Platform.OS === 'ios' ? -360 : 0
        }}
      >
        <Text style={[textStyles.heading4, { color: 'white' }]} >Selamat Datang!</Text>
        <MECard 
          style={{
            marginTop: 16,
            marginBottom: 32,
          }}
          onPress={() => {
            navigation.navigate('Root', {
              screen: 'ProfilePage'
            })
          }}
        >
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
              <Text style={textStyles.body3}>{profile.description}</Text>
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
            <MEButton
              onPress={() => {
                navigation.navigate('Root', {
                  screen: 'ProfilePage',
                  params: {
                    screen: 'EditProfile'
                  }
                })
              }}
            >
              Pengaturan
            </MEButton>
            </View>
          </View>
        </MECard>
        {
          !profile.classIds?.length ? (
            <Text style={[textStyles.body2, { textAlign: 'center' }]}>
              Anda belum terdaftar di kelas apapun. {'\n'}
              Mohon hubungi administrator sekolah Anda.
            </Text>
          ) : (
            <>
              {
                isLoading ? (
                  <MESpinner/>
                ) : (
                  <>
                    {
                      currentSchedule ? (
                        <View style={{ marginBottom: 16 }}>
                          <Text style={[textStyles.heading3, { marginBottom: 16 }]}>Sedang Berlangsung</Text>
                          <ScheduleCard
                            schedule={currentSchedule}
                            disableScanButton={true}
                            disableCountdown={true}
                          />
                        </View>
                      ) : null
                    }
                    <WeeklySummary/>
                    <NextSchedules/>
                    <History/>
                  </>
                )
              }
            </>
          )
        }
      </ImageBackground>
    </ScrollView>
  )
}
