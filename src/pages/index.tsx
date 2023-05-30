import { ActionIcon, Button, Card, Collapse, Divider, Highlight, Text, TextInput, Title } from "@mantine/core";
import { useLocalStorage, useSetState } from "react-use";
import Link from "next/link";
import axios from "axios";
import { IconSettings } from "@tabler/icons-react";
import { useDisclosure } from "@mantine/hooks";
import { useState } from "react";
import { map } from "lodash";
import { FileData } from "@/utility/types";

export default function Home() {
  const [folderId, setFolderId] = useLocalStorage(":folderId", "");
  const [zoomFolder, setZoomFolder] = useLocalStorage(":zoomFolder", "Documents/Zoom");
  const [accessToken, setAccessToken] = useLocalStorage(":accessToken", "");
  const [refreshToken, setRefreshToken] = useLocalStorage(":refreshToken", "");
  const [loadings, setLoadings] = useSetState({
    reload: false,
  });
  const [opened, { toggle, close }] = useDisclosure(false);
  const [driveFolders, setDriveFolders] = useState<any[]>([]);
  const [files, setFiles] = useState<any[]>([]);

  return (
    <main className="m-auto max-w-screen-md py-10 px-2">
      <div className={"flex flex-row gap-3 items-center"}>
        <ActionIcon variant={"outline"} onClick={toggle}>
          <IconSettings />
        </ActionIcon>
        <Button
          loading={loadings.reload}
          variant="gradient"
          onClick={() => {
            close();
            setLoadings({ reload: true });
            setFiles([]);
            axios
              .post("/api/getVideos", {
                drive: {
                  access_token: accessToken,
                  refresh_token: refreshToken,
                },
                folderId,
                zoomFolder,
              })
              .then(({ data }) => {
                console.log("data", data);
                setDriveFolders(data.driveFolders || []);
                setFiles(data.files || []);
              })
              .catch(() => alert("error"))
              .finally(() => {
                setLoadings({ reload: false });
              });
          }}
        >
          Reload Files
        </Button>
      </div>
      <Collapse in={opened}>
        <Card withBorder padding={"xs"} className={"my-3"}>
          <Card.Section className={"px-6"}>
            <Title order={3}>Settings</Title>
          </Card.Section>
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
          </div>
        </Card>
      </Collapse>
      <div>
        <FileList files={files} driveFolders={driveFolders} />
      </div>
    </main>
  );
}

function FileList({ files, driveFolders }: { files: FileData[]; driveFolders: any[] }) {
  return (
    <div className={"flex flex-col gap-2 mt-5"}>
      {map(files, (file, index) => {
        return (
          <Card withBorder key={index}>
            <div className={"flex flex-row gap-2 items-start"}>
              <video width="280" controls className={"rounded-md"}>
                <source src={`/api/streamVideo?filePath=` + encodeURIComponent(file.fullPath)} type="video/mp4" />
              </video>
              <FileUpload file={file} driveFolders={driveFolders} />
            </div>
          </Card>
        );
      })}
    </div>
  );
}

function FileUpload({ file, driveFolders }: { file: FileData; driveFolders: any[] }) {
  return (
    <div className={"flex flex-col gap-2"}>
      <Text size={"sm"} className={"opacity-60"}>
        {file.fullPath}
      </Text>
      <div className={"flex flex-row gap-2 items-center"}>
        <TextInput label={"Student"} size={"sm"} className={"w-full"} />
        <TextInput label={"File name"} size={"sm"} className={"w-full"} />
      </div>
      <div>
        <Button variant={"outline"}>Upload</Button>
      </div>
    </div>
  );
}
