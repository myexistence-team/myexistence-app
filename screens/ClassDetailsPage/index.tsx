import { useNavigation } from "@react-navigation/native";
import { collection, doc, documentId, getDoc, getDocs, limit, orderBy, query, where } from "firebase/firestore";
import React, { useContext, useEffect, useState } from "react";
import { Text } from "react-native";
import ClassScheduleCard from "../../components/ClassScheduleCard";
import MEContainer from "../../components/MEContainer";
import MEHeader from "../../components/MEHeader";
import MESpinner from "../../components/MESpinner";
import ScheduleCard from "../../components/ScheduleCard";
import { textStyles } from "../../constants/Styles";
import { ProfileContext } from "../../contexts";
import { firestore } from "../../firebase";
import { ClassScreenProps } from "../../navTypes";
import { Class, Profile } from "../../types";

export default function ClassDetailsPage({ route }: ClassScreenProps) {
  const { classId } = route.params;
  const navigation = useNavigation();
  
  const { profile } = useContext(ProfileContext);
  const [classRoom, setClass] = useState<Class | any>(null);
  const [schedules, setSchedules] = useState<any[]>([]);
  const [teachers, setTeachers] = useState<any[]>([]);
  const [students, setStudents] = useState<any[]>([]);

  const [isLoading, setIsLoading] = useState(true);

  const scheduleQuery = query(collection(
    firestore, 
    `schools/${profile.schoolId}/classes/${ classId }/schedules`),
    orderBy('day'),
    orderBy('start'),
  )

  const classQuery = query(collection(
    firestore, 
    `schools/${profile.schoolId}/classes`),
    where(documentId(), '==', classId)
  )

  function loadData() {
    if (profile.classIds?.length) {  
      setIsLoading(true);     
      setClass(null);

      getDoc((doc(
        firestore,
        'schools', 
        profile.schoolId,
        'classes', 
        classId
      ))).then((classSnap) => {
        if (classSnap.exists()) {          
          const classroom = classSnap.data();
          setClass(classroom);
          setIsLoading(false);

          // Get Students
          if (classroom.studentIds != 0) {            
            getDocs(
              query(collection(firestore,`users`),
                where(documentId(), 'in', classroom.studentIds), limit(3)
              )).then((docs) => {
                const studentArr: any = [];
                docs.forEach((doc) => {
                  // console.log(doc.data().displayName);
                  studentArr.push({ 
                    ...doc.data(),
                    id: doc.id
                  });
                })
                setStudents(studentArr);
            })
          }

          // Get Teacher
          if (classroom.teacherIds != 0) {            
            getDocs(
              query(collection(firestore, `users`),
                where(documentId(), 'in', classroom.teacherIds)
              )).then((docs) => {
                const teachArr: any = [];
                docs.forEach((doc) => {
                  teachArr.push({ 
                    ...doc.data(),
                    id: doc.id
                  });
                })
              setTeachers(teachArr);
            })
          }

          // Get Schedules
          if (classroom) {
            getDocs(scheduleQuery).then((docs) => {
              const docsArr: any[] = [];
              docs.forEach((doc) => {
                docsArr.push({ 
                  ...doc.data(),
                  id: doc.id,
                  className: classroom?.name,
                  classDescription: classroom?.description,
                });
              })
              setSchedules(docsArr);
              setIsLoading(false);
            })
          }
        }
      })
      
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
                { teachers.length ? (
                    teachers.map((person) => (
                      <Text key={person.id} style={[textStyles.body1, { fontFamily: 'manrope-bold' }]}>
                        {person.displayName} 
                      </Text>
                    ))
                  ) : <Text style={[textStyles.body1, { fontFamily: 'manrope-bold' }]}>
                        - 
                      </Text>
                }

              <Text style={[textStyles.body2, {marginTop: 16, marginBottom: 4}]}>Pelajar</Text>
                { students.length ?
                  (students.map((person) => (
                    <Text key={person.id} style={[textStyles.body1, { fontFamily: 'manrope-bold' }]}>
                      {person.displayName} 
                    </Text>
                  ))) : <Text style={[textStyles.body1, { fontFamily: 'manrope-bold' }]}>
                          - 
                        </Text>
                }
                { 
                  classRoom.studentIds.length > 3 ?  (
                    <Text style={[textStyles.body3, {marginTop: 12, marginBottom: 4}]}
                    >{classRoom.studentIds.length - 3} lainnya</Text>
                  ) : null
                }
              

              <Text style={[textStyles.body2, { marginTop: 16, marginBottom: 4, }]}>Jadwal</Text>
                {
                  schedules.map((s: any, idx: number) => (
                    <ClassScheduleCard schedule={s} key={idx}/>
                  ))
                }
            </>              
              
            
          }
      </MEContainer>
  )
}