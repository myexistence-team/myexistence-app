import { Image, ImageBackground, Platform, RefreshControl, ScrollView, StatusBar, Text, View } from 'react-native'
import React, { useContext, useEffect, useState } from 'react'
import MEContainer from '../../components/MEContainer'
import { textStyles } from '../../constants/Styles'
import MECard from '../../components/MECard'
import NextSchedules from './NextSchedules'
import { RootTabScreenProps } from '../../navTypes'
import { ProfileContext } from '../../contexts'
import { Profile } from '../../types'
import MEButton from '../../components/MEButton'
import { signOut } from '../../actions/authActions'
import History from './History'
import { RoleEnum } from '../../enums'
import { collection, collectionGroup, documentId, getDocs, limit, query, where } from 'firebase/firestore'
import { firestore } from '../../firebase'
import { nowScheduleDate } from '../../constants/constants'
import Colors from '../../constants/Colors'

export default function HomePage(props: RootTabScreenProps<"Home">) {
  const { profile }: { profile: Profile } = useContext(ProfileContext);

  const [schedules, setSchedules] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const classesQuery = query(collection(
    firestore, 
    `schools/${profile.schoolId}/classes`),
    ...profile.classIds.length ? [where(documentId(), 'in', profile.classIds)] : [],
  );
  const schedulesQuery = query(
    collectionGroup(firestore, 'schedules'), 
    ...profile.classIds.length ? [where('classId', 'in', profile.classIds)] : [],
    where('start', '>', nowScheduleDate),
    limit(5),
  );

  function loadHomePageData() {    
    if (profile.classIds.length) {
      setIsLoading(true);
      getDocs(classesQuery).then((docs) => {
        const classArr: any[] = [];
        docs.forEach((doc) => {
          classArr.push({ ...doc.data(), id: doc.id });
        })
        getDocs(schedulesQuery).then((docs) => {
          const docsArr: any[] = [];
          docs.forEach((doc) => {
            const classObj = classArr
              .find(({ id }) => id === doc.data().classId);
            docsArr.push({ 
              ...doc.data(),
              className: classObj?.name,
              description: classObj?.description,
              start: doc.data().start.toDate(),
              end: doc.data().end.toDate(),
            });
          })
          setSchedules(docsArr);
          setIsLoading(false);
        })
      }) 
    } else {
    setIsLoading(false);
    }
  }

  useEffect(() => {
    loadHomePageData();
  }, [])

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
          enabled={Boolean(profile.classIds.length)}
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
        {
          !profile.classIds.length ? (
            <Text style={[textStyles.body2, { textAlign: 'center' }]}>
              Anda belum terdaftar di kelas apapun. {'\n'}
              Mohon hubungi administrator sekolah Anda.
            </Text>
          ) : (
            <>
              <NextSchedules schedules={schedules} isLoading={isLoading}/>
              <History/>
            </>
          )
        }
      </ImageBackground>
    </ScrollView>
  )
}
