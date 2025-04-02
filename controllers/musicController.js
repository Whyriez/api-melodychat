import axios from "axios";
import {getAccessToken} from "../services/auth.js";

export const searchTrackMusic = async (req, res) => {
    try {
      const { q, type = 'track', limit = 20, offset = 0 } = req.query;
  
      if (!q) {
        return res.status(400).json({ error: "Query parameter 'q' is required." });
      }

      let token = await getAccessToken();
  
      const response = await axios.get('https://api.spotify.com/v1/search', {
        params: {
          q,
          type, 
          limit,
          offset
        },
        headers: {
          Authorization: `Bearer ${token.access_token}`,
        },
      });

      const tracks = response.data.tracks.items.map(track => ({
        id: track.id,
        name: track.name,
        artist: track.artists.map(artist => artist.name).join(', '),
        album: track.album.name,
        album_image: track.album.images[0]?.url,
        preview_url: `https://open.spotify.com/embed/track/${track.id}`,
        external_url: track.external_urls.spotify,
      }));
  
      res.status(200).json({ tracks });
    } catch (error) {
      console.error('Error searching tracks:', error);
      res.status(500).json({ error: error.message });
    }
  };
  