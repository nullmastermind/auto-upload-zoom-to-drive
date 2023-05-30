import axios, { AxiosError } from "axios";
import { drive_v3 } from "googleapis";

export const refreshToken = async (
  refreshToken: string,
): Promise<{ data: any; errorMessage: string; statusCode: number }> => {
  try {
    const response = await axios.post("https://developers.google.com/oauthplayground/refreshAccessToken", {
      token_uri: "https://oauth2.googleapis.com/token",
      client_id: "636038632941-rrlqtq7h3gp8l4ipu64d8pnunhpqrr8q.apps.googleusercontent.com",
      client_secret: "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",
      refresh_token: refreshToken,
    });
    return { data: response.data, errorMessage: "", statusCode: response.status };
  } catch (error: AxiosError | any) {
    const errorMessage = error.response?.data?.message || "An error occurred while fetching the data.";
    const statusCode = error.response?.status || 500;
    return { data: null, errorMessage, statusCode };
  }
};

export const getDriveFiles = async (drive: drive_v3.Drive, folderId: string): Promise<any> => {
  return new Promise((rel) => {
    drive.files.list(
      {
        q: `'${folderId}' in parents`,
      },
      (err, data) => {
        if (err) throw err;
        rel(data?.data?.files || []);
      },
    );
  }).catch(() => Promise.resolve([]));
};
