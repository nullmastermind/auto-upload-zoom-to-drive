import type { NextApiRequest, NextApiResponse } from "next";
import path from "path";
import { copy, copyFile, ensureDir, pathExists, remove } from "fs-extra";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { fileName, filePath, deleteVideo, driveFolder } = req.body;

  try {
    if (!(await pathExists(driveFolder))) {
      throw new Error("drive folder not found");
    }

    await copy(filePath, path.join(driveFolder, fileName));

    try {
      if (deleteVideo) {
        await remove(path.dirname(filePath));
      }
    } catch (e) {}

    res.status(200).json({ fileId: 1 });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to upload file" });
  }
}
