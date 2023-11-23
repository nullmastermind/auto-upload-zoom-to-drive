import { Button, Modal, Textarea } from "@mantine/core";
import { useEffect, useState } from "react";
import { createGlobalState, useLocalStorage } from "react-use";

export const usePhoneNumbers = createGlobalState<
  Array<{
    label: string;
    value: string;
  }>
>([]);

const PhoneNumbersInput = () => {
  const [open, setOpen] = useState(false);
  const [phoneNumbers, setPhoneNumbers] = useLocalStorage("phoneNumbers", "");
  const [, setPhoneNumberOptions] = usePhoneNumbers();

  useEffect(() => {
    setPhoneNumberOptions(
      (phoneNumbers || "")
        .split("\n")
        .map((v) => v.trim())
        .filter((v) => v.length)
        .map((v) => {
          const [value, name] = v
            .split(",")
            .map((v) => v.trim())
            .filter((v) => v.length);
          return {
            label: [name, value].filter((v) => !!v).join(" - "),
            value: value,
          };
        }),
    );
  }, [phoneNumbers]);

  return (
    <>
      <Button size={"xs"} variant={"default"} onClick={() => setOpen(true)}>
        Cài đặt SĐT
      </Button>
      <Modal title={"Cài đặt SĐT"} opened={open} onClose={() => setOpen(false)} centered>
        <div className={"flex flex-col gap-3"}>
          <Textarea
            autosize
            minRows={10}
            maxRows={10}
            placeholder={"<SĐT>,<Tên gợi nhớ>\n0376561111,Anh Một\n0376562222,Anh Hai\n0376563333,Chị Ba\n..."}
            value={phoneNumbers}
            onChange={(v) => setPhoneNumbers(v.target.value)}
          ></Textarea>
          <div className={"flex flex-row gap-3 justify-end"}>
            <Button size={"xs"} variant={"gradient"} onClick={() => setOpen(false)}>
              OK
            </Button>
          </div>
        </div>
      </Modal>
    </>
  );
};

export default PhoneNumbersInput;
