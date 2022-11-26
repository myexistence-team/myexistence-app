import { useNavigation } from "@react-navigation/native";
import { collection, doc, documentId, getDoc, getDocs, limit, orderBy, query, where } from "firebase/firestore";
import React, { useContext, useEffect, useState } from "react";
import { Text } from "react-native";
import ClassScheduleCard from "../../components/ClassScheduleCard";
import MEContainer from "../../components/MEContainer";
import MEHeader from "../../components/MEHeader";
import MESpinner from "../../components/MESpinner";
import { textStyles } from "../../constants/Styles";
import { ProfileContext, UsersContext } from "../../contexts";
import { firestore } from "../../firebase";
import { ClassScreenProps } from "../../navTypes";
import { Class } from "../../types";

export default function ClassDetailsPage({ route }: ClassScreenProps) {
  const { classId } = route.params;
  const navigation = useNavigation();
  
  const { profile } = useContext(ProfileContext);
  const { users, setUsers } = useContext(UsersContext);
  const [classRoom, setClass] = useState<Class | any>(null);
  const [schedules, setSchedules] = useState<any[]>([]);

  const [isLoading, setIsLoading] = useState(true);

  const scheduleQuery = query(collection(
    firestore, 
    `schools/${profile.schoolId}/classes/${ classId }/schedules`),
    orderBy('day'),
    orderBy('start'),
  )

  async function loadData() {
    if (profile.classIds?.length) {  
      setIsLoading(true);     
      setClass(null);

      const classSnap = await getDoc((doc(
        firestore,
        'schools', 
        profile.schoolId,
        'classes', 
        classId
      )))
      if (classSnap.exists()) {          
        const classroom = classSnap.data();
        setClass(classroom);
        setIsLoading(false);

        // Get Students
        if (classroom.studentIds.length != 0) {   
          const notStoredIds: string[] = classroom.studentIds.filter((sId: string) => !Object.keys(users).includes(sId));
          if (notStoredIds.length) {
            const studentSnaps = await getDocs(
              query(collection(firestore,`users`),
              where(documentId(), 'in', notStoredIds)
            ))
            const userObjs = studentSnaps.docs.reduce((a, b) => ({ ...a, [b.id]: b.data() }), {});
            setUsers((prevUsers: any) => ({ ...prevUsers, ...userObjs }));
          }
        }

        // Get Teacher
        if (classroom.teacherIds.length != 0) {      
          const notStoredIds: string[] = classroom.teacherIds.filter((tId: string) => !Object.keys(users).includes(tId));
          if (notStoredIds.length) {
            const teacherSnaps = await getDocs(
              query(collection(firestore, `users`),
              where(documentId(), 'in', classroom.teacherIds)
            ))
            const userObjs = teacherSnaps.docs.reduce((a, b) => ({ ...a, [b.id]: b.data() }), {});
            setUsers((prevUsers: any) => ({ ...prevUsers, ...userObjs }));
          }
        }

        // Get Schedules
        if (classroom) {
          const scheduleSnaps = await getDocs(scheduleQuery)
          const docsArr: any[] = [];
          scheduleSnaps.forEach((doc) => {
            docsArr.push({ 
              ...doc.data(),
              id: doc.id,
              className: classroom?.name,
              classDescription: classroom?.description,
            });
          })
          setSchedules(docsArr);
        }
        setIsLoading(false);
      }
      
    } else {
      setIsLoading(false);
    }
  }

  useEffect(() => {
    loadData();
  }, [])

  return (
      <MEContainer      
        onRefresh={profile.classIds?.length ? loadData : undefined}
        refreshing={isLoading}
      >
          {
            !profile.classIds?.length? (
              <Text style={[textStyles.body2]}>
                Anda belum terdaftar di kelas apapun.
              </Text>
            ) : 
            isLoading? (
              <MESpinner/>
            ) : 
            !classRoom? (
              <Text style={[textStyles.body2]}>
                Anda belum terdaftar di kelas ini.
              </Text>
            ) :
            <>
              <MEHeader
                title='Detail Kelas'
              />
              <Text style={[{fontFamily: 'manrope-bold', marginBottom: 4, fontSize: 30}]}>{classRoom.name}</Text>
              <Text style={[textStyles.body1, {marginBottom: 12}]}>{classRoom.description}</Text>

              <Text style={[textStyles.body2, {marginTop: 16, marginBottom: 4}]}>Pengajar</Text>
                { classRoom.teacherIds.length ? 
                    classRoom.teacherIds.map((tId: string) => {
                      const teacher = users[tId];
                      return (
                        <Text key={tId} style={[textStyles.body1, { fontFamily: 'manrope-bold' }]}>
                          {teacher?.displayName} 
                        </Text>
                      )
                    }
                  ) : (
                    <Text style={[textStyles.body1, { fontFamily: 'manrope-bold' }]}>
                      - 
                    </Text>
                  )
                }

              <Text style={[textStyles.body2, {marginTop: 16, marginBottom: 4}]}>Pelajar</Text>
                { classRoom.studentIds.length ?
                  (classRoom.studentIds.map((sId: string) => {
                    const student = users[sId]
                    return (
                      <Text key={sId} style={[textStyles.body1, { fontFamily: 'manrope-bold' }]}>
                        {student?.displayName} 
                      </Text>
                    )
                  })) : (
                    <Text style={[textStyles.body1, { fontFamily: 'manrope-bold' }]}>
                      - 
                    </Text>
                  )
                }
                { 
                  classRoom.studentIds.length > 3 ?  (
                    <Text style={[textStyles.body3, {marginTop: 12, marginBottom: 4}]}
                    >{classRoom.studentIds.length - 3} lainnya</Text>
                  ) : null
                }
              

              <Text style={[textStyles.body2, { marginTop: 16, marginBottom: 4, }]}>Sesi</Text>
                {
                  schedules.map((s: any, idx: number) => (
                    <ClassScheduleCard 
                      schedule={s} 
                      key={idx}
                      classId={classId}
                    />
                  ))
                }
            </>              
          }
      </MEContainer>
  )
}