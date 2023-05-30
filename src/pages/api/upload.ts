import type { NextApiRequest, NextApiResponse } from "next";
import { google, drive_v3 } from "googleapis";
import { accessTokens, clientId, clientSecret, redirectUri } from "@/pages/api/getVideos";
import { createReadStream } from "fs";
import path from "path";
import { remove } from "fs-extra";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const oauth2Client = new google.auth.OAuth2(clientId, clientSecret, redirectUri);
  oauth2Client.setCredentials({
    ...req.body.drive,
    access_token: accessTokens[req.body.drive.refresh_token],
  });
  const drive = google.drive({ version: "v3", auth: oauth2Client });
  const { folderId, fileName, filePath, deleteVideo } = req.body;
  const fileMetadata: drive_v3.Schema$File = {
    name: fileName,
    parents: [folderId],
  };
  const media = {
    mimeType: "video/mp4",
    body: createReadStream(filePath),
  };

  try {
    const response = await drive.files.create({
      requestBody: fileMetadata,
      media: media,
      fields: "id",
    });

    try {
      if (deleteVideo) {
        await remove(path.dirname(filePath));
      }
    } catch (e) {}

    res.status(200).json({ fileId: response.data.id });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to upload file" });
  }
}
