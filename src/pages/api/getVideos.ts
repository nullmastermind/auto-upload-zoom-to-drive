import { NextApiRequest, NextApiResponse } from "next";
import * as fs from "fs";
import path from "path";
import * as os from "os";
import { google } from "googleapis";
import { getDriveFiles, isAccessTokenExpired, refreshAccessToken, refreshToken } from "@/utility/utils";

export const clientId = "636038632941-rrlqtq7h3gp8l4ipu64d8pnunhpqrr8q.apps.googleusercontent.com";
export const clientSecret = "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";
export const redirectUri = "http://localhost:3000";
export const accessTokens: Record<string, string> = {};

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const token = await refreshToken(req.body.drive.refresh_token);

  accessTokens[req.body.drive.refresh_token] = req.body.drive.access_token;

  if (token?.data?.access_token) {
    accessTokens[req.body.drive.refresh_token] = token?.data?.access_token;
  }

  const oauth2Client = new google.auth.OAuth2(clientId, clientSecret, redirectUri);
  oauth2Client.setCredentials({
    ...req.body.drive,
    access_token: accessTokens[req.body.drive.refresh_token],
  });

  if (isAccessTokenExpired(oauth2Client)) {
    await refreshAccessToken(oauth2Client);
  }

  const drive = google.drive({ version: "v3", auth: oauth2Client });

  let videoDir = path.join(os.homedir(), "OneDrive", req.body.zoomFolder);
  if (!fs.existsSync(videoDir)) {
    videoDir = path.join(os.homedir(), req.body.zoomFolder);
  }

  const videoFiles = getAllFilesRecursive(videoDir)
    .filter((v) => v.endsWith(".mp4"))
    .map((v) => {
      const dirName = path.dirname(v).split(path.sep).pop() as string;
      const dateInfo = dirName!.split(" ");
      const date = dateInfo.shift() as string;
      const time = (dateInfo.shift() as string).split(".").join(":");
      const keywords = [dateInfo.join(" ").trim()];
      const chatFile = path.join(videoDir, dirName, "chat.txt");

      if (fs.existsSync(chatFile)) {
        fs.readFileSync(chatFile, "utf-8")
          .split("\n")
          .map((v) => v.trim())
          .filter((v) => v.length > 0)
          .forEach((line) => {
            const phone = line.split(":").pop();
            if (phone && phone.trim().length > 0) {
              keywords.push(phone.trim());
            }
          });
      }

      keywords.sort((a, b) => {
        return b.length - a.length;
      });

      return {
        fullPath: v,
        fileName: path.basename(v),
        dirName,
        date,
        time,
        keywords,
        saveAt: new Date(`${date} ${time}`),
      };
    });

  videoFiles.sort((a, b) => {
    return a.saveAt.getTime() - b.saveAt.getTime();
  });

  res.status(200).json({
    files: videoFiles,
    driveFolders: (await getDriveFiles(drive, req.body.folderId)).filter(
      (v) => v.mimeType === "application/vnd.google-apps.folder",
    ),
  });
}

function getAllFilesRecursive(dirPath: string, arrayOfFiles: string[] = []): string[] {
  const files = fs.readdirSync(dirPath);

  files.forEach((file) => {
    const filePath = path.join(dirPath, file);
    if (fs.statSync(filePath).isDirectory()) {
      arrayOfFiles = getAllFilesRecursive(filePath, arrayOfFiles);
    } else {
      arrayOfFiles.push(filePath);
    }
  });

  return arrayOfFiles;
}
