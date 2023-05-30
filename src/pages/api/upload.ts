import type { NextApiRequest, NextApiResponse } from "next";
import { google } from "googleapis";
import { clientId, clientSecret, redirectUri } from "@/pages/api/getVideos";

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  const oauth2Client = new google.auth.OAuth2(clientId, clientSecret, redirectUri);
  oauth2Client.setCredentials({
    ...req.body.drive,
  });
  const drive = google.drive({ version: "v3", auth: oauth2Client });
  res.status(200).json({ name: "John Doe" });
}
