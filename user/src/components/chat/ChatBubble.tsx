"use client";

import { useState, useEffect, useRef } from "react";
import { io, Socket } from "socket.io-client";
import { chatService, Message } from "../../services/chat.service";
import { storage } from "../../utils/storage";
import { X, Send, MessageCircle } from "lucide-react";

export default function ChatBubble() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputMessage, setInputMessage] = useState("");
  const [socket, setSocket] = useState<Socket | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [hasToken, setHasToken] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const [pendingMessage, setPendingMessage] = useState<{ content: string; metadata?: any } | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const chatContainerRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    const token = storage.getToken();
    setHasToken(!!token);
    if (!token) return;

    const apiEndpoint =
      process.env.NEXT_PUBLIC_API_ENDPOINT || "http://localhost:5001";
    const socketInstance = io(`${apiEndpoint}/chat`, {
      query: { token },
      transports: ["websocket", "polling"],
    });

    socketInstance.on("connect", () => {
      setIsConnected(true);
    });

    socketInstance.on("disconnect", () => {
      setIsConnected(false);
    });

    socketInstance.on("message:receive", (message: Message) => {
      const shouldMarkAsRead = message.isFromAdmin && isOpen;
      const messageToAdd = shouldMarkAsRead ? { ...message, read: true } : message;
      
      setMessages((prev) => {
        const exists = prev.some((msg) => msg._id === message._id);
        if (exists) {
          return prev.map((msg) =>
            msg._id === message._id ? messageToAdd : msg
          );
        }
        const tempIndex = prev.findIndex((msg) => msg._id?.startsWith("temp-"));
        if (tempIndex !== -1 && !message.isFromAdmin) {
          const updated = [...prev];
          updated[tempIndex] = message;
          return updated;
        }
        return [...prev, messageToAdd];
      });
      
      if (message.isFromAdmin) {
        if (isOpen) {
          markAsRead();
        } else {
          // Tăng unread count ngay khi nhận tin nhắn mới chưa đọc
          if (!message.read) {
            setUnreadCount((prev) => prev + 1);
          }
          // Đồng bộ với server
          loadUnreadCount();
        }
      }
    });

    setSocket(socketInstance);

    return () => {
      socketInstance.disconnect();
    };
  }, []);

  useEffect(() => {
    const checkToken = () => {
      const token = storage.getToken();
      setHasToken(!!token);
    };
    checkToken();
    const interval = setInterval(checkToken, 1000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (isOpen) {
      loadMessages().then(() => {
        markAsRead();
      });
    } else {
      loadUnreadCount();
    }
  }, [isOpen]);

  // Tự động gửi pending message khi socket đã kết nối và chat đã mở
  useEffect(() => {
    if (isOpen && isConnected && socket && pendingMessage) {
      const sendPendingMessage = async () => {
        const content = pendingMessage.content;
        const metadata = pendingMessage.metadata;
        const tempId = `temp-${Date.now()}`;
        const tempMessage: Message = {
          _id: tempId,
          userId: "",
          content,
          isFromAdmin: false,
          read: false,
          metadata,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };

        setMessages((prev) => [...prev, tempMessage]);
        setInputMessage("");

        try {
          socket.emit("message:send", { 
            content, 
            metadata 
          }, (response: any) => {
            if (response?.success && response?.message) {
              setMessages((prev) => {
                const tempIndex = prev.findIndex((msg) => msg._id === tempId);
                if (tempIndex !== -1) {
                  const updated = [...prev];
                  updated[tempIndex] = response.message;
                  return updated;
                }
                return prev;
              });
            } else if (response?.error) {
              setMessages((prev) => prev.filter((msg) => msg._id !== tempId));
            }
          });
          setPendingMessage(null);
        } catch (error) {
          console.error("Failed to send pending message:", error);
          setMessages((prev) => prev.filter((msg) => msg._id !== tempId));
        }
      };
      
      // Đợi một chút để đảm bảo messages đã load
      setTimeout(sendPendingMessage, 500);
    }
  }, [isOpen, isConnected, socket, pendingMessage]);

  // Expose function to open chat with message
  useEffect(() => {
    (window as any).openChatWithMessage = (content: string, metadata?: any) => {
      setPendingMessage({ content, metadata });
      setIsOpen(true);
    };
    return () => {
      delete (window as any).openChatWithMessage;
    };
  }, []);

  useEffect(() => {
    if (hasToken) {
      if (!isOpen) {
        loadUnreadCount();
        const interval = setInterval(loadUnreadCount, 10000);
        return () => clearInterval(interval);
      }
    }
  }, [hasToken, isOpen]);

  const loadMessages = async () => {
    try {
      const data = await chatService.getMessages(100);
      setMessages(data);
      return data;
    } catch (error) {
      console.error("Failed to load messages:", error);
      return [];
    }
  };

  const loadUnreadCount = async () => {
    try {
      const count = await chatService.getUnreadCount();
      setUnreadCount(count);
    } catch (error) {
      console.error("Failed to load unread count:", error);
    }
  };

  const markAsRead = async () => {
    try {
      await chatService.markAsRead();
      setMessages((prev) =>
        prev.map((msg) =>
          msg.isFromAdmin ? { ...msg, read: true } : msg
        )
      );
      loadUnreadCount();
    } catch (error) {
      console.error("Failed to mark as read:", error);
    }
  };

  const sendMessage = async () => {
    if (!inputMessage.trim() || !socket || !isConnected) return;

    const content = inputMessage.trim();
    const tempId = `temp-${Date.now()}`;
    const tempMessage: Message = {
      _id: tempId,
      userId: "",
      content,
      isFromAdmin: false,
      read: false,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    setMessages((prev) => [...prev, tempMessage]);
    setInputMessage("");

    try {
      // Lấy metadata từ pending message nếu có
      const metadata = pendingMessage?.metadata;
      socket.emit("message:send", { content, metadata });
      setPendingMessage(null);
    } catch (error) {
      console.error("Failed to send message:", error);
      setMessages((prev) => prev.filter((msg) => msg._id !== tempId));
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  if (!hasToken) {
    return null;
  }

  if (!isOpen) {
    return (
      <button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-6 right-6 z-50 bg-black border-2 border-yellow-400 rounded-full p-4 shadow-2xl transition-all duration-200 hover:scale-110 hover:shadow-yellow-400/50 group"
        style={{
          boxShadow: "0 0 20px rgba(251, 191, 36, 0.4), 0 0 40px rgba(251, 191, 36, 0.2)",
        }}
        aria-label="Open chat"
      >
        <MessageCircle size={24} className="text-yellow-400 group-hover:text-yellow-300 transition-colors" />
        {unreadCount > 0 && (
          <span
            className="absolute -top-1 -right-1 bg-red-500 text-white text-xs font-bold rounded-full w-6 h-6 flex items-center justify-center border-2 border-black"
            style={{
              boxShadow: "0 0 10px rgba(239, 68, 68, 0.8)",
            }}
          >
            {unreadCount > 99 ? "99+" : unreadCount}
          </span>
        )}
      </button>
    );
  }

  return (
    <div
      ref={chatContainerRef}
      className="fixed bottom-6 right-6 z-50 w-96 h-[600px] bg-black border-2 border-gray-700 rounded-lg shadow-2xl flex flex-col overflow-hidden"
      style={{
        boxShadow: "0 0 30px rgba(0, 0, 0, 0.8), 0 0 60px rgba(251, 191, 36, 0.1)",
      }}
    >
      <div
        className="bg-gradient-to-r from-gray-900 to-black border-b-2 border-yellow-400/30 text-white p-4 flex items-center justify-between"
        style={{
          boxShadow: "0 2px 10px rgba(251, 191, 36, 0.2)",
        }}
      >
        <div className="flex items-center gap-2">
          <MessageCircle size={20} className="text-yellow-400" />
          <h3 className="font-semibold text-yellow-400">Chat với Admin</h3>
          {unreadCount > 0 && (
            <span
              className="bg-red-500 text-white text-xs font-bold rounded-full px-2 py-0.5 ml-2"
              style={{
                boxShadow: "0 0 10px rgba(239, 68, 68, 0.6)",
              }}
            >
              {unreadCount}
            </span>
          )}
        </div>
        <button
          onClick={() => setIsOpen(false)}
          className="hover:bg-gray-800 rounded-full p-1 transition-colors text-gray-400 hover:text-white"
          aria-label="Close chat"
        >
          <X size={20} />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-gray-900 scrollbar-hide">
        {messages.length === 0 ? (
          <div className="text-center text-gray-400 mt-8">
            <MessageCircle className="w-12 h-12 mx-auto mb-3 opacity-50" />
            <p>Chưa có tin nhắn nào. Hãy bắt đầu cuộc trò chuyện!</p>
          </div>
        ) : (
                      messages.map((message) => {
            const isUnread = message.isFromAdmin && !message.read && !isOpen;
            return (
              <div
                key={message._id}
                className={`flex ${
                  message.isFromAdmin ? "justify-start" : "justify-end"
                }`}
              >
                <div
                  className={`max-w-[75%] rounded-lg px-4 py-2 relative ${
                    message.isFromAdmin
                      ? isUnread
                        ? "bg-gradient-to-r from-yellow-500/20 to-orange-500/20 border-2 border-yellow-400/50 text-white"
                        : "bg-gray-800 border border-gray-700 text-white"
                      : "bg-gradient-to-r from-yellow-400 to-yellow-500 text-black"
                  }`}
                  style={
                    message.isFromAdmin && isUnread
                      ? {
                          boxShadow: "0 0 15px rgba(251, 191, 36, 0.3)",
                        }
                      : !message.isFromAdmin
                        ? {
                            boxShadow: "0 0 15px rgba(251, 191, 36, 0.4)",
                          }
                        : {}
                  }
                >
                  {isUnread && (
                    <div
                      className="absolute -left-2 top-2 w-3 h-3 bg-yellow-400 rounded-full animate-pulse"
                      style={{
                        boxShadow: "0 0 10px rgba(251, 191, 36, 0.8)",
                      }}
                    />
                  )}
                  <p className="text-sm whitespace-pre-wrap break-words font-medium">
                    {message.content}
                  </p>
                  <p
                    className={`text-xs mt-1 ${
                      message.isFromAdmin
                        ? isUnread
                          ? "text-yellow-200"
                          : "text-gray-400"
                        : "text-black/70"
                    }`}
                  >
                    {new Date(message.createdAt).toLocaleTimeString("vi-VN", {
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                    {isUnread && (
                      <span className="ml-2 text-yellow-300 font-semibold">• Chưa đọc</span>
                    )}
                  </p>
                </div>
              </div>
            );
          })
        )}
        <div ref={messagesEndRef} />
      </div>

      <div className="border-t-2 border-gray-700 p-4 bg-black">
        <div className="flex items-center gap-2">
          <input
            type="text"
            value={inputMessage}
            onChange={(e) => setInputMessage(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Nhập tin nhắn..."
            className="flex-1 px-4 py-2 bg-gray-900 border border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-400 focus:border-yellow-400 text-white placeholder-gray-500"
            disabled={!isConnected}
          />
          <button
            onClick={sendMessage}
            disabled={!inputMessage.trim() || !isConnected}
            className="bg-gradient-to-r from-yellow-400 to-yellow-500 hover:from-yellow-300 hover:to-yellow-400 disabled:from-gray-700 disabled:to-gray-700 disabled:cursor-not-allowed text-black rounded-lg p-2 transition-all font-semibold shadow-lg"
            style={{
              boxShadow: !inputMessage.trim() || !isConnected
                ? "none"
                : "0 0 15px rgba(251, 191, 36, 0.5)",
            }}
            aria-label="Send message"
          >
            <Send size={20} />
          </button>
        </div>
        {!isConnected && (
          <p className="text-xs text-red-400 mt-2 flex items-center gap-1">
            <span className="w-2 h-2 bg-red-400 rounded-full animate-pulse"></span>
            Đang kết nối...
          </p>
        )}
      </div>
    </div>
  );
}
