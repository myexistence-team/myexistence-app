import { useNavigation } from "@react-navigation/native";
import { collection, doc, documentId, getDoc, getDocs, limit, query, where } from "firebase/firestore";
import React, { useContext, useEffect, useState } from "react";
import { Text } from "react-native";
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
  )

  const classQuery = query(collection(
    firestore, 
    `schools/${profile.schoolId}/classes`),
    where(documentId(), '==', classId)
  )

  function loadData() {
    if (profile.classIds.length) {  
      setIsLoading(true);     
      setClass(null);

      // Get Schedules
      getDocs(classQuery).then((docs) => {
        const classObjs: any = {};
        docs.forEach((doc) => {
          classObjs[doc.id] = doc.data();
        })
        getDocs(scheduleQuery).then((docs) => {
          const docsArr: any[] = [];
          docs.forEach((doc) => {
            const classObj = classObjs[doc.data().classId];
            docsArr.push({ 
              ...doc.data(),
              id: doc.id,
              className: classObj?.name,
              classDescription: classObj?.description,
              start: doc.data().start.toDate(),
              end: doc.data().end.toDate(),
            });
          })
          setSchedules(docsArr);
          setIsLoading(false);
        })
      }) 

      // Get Teachers name
      getDocs(classQuery).then((docs) => {
        const classObjs: any = {};
        const teachIdArr: any = [];
        docs.forEach((doc) => {
          classObjs[doc.id] = doc.data();
          for (let index = 0; index < doc.data().teacherIds.length; index++) {
            teachIdArr.push(doc.data().teacherIds[index]);              
          };
        })
        getDocs(
          query(collection(firestore, `users`),
            where(documentId(), 'in', teachIdArr)
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
      }) 

      // Get Student
      getDocs(classQuery).then((docs) => {
        const classObjs: any = {};
        const studentIdArr: any = [];
        docs.forEach((doc) => {
          classObjs[doc.id] = doc.data();
          console.log(doc.data().teacherIds);
          for (let index = 0; index < doc.data().studentIds.length; index++) {
            console.log(doc.get("studentIds")[index]);
            studentIdArr.push(doc.data().studentIds[index]);              
          };
          console.log(studentIdArr);
        })
        getDocs(
          query(collection(firestore,`users`),
            where(documentId(), 'in', studentIdArr), limit(3)
          )).then((docs) => {
            const studentArr: any = [];
          docs.forEach((doc) => {
            console.log(doc.data().displayName);
            // const classObj = classObjs[doc.data().classId];
            studentArr.push({ 
              ...doc.data(),
              id: doc.id
            });
          })
          setStudents(studentArr);
        })
      }) 

      // Get Class
      getDocs(classQuery).then((docs) => {
        const classArr: any[] = [];
        const teachIdArr: any[] = [];
        const studentIdArr: any[] = [];
        docs.forEach((doc) => {
          setClass({ 
            ...doc.data(),
            id: doc.id,
            className: doc.data().name,
            classDescription: doc.data().description,
          });
        })          
        setIsLoading(false);
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
        onRefresh={profile.classIds.length ? loadData : undefined}
        refreshing={isLoading}
      >
          {
            !profile.classIds.length? (
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
                    <ScheduleCard schedule={s} key={idx}/>
                  ))
                }
            </>              
              
            
          }
      </MEContainer>
  )
}