import { View, Text, KeyboardAvoidingView } from 'react-native'
import React, { useContext, useState } from 'react'
import MEContainer from '../../components/MEContainer'
import { useForm } from 'react-hook-form'
import { object, string } from 'yup'
import { AuthContext, ProfileContext } from '../../contexts'
import { yupResolver } from '@hookform/resolvers/yup'
import MEControlledTextInput from '../../components/MEControlledTextInput'
import MEHeader from '../../components/MEHeader'
import MEButton from '../../components/MEButton'
import { textStyles } from '../../constants/Styles'
import { updateProfile } from '../../actions/profileActions'
import { useNavigation } from '@react-navigation/native'
import MEImagePicker from '../../components/MEImagePicker'

export default function EditProfile() {
  const { profile } = useContext(ProfileContext);
  const { auth } = useContext(AuthContext);
  const navigation = useNavigation();
  const [photoUri, setPhotoUri] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);

  const profileSchema = object().shape({
    displayName: string().required().strict(),
    description: string().required().strict(),
  })
  const { control, handleSubmit, formState: {errors} } = useForm({
    resolver: yupResolver(profileSchema),
    defaultValues: {
      displayName: profile.displayName,
      description: profile.description,
      role: profile.role,
      photoUrl: profile.photoUrl,
    }
  });

  function onSubmit(data: any) {
    setIsLoading(true);
    updateProfile(auth.uid, data, photoUri)
      .then(() => {
        navigation.goBack();
      })
      .finally(() => {
        setIsLoading(false);
      })
  }

  return (
    <MEContainer>
      <KeyboardAvoidingView
        behavior='position'
      >
        <MEHeader
          title='Edit Profil'
        />
        <Text 
          style={[
            textStyles.body1,
          ]}
        >
          Foto Profil
        </Text>
        <View
          style={{
            marginTop: 4,
            marginBottom: 16,
          }}
        >
          <MEImagePicker
            defaultImageUrl={profile.photoUrl}
            onChange={setPhotoUri}
          />
        </View>
        <MEControlledTextInput
          control={control}
          name='displayName'
          label='Nama'
        />
        <MEControlledTextInput
          control={control}
          name='description'
          label='Deskripsi'
          multiline={true}
          numberOfLines={4}
        />
        <MEButton
          color='primary'
          size='lg'
          variant='contained'
          onPress={handleSubmit(onSubmit)}
          isLoading={isLoading}
        >
          Simpan
        </MEButton>
      </KeyboardAvoidingView>
    </MEContainer>
  )
}