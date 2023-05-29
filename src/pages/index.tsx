import { Button, Divider, TextInput } from "@mantine/core";
import { useLocalStorage } from "react-use";

export default function Home() {
  const [folderId, setFolderId] = useLocalStorage(":folderId", "");
  const [zoomFolder, setZoomFolder] = useLocalStorage(":zoomFolder", "Documents/Zoom");

  return (
    <main className="m-auto max-w-xl">
      <div className="p-4 flex flex-col gap-2">
        <TextInput
          label="Google Drive Folder ID"
          value={folderId}
          onChange={(e) => setFolderId(e.target.value)}
          placeholder={"E.g: 1Gz5K3YtRNK6HZITIZ8rk-knuJpwD-uMv"}
        />
        <TextInput
          label="Folder containing Zoom's video recordings"
          value={zoomFolder}
          onChange={(e) => setZoomFolder(e.target.value)}
          placeholder={"E.g: Documents/Zoom"}
        />
        <Divider />
        <div>
          <Button variant="gradient">Reload Files</Button>
        </div>
      </div>
    </main>
  );
}
