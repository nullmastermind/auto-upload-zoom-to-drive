import { Button, Divider, TextInput } from "@mantine/core";
import { useLocalStorage } from "react-use";
import Link from "next/link";
import axios from "axios";

export default function Home() {
  const [folderId, setFolderId] = useLocalStorage(":folderId", "");
  const [zoomFolder, setZoomFolder] = useLocalStorage(":zoomFolder", "Documents/Zoom");
  const [accessToken, setAccessToken] = useLocalStorage(":accessToken", "");
  const [refreshToken, setRefreshToken] = useLocalStorage(":refreshToken", "");

  return (
    <main className="m-auto max-w-xl">
      <div className="p-4 flex flex-col gap-2">
        <TextInput
          size={"xs"}
          label="Folder ID"
          value={folderId}
          onChange={(e) => setFolderId(e.target.value)}
          placeholder={"E.g: 1Gz5K3YtRNK6HZITIZ8rk-knuJpwD-uMv"}
        />
        <TextInput
          size={"xs"}
          label="Folder containing Zoom's video recordings"
          value={zoomFolder}
          onChange={(e) => setZoomFolder(e.target.value)}
          placeholder={"E.g: Documents/Zoom"}
        />
        <TextInput
          size={"xs"}
          label="Access token"
          value={accessToken}
          onChange={(e) => setAccessToken(e.target.value)}
        />
        <TextInput
          size={"xs"}
          label="Refresh token"
          value={refreshToken}
          onChange={(e) => setRefreshToken(e.target.value)}
        />
        <div>
          <Link href={"https://developers.google.com/oauthplayground"} target={"_blank"}>
            https://developers.google.com/oauthplayground
          </Link>
          <div className={"flex flex-row gap-2"}>
            <div className={"whitespace-nowrap opacity-60"}>Client ID:</div>
            <TextInput
              className={"w-full"}
              size={"xs"}
              value={"636038632941-rrlqtq7h3gp8l4ipu64d8pnunhpqrr8q.apps.googleusercontent.com"}
            />
          </div>
          <div className={"flex flex-row gap-2 mt-1"}>
            <div className={"whitespace-nowrap opacity-60"}>Client secret:</div>
            <TextInput className={"w-full"} size={"xs"} value={"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"} />
          </div>
        </div>
        <Divider />
        <div>
          <Button
            variant="gradient"
            onClick={() => {
              axios
                .post("/api/getVideos", {
                  drive: {
                    access_token: accessToken,
                    refresh_token: refreshToken,
                  },
                  folderId,
                  zoomFolder,
                })
                .finally();
            }}
          >
            Reload Files
          </Button>
        </div>
      </div>
    </main>
  );
}
