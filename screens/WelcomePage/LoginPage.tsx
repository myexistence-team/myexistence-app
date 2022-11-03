import { View, Text, KeyboardAvoidingView } from 'react-native'
import React, { useState } from 'react'
import MEContainer from '../../components/MEContainer'
import MEHeader from '../../components/MEHeader'
import MEControlledTextInput from '../../components/MEControlledTextInput'
import { useForm } from 'react-hook-form'
import MEButton from '../../components/MEButton'
import METextInput from '../../components/METextInput'
import { Auth, getAuth, signInWithEmailAndPassword, UserCredential } from 'firebase/auth'
import { app } from '../../firebase'
import { FirebaseError } from 'firebase/app'
import { useNavigation } from '@react-navigation/native'
import { yupResolver } from '@hookform/resolvers/yup';
import { object, string } from 'yup'
import { RootStackParamList, RootTabScreenProps } from '../../navTypes'
import { signIn } from '../../actions/authActions'

export default function LoginPage(props: any) {
  const [isSubmitting, setIsSubmitting] = useState(false);

  const loginSchema = object().shape({
    email: string().email().required().strict(),
    password: string().required().strict(),
  })
  const { control, handleSubmit } = useForm({
    resolver: yupResolver(loginSchema)
  })

  function onSubmit(data: any) {
    setIsSubmitting(true);
    signIn(data.email, data.password)
      // .then((user: UserCredential) => {
      //   navigation.navigate('Root')
      // })
      .catch((error: FirebaseError) => {
        alert(error.message);
        setIsSubmitting(false);
      })
  }
  return (
    <MEContainer>
      <MEHeader title='Masuk'/>
      <KeyboardAvoidingView
        behavior='padding'
      >
        <View>
          <MEControlledTextInput
            name='email'
            control={control}
            autoCapitalize='none'
            autoComplete='email'
            keyboardType='email-address'
          />
          <MEControlledTextInput
            control={control}
            name='password'
            autoCapitalize='none'
            secureTextEntry
          />
          <MEButton 
            size='lg' 
            // variant='outline'
            isLoading={isSubmitting} 
            onPress={handleSubmit(onSubmit)}
          >
            Masuk
          </MEButton>
        </View>
      </KeyboardAvoidingView>
    </MEContainer>
  )
}