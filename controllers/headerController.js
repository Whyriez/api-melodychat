import { db } from "../services/firebaseService.js";
import { v4 as uuidv4 } from "uuid";

// Insert header
export const insertHeader = async (req, res) => {
  try {
    const { name, text, theme, userId } = req.body;
    const id = uuidv4();
    await db
      .collection("headers")
      .doc(id)
      .set({ id, name, text, theme, userId });
    res.status(201).json({ id, name, text, theme, userId });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Update header
export const updateHeader = async (req, res) => {
  try {
    const { name } = req.params;
    const { text, theme } = req.body;

    const headerSnapshot = await db
      .collection("headers")
      .where("name", "==", name)
      .get();
    if (headerSnapshot.empty) {
      return res.status(404).json({ error: "Header not found" });
    }

    const headerDoc = headerSnapshot.docs[0];
    const headerData = headerDoc.data();

    await db
      .collection("headers")
      .doc(headerDoc.id)
      .update({
        text: text || headerData.text,
        theme: theme || headerData.theme,
      });

    const updatedHeader = {
      ...headerData,
      text: text || headerData.text,
      theme: theme || headerData.theme,
    };
    res.status(200).json({
      message: "Updated Successfuly",
      success: true,
      data: updatedHeader,
    });
  } catch (error) {
    res.status(500).json({
      message: error.message,
      status: false,
    });
  }
};

// Get header by name
export const getHeaderByName = async (req, res) => {
  try {
    const { name } = req.params;

    const snapshot = await db
      .collection("headers")
      .where("name", "==", name)
      .limit(1)
      .get();

    if (snapshot.empty) {
      return res.status(404).json({ error: "Header not found" });
    }

    const header = snapshot.docs[0].data();
    res.status(200).json({
      message: "Fetch Successfuly",
      success: true,
      data: header,
    });
  } catch (error) {
    res.status(500).json({
      message: error.message,
      status: false,
    });
  }
};

export const headersWithMessages = async (req, res) => {
  try {
    const { name } = req.params;
    const { page = 1, limit = 10, lastVisible } = req.query;

    // Ambil header berdasarkan 'name'
    const headerSnapshot = await db
      .collection("headers")
      .where("name", "==", name)
      .get();

    if (headerSnapshot.empty) {
      return res.status(404).json({ error: "Header not found" });
    }

    const headerData = {
      id: headerSnapshot.docs[0].id,
      ...headerSnapshot.docs[0].data(),
    };

    let query = db
      .collection("messages")
      .where("headerId", "==", headerData.id)
      .orderBy("createdAt");

    // Gunakan startAfter() untuk pagination Firestore
    if (lastVisible) {
      const lastDocSnapshot = await db
        .collection("messages")
        .doc(lastVisible)
        .get();
      if (lastDocSnapshot.exists) {
        query = query.startAfter(lastDocSnapshot);
      } else {
        console.log(`Document with ID ${lastVisible} does not exist`);
      }
    }

    // Terapkan limit setelah kondisi pagination
    query = query.limit(parseInt(limit));

    const messageSnapshot = await query.get();

    // Debug info
    console.log(`Found ${messageSnapshot.docs.length} messages`);

    const messages = messageSnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));

    // Cek apakah masih ada halaman berikutnya
    const hasNextPage = messages.length === parseInt(limit);
    const nextPageCursor =
      hasNextPage && messages.length > 0
        ? messages[messages.length - 1].id
        : null;

    res.status(200).json({
      header: headerData,
      messages,
      pagination: {
        currentPage: parseInt(page),
        hasNextPage,
        nextPageCursor,
      },
    });
  } catch (error) {
    console.error("Error in headersWithMessages:", error);
    res.status(500).json({ error: error.message });
  }
};

export const updateFcmToken = async (req, res) => {
  try {
    const { userId, token } = req.body;

    if (!userId || !token) {
      return res.status(400).json({ error: "userId dan token wajib diisi." });
    }

    // Cari header berdasarkan userId
    const headerQuery = await db
      .collection("headers")
      .where("userId", "==", userId)
      .limit(1)
      .get();

    if (headerQuery.empty) {
      return res.status(404).json({ error: "Header untuk user tidak ditemukan." });
    }

    const headerDoc = headerQuery.docs[0];

    // Update token
    await headerDoc.ref.update({
      token: token,
      updatedAt: new Date(),
    });

    res.status(200).json({
      success: true,
      message: "FCM token berhasil diperbarui.",
    });
  } catch (err) {
    console.error("Gagal update token:", err);
    res.status(500).json({ success: false, error: err.message });
  }
};
