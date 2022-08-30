import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { isLoading } from "expo-font";
import { collection, documentId, getDocs, query, where } from "firebase/firestore";
import React, { useContext, useEffect, useState } from "react";
import { Text } from "react-native";
import ClassesCard from "../../components/ClassesCard";
import MEContainer from "../../components/MEContainer";
import MESpinner from "../../components/MESpinner";
import { textStyles } from "../../constants/Styles";
import { ProfileContext } from "../../contexts";
import { firestore } from "../../firebase";
import { ClassParamList } from "../../navTypes";
import { Profile } from "../../types";

const Stack = createNativeStackNavigator<ClassParamList>();

export default function ClassPage() {
  return (
    <Stack.Navigator
    initialRouteName="Classes"
    >
      <Stack.Screen
        name="Classes"
        component={Classes}
        options={{
          header: () => null
        }}
      />
      {/* <Stack.Screen
        name="ClassDetails"
        component={ClassDetailsPage}
        options={{
          headerShown: false,
        }}
      /> */}
    </Stack.Navigator>

  )
}

function Classes() {
  const { profile } : { profile: Profile } = useContext(ProfileContext);
  const [classesState, setClassesState] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);


  const classesQuery = query(collection(
    firestore, 
    `schools/${profile.schoolId}/classes`), 
    where(documentId(), 'in', profile.classIds)
  )

  function loadData() {
    if (profile.classIds.length) {
      setIsLoading(true);
      getDocs(classesQuery).then((docs) => {
        const docsArr: any[] = [];
        docs.forEach((doc) => {
          console.log(doc.id)
          docsArr.push({
            ...doc.data(),
            id: doc.id,
          })
        })
        setClassesState(docsArr)
        setIsLoading(false);
        // console.log("DOCSARR", docsArr);
      })
    } else {
      setIsLoading(false);
    }
  }

  useEffect(() => {
    loadData();
  }, [])

  return (
    <MEContainer
      onRefresh={profile.classIds.length ? loadData : undefined}
      refreshing={isLoading}  
    >
      <Text
        style={[textStyles.heading3, {marginBottom: 16}]}
      >Kelas</Text>
      {
        !profile.classIds.length? (
          <Text style={[textStyles.body2]}>
            Anda belum terdaftar di kelas apapun.
          </Text>
        ) : 
        isLoading? (
          <MESpinner/>
        ) : 
        !classesState.length? (
          <Text style={[textStyles.body2]}>
            Anda belum terdaftar di kelas apapun.
          </Text>
        ) : 
        classesState.map((c, idx) => (
          <ClassesCard classRoom={c} key={idx}/>
        ))
      }
    </MEContainer>
  )
}