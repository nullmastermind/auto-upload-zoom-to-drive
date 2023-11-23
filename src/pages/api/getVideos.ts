import { NextApiRequest, NextApiResponse } from "next";
import * as fs from "fs";
import path from "path";
import * as os from "os";
import moment from "moment";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  let videoDir = path.join(os.homedir(), "OneDrive", req.body.zoomFolder);
  if (!fs.existsSync(videoDir)) {
    videoDir = path.join(os.homedir(), req.body.zoomFolder);
  }

  const videoFiles = getAllFilesRecursive(videoDir)
    .filter((v) => v.endsWith(".mp4"))
    .map((v) => {
      const dirName = path.dirname(v).split(path.sep).pop() as string;
      const dateInfo = dirName!.split(" ");
      if (dateInfo.length < 2) {
        dateInfo.push(moment().format("YYYY/MM/DD"));
        dateInfo.push(moment().format("hh.mm.ss"));
      }
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
    driveFolders: [],
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
