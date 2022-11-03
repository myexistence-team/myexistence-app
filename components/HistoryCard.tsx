import { FontAwesome, FontAwesome5 } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import { doc, getDoc } from "firebase/firestore";
import moment from "moment";
import React, { useContext, useEffect, useState } from "react";
import { ActivityIndicator, Text } from "react-native";
import Colors from "../constants/Colors";
import { textStyles } from "../constants/Styles";
import { ClassesContext, ProfileContext } from "../contexts";
import { PresenceStatusEnum } from "../enums";
import { firestore } from "../firebase";
import { Log, Profile } from "../types";
import { getStatusColor } from "../utils/utilFunctions";
import MECard from "./MECard";
import { View } from "./Themed";

export default function HistoryCard(props: { history: Log, clickable?: boolean }) {
  const { history, clickable = true } = props;
  const navigation = useNavigation();
  const { profile }: { profile: Profile } = useContext(ProfileContext);
  const { classes } = useContext(ClassesContext);
  const { name: className } = classes.find((c) => c.id === history.classId);

  // function loadClassData() {
  //   getDoc(doc(
  //     firestore, 
  //     `schools/${profile.schoolId}/classes/${history.classId}`
  //   )).then((docSnap) => {
  //     if (docSnap.exists()) {
  //       setClassName(docSnap.data().name)
  //     } else {
  //       setClassName('Kelas Tidak Ditemukan')
  //     }
  //   })
  // }

  // useEffect(() => {
  //   loadClassData();
  // }, []);

  return (
    <MECard
      style={{
        marginBottom: 16,
      }}
      onPress={!clickable ? undefined : () => {
        navigation.navigate("Root", {
          screen: "HistoryPage",
          params: {
            screen: "HistoryDetails",
            params: {
              logId: history.id,
              isCurrent: history.isCurrent,
              classId: history.classId,
            },
            initial: false,
          },
        })
      }}
    >
      <View
        style={{
          flexDirection: "row",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: 8,
        }}
      >
        {
          history.time && (
            <View
              style={{
                flexDirection: "row",
                alignItems: "center",
                flex: 2,
              }}
            >
              <FontAwesome5 size={12} name="calendar" color={Colors.light.grey} />
              <Text
                style={[
                  textStyles.body3,
                  {
                    marginLeft: 8,
                    color: Colors.light.grey,
                  },
                ]}
              >
                {moment(history.time.toDate()).format("LL - HH:mm")}
              </Text>
            </View>
          )
        }
        <View
          style={{
            flexDirection: "row",
            justifyContent: "flex-end",
            alignItems: "center",
            flex: 1,
          }}
        >
          <FontAwesome
            size={12}
            name="circle"
            color={getStatusColor(history.status)}
          />
          <Text
            style={[
              textStyles.body3,
              {
                marginLeft: 4,
                fontFamily: "manrope-bold",
                color: getStatusColor(history.status),
              },
            ]}
          >
            {PresenceStatusEnum[history.status]}
          </Text>
        </View>
      </View>
      {
        className ? (
          <Text
            style={[
              textStyles.body1,
              {
                fontFamily: "manrope-bold",
              },
            ]}
          >
            {className}
          </Text>
        ) : (
          <ActivityIndicator/>
        )
      }
    </MECard>
  );
}
