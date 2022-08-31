import React from "react";
import { Text } from "react-native";
import { textStyles } from "../constants/Styles";
import MECard from "./MECard";
import { View } from "./Themed";

export default function ClassesCard(props: {
    classRoom: {
        classId: string,
        name: string,
        description: string,
    },
}) {
    const {classRoom} = props;

    return (
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
    )
}