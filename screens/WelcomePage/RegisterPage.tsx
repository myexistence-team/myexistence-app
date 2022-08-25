import { View, Text, KeyboardAvoidingView, FlatList } from 'react-native'
import React, { useState } from 'react'
import MEContainer from '../../components/MEContainer';
import MEHeader from '../../components/MEHeader';
import { object, string } from 'yup';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import MEControlledTextInput from '../../components/MEControlledTextInput';
import MEButton from '../../components/MEButton';
import { FirebaseError } from 'firebase/app';
import MEControlledSelect from '../../components/MEControlledSelect';
import MEFirestoreSelect from '../../components/MEFirestoreSelect';
import { signUp } from '../../actions/authActions';

export default function RegisterPage(props: {
  role: "TEACHER" | "STUDENT"
}) {
  const {
    role
  } = props;

  const [isSubmitting, setIsSubmitting] = useState(false);

  const registerSchema = object().shape({
    displayName: string().required().strict(),
    email: string().email().required().strict(),
    password: string().required().strict(),
    repassword: string().required().strict(),
    role: string().required().strict(),
    schoolId: string().required().strict(),
  })
  const { control, handleSubmit, watch } = useForm({
    resolver: yupResolver(registerSchema)
  })

  function onSubmit(data: any) {
    console.log(data);
    setIsSubmitting(true);
    signUp(data)
      .catch((error: FirebaseError) => {
        alert(error.message);
      })
      .finally(() => {
        setIsSubmitting(false);
      })
  }

  return (
    <MEContainer>
      <MEHeader title='Daftar'/>
      <KeyboardAvoidingView
        behavior='padding'
      >
        <View>
          <MEControlledSelect
            control={control}
            name='role'
            options={[
              { value: 'TEACHER', label: 'Pengajar' },
              { value: 'STUDENT', label: 'Pelajar' },
            ]}
            label='Daftar Sebagai'
          />
          <MEFirestoreSelect
            control={control}
            name='schoolId'
            listName='schools'
            singularName='school'
            label='Pilih Sekolah'
          />
          <MEControlledTextInput
            name='displayName'
            label='Nama'
            control={control}
          />
          <MEControlledTextInput
            name='email'
            control={control}
            autoCapitalize='none'
          />
          <MEControlledTextInput
            control={control}
            name='password'
            autoCapitalize='none'
            secureTextEntry
          />
          <MEControlledTextInput
            control={control}
            label='Ketik Ulang Password'
            name='repassword'
            autoCapitalize='none'
            secureTextEntry
          />
          <MEButton 
            size='lg' 
            // disabled={watch("password") !== watch("repassword")}
            isLoading={isSubmitting} 
            onPress={handleSubmit(onSubmit)}
          >
            Daftar
          </MEButton>
        </View>
      </KeyboardAvoidingView>
    </MEContainer>
  )
}