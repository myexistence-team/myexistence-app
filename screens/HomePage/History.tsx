import { Text } from "react-native";
import { View } from "../../components/Themed";
import { textStyles } from "../../constants/Styles";
import historyMocks from "../../mocks/historyMocks";
import React from 'react'
import HistoryCard from "../../components/HistoryCard";
import Colors from "../../constants/Colors";
import { Log } from "../../types";
import MEButton from "../../components/MEButton";
import { useNavigation } from "@react-navigation/native";

export default function History({
  logs
}: {
  logs: Log[]
}) {
  const navigation = useNavigation();
  return (
    <View 
      style={{
        paddingBottom: 64
      }}
    >
      <Text
        style={[textStyles.heading3, { marginBottom: 16 }]}
      >
        Riwayat
      </Text>
      {
        logs.map((h, idx) => (
          <HistoryCard history={h} key={idx}/>
        ))

      }
      <MEButton
        variant='outline'
        onPress={() => {
          navigation.navigate('Root', {
            screen: 'HistoryPage', 
            params: {
              screen: "History"
            }
          })
        }}
      >
        Tampilkan Lebih Banyak
      </MEButton>
    </View>
  )

}