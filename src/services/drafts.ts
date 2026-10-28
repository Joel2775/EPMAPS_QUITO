import type { SQLiteDatabase } from "expo-sqlite";

import { getReadingByClientId } from "@/db/readings";
import { deletePhoto } from "@/services/photos";
import { useDraftStore } from "@/store/draft";

export async function discardDraft(db: SQLiteDatabase): Promise<void> {
  const { photoUri, editingClientId, clearDraft } = useDraftStore.getState();

  if (editingClientId) {
    const original = await getReadingByClientId(db, editingClientId);

    if (photoUri && photoUri !== original?.photoUri) {
      await deletePhoto(photoUri);
    }
  } else if (photoUri) {
    await deletePhoto(photoUri);
  }

  clearDraft();
}
