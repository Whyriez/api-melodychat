import axios from "axios";
import { Buffer } from "buffer";
import dotenv from "dotenv";

// Cache untuk menyimpan token
let tokenCache = {
  access_token: null,
  expires_at: null
};

export const getAccessToken = async () => {
  const currentTime = Date.now();
  
  // Periksa apakah token masih valid (dengan margin 60 detik)
  if (tokenCache.access_token && tokenCache.expires_at && currentTime < tokenCache.expires_at - 60000) {
    console.log("Using cached token");
    return { access_token: tokenCache.access_token };
  }
  
  // Jika tidak ada token atau token sudah kadaluarsa, minta token baru
  try {
    console.log("Requesting new token");
    const response = await axios.post(
      "https://accounts.spotify.com/api/token",
      new URLSearchParams({
        grant_type: "client_credentials",
      }).toString(),
      {
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
          Authorization: `Basic ${Buffer.from(
            `${process.env.CLIENT_ID}:${process.env.CLIENT_SECRET}`
          ).toString("base64")}`,
        },
      }
    );

    const { access_token, expires_in } = response.data;
    
    // Simpan token dan waktu kadaluarsa ke cache
    tokenCache = {
      access_token,
      expires_at: currentTime + (expires_in * 1000) // konversi expires_in (detik) ke milidetik
    };

    return {
      access_token,
    };
  } catch (error) {
    console.error(
      "Error getting access token:",
      error.response?.data || error.message
    );
    throw error;
  }
};