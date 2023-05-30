import type { NextApiRequest, NextApiResponse } from "next";
import { google, drive_v3 } from "googleapis";
import { clientId, clientSecret, redirectUri } from "@/pages/api/getVideos";
import { createReadStream } from "fs";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const oauth2Client = new google.auth.OAuth2(clientId, clientSecret, redirectUri);
  oauth2Client.setCredentials({
    ...req.body.drive,
  });
  const drive = google.drive({ version: "v3", auth: oauth2Client });
  const { folderId, fileName, filePath } = req.body;
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
    res.status(200).json({ fileId: response.data.id });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to upload file" });
  }

  res.status(200).json({ name: "John Doe" });
}
