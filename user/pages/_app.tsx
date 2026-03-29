import "../style/globals.css";
import type { AppProps } from "next/app";
import { Toaster } from "react-hot-toast";
import { GoogleOAuthProvider } from "@react-oauth/google";
import SpinFloating from "../src/components/common/SpinFloating";
import SlotMachineFloating from "../src/components/common/SlotMachineFloating";
import PetFloating from "../src/components/common/PetFloating";

function App({ Component, pageProps }: AppProps) {
  const clientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID ?? "";

  return (
    <>
      <Toaster position="top-center" />
      <SpinFloating />
      <SlotMachineFloating />
      <PetFloating />
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
