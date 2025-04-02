import { admin, db } from "../services/firebaseService.js";
import { v4 as uuidv4 } from "uuid";

// Create user and automatically create a header
export const createUser = async (req, res) => {
  try {
    const { email, password, name } = req.body;

    const existingUser = await admin.auth().getUserByEmail(email).catch(() => null);
    if (existingUser) {
      return res.status(400).json({ error: "Email is already in use" });
    }

    const existingHeader = await db.collection("headers").where("name", "==", name).get();
    if (!existingHeader.empty) {
      return res.status(400).json({ error: "Name is already taken" });
    }

    const userRecord = await admin.auth().createUser({ email, password, displayName: name });

    const headerId = uuidv4();
    const defaultHeader = {
      id: headerId,
      name,
      text: "Default Header",
      theme: "default",
      userId: userRecord.uid,
    };
    await db.collection("headers").doc(headerId).set(defaultHeader);

    res.status(201).json({
      userId: userRecord.uid,
      email: userRecord.email,
      name: userRecord.displayName,
      header: defaultHeader,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Get user details from Firebase Authentication using ID token
export const getUserDetails = async (req, res) => {
  try {
    const idToken = req.headers.authorization?.split(" ")[1];

    if (!idToken) {
      return res.status(400).json({ error: "ID token is required" });
    }

    const decodedToken = await admin.auth().verifyIdToken(idToken);
    const userRecord = await admin.auth().getUser(decodedToken.uid);

    res.status(200).json({
      userId: userRecord.uid,
      email: userRecord.email,
      name: userRecord.displayName,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
