import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Gift } from 'lucide-react';
import { useRouter } from 'next/router';

interface NotificationRow {
    image: string;
    text: string;
}

interface WelcomePopupProps {
    notifications: NotificationRow[];
}

export const WelcomePopup: React.FC<WelcomePopupProps> = ({ notifications }) => {
    const [isOpen, setIsOpen] = useState(false);
    const router = useRouter();

    useEffect(() => {
        // Only show if there are notifications configured
        if (notifications && notifications.length > 0) {
            // Optional: Check local storage if we want to show it once per session/day
            // For now, requirement is: "xuất hiện mỗi khi vào trang chủ"
            setIsOpen(true);
        }
    }, [notifications]);

    return (
        <AnimatePresence>
            {isOpen && (
                <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4">
                    {/* Backdrop overlay */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="absolute inset-0 bg-black/40 backdrop-blur-sm"
                        onClick={() => setIsOpen(false)}
                    />

                    {/* Popup content */}
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.8, y: 30 }}
                        transition={{ type: "spring", damping: 25, stiffness: 300 }}
                        className="relative w-full max-w-[560px] overflow-hidden rounded-[2.5rem] backdrop-blur-2xl"
                        style={{
                            background: 'linear-gradient(165deg, rgba(15, 7, 33, 0.8) 0%, rgba(45, 27, 105, 0.8) 40%, rgba(91, 33, 182, 0.8) 100%)',
                            boxShadow: '0 25px 70px -12px rgba(0, 0, 0, 0.5), inset 0 0 20px rgba(255, 255, 255, 0.1)',
                            border: '1px solid rgba(255, 255, 255, 0.2)',
                        }}
                    >
                        {/* Background Decorations - Gift Boxes */}
                        <div className="absolute inset-0 pointer-events-none overflow-hidden origin-center">
                            <motion.div
                                animate={{
                                    y: [0, -20, 0],
                                    rotate: [0, 10, 0],
                                    scale: [1, 1.1, 1]
                                }}
                                transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
                                className="absolute -top-10 -left-10 text-white/20 opacity-30"
                            >
                                <Gift size={180} />
                            </motion.div>
                            <motion.div
                                animate={{
                                    y: [0, 20, 0],
                                    rotate: [0, -15, 0],
                                    scale: [1, 1.2, 1]
                                }}
                                transition={{ duration: 8, repeat: Infinity, ease: "easeInOut", delay: 1 }}
                                className="absolute -bottom-10 -right-10 text-white/10 opacity-20"
                            >
                                <Gift size={220} />
                            </motion.div>
                            <motion.div
                                animate={{
                                    x: [0, 15, 0],
                                    rotate: [0, 25, 0]
                                }}
                                transition={{ duration: 10, repeat: Infinity, ease: "easeInOut", delay: 2 }}
                                className="absolute top-1/2 -right-10 text-white/10 opacity-20"
                            >
                                <Gift size={120} />
                            </motion.div>
                            <motion.div
                                animate={{
                                    x: [0, -10, 0],
                                    rotate: [0, -5, 0]
                                }}
                                transition={{ duration: 7, repeat: Infinity, ease: "easeInOut", delay: 0.5 }}
                                className="absolute top-1/4 -left-5 text-white/10 opacity-20"
                            >
                                <Gift size={80} />
                            </motion.div>
                        </div>

                        {/* Close button */}
                        <button
                            onClick={(e) => {
                                e.stopPropagation();
                                setIsOpen(false);
                            }}
                            className="absolute right-6 top-6 z-[100] flex h-10 w-10 items-center justify-center rounded-full bg-white/10 text-white backdrop-blur-xl border border-white/20 hover:bg-red-500 transition-all group active:scale-90"
                        >
                            <X className="h-6 w-6 group-hover:rotate-180 transition-transform duration-500" />
                        </button>

                        <div className="px-8 pt-10 pb-12 relative z-10">
                            {/* Header / Logo Centered */}
                            <div className="flex flex-col items-center justify-center mb-8">
                                <div className="h-32 w-32 overflow-hidden rounded-full p-1 mb-4 flex items-center justify-center relative shadow-[0_0_40px_rgba(139,92,246,0.6)]">
                                    <div className="absolute inset-0 rounded-full border-2 border-white/30 animate-pulse pointer-events-none opacity-20"></div>
                                    <img
                                        src="/logo.png"
                                        alt="Logo"
                                        className="w-full h-full object-contain rounded-full shadow-2xl"
                                    />
                                </div>

                                <div className="text-center">
                                    <h2 className="text-3xl font-black text-white tracking-tight leading-tight mb-2 drop-shadow-lg">LABUBU STORE</h2>
                                    <div className="inline-block px-4 py-1.5 bg-gradient-to-r from-yellow-400 via-orange-500 to-red-500 rounded-full shadow-lg">
                                        <p className="text-xs text-white font-black uppercase tracking-[0.2em]">Thông Báo Thế Giới</p>
                                    </div>
                                </div>
                            </div>

                            {/* List of Notification Options - Back to simple style */}
                            <div className="space-y-5">
                                {notifications.map((item, idx) => (
                                    <div key={idx} className="flex items-center gap-5 group">
                                        {item.image && (
                                            <div className="flex-shrink-0 flex items-center justify-center w-10 h-10 rounded-2xl  overflow-hidden shadow-lg">
                                                <img src={item.image} className="w-full h-full object-contain" alt="" />
                                            </div>
                                        )}
                                        <div className="text-white text-sm font-bold leading-relaxed drop-shadow-lg flex-1">
                                            {item.text}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
};
