import { addDoc, collection } from 'firebase/firestore';
import { db } from './firebaseConfig';

type Location = {
  latitude: number;
  longitude: number;
};

export const savePhotoUriAndLocationToFirestore = async (
  photoUri: string,
  location: Location
): Promise<void> => {
  try {
    await addDoc(collection(db, 'photos'), {
      photo_uri: photoUri,
      latitude: location.latitude,
      longitude: location.longitude,
      timestamp: new Date(),
    });

    console.log('Photo URI and location saved to Firestore successfully.');
  } catch (error) {
    console.error('Error saving to Firestore:', error);
    throw error;
  }
};
