import { Timestamp } from "firebase-admin/firestore";
import { db } from "../services/firebaseService.js";
import { v4 as uuidv4 } from "uuid";

// Insert message with createdAt
export const insertMessage = async (req, res) => {
  try {
    const { headerId, musicId, message, canReply, senderId } = req.body;
    const id = uuidv4();
    const createdAt = Timestamp.now(); // Gunakan Timestamp dari Firestore Admin SDK
    const isRead = false;

    await db.collection("messages").doc(id).set({
      id,
      headerId,
      musicId,
      message,
      canReply,
      isRead,
      senderId,
      createdAt,
    });

    res.status(201).json({ id, headerId, message, createdAt });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const markMessageAsRead = async (req, res) => {
  try {
    const { messageId } = req.params;

    const messageRef = db.collection("messages").doc(messageId);


    await messageRef.update({
      isRead: true,
    });

    res.status(200).json({ message: `Message ${messageId} marked as read.` });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Get messages by header ID with paging
export const getMessagesByHeader = async (req, res) => {
  try {
    const { headerId } = req.params;
    const { page = 1, limit = 10 } = req.query;

    const offset = (page - 1) * limit;

    const snapshot = await db
      .collection("messages")
      .where("headerId", "==", headerId)
      .orderBy("createdAt")
      .offset(offset)
      .limit(parseInt(limit))
      .get();

    if (snapshot.empty) {
      return res
        .status(404)
        .json({ error: "No messages found for this header" });
    }

    const messages = snapshot.docs.map((doc) => doc.data());

    const hasNextPage = snapshot.docs.length === parseInt(limit);
    res.status(200).json({
      messages,
      pagination: {
        currentPage: parseInt(page),
        hasNextPage,
        nextPage: hasNextPage ? parseInt(page) + 1 : null,
      },
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const deleteMessage = async (req, res) => {
  try {
    const { messageId } = req.params;

    const messageRef = db.collection("messages").doc(messageId);

    const doc = await messageRef.get();
    if (!doc.exists) {
      return res.status(404).json({ error: `Message ${messageId} not found.` });
    }

    await messageRef.delete();

    res.status(200).json({ message: `Message ${messageId} has been deleted.` });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
