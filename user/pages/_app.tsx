import "../style/globals.css";
import type { AppProps } from "next/app";
import { Toaster } from "react-hot-toast";
import { GoogleOAuthProvider } from "@react-oauth/google";
import GameFloating from "../src/components/common/GameFloating";

function App({ Component, pageProps }: AppProps) {
  const clientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID ?? "";

  return (
    <>
      <Toaster position="top-center" />
      <GameFloating />
      {clientId ? (
        <GoogleOAuthProvider clientId={clientId}>
          <Component {...pageProps} />
        </GoogleOAuthProvider>
      ) : (
        <Component {...pageProps} />
      )}
    </>
  );
}

export default App;
