import { View, Text } from 'react-native'
import React, { useContext, useState } from 'react'
import { AuthContext, ProfileContext } from '../../contexts'
import { textStyles } from '../../constants/Styles';
import MEContainer from '../../components/MEContainer';
import MEFirestoreSelect from '../../components/MEFirestoreSelect';
import { useForm } from 'react-hook-form';
import MEButton from '../../components/MEButton';
import { signOut, signUpFromGoogle } from '../../actions/authActions';
import { object, string } from 'yup';
import { yupResolver } from '@hookform/resolvers/yup';
import { FirestoreError } from 'firebase/firestore';

export default function RegisterAccount() {
  const { auth } = useContext(AuthContext);
  const { setProfile } = useContext(ProfileContext);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const registerSchema = object().shape({
    schoolId: string().required().strict()
  })
  const { control, watch, handleSubmit } = useForm({
    resolver: yupResolver(registerSchema)
  });

  function onSubmit(data: any) {
    setIsSubmitting(true)
    signUpFromGoogle(auth, data.schoolId)
      .then((profile) => {
        setProfile(profile);
      })
      .catch((e: FirestoreError) => {
        alert(e.message)
      })
      .finally(() => {
        setIsSubmitting(false)
      })
  }

  return (
    <MEContainer>
      <Text style={[textStyles.heading3, { marginBottom: 8, marginTop: 64 }]}>Anda belum terdaftar</Text>
      <Text style={[textStyles.body2]}>Sepertinya Anda belum daftar. Silahkan pilih sekolah Anda.</Text>
      <MEFirestoreSelect
        control={control}
        name='schoolId'
        listName='schools'
        singularName='school'
        label={false}
      />
      <MEButton
        size='lg'
        isLoading={isSubmitting}
        onPress={handleSubmit(onSubmit)}
      >
        Daftar
      </MEButton>
      <MEButton
        color='danger'
        variant='outline'
        style={{
          marginTop: 16
        }}
        onPress={() => signOut()}
      >
        Batal
      </MEButton>
    </MEContainer>
  )
}