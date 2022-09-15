import { View, Image } from 'react-native'
import React, { useState } from 'react';
import MEButton from './MEButton';
import * as ImagePicker from 'expo-image-picker';

export default function MEImagePicker({
  onChange,
  defaultImageUrl
}: {
  onChange?: Function,
  defaultImageUrl?: string
}) {
  const [image, setImage] = useState<string | any>(defaultImageUrl);

  const pickImage = async () => {
    // No permissions request is necessary for launching the image library
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 1,
    });

    if (!result.cancelled) {
      onChange && onChange(result.uri);
      setImage(result.uri);
    }
  };

  const openCamera = async () => {
    // Ask the user for the permission to access the camera
    const permissionResult = await ImagePicker.requestCameraPermissionsAsync();

    if (permissionResult.granted === false) {
      alert("You've refused to allow this appp to access your camera!");
      return;
    }

    const result = await ImagePicker.launchCameraAsync({
      allowsEditing: true,
      aspect: [1, 1],
    });

    if (!result.cancelled) {
      onChange && onChange(result.uri);
      setImage(result.uri);
    }
  }

  return (
    <>
      {
        image && (
          <Image 
            source={{ uri: image }} 
            style={{ 
              marginBottom: 16,
              width: 120, 
              height: 120,
              borderRadius: 400,
              alignSelf: 'center'
            }} 
          />
        )
      }
      <View style={{ flexDirection: 'row' }}>
        <View style={{ flex: 1 }}>
          <MEButton
            color='primary'
            size='lg'
            variant='outline'
            onPress={pickImage}
            iconStart='image'
          />
        </View>
        <View style={{ flex: 1, marginLeft: 16 }}>
          <MEButton
            color='primary'
            size='lg'
            variant='outline'
            iconStart='camera'
            onPress={openCamera}
          />
        </View>
      </View>
    </>
  )
}