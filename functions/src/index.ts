import * as admin from "firebase-admin";
import * as logger from "firebase-functions/logger";
import { onDocumentWritten } from "firebase-functions/v2/firestore";

admin.initializeApp();
const db = admin.firestore();

/**
 * Ensure Gemini only runs when labels exist.
 * This function runs whenever a scanResults doc is updated.
 */
export const markReadyForGemini = onDocumentWritten("scanResults/{docId}", async (event) => {
  const before = event.data?.before?.data();
  const after = event.data?.after?.data();

  // Only act when labels were missing before but exist now
  if (!before?.labels && after?.labels) {
    logger.info("Labels added, marking doc ready:", event.params.docId);

    await db.doc(`scanResults/${event.params.docId}`).update({
      readyForGemini: true,
      status: {
        state: "READY",
        updated: admin.firestore.FieldValue.serverTimestamp(),
      },
    });
  }
});
