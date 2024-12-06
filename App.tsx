import React, { useState, useEffect } from 'react';
import { StyleSheet, Text, View, Button, Alert, Image } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import * as MediaLibrary from 'expo-media-library';
import * as Location from 'expo-location';
import * as Notifications from 'expo-notifications';
import { savePhotoUriAndLocationToFirestore } from './firestoreFunctions';
import { StatusBar } from 'expo-status-bar';

interface LocationData {
  latitude: number;
  longitude: number;
}

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
  }),
});

async function sendPushNotification(expoPushToken: string, title: string, body: string) {
  const message = {
    to: expoPushToken,
    sound: 'default',
    title,
    body,
    data: { title, body },
  };

  await fetch('https://exp.host/--/api/v2/push/send', {
    method: 'POST',
    headers: {
      Accept: 'application/json',
      'Accept-encoding': 'gzip, deflate',
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(message),
  });
}

const App: React.FC = () => {
  const [uri, setUri] = useState<string>('');
  const [location, setLocation] = useState<LocationData | null>(null);
  const [expoPushToken, setExpoPushToken] = useState<string>('');

  useEffect(() => {
    const registerForPushNotifications = async () => {
      const { status } = await Notifications.getPermissionsAsync();
      if (status !== 'granted') {
        await Notifications.requestPermissionsAsync();
      }
      const tokenData = await Notifications.getExpoPushTokenAsync();
      setExpoPushToken(tokenData.data);
    };

    registerForPushNotifications();
  }, []);

  const handleCameraLaunch = async () => {
    const cameraPermission = await ImagePicker.requestCameraPermissionsAsync();
    if (!cameraPermission.granted) {
      Alert.alert('Permission required', 'Camera access is needed to take photos.');
      return;
    }

    const result = await ImagePicker.launchCameraAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      quality: 1,
    });

    if (!result.canceled) {
      setUri(result.assets[0].uri);
    }
  };

  const openImagePicker = async () => {
    const galleryPermission = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!galleryPermission.granted) {
      Alert.alert('Permission required', 'Gallery access is needed to select photos.');
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      quality: 1,
    });

    if (!result.canceled) {
      setUri(result.assets[0].uri);
    }
  };

  const saveToLocalAndFirestore = async (): Promise<void> => {
    if (!uri) {
      Alert.alert('No image selected', 'Please capture or select an image first.');
      return;
    }

    const mediaLibraryPermission = await MediaLibrary.requestPermissionsAsync();
    if (!mediaLibraryPermission.granted) {
      Alert.alert('Permission required', 'You need to enable permission to save images to the gallery.');
      return;
    }

    try {
      const asset = await MediaLibrary.createAssetAsync(uri);

      const locationPermission = await Location.requestForegroundPermissionsAsync();
      if (!locationPermission.granted) {
        Alert.alert('Permission Denied', 'Location access is required.');
        return;
      }

      const currentLocation = await Location.getCurrentPositionAsync({});
      const locationData: LocationData = {
        latitude: currentLocation.coords.latitude,
        longitude: currentLocation.coords.longitude,
      };
      setLocation(locationData);

      await savePhotoUriAndLocationToFirestore(asset.uri, locationData);
      Alert.alert('Success', 'Image and location saved to Firestore and device.');

      // Kirim notifikasi sukses
      const successMessage = `Data saved successfully. Latitude: ${locationData.latitude}, Longitude: ${locationData.longitude}`;
      await sendPushNotification(
        expoPushToken,
        'Data Saved Successfully',
        successMessage
      );
    } catch (error) {
      console.error('Error saving data:', error);
      Alert.alert('Error', 'Failed to save data.');

      // Kirim notifikasi gagal
      const failMessage = 'Failed to save image and location.';
      await sendPushNotification(
        expoPushToken,
        'Data Save Failed',
        failMessage
      );
    }
  };

  return (
    <View style={styles.container}>
      <Text>Nayla Mutiara Salsabila Bastari - 00000075205</Text>
      <Button title="Open Camera" onPress={handleCameraLaunch} color="#1E90FF" />
      <Button title="Open Gallery" onPress={openImagePicker} color="#1E90FF" />

      {uri ? (
        <>
          <Image source={{ uri }} style={styles.image} />
          <Button title="Save to Local and Firestore" onPress={saveToLocalAndFirestore} color="#1E90FF" />
        </>
      ) : (
        <Text>No image selected</Text>
      )}

      {location && (
        <Text>
          Location: {location.latitude}, {location.longitude}
        </Text>
      )}

      <StatusBar style="auto" />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#fff',
  },
  image: {
    width: 200,
    height: 200,
    marginTop: 20,
    borderRadius: 10,
  },
});

export default App;
