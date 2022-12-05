import { createNativeStackNavigator, NativeStackScreenProps } from "@react-navigation/native-stack";
import React, { useContext } from "react";
import { Text } from "react-native";
import ClassesCard from "../../components/ClassCard";
import MEContainer from "../../components/MEContainer";
import { ProfileRoles } from "../../constants/constants";
import { textStyles } from "../../constants/Styles";
import { ClassesContext, ProfileContext } from "../../contexts";
import { ClassParamList } from "../../navTypes";
import { Profile } from "../../types";
import ClassDetailsPage from "../ClassDetailsPage";
import ClassDetailsStudentDetails from "../ClassDetailsPage/ClassDetailsStudentDetails";
import ClassDetailsStudents from "../ClassDetailsPage/ClassDetailsStudents";

const Stack = createNativeStackNavigator<ClassParamList>();

export default function ClassPage() {
  const { profile } = useContext(ProfileContext);

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
      <Stack.Screen
        name='ClassDetailsStudents'
        component={ClassDetailsStudents}
        options={{
          headerShown: false,
        }}
      />
      {
        profile.role === ProfileRoles.TEACHER && (
          <Stack.Screen
            name='ClassDetailsStudentDetails'
            component={ClassDetailsStudentDetails}
            options={{
              headerShown: false,
            }}
          />
        )
      }
    </Stack.Navigator>

  )
}

function Classes({ }: NativeStackScreenProps<ClassParamList, "Classes">) {
  const { profile } : { profile: Profile } = useContext(ProfileContext);
  const { classes } = useContext(ClassesContext);
  const filteredClasses = classes?.filter((c) => profile.classIds?.includes(c.id));

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
        !filteredClasses.length? (
          <Text style={[textStyles.body2]}>
            Anda belum terdaftar di kelas apapun.
          </Text>
        ) : 
        filteredClasses.map((c: any, idx: number) => (
          <ClassesCard classRoom={c} key={idx}/>
        ))
      }
    </MEContainer>
  )
}