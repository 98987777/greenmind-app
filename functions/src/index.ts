import * as admin from "firebase-admin";
import * as logger from "firebase-functions/logger";
import {
  onDocumentWritten,
} from "firebase-functions/v2/firestore";

admin.initializeApp();
const db = admin.firestore();

/**
 * Step 1: Copy labels from labeledWaste → scanResults
 * Runs whenever a labeledWaste doc is created or updated.
 */
export const copyLabelsToScanResults = onDocumentWritten("labeledWaste/{docId}", async (event) => {
  const before = event.data?.before?.data();
  const after = event.data?.after?.data();
  if (!after) return;

  // Only act when labels were missing before but now exist
  if (!before?.labels && after.labels) {
    const labelsArray: string[] = after.labels || [];
    const labelsText = labelsArray.join(", ");

    const scanDocId = `${after.userId || "unknownUser"}_${after.imageId || Date.now()}`;

    await db.doc(`scanResults/${scanDocId}`).set(
      {
        userId: after.userId || "unknownUser",
        imageId: after.imageId,
        labels: labelsText,
        file: after.file,
        status: {
          state: "PENDING",
          startTime: admin.firestore.FieldValue.serverTimestamp(),
        },
      },
      { merge: true } // merge so we don’t overwrite other fields
    );

    logger.info("✅ Copied labels into scanResults", { scanDocId, labelsText });
  }
});

/**
 * Step 2: Mark scanResults READY when labels appear.
 */
export const markReadyForGemini = onDocumentWritten("scanResults/{docId}", async (event) => {
  const before = event.data?.before?.data();
  const after = event.data?.after?.data();
  if (!after) return;

  if (!before?.labels && after?.labels) {
    logger.info("✅ Labels added, marking READY:", event.params.docId);

    await db.doc(`scanResults/${event.params.docId}`).update({
      readyForGemini: true,
      status: {
        state: "READY",
        updated: admin.firestore.FieldValue.serverTimestamp(),
      },
    });
  }
});

/**
 * Step 3: Run Gemini AI analysis.
 */
export const runGeminiAnalysis = onDocumentWritten("scanResults/{docId}", async (event) => {
  const after = event.data?.after?.data();
  if (!after) return;

  // Only run when READY and no aiResult yet
  if (after.readyForGemini && !after.aiResult) {
    try {
      // 🔮 Replace this with real Gemini call later
      const aiResult = {
        name: "Loading...",   // remove this demo later
        type: "Loading...",
        biodegradability: "Loading...",
        carbonFootprint: "Loading...",
        recyclingSteps: ["Loading..."],
        co2Saved: 0,
        points: 0,
      };

      await db.doc(`scanResults/${event.params.docId}`).update({
        aiResult,
        status: {
          state: "COMPLETED",
          completeTime: admin.firestore.FieldValue.serverTimestamp(),
        },
      });

      logger.info("✅ Gemini analysis completed", { docId: event.params.docId });
    } catch (err: any) {
      logger.error("❌ Gemini analysis failed:", err);

      // Only write result if Gemini fails
      await db.doc(`scanResults/${event.params.docId}`).update({
        aiResult: {
          name: "Unknown",
          type: "Unknown",
          biodegradability: "—",
          carbonFootprint: "—",
          recyclingSteps: ["Could not analyze item. Please retry."],
          co2Saved: 0,
          points: 0,
        },
        status: {
          state: "FAILED",
          error: err?.message || "Gemini failed",
          completeTime: admin.firestore.FieldValue.serverTimestamp(),
        },
      });
    }
  }
});
