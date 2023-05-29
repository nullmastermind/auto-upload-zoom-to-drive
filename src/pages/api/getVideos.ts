import { NextApiRequest, NextApiResponse } from "next";
import * as fs from "fs";
import path from "path";
import * as os from "os";

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  let videoDir = path.join(os.homedir(), "OneDrive", "Documents", "Zoom");
  if (!fs.existsSync(videoDir)) {
    videoDir = path.join(os.homedir(), "Documents", "Zoom");
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
