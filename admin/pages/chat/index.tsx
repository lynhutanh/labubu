import Head from "next/head";
import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/router";
import { io, Socket } from "socket.io-client";
import { chatService, Message, UserWithMessages } from "../../src/services/chat.service";
import { storage } from "../../src/utils/storage";
import AdminLayout from "../../src/components/layout/AdminLayout";
import { Send, Search, MessageCircle, User, Package, ExternalLink } from "lucide-react";
import Image from "next/image";

export default function ChatPage() {
  const router = useRouter();
  const [users, setUsers] = useState<UserWithMessages[]>([]);
  const [selectedUser, setSelectedUser] = useState<string | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputMessage, setInputMessage] = useState("");
  const [socket, setSocket] = useState<Socket | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [mounted, setMounted] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const messagesContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setMounted(true);
    const user = storage.getUser();
    if (!user) {
      router.push("/login");
      return;
    }
  }, [router]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    const token = storage.getToken();
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
      if (message.userId === selectedUser && !message.isFromAdmin) {
        const messageToAdd = { ...message, read: true };
        setMessages((prev) => {
          const exists = prev.some((msg) => msg._id === message._id);
          if (exists) {
            return prev.map((msg) =>
              msg._id === message._id ? messageToAdd : msg
            );
          }
          return [...prev, messageToAdd];
        });
        markAsRead(message.userId);
        loadUsers();
      }
    });

    socketInstance.on("message:new", (data: { userId: string; message: Message }) => {
      const isSelectedUser = data.userId === selectedUser;
      const shouldMarkAsRead = isSelectedUser && !data.message.isFromAdmin;
      const messageToAdd = shouldMarkAsRead ? { ...data.message, read: true } : data.message;
      
      if (isSelectedUser && !data.message.isFromAdmin) {
        setMessages((prev) => {
          const exists = prev.some((msg) => msg._id === data.message._id);
          if (exists) {
            return prev.map((msg) =>
              msg._id === data.message._id ? messageToAdd : msg
            );
          }
          return [...prev, messageToAdd];
        });
        markAsRead(data.userId);
      }
      loadUsers();
    });

    setSocket(socketInstance);

    return () => {
      socketInstance.disconnect();
    };
  }, [selectedUser]);

  useEffect(() => {
    if (mounted) {
      loadUsers();
    }
  }, [mounted]);

  useEffect(() => {
    if (selectedUser) {
      loadMessages(selectedUser).then(() => {
        markAsRead(selectedUser);
      });
    }
  }, [selectedUser]);

  const loadUsers = async () => {
    try {
      const data = await chatService.getUsersWithMessages();
      setUsers(data);
    } catch (error) {
      console.error("Failed to load users:", error);
    }
  };

  const loadMessages = async (userId: string) => {
    try {
      const data = await chatService.getMessagesByUserId(userId, 100);
      setMessages(data);
      return data;
    } catch (error) {
      console.error("Failed to load messages:", error);
      return [];
    }
  };

  const markAsRead = async (userId: string) => {
    try {
      await chatService.markAsRead(userId);
      setMessages((prev) =>
        prev.map((msg) =>
          msg.userId === userId && !msg.isFromAdmin
            ? { ...msg, read: true }
            : msg
        )
      );
      loadUsers();
    } catch (error) {
      console.error("Failed to mark as read:", error);
    }
  };

  const sendMessage = async () => {
    if (!inputMessage.trim() || !socket || !isConnected || !selectedUser) return;

    const content = inputMessage.trim();
    const tempId = `temp-${Date.now()}`;
    const tempMessage: Message = {
      _id: tempId,
      userId: selectedUser,
      content,
      isFromAdmin: true,
      read: false,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    setMessages((prev) => [...prev, tempMessage]);
    setInputMessage("");

    try {
      socket.emit("message:send", {
        content,
        userId: selectedUser,
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

  const filteredUsers = users.filter(
    (user) =>
      user.userName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.userEmail?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const selectedUserData = users.find((u) => u.userId === selectedUser);

  if (!mounted) {
    return null;
  }

  return (
    <AdminLayout>
      <Head>
        <title>Chat - Labubu Admin</title>
      </Head>

      <div className="flex-1 overflow-y-auto">
        <header
          className="sticky top-0 z-10 backdrop-blur-lg border-b border-purple-500/30"
          style={{
            background: "rgba(0, 0, 0, 0.3)",
          }}
        >
          <div className="px-6 py-4">
            <h1
              className="text-2xl font-bold"
              style={{
                background:
                  "linear-gradient(135deg, #fbbf24, #f59e0b, #ec4899)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
                backgroundClip: "text",
              }}
            >
              Chat
            </h1>
          </div>
        </header>

        <main className="p-6">
          <div className="galaxy-card rounded-xl overflow-hidden flex h-[calc(100vh-200px)]"
            style={{
              background: "linear-gradient(135deg, rgba(139, 92, 246, 0.2) 0%, rgba(79, 70, 229, 0.2) 50%, rgba(0, 0, 0, 0.3) 100%)",
              backdropFilter: "blur(10px)",
              border: "1px solid rgba(139, 92, 246, 0.3)",
            }}
          >
            <div className="w-80 border-r border-purple-500/30 flex flex-col"
              style={{
                background: "rgba(0, 0, 0, 0.2)",
              }}
            >
              <div className="p-4 border-b border-purple-500/30">
                <div className="flex items-center gap-2 mb-4">
                  <MessageCircle className="w-5 h-5 text-purple-300" />
                  <h2 className="text-lg font-semibold text-white">Tin nhắn</h2>
                </div>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-purple-300" size={18} />
                  <input
                    type="text"
                    placeholder="Tìm kiếm người dùng..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 bg-white/10 border border-purple-500/30 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 text-white placeholder-purple-300 backdrop-blur-sm"
                  />
                </div>
              </div>

              <div className="flex-1 overflow-y-auto scrollbar-hide">
                {filteredUsers.length === 0 ? (
                  <div className="p-4 text-center text-purple-300">
                    <MessageCircle className="w-12 h-12 mx-auto mb-2 opacity-50" />
                    <p>Không có cuộc trò chuyện nào</p>
                  </div>
                ) : (
                  filteredUsers.map((user) => (
                    <button
                      key={user.userId}
                      onClick={() => setSelectedUser(user.userId)}
                      className={`w-full p-4 text-left border-b border-purple-500/20 hover:bg-white/10 transition-colors ${
                        selectedUser === user.userId
                          ? "bg-gradient-to-r from-pink-500/30 to-purple-500/30 border-l-4 border-l-pink-400"
                          : ""
                      }`}
                    >
                      <div className="flex items-start gap-3">
                        <div
                          className="w-12 h-12 rounded-full flex items-center justify-center border-2 border-purple-500/30 flex-shrink-0"
                          style={{
                            background:
                              "linear-gradient(135deg, rgba(139, 92, 246, 0.3), rgba(79, 70, 229, 0.3))",
                          }}
                        >
                          {user.userAvatar ? (
                            <img
                              src={user.userAvatar}
                              alt={user.userName || user.userEmail}
                              className="w-full h-full rounded-full object-cover"
                            />
                          ) : (
                            <span className="text-purple-200 text-lg font-medium">
                              {(user.userName || user.userEmail || "U").charAt(0).toUpperCase()}
                            </span>
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <h3 className="font-semibold text-white truncate">
                              {user.userName || user.userEmail || "Người dùng"}
                            </h3>
                            {user.unreadCount > 0 && selectedUser !== user.userId && (
                              <span
                                className="bg-red-500 text-white text-xs font-bold rounded-full px-2 py-0.5 min-w-[20px] text-center flex-shrink-0"
                                style={{
                                  boxShadow: "0 0 10px rgba(239, 68, 68, 0.5)",
                                }}
                              >
                                {user.unreadCount > 99 ? "99+" : user.unreadCount}
                              </span>
                            )}
                          </div>
                          <p className="text-sm text-purple-300 truncate">
                            {user.userEmail}
                          </p>
                          {user.lastMessage && (
                            <p className="text-xs text-purple-400 mt-1">
                              {new Date(user.lastMessage).toLocaleDateString("vi-VN", {
                                day: "numeric",
                                month: "short",
                                hour: "2-digit",
                                minute: "2-digit",
                              })}
                            </p>
                          )}
                        </div>
                      </div>
                    </button>
                  ))
                )}
              </div>
            </div>

            <div className="flex-1 flex flex-col">
              {selectedUser ? (
                <>
                  <div
                    className="p-4 border-b border-purple-500/30"
                    style={{
                      background: "rgba(0, 0, 0, 0.2)",
                    }}
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className="w-10 h-10 rounded-full flex items-center justify-center border-2 border-purple-500/30"
                        style={{
                          background:
                            "linear-gradient(135deg, rgba(139, 92, 246, 0.3), rgba(79, 70, 229, 0.3))",
                        }}
                      >
                        {selectedUserData?.userAvatar ? (
                          <img
                            src={selectedUserData.userAvatar}
                            alt={selectedUserData.userName || selectedUserData.userEmail}
                            className="w-full h-full rounded-full object-cover"
                          />
                        ) : (
                          <span className="text-purple-200 text-sm font-medium">
                            {(selectedUserData?.userName || selectedUserData?.userEmail || "U").charAt(0).toUpperCase()}
                          </span>
                        )}
                      </div>
                      <div>
                        <h2 className="font-semibold text-lg text-white">
                          {selectedUserData?.userName || selectedUserData?.userEmail || "Người dùng"}
                        </h2>
                        <p className="text-sm text-purple-300">{selectedUserData?.userEmail}</p>
                      </div>
                    </div>
                  </div>

                  <div
                    ref={messagesContainerRef}
                    className="flex-1 overflow-y-auto p-4 space-y-3 scrollbar-hide"
                    style={{
                      background: "rgba(0, 0, 0, 0.1)",
                    }}
                  >
                    {messages.length === 0 ? (
                      <div className="text-center text-purple-300 mt-8">
                        <MessageCircle className="w-16 h-16 mx-auto mb-4 opacity-50" />
                        <p>Chưa có tin nhắn nào</p>
                      </div>
                    ) : (
                      messages.map((message) => {
                        const isUnread = !message.isFromAdmin && !message.read && selectedUser === message.userId;
                        return (
                          <div
                            key={message._id}
                            className={`flex ${
                              message.isFromAdmin ? "justify-end" : "justify-start"
                            }`}
                          >
                            <div
                              className={`max-w-[75%] rounded-lg px-4 py-2 relative ${
                                message.isFromAdmin
                                  ? "bg-gradient-to-r from-blue-600 to-cyan-600 text-white"
                                  : isUnread
                                    ? "bg-gradient-to-r from-yellow-500/30 to-orange-500/30 backdrop-blur-sm text-white border-2 border-yellow-400/50"
                                    : "bg-white/10 backdrop-blur-sm text-white border border-purple-500/30"
                              }`}
                              style={
                                message.isFromAdmin
                                  ? {
                                      boxShadow: "0 0 15px rgba(37, 99, 235, 0.3)",
                                    }
                                  : isUnread
                                    ? {
                                        boxShadow: "0 0 20px rgba(251, 191, 36, 0.4)",
                                      }
                                    : {}
                              }
                            >
                              {isUnread && (
                                <div className="absolute -left-2 top-2 w-3 h-3 bg-yellow-400 rounded-full animate-pulse"
                                  style={{
                                    boxShadow: "0 0 10px rgba(251, 191, 36, 0.8)",
                                  }}
                                />
                              )}
                              {message.metadata?.type === "product_inquiry" && message.metadata?.product && (
                                <div className="mb-3 p-3 bg-white/10 rounded-lg border border-purple-500/30">
                                  <div className="flex items-center gap-2 mb-2">
                                    <Package className="w-4 h-4 text-purple-300" />
                                    <span className="text-xs font-semibold text-purple-200">Thông tin sản phẩm</span>
                                  </div>
                                  <div className="flex gap-3">
                                    {message.metadata.product.productImage && (
                                      <div className="relative w-16 h-16 rounded-lg overflow-hidden flex-shrink-0">
                                        <Image
                                          src={message.metadata.product.productImage}
                                          alt={message.metadata.product.productName}
                                          fill
                                          className="object-cover"
                                          unoptimized
                                        />
                                      </div>
                                    )}
                                    <div className="flex-1 min-w-0">
                                      <h4 className="text-sm font-semibold text-white truncate">
                                        {message.metadata.product.productName}
                                      </h4>
                                      <p className="text-xs text-purple-300 mt-1">
                                        {message.metadata.product.productPrice?.toLocaleString("vi-VN")}₫
                                        {message.metadata.product.productOriginalPrice && (
                                          <span className="line-through ml-2 text-gray-400">
                                            {message.metadata.product.productOriginalPrice.toLocaleString("vi-VN")}₫
                                          </span>
                                        )}
                                      </p>
                                      {message.metadata.product.productSlug && (
                                        <a
                                          href={`${process.env.NEXT_PUBLIC_USER_SITE_URL || "http://localhost:5002"}/products/${message.metadata.product.productSlug}`}
                                          target="_blank"
                                          rel="noopener noreferrer"
                                          className="inline-flex items-center gap-1 text-xs text-purple-300 hover:text-purple-200 mt-1"
                                        >
                                          Xem sản phẩm
                                          <ExternalLink className="w-3 h-3" />
                                        </a>
                                      )}
                                    </div>
                                  </div>
                                </div>
                              )}
                              <p className="text-sm whitespace-pre-wrap break-words">
                                {message.content}
                              </p>
                              <p
                                className={`text-xs mt-1 ${
                                  message.isFromAdmin
                                    ? "text-blue-100"
                                    : isUnread
                                      ? "text-yellow-200"
                                      : "text-purple-300"
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

                  <div
                    className="border-t border-purple-500/30 p-4"
                    style={{
                      background: "rgba(0, 0, 0, 0.2)",
                    }}
                  >
                    <div className="flex items-center gap-2">
                      <input
                        type="text"
                        value={inputMessage}
                        onChange={(e) => setInputMessage(e.target.value)}
                        onKeyPress={handleKeyPress}
                        placeholder="Nhập tin nhắn..."
                        className="flex-1 px-4 py-2 bg-white/10 border border-purple-500/30 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 text-white placeholder-purple-300 backdrop-blur-sm"
                        disabled={!isConnected}
                      />
                      <button
                        onClick={sendMessage}
                        disabled={!inputMessage.trim() || !isConnected}
                        className="bg-gradient-to-r from-pink-500 to-purple-600 hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-lg p-2 transition-all shadow-lg"
                        style={{
                          boxShadow: "0 0 20px rgba(236, 72, 153, 0.4)",
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
                </>
              ) : (
                <div
                  className="flex-1 flex items-center justify-center text-purple-300"
                  style={{
                    background: "rgba(0, 0, 0, 0.1)",
                  }}
                >
                  <div className="text-center">
                    <MessageCircle className="w-16 h-16 mx-auto mb-4 opacity-50" />
                    <p>Chọn một người dùng để bắt đầu trò chuyện</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </main>
      </div>
    </AdminLayout>
  );
}
