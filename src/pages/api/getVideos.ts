import { NextApiRequest, NextApiResponse } from "next";
import * as fs from "fs";
import path from "path";
import * as os from "os";
import { google } from "googleapis";

const clientId = "636038632941-rrlqtq7h3gp8l4ipu64d8pnunhpqrr8q.apps.googleusercontent.com";
const clientSecret = "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";
const redirectUri = "http://localhost:3000";

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  const oauth2Client = new google.auth.OAuth2(clientId, clientSecret, redirectUri);
  oauth2Client.setCredentials({
    ...req.body.drive,
  });
  // your oauth method, see documentation

  const drive = google.drive({ version: "v3", auth: oauth2Client });

  drive.files.list(
    {
      q: `'${req.body.folderId}' in parents`,
    },
    (err, data) => {
      if (err) throw err;
      console.log("your files", data?.data);
    },
  );

  let videoDir = path.join(os.homedir(), "OneDrive", req.body.zoomFolder);
  if (!fs.existsSync(videoDir)) {
    videoDir = path.join(os.homedir(), req.body.zoomFolder);
  }

  const videoFiles = getAllFilesRecursive(videoDir)
    .filter((v) => v.endsWith(".mp4"))
    .map((v) => {
      const dirName = path.dirname(v).split(path.sep).pop();
      const dateInfo = dirName!.split(" ");
      const date = dateInfo.shift() as string;
      const time = (dateInfo.shift() as string).split(".").join(":");
      const keywords = dateInfo.join(" ");

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

  res.status(200).json({
    files: videoFiles,
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
