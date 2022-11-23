import { useNavigation } from "@react-navigation/native";
import React from "react";
import { Pressable, Text } from "react-native";
import { textStyles } from "../constants/Styles";
import MECard from "./MECard";

export default function ClassCard(props: {
    classRoom: {
        id: string,
        name: string,
        description: string,
    },
}) {
    const {classRoom} = props;

    const navigation = useNavigation();

    return (
        <Pressable
        style={({ pressed }) => ({
          opacity: pressed ? 0.75 : 1
        })}
        onPress={() => {
            navigation.navigate("Root", {
              screen: "ClassPage",
              params: {
                  screen: "ClassDetails",
                  params: {
                    classId: classRoom.id
                },
                  initial: false,
              },                
            })
         }}
        >            
            <MECard 
                style={{
                    marginBottom: 16
                }}>
                <Text
                    style={[textStyles.body1, {
                        fontFamily: 'manrope-bold',
                        marginBottom: 8,
                    }]}
                    >{classRoom.name}</Text>
                <Text
                    style={[textStyles.body3]}
                >{classRoom.description}</Text>
            </MECard>
        </Pressable>
    )
}