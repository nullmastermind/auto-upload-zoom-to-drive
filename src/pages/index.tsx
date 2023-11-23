import { Button, Checkbox, Divider, Select, Text, TextInput } from "@mantine/core";
import { createGlobalState, useLocalStorage, useSetState } from "react-use";
import axios from "axios";
import { useEffect, useMemo, useState } from "react";
import { find, map } from "lodash";
import { DriveFileData, FileData } from "@/utility/types";
import moment from "moment";
import validator from "validator";
import { notifications } from "@mantine/notifications";
import PhoneNumbersInput, { usePhoneNumbers } from "@/components/PhoneNumbersInput";
import { DateTimePicker } from "@mantine/dates";
import isMobilePhone = validator.isMobilePhone;

const useRemovedFiles = createGlobalState<Record<any, boolean>>({});
const useSuggestLoading = createGlobalState<Record<any, boolean>>({});
const useFileNames = createGlobalState<Record<any, Record<any, any>>>({});

export default function Home() {
  const [folderId, setFolderId] = useLocalStorage(":folderId", "");
  const [zoomFolder, setZoomFolder] = useLocalStorage(":zoomFolder", "Documents/Zoom");
  const [loadings, setLoadings] = useSetState({
    reload: false,
  });
  const [driveFolders, setDriveFolders] = useState<any[]>([]);
  const [files, setFiles] = useState<any[]>([]);
  const [, setFileNames] = useFileNames();
  const [showAll, setShowAll] = useState(false);
  const [driveFolder, setDriveFolder] = useLocalStorage(":driveFolder", "");

  return (
    <main className="m-auto max-w-screen-md py-10 px-2">
      <div className={"flex flex-row gap-3 items-center"}>
        <PhoneNumbersInput />
        <TextInput
          value={zoomFolder}
          size={"xs"}
          placeholder={"Thư mục Zoom"}
          onChange={(e) => setZoomFolder(e.target.value)}
        />
        <TextInput
          value={driveFolder}
          size={"xs"}
          placeholder={"Thư mục Drive"}
          onChange={(e) => setDriveFolder(e.target.value)}
        />
        <Divider orientation={"vertical"} />
        <Button
          loading={loadings.reload}
          variant="gradient"
          size={"xs"}
          onClick={() => {
            setLoadings({ reload: true });
            setFiles([]);
            setFileNames({});
            axios
              .post("/api/getVideos", {
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
          Lấy danh sách video
        </Button>
      </div>
      <div>
        <FileList driveFolder={driveFolder as string} files={files} driveFolders={driveFolders} showAll={showAll} />
        <Text className={"mt-2 opacity-60 flex flex-row gap-2"}>
          <Text>total: {files.length} videos.</Text>
          <Text
            color={"blue"}
            className={"cursor-pointer hover:underline"}
            onClick={() => {
              setShowAll(!showAll);
            }}
          >
            Show All/Short
          </Text>
        </Text>
      </div>
    </main>
  );
}

function FileList({
  files,
  driveFolder,
  driveFolders,
  showAll,
}: {
  driveFolder: string;
  files: FileData[];
  driveFolders: any[];
  showAll: boolean;
}) {
  const [removedFiles] = useRemovedFiles();

  let showed = 0;

  return (
    <div className={"flex flex-col gap-2 mt-5"}>
      {map(files, (file, index) => {
        if (removedFiles[file.fullPath]) return null;

        showed++;

        if (showed > 20 && !showAll) return;

        return (
          <>
            <div key={index} className={"p-5"}>
              <div className={"flex flex-row gap-2 items-start"}>
                <div className={"flex flex-col"}>
                  <video width="280" controls className={"rounded-md"} autoPlay={false} preload={"none"}>
                    <source src={`/api/streamVideo?filePath=` + encodeURIComponent(file.fullPath)} type="video/mp4" />
                  </video>
                  <DateInfo originDate={file.saveAt} />
                </div>
                <FileUpload driveFolder={driveFolder} index={index} file={file} driveFolders={driveFolders} />
              </div>
            </div>
            <Divider />
          </>
        );
      })}
    </div>
  );
}

function DateInfo({ originDate }: { originDate: any }) {
  const [info, setInfo] = useState(moment(originDate).fromNow());

  useEffect(() => {
    const t = setInterval(() => {
      setInfo(moment(originDate).fromNow());
    }, 60000);
    return () => {
      clearInterval(t);
    };
  }, [originDate]);

  return (
    <Text size={"xs"} className={"px-2 text-center"}>
      {moment(originDate).format("DD/MM")} ({info})
    </Text>
  );
}

function FileUpload({
  file,
  driveFolders,
  index,
  driveFolder,
}: {
  driveFolder: string;
  file: FileData;
  driveFolders: DriveFileData[];
  index: number;
}) {
  const localStorageRemoveKey = `${file.fullPath}:remove`;
  const [student, setStudent] = useState<string>();
  const [studentName, setStudentName] = useState<string>();
  const [loadings, setLoadings] = useSetState({
    uploading: false,
    suggesting: false,
  });
  const [deleteVideo, setDeleteVideo] = useLocalStorage(localStorageRemoveKey, true);
  const [removedFiles, setRemovedFiles] = useRemovedFiles();
  const [suggestLoading, setSuggestLoading] = useSuggestLoading();
  const [fileNames, setFileNames] = useFileNames();
  const [phoneNumbers] = usePhoneNumbers();
  const [date, setDate] = useState(new Date(`${file.date} ${file.time}`));
  const fileName = useMemo(() => {
    return `${student}_${moment(date).format("DD-MM hh:mm")}`;
  }, [date, student]);
  ``;

  useEffect(() => {
    if (student !== undefined) return;

    for (let i = 0; i < driveFolders.length; i++) {
      const folder = driveFolders[i];
      for (let j = 0; j < file.keywords.length; j++) {
        const keyword = file.keywords[j];
        if (isMobilePhone(keyword) && folder.name.includes(keyword)) {
          setStudent(folder.id);
          setStudentName(folder.name);
          return;
        } else if (folder.name.toLowerCase() === keyword.toLowerCase()) {
          setStudent(folder.id);
          setStudentName(folder.name);
          return;
        }
      }
    }
  }, [student, driveFolders, file]);

  useEffect(() => {
    setFileNames({
      ...fileNames,
      [student as any]: {
        ...(fileNames[student as any] || {}),
        [file.fullPath]: {
          fileName,
          saveAt: file.saveAt,
        },
      },
    });
  }, [fileName, student, file]);

  return (
    <div className={"flex flex-col gap-2"}>
      <div className={"flex flex-row gap-2 items-center"}>
        <Text style={{ minWidth: 30 }}>{index + 1}.</Text>
        <Text size={"sm"} className={"opacity-60"}>
          {file.fullPath}
        </Text>
      </div>
      <div className={"flex flex-row gap-2 items-center"}>
        <Select
          label={"Học viên"}
          size={"xs"}
          data={[...phoneNumbers]}
          value={student}
          onChange={(event) => {
            setStudent(event || "");
            setStudentName(find(phoneNumbers, (v) => v.value === event)?.label);
          }}
          searchable
          clearable
        />
        <DateTimePicker
          label={"Ngày học"}
          size={"xs"}
          value={date}
          onChange={(v) => {
            setDate(new Date(v as any));
          }}
        />
      </div>
      <div className={"flex flex-row gap-2 items-center"}>
        <Button
          size={"xs"}
          loading={loadings.uploading}
          disabled={!student}
          variant={"outline"}
          onClick={() => {
            setLoadings({ uploading: true });
            axios
              .post("/api/upload", {
                fileName: fileName + ".mp4",
                filePath: file.fullPath,
                driveFolder,
                deleteVideo,
              })
              .then(({ data }) => {
                if (data?.fileId) {
                  setRemovedFiles({
                    ...removedFiles,
                    [file.fullPath]: true,
                  });

                  notifications.show({
                    title: "Uploaded video",
                    message: `${studentName}/${fileName}.mp4 ${file.fullPath}`,
                    color: "green",
                  });
                }
              })
              .catch(() => {
                notifications.show({
                  title: "Failed",
                  message: `${studentName}/${fileName}.mp4 ${file.fullPath}`,
                  color: "red",
                  autoClose: false,
                });
              })
              .finally(() => {
                setLoadings({ uploading: false });
                if (deleteVideo) {
                  localStorage.removeItem(localStorageRemoveKey);
                }
              });
          }}
        >
          Upload
        </Button>
        <Checkbox
          label={"Delete local file after uploading"}
          checked={deleteVideo}
          onChange={(e) => setDeleteVideo(e.target.checked)}
        />
      </div>
    </div>
  );
}
