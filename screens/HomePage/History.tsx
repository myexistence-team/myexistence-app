import { Text } from "react-native";
import { View } from "../../components/Themed";
import { textStyles } from "../../constants/Styles";
import React, { useContext, useEffect, useState } from 'react'
import HistoryCard from "../../components/HistoryCard";
import MEButton from "../../components/MEButton";
import { useNavigation } from "@react-navigation/native";
import { collection, getDocs, limit, orderBy, query, where } from "firebase/firestore";
import { AuthContext, ProfileContext } from "../../contexts";
import { firestore } from "../../firebase";
import MESpinner from "../../components/MESpinner";
import HistoryDetailsModal from "../HistoryDetailsModal";

export default function History() {
  const navigation = useNavigation();
  const { profile } = useContext(ProfileContext);
  const { auth } = useContext(AuthContext);
  const [logs, setLogs] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const logsQuery = query(collection(
    firestore, 
    `schools/${profile.schoolId}/logs`),
    where('studentId', '==', auth.uid),
    orderBy('time', 'desc'),
    limit(5)
  );
  function loadData() {
    setIsLoading(true);
    getDocs(logsQuery).then((docSnaps) => {
      const docsArr: any[] = [];
      docSnaps.docs.forEach((doc) => {
        docsArr.push({
          ...doc.data(),
          id: doc.id
        });
      })
      setLogs(docsArr);
    }).finally(() => {
      setIsLoading(false);
    })
  }

  useEffect(() => {
    loadData()
  }, []);

  const [selectedLogId, setSelectedLogId] = useState(null);
  const selectedLog = logs?.find((l) => l.id === selectedLogId);

  return (
    <View 
      style={{
        paddingBottom: 64
      }}
    >
      <HistoryDetailsModal
        log={selectedLog}
        setSelectedLogId={setSelectedLogId}
      />
      {
        isLoading ? (
          <MESpinner/>
        ) : (
          <>
            <Text
              style={[textStyles.heading3, { marginBottom: 16 }]}
            >
              Riwayat
            </Text>
            {
              logs.map((h, idx) => (
                <HistoryCard 
                  history={h} 
                  key={idx}
                  onPress={() => {
                    setSelectedLogId(h.id)
                  }}
                />
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
          </>
        )
      }
    </View>
  )

}