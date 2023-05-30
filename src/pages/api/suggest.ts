import type { NextApiRequest, NextApiResponse } from "next";
import { google } from "googleapis";
import { accessTokens, clientId, clientSecret, redirectUri } from "@/pages/api/getVideos";
import { getDriveFiles } from "@/utility/utils";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const oauth2Client = new google.auth.OAuth2(clientId, clientSecret, redirectUri);
  oauth2Client.setCredentials({
    ...req.body.drive,
    access_token: accessTokens[req.body.drive.refresh_token],
  });
  const drive = google.drive({ version: "v3", auth: oauth2Client });
  const { folderId, saveAt, origin } = req.body;
  const files = await getDriveFiles(drive, folderId);

  console.log("files", files);

  res.status(200).json({
    data: origin,
  });
}
