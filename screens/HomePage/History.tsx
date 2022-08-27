import { Text } from "react-native";
import { View } from "../../components/Themed";
import { textStyles } from "../../constants/Styles";
import historyMocks from "../../mocks/historyMocks";
import React from 'react'
import HistoryCard from "../../components/HistoryCard";
import Colors from "../../constants/Colors";

export default function History() {
  const histories = historyMocks;
  
  return (
    <View 
      style={{
        paddingBottom: 64
      }}
    >
      <Text
        style={[textStyles.heading3, { marginBottom: 16, color: Colors.light.tint }]}
      >
        Riwayat
      </Text>
      {
        histories.map((h, idx) => (
          <HistoryCard history={h} key={idx}
          />
        ))
      }
    </View>
  )

}