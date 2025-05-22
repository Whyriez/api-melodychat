import { admin, db } from "../services/firebaseService.js";
import { v4 as uuidv4 } from "uuid";
import slugify from "slugify";
// Create user and automatically create a header
export const createUser = async (req, res) => {
  try {
    const { email, password, name } = req.body;

    // 1. Cek email
    const existingUser = await admin
      .auth()
      .getUserByEmail(email)
      .catch(() => null);
    if (existingUser) {
      return res.status(400).json({ error: "Email is already in use" });
    }

    // 2. Buat base username (tanpa strip)
    const baseName = slugify(name, { lower: true, strict: true });

    let finalName = baseName;

    // 3. Gunakan transaction untuk dapat username unik
    const usernameRef = db.collection("username_counters").doc(baseName);

    await db.runTransaction(async (t) => {
      const doc = await t.get(usernameRef);
      if (!doc.exists) {
        // Kalau belum dipakai, langsung pakai baseName
        t.set(usernameRef, { count: 1 });
      } else {
        const count = doc.data().count || 1;
        finalName = `${baseName}${count}`;
        t.update(usernameRef, { count: count + 1 });
      }
    });

    // 4. Simpan ke koleksi username untuk referensi
    const usernameDocRef = db.collection("usernames").doc(finalName);
    await usernameDocRef.set({ reserved: true, createdAt: new Date() });

    // 5. Buat user di Firebase
    const userRecord = await admin.auth().createUser({
      email,
      password,
      displayName: finalName,
    });

    // 6. Update dokumen username
    await usernameDocRef.update({ userId: userRecord.uid });

    // 7. Buat default header
    const headerId = uuidv4();
    const defaultHeader = {
      id: headerId,
      name: finalName,
      text: "Hallo",
      theme: "default",
      userId: userRecord.uid,
      token: "",
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    await db.collection("headers").doc(headerId).set(defaultHeader);

    // 8. Response
    res.status(201).json({
      message: "User Created Successfuly",
      success: true,
      userId: userRecord.uid,
      email: userRecord.email,
      name: finalName,
      header: defaultHeader,
    });
  } catch (error) {
    console.error("Error creating user:", error);
    res.status(500).json({ message: error.message, success: false });
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
