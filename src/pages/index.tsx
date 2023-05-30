import { ActionIcon, Button, Card, Collapse, NativeSelect, Text, TextInput, Title } from "@mantine/core";
import { useLocalStorage, useSetState } from "react-use";
import Link from "next/link";
import axios from "axios";
import { IconSettings } from "@tabler/icons-react";
import { useDisclosure } from "@mantine/hooks";
import { useEffect, useState } from "react";
import { map } from "lodash";
import { DriveFileData, FileData } from "@/utility/types";
import moment from "moment";
import validator from "validator";
import isMobilePhone = validator.isMobilePhone;

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

function FileUpload({ file, driveFolders }: { file: FileData; driveFolders: DriveFileData[] }) {
  const [accessToken] = useLocalStorage(":accessToken", "");
  const [refreshToken] = useLocalStorage(":refreshToken", "");
  const [student, setStudent] = useState<string>();
  const [fileName, setFileName] = useState(`B ${moment(file.date).format("DD/MM")}`);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (student !== undefined) return;

    for (let i = 0; i < driveFolders.length; i++) {
      const folder = driveFolders[i];
      for (let j = 0; j < file.keywords.length; j++) {
        const keyword = file.keywords[j];
        if (isMobilePhone(keyword) && folder.name.includes(keyword)) {
          setStudent(folder.id);
          return;
        } else if (folder.name.toLowerCase() === keyword.toLowerCase()) {
          setStudent(folder.id);
          return;
        }
      }
    }
  }, [student, driveFolders, file]);

  return (
    <div className={"flex flex-col gap-2"}>
      <Text size={"sm"} className={"opacity-60"}>
        {file.fullPath}
      </Text>
      <div className={"flex flex-row gap-2 items-center"}>
        <NativeSelect
          label={"Student"}
          size={"sm"}
          className={"w-full"}
          data={[
            {
              label: "---",
              value: "",
            },
            ...driveFolders.map((v) => {
              return {
                label: v.name,
                value: v.id,
              };
            }),
          ]}
          value={student}
          onChange={(event) => {
            setStudent(event.target.value);
          }}
        />
        <TextInput
          label={"File name"}
          size={"sm"}
          className={"w-full"}
          value={fileName}
          onChange={(e) => setFileName(e.target.value)}
        />
      </div>
      <div>
        <Button
          loading={loading}
          disabled={!student}
          variant={"outline"}
          onClick={() => {
            setLoading(true);
            axios
              .post("/api/upload", {
                drive: {
                  access_token: accessToken,
                  refresh_token: refreshToken,
                },
                folderId: student,
                fileName: fileName + ".mp4",
                filePath: file.fullPath,
              })
              .then(({ data }) => {
                if (data?.fileId) {
                  console.log("OK", data);
                }
              })
              .finally(() => {
                setLoading(false);
              });
          }}
        >
          Upload
        </Button>
      </div>
    </div>
  );
}
