import { ReactNode } from "react";
import Header from "./Header";
import Footer from "./Footer";
import ChatBubble from "../chat/ChatBubble";
import OrderTicker from "../common/OrderTicker";

interface LayoutProps {
  children: ReactNode;
}

export default function Layout({ children }: LayoutProps) {
  return (
    <div className="min-h-screen flex flex-col">
      <OrderTicker />
      <Header />
      <main className="flex-1">{children}</main>
      <Footer />
      <ChatBubble />
    </div>
  );
}
