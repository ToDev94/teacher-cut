import { Inter } from "next/font/google";
import classes from "./index.module.css";
import { List, Button, ThemeIcon } from "@mantine/core";
import { useState } from "react";

import { FileInput } from "@mantine/core";
import { Notification, Transition, rem } from "@mantine/core";
import {
  IconX,
  IconArrowBarToDown,
  IconUpload,
  IconCircleCheck,
  IconCircleDashed,
  IconFileCheck,
} from "@tabler/icons-react";

const inter = Inter({ subsets: ["latin"] });

const scaleY = {
  in: { opacity: 1, transform: "scaleY(1)" },
  out: { opacity: 0, transform: "scaleY(0)" },
  common: { transformOrigin: "top" },
  transitionProperty: "transform, opacity",
};

export default function Home() {
  const [value, setValue] = useState([]);
  const [isReady, setIsReady] = useState(false);
  const [isNotified, setIsNotified] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [fileUrl, setFileUrl] = useState("#");

  const openFileHandler = () => {
    window.open(fileUrl, "_blank");
  };

  const submitHanlder = async (e) => {
    e.preventDefault();

    setValue(value);

    if (value.length === 0) {
      setIsNotified(true);

      setTimeout(() => {
        setIsNotified(false);
      }, 5000);

      return;
    }

    setIsNotified(false);

    setIsLoading(true);
    const formData = new FormData();
    formData.append("file", value[0]);

    const options = {
      method: "POST",
      body: formData,
    };

    const doc = await fetch("/api/hello", options);

    console.log(doc);
    setFileUrl(doc.url);
    setIsLoading(false);
    setIsReady(true);
  };

  return (
    <main className={classes.main}>
      <div style={{ position: "absolute", minWidth: rem(300) }}>
        <Transition
          mounted={isNotified}
          transition={scaleY}
          duration={200}
          timingFunction="ease"
        >
          {(styles) => (
            <Notification
              style={{
                ...styles,
                position: "absolute",
                top: 0,
                left: 0,
              }}
              icon={<IconX size="1.1rem" />}
              color="red"
              withCloseButton={false}
              title="إختر ملف البيانات "
            >
              عليك إختيار ملف المجدول الذي يحتوي على البيانات اللازمة
            </Notification>
          )}
        </Transition>
      </div>
      <div className={classes.container}>
        <div className={classes.home}>
          <form
            className={classes.form}
            encType="multipart/form-data"
            method="POST"
            onSubmit={submitHanlder}
          >
            <Button
              loading={isLoading}
              type="submit"
              color="violet"
              variant="filled"
              leftIcon={<IconFileCheck />}
            >
              تأكيد
            </Button>
            <FileInput
              placeholder=" إضغط هنا لإختيار ملف بيانات الغيابات للأساتذة"
              label="يجب أن يكون الملف من إمتداد .xlsx و يحتوي على البيانات المذكور في الأسفل"
              withAsterisk
              icon={<IconUpload size={rem(14)} />}
              style={{ flexGrow: 1 }}
              multiple
              value={value}
              onChange={setValue}
            />
          </form>
          <Button
            loading={isLoading}
            onClick={openFileHandler}
            disabled={!isReady}
            leftIcon={<IconArrowBarToDown />}
          >
            تحميل الملف
          </Button>

          <List
            spacing="xs"
            size="sm"
            center
            icon={
              <ThemeIcon color="teal" size={24} radius="xl">
                <IconCircleCheck size="1rem" />
              </ThemeIcon>
            }
          >
            <List.Item>الإسم</List.Item>
            <List.Item>اللقب</List.Item>
            <List.Item>الرتبة</List.Item>
            <List.Item>الصفة</List.Item>
            <List.Item>تاريخ بداية الغياب</List.Item>
            <List.Item>تاريخ نهاية الغياب</List.Item>
            <List.Item>السبب</List.Item>
          </List>
        </div>
      </div>
    </main>
  );
}
