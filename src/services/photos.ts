import * as ImagePicker from "expo-image-picker";
import { Directory, File, Paths } from "expo-file-system";

export type CameraPermissionStatus = "granted" | "denied" | "blocked";

export async function ensureCameraPermission(): Promise<CameraPermissionStatus> {
  const initial = await ImagePicker.getCameraPermissionsAsync();

  if (initial.status === "granted") {
    return "granted";
  }

  if (!initial.canAskAgain) {
    return "blocked";
  }

  const requested = await ImagePicker.requestCameraPermissionsAsync();

  if (requested.status === "granted") {
    return "granted";
  }

  return requested.canAskAgain ? "denied" : "blocked";
}

export async function takePhoto(clientId: string): Promise<string | null> {
  const permission = await ensureCameraPermission();

  if (permission !== "granted") {
    return null;
  }

  const result = await ImagePicker.launchCameraAsync({
    allowsEditing: false,
    quality: 0.5,
    mediaTypes: ImagePicker.MediaTypeOptions.Images,
  });

  if (result.canceled || !result.assets?.[0]?.uri) {
    return null;
  }

  const directory = new Directory(Paths.document, "evidencias");

  if (!directory.exists) {
    directory.create();
  }

  const destination = new File(directory, `evidencia-${clientId}.jpg`);

  if (destination.exists) {
    destination.delete();
  }

  const source = new File(result.assets[0].uri);
  await source.copy(destination, { overwrite: true });

  return destination.uri;
}

export async function deletePhoto(uri: string | null): Promise<void> {
  if (!uri) {
    return;
  }

  try {
    const file = new File(uri);
    if (file.exists) {
      file.delete();
    }
  } catch {
    // Ignored: the photo may already be missing.
  }
}
