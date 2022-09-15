import { FontAwesome, FontAwesome5 } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import { doc, getDoc } from "firebase/firestore";
import moment from "moment";
import React, { useContext, useEffect, useState } from "react";
import { ActivityIndicator, Pressable, Text } from "react-native";
import Colors from "../constants/Colors";
import { textStyles } from "../constants/Styles";
import { ProfileContext } from "../contexts";
import { PresenceStatusEnum } from "../enums";
import { firestore } from "../firebase";
import { Log, Profile } from "../types";
import MECard from "./MECard";
import { View } from "./Themed";

function getStatusColor(status: string) {
  switch (status) {
    case "PRESENT":
      return Colors.light.green;
    case "ABSENT":
      return Colors.light.red;
    case "LATE":
      return Colors.light.orange;
    case "EXCUSED":
      return Colors.light.yellows.yellow3;
    default:
      return Colors.light.black;
  }
}

export default function HistoryCard(props: { history: Log }) {
  const { history } = props;
  const navigation = useNavigation();
  const [className, setClassName] = useState<string | null>(null);
  const { profile }: { profile: Profile } = useContext(ProfileContext);

  function loadClassData() {
    getDoc(doc(
      firestore, 
      `schools/${profile.schoolId}/classes/${history.classId}`
    )).then((docSnap) => {
      if (docSnap.exists()) {
        setClassName(docSnap.data().name)
      } else {
        setClassName('Kelas Tidak Ditemukan')
      }
    })
  }

  useEffect(() => {
    loadClassData();
  }, []);

  return (
    <Pressable
      style={({ pressed }) => ({
        opacity: pressed ? 0.75 : 1
      })}
      onPress={() => {
        navigation.navigate("Root", {
          screen: "HistoryPage",
          params: {
            screen: "HistoryDetails",
            params: {
              logId: history.id,
            },
            initial: false,
          },
        })
      }}
    >
      <MECard
        style={{
          marginBottom: 16,
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
    </Pressable>
  );
}
