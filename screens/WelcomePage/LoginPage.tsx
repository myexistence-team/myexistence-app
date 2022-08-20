import { View, Text, KeyboardAvoidingView } from 'react-native'
import React from 'react'
import MEContainer from '../../components/MEContainer'
import MEHeader from '../../components/MEHeader'
import MEControlledTextInput from '../../components/MEControlledTextInput'
import { useForm } from 'react-hook-form'
import MEButton from '../../components/MEButton'
import { Formik } from 'formik'
import METextInput from '../../components/METextInput'
import { Auth, getAuth, signInWithEmailAndPassword, UserCredential } from 'firebase/auth'
import { app } from '../../firebase'
import { FirebaseError } from 'firebase/app'
import { useNavigation } from '@react-navigation/native'

const auth: Auth = getAuth(app);
export default function LoginPage(props: any) {
  const navigation = useNavigation();
  function onSubmit(data: any) {
    signInWithEmailAndPassword(auth, data.email, data.password)
      .then((user: UserCredential) => {
        navigation.navigate('Root');
      })
      .catch((error: FirebaseError) => {
        alert(error.message);
      })
  }
  return (
    <MEContainer>
      <MEHeader title='Masuk'/>
      <KeyboardAvoidingView
        behavior='padding'
      >
        <Formik
          onSubmit={onSubmit}
          initialValues={{
            email: '',
            password: '',
          }}
        > 
        {({ handleChange, handleBlur, handleSubmit, values }: any) => (
          <View>
            <METextInput
              name='email'
              onChangeText={handleChange('email')}
              onBlur={handleBlur('email')}
              value={values.email}
              autoCapitalize='none'
            />
            <METextInput
              name='password'
              onChangeText={handleChange('password')}
              onBlur={handleBlur('password')}
              value={values.password}
              autoCapitalize='none'
              secureTextEntry
            />
            <MEButton 
              size='lg' 
              variant='outline'
              onPress={handleSubmit}
            >
              Masuk
            </MEButton>
          </View>
        )}
        </Formik>
      </KeyboardAvoidingView>
    </MEContainer>
  )
}