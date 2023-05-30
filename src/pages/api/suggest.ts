import type { NextApiRequest, NextApiResponse } from "next";
import { google } from "googleapis";
import { accessTokens, clientId, clientSecret, redirectUri } from "@/pages/api/getVideos";
import { getDriveFiles, isAccessTokenExpired, refreshAccessToken } from "@/utility/utils";
import { forEach } from "lodash";
import moment from "moment/moment";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const oauth2Client = new google.auth.OAuth2(clientId, clientSecret, redirectUri);
  oauth2Client.setCredentials({
    ...req.body.drive,
    access_token: accessTokens[req.body.drive.refresh_token],
  });
  if (isAccessTokenExpired(oauth2Client)) {
    await refreshAccessToken(oauth2Client);
  }
  const drive = google.drive({ version: "v3", auth: oauth2Client });
  const { folderId, saveAt, fileNames } = req.body;
  const files = await getDriveFiles(drive, folderId);
  let maxId = 0;

  const handleFileName = (fileName: string) => {
    const fileNameArr = fileName.split(" ");
    if (fileNameArr.length && fileNameArr[0].startsWith("b")) {
      const num = fileNameArr[0].replace("b", "");
      if (+num + "" === num && +num > maxId) {
        maxId = +num;
      }
    }
  };

  forEach(files, (file) => {
    handleFileName(file.name.toLowerCase().trim());
  });
  forEach(fileNames, (fileName: string) => {
    handleFileName(fileName.toLowerCase().trim());
  });

  res.status(200).json({
    data: `B${maxId + 1} ${moment(saveAt).format("DD/MM")}`,
  });
}
