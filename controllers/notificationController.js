
import { admin } from "../services/firebaseService.js";

export const sendNotification = async (req, res) => {
  const { token, title, body, data } = req.body;

  if (!token || !title || !body) {
    return res.status(400).json({ error: 'Token, title, dan body wajib diisi.' });
  }

  const message = {
    token,
    notification: { title, body },
    data: data || {}, // payload tambahan kalau ada
  };

  try {
    const response = await admin.messaging().send(message);
    return res.status(200).json({ success: true, messageId: response });
  } catch (error) {
    console.error('FCM send error:', error);
    return res.status(500).json({ success: false, error: error.message });
  }
};