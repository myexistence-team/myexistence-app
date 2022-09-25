import { View, Text, Alert } from 'react-native'
import React, { useContext, useState } from 'react'
import MEContainer from '../../components/MEContainer'
import { useForm } from 'react-hook-form'
import { object, string } from 'yup'
import { yupResolver } from '@hookform/resolvers/yup'
import MEHeader from '../../components/MEHeader'
import MEControlledSelect from '../../components/MEControlledSelect'
import MEControlledTextInput from '../../components/MEControlledTextInput'
import { textStyles } from '../../constants/Styles'
import MEImagePicker from '../../components/MEImagePicker'
import Colors from '../../constants/Colors'
import MEButton from '../../components/MEButton'
import { createExcuseRequest } from '../../actions/scheduleActions'
import { AuthContext, SchoolContext } from '../../contexts'
import { RootStackScreenProps } from '../../navTypes'
import { useNavigation } from '@react-navigation/native'

export default function ExcusePage({
  route: {
    params: {
      classId,
      scheduleId
    }
  }
}: RootStackScreenProps<'ExcusePage'>) {
  const excuseSchema = object().shape({
    type: string().oneOf(['SICK', 'OTHER']).required().strict(),
    message: string().required().strict(),
    proofUri: string().required().strict()
  })
  const { control, handleSubmit, setValue, formState: { errors } } = useForm({
    resolver: yupResolver(excuseSchema)
  });

  const [isSubmitting, setIsSubmitting] = useState(false);

  const navigaton = useNavigation();
  const { auth } = useContext(AuthContext);
  const { school } = useContext(SchoolContext);
  function onSubmit(data: any) {
    setIsSubmitting(true);
    createExcuseRequest(
      auth.uid,
      school.id,
      classId,
      scheduleId,
      data
    ).then(() => {
      Alert.alert(
        'Sukses!',
        'Permintaan izin Anda sudah disimpan. Mohon tunggu jawaban dari pengajar.',
        [
          {
            text: 'OK',
            onPress: () => {
              navigaton.goBack();
            }
          }
        ]
      )
    })
    .finally(() => {
      setIsSubmitting(false);
    })
  }

  return (
    <MEContainer>
      <MEHeader
        title='Izin Kelas'
      />
      <MEControlledSelect
        control={control}
        name='type'
        label='Tipe'
        options={[
          { value: 'SICK', label: 'Sakit' },
          { value: 'OTHER', label: 'Lainnya' },
        ]}
      />
      <MEControlledTextInput
        control={control}
        name='message'
        multiline={true}
        numberOfLines={4}
        label='Pesan'
      />
      <Text 
        style={[
          textStyles.body1,
          { marginBottom: 8 }
        ]}
      >
        Bukti
      </Text>
      <MEImagePicker
        onChange={(uri: string) => setValue('proofUri', uri)}
        aspectRatio={[3, 4]}
        fullPreview={true}
      />
      {
        errors.proofUri && (
          <Text style={[textStyles.body2, { color: Colors.light.red }]}>
            {errors['proofUri'].message}
          </Text>
        )
      }
      <MEButton
        size='lg' 
        style={{
          marginTop: 16
        }}
        isLoading={isSubmitting} 
        onPress={handleSubmit(onSubmit)}
      >
        Simpan Permintaan Izin
      </MEButton>
    </MEContainer>
  )
}