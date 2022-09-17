import { Image, ImageBackground, Platform, RefreshControl, ScrollView, StatusBar, Text, View } from 'react-native'
import React, { useContext, useEffect, useState } from 'react'
import { textStyles } from '../../constants/Styles'
import MECard from '../../components/MECard'
import NextSchedules from './NextSchedules'
import { RootTabScreenProps } from '../../navTypes'
import { AuthContext, ProfileContext } from '../../contexts'
import { Class, Profile } from '../../types'
import MEButton from '../../components/MEButton'
import { signOut } from '../../actions/authActions'
import History from './History'
import { collection, collectionGroup, doc, documentId, DocumentReference, getDoc, getDocs, limit, orderBy, query, updateDoc, where } from 'firebase/firestore'
import { firestore } from '../../firebase'
import Colors from '../../constants/Colors'
import ScheduleCard from '../../components/ScheduleCard'
import MESpinner from '../../components/MESpinner'
import { getCurrentScheduleTime } from '../../utils/getters'
import { ScheduleStasuses } from '../../constants/constants'
import { useNavigation } from '@react-navigation/native'

export default function HomePage(props: RootTabScreenProps<"Home">) {
  const { profile }: { profile: Profile } = useContext(ProfileContext);
  const { auth } = useContext(AuthContext);
  const navigation = useNavigation();

  const [currentSchedule, setCurrentSchedule] = useState<any>(null);
  const [schedules, setSchedules] = useState<any[]>([]);
  const [logs, setLogs] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  
  
  function loadHomePageData() {    
    const nowScheduleDate = getCurrentScheduleTime();
    var excludedScheduleId: string | undefined;
    if (profile.classIds?.length) {
      setIsLoading(true);
      if (profile.currentScheduleId) {
        const currentScheduleQuery = query(
          collectionGroup(firestore, 'schedules'),
          where('id', '==', profile.currentScheduleId),
        );
        getDocs(currentScheduleQuery)
        .then((docs) => {
          const schedule: any = docs.docs[0].data();
          if (
            schedule.end.toDate().getTime() < nowScheduleDate.getTime()
            || schedule.status === ScheduleStasuses.CLOSED
          ) {
            updateDoc(doc(firestore, 'users', profile.id), {
              currentScheduleId: null
            })
          } else {
            excludedScheduleId = profile.currentScheduleId;
            getDoc(doc(firestore, `schools/${profile.schoolId}/classes/${schedule.classId}`)).then((classSnap) => {
              const classObj: Class | any = classSnap.data();
              const convertedSchedule = {
                ...schedule,
                className: classObj.name,
                classDescription: classObj.description,
                class: null
              }
              setCurrentSchedule(convertedSchedule);
            })
          }
        })
      } else {
        setCurrentSchedule(null);
      }
      const schedulesQuery = query(
        collectionGroup(firestore, 'schedules'), 
        where('classId', 'in', profile.classIds),
        where('end', '>', nowScheduleDate),
        orderBy('end', 'desc'),
        limit(excludedScheduleId ? 6 : 5),
      );
      const classesQuery = query(collection(
        firestore, 
        `schools/${profile.schoolId}/classes`),
        where(documentId(), 'in', profile.classIds),
      );
      const logsQuery = query(collection(
        firestore, 
        `schools/${profile.schoolId}/logs`),
        where('studentId', '==', auth.uid),
        limit(5)
      );

      getDocs(classesQuery).then((docs) => {
        const classObjs: any = {};
        docs.forEach((doc) => {
          classObjs[doc.id] = doc.data();
        })
        getDocs(schedulesQuery).then((docs) => {
          const docsArr: any[] = [];
          docs.forEach((doc) => {
            const classObj = classObjs[doc.data().classId];
            docsArr.push({ 
              ...doc.data(),
              id: doc.id,
              className: classObj?.name,
              classDescription: classObj?.description,
              class: null
            });
          })
          setSchedules(docsArr.filter((s) => s.id !== excludedScheduleId));
          setIsLoading(false);
        })
      }) 
      getDocs(logsQuery).then((docSnaps) => {
        const docsArr: any[] = [];
        docSnaps.docs.forEach((doc) => {
          docsArr.push({
            ...doc.data(),
            id: doc.id
          });
        })
        setLogs(docsArr);
      })
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
                    screen: 'EditProfile',
                    initial: false
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
                        <>
                          <Text style={[textStyles.heading3, { marginBottom: 16 }]}>Sedang Berlangsung</Text>
                          <ScheduleCard
                            schedule={currentSchedule}
                            disableScanButton={true}
                            disableCountdown={true}
                          />
                        </>
                      ) : null
                    }
                    <NextSchedules schedules={schedules}/>
                    <History logs={logs}/>
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
