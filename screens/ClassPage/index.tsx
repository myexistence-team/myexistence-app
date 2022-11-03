import { createNativeStackNavigator, NativeStackScreenProps } from "@react-navigation/native-stack";
import { isLoading } from "expo-font";
import { collection, documentId, getDocs, query, where } from "firebase/firestore";
import React, { useContext, useEffect, useState } from "react";
import { Text } from "react-native";
import ClassesCard from "../../components/ClassCard";
import MEContainer from "../../components/MEContainer";
import MESpinner from "../../components/MESpinner";
import { textStyles } from "../../constants/Styles";
import { ClassesContext, ProfileContext } from "../../contexts";
import { firestore } from "../../firebase";
import { ClassParamList } from "../../navTypes";
import { Profile } from "../../types";
import ClassDetailsPage from "../ClassDetailsPage";

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
      <Stack.Screen
        name="ClassDetails"
        component={ClassDetailsPage}
        options={{
          headerShown: false,
        }}
      />
    </Stack.Navigator>

  )
}

function Classes({ }: NativeStackScreenProps<ClassParamList, "Classes">) {
  const { profile } : { profile: Profile } = useContext(ProfileContext);
  const { classes } = useContext(ClassesContext);

  return (
    <MEContainer>
      <Text
        style={[textStyles.heading3, {marginBottom: 16}]}
      >Kelas</Text>
      {
        !profile.classIds?.length? (
          <Text style={[textStyles.body2]}>
            Anda belum terdaftar di kelas apapun.
          </Text>
        ) : 
        !classes.length? (
          <Text style={[textStyles.body2]}>
            Anda belum terdaftar di kelas apapun.
          </Text>
        ) : 
        classes.map((c: any, idx: number) => (
          <ClassesCard classRoom={c} key={idx}/>
        ))
      }
    </MEContainer>
  )
}