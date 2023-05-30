export type FileData = {
  fullPath: string;
  fileName: string;
  dirName: string;
  date: string;
  time: string;
  keywords: string[];
  saveAt: string;
};

export type DriveFileData = {
  kind: string;
  mimeType: string;
  id: string;
  name: string;
};
