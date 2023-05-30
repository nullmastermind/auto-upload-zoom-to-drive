import "@/styles/globals.css";
import type { AppProps } from "next/app";
import { MantineProvider } from "@mantine/core";
import { Notifications } from "@mantine/notifications";
import Dynamic from "@/components/Dynamic";

export default function App({ Component, pageProps }: AppProps) {
  return (
    <MantineProvider withGlobalStyles withNormalizeCSS theme={{ colorScheme: "dark" }}>
      <Dynamic>
        <Notifications />
        <Component {...pageProps} />
      </Dynamic>
    </MantineProvider>
  );
}
