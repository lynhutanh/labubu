import Head from "next/head";
import { useState, useEffect } from "react";
import { useRouter } from "next/router";
import Layout from "../../src/components/layout/Layout";
import {
  slotMachineService,
  SlotMachineConfig,
  SlotMachineResult,
  SlotMachineTurns,
} from "../../src/services/slot-machine.service";
import { storage } from "../../src/utils/storage";
import toast from "react-hot-toast";

export default function SlotMachinePage() {
  const router = useRouter();
  const [config, setConfig] = useState<SlotMachineConfig | null>(null);
  const [turns, setTurns] = useState<SlotMachineTurns | null>(null);
  const [loading, setLoading] = useState(true);
  const [spinning, setSpinning] = useState(false);
  const [reels, setReels] = useState<number[]>([0, 0, 0]);
  const [result, setResult] = useState<SlotMachineResult | null>(null);
  const [showWinPopup, setShowWinPopup] = useState(false);
  const [showLosePopup, setShowLosePopup] = useState(false);
  const [showInfoForm, setShowInfoForm] = useState(false);
  const [leverPulled, setLeverPulled] = useState(false);
  const [reelsStopped, setReelsStopped] = useState([false, false, false]);
  const [mounted, setMounted] = useState(false);

  // Info form
  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [address, setAddress] = useState("");
  const [submitting, setSubmitting] = useState(false);

  // History
  const [history, setHistory] = useState<SlotMachineResult[]>([]);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [historyForm, setHistoryForm] = useState({ fullName: "", phone: "", email: "", address: "" });
  const [historySubmitting, setHistorySubmitting] = useState(false);
  const [historyPage, setHistoryPage] = useState(0);
  const HISTORY_PER_PAGE = 5;

  useEffect(() => {
    setMounted(true);
    loadConfig();
    loadHistory();
  }, []);

  const loadConfig = async () => {
    try {
      setLoading(true);
      const cfg = await slotMachineService.getActiveConfig();
      setConfig(cfg);
      if (cfg) {
        const user = storage.getUser();
        if (user) {
          try {
            const t = await slotMachineService.getSlotTurns(cfg._id);
            setTurns(t);
          } catch { }
        }
      }
    } catch {
      toast.error("Không thể tải trò chơi");
    } finally {
      setLoading(false);
    }
  };

  const handlePlay = async () => {
    if (!config || spinning) return;
    const user = storage.getUser();
    if (!user) {
      toast.error("Vui lòng đăng nhập để chơi");
      router.push("/login");
      return;
    }
    if (turns && turns.remainingTurns <= 0) {
      toast.error("Bạn đã hết lượt chơi!");
      return;
    }

    try {
      setSpinning(true);
      setLeverPulled(true);
      setReelsStopped([false, false, false]);
      setResult(null);
      setShowWinPopup(false);
      setShowLosePopup(false);

      const res = await slotMachineService.play(config._id);
      setResult(res);

      // Animation: cuộn dừng lần lượt
      setTimeout(() => {
        setReels(prev => [res.reels[0], prev[1], prev[2]]);
        setReelsStopped(prev => [true, prev[1], prev[2]]);
      }, 1200);

      setTimeout(() => {
        setReels(prev => [prev[0], res.reels[1], prev[2]]);
        setReelsStopped(prev => [prev[0], true, prev[2]]);
      }, 2000);

      setTimeout(() => {
        setReels([res.reels[0], res.reels[1], res.reels[2]]);
        setReelsStopped([true, true, true]);
        setLeverPulled(false);
        setSpinning(false);

        if (res.type === "prize") {
          setTimeout(() => setShowWinPopup(true), 500);
        } else {
          setTimeout(() => setShowLosePopup(true), 500);
        }

        // Refresh turns + history
        slotMachineService.getSlotTurns(config._id).then(t => setTurns(t)).catch(() => { });
        loadHistory();
      }, 2800);
    } catch (error: any) {
      setSpinning(false);
      setLeverPulled(false);
      toast.error(error?.response?.data?.message || error?.message || "Lỗi khi chơi");
    }
  };

  const handleSubmitInfo = async () => {
    if (!result || result.type !== "prize") return;
    if (!fullName.trim() || !phone.trim()) {
      toast.error("Vui lòng nhập họ tên và số điện thoại");
      return;
    }
    try {
      setSubmitting(true);
      await slotMachineService.submitInfo(result._id, { fullName, phone, email, address });
      toast.success("Gửi thông tin thành công!");
      setShowInfoForm(false);
      setShowWinPopup(false);
      loadHistory();
    } catch {
      toast.error("Gửi thất bại");
    } finally {
      setSubmitting(false);
    }
  };

  const loadHistory = async () => {
    const user = storage.getUser();
    if (!user) return;
    try {
      const results = await slotMachineService.getMyResults();
      setHistory(results);
    } catch {
      // ignore
    }
  };

  const handleHistorySubmit = async (resultId: string) => {
    const { fullName: fn, phone: ph, email: em, address: addr } = historyForm;
    if (!fn.trim() || !ph.trim()) {
      toast.error("Vui lòng nhập họ tên và số điện thoại");
      return;
    }
    try {
      setHistorySubmitting(true);
      await slotMachineService.submitInfo(resultId, {
        fullName: fn.trim(),
        phone: ph.trim(),
        email: em.trim(),
        address: addr.trim(),
      });
      setEditingId(null);
      setHistoryForm({ fullName: "", phone: "", email: "", address: "" });
      loadHistory();
    } catch {
      toast.error("Gửi thông tin thất bại");
    } finally {
      setHistorySubmitting(false);
    }
  };

  if (!mounted) return null;

  return (
    <Layout>
      <Head>
        <title>Slot Machine - Quay số trúng thưởng</title>
      </Head>

      <style jsx global>{`
        .slot-page {
          min-height: 100vh;
          background: url("/bg.png") center / cover no-repeat fixed;
          display: flex;
          flex-direction: column;
          align-items: center;
          font-family: "Roboto", "Segoe UI", sans-serif;
          overflow-x: hidden;
          padding: 20px 0 60px;
        }

        .slot-machine-container {
          width: 100%;
          max-width: 420px;
          margin: 0 auto;
          position: relative;
        }

        .slot-bg-wrap {
          width: 100%;
          max-width: 500px;
          margin: 0 auto;
          position: relative;
          padding: 0;
          container-type: inline-size;
        }

        .slot-bg-wrap img.slot-bg-img {
          width: 100%;
          height: auto;
          display: block;
          border-radius: 16px;
        }

        .slot-bg-content {
          position: absolute;
          top: 20%;
          left: 50%;
          transform: translateX(-50%);
          width: 58%;
          z-index: 2;
        }

        /* Machine body */
        .slot-machine-body {
          position: relative;
          background: url("/thanmay.jpg") center top / 100% auto no-repeat;
          padding: 0;
          border: none;
          box-shadow: none;
          aspect-ratio: 615 / 920;
        }

        /* JACKPOT header - nằm trong bảng hiệu trên cùng */
        .slot-jackpot-header {
          position: absolute;
          top: 18%;
          left: 16%;
          right: 16%;
          text-align: center;
          padding: 0;
          z-index: 3;
          display: flex;
          align-items: center;
          justify-content: center;
          height: 10%;
        }
        .slot-jackpot-header h2 {
          font-size: 28px;
          font-weight: 900;
          color: #ffd700;
          text-shadow:
            0 0 10px rgba(255, 215, 0, 0.8),
            0 0 20px rgba(255, 165, 0, 0.6),
            2px 2px 0 #8b4513,
            -1px -1px 0 #8b4513;
          letter-spacing: 6px;
          margin: 0;
        }

        /* Reels area - nằm trong 3 ô giữa */
        .slot-reels-frame {
          position: absolute;
          top: 45%;
          height: 20%;
          background: transparent;
          border-radius: 0;
          padding: 2% 3%;
          display: flex;
          gap: 3%;
          justify-content: center;
          align-items: stretch;
          border: none;
          box-shadow: none;
        }

        .slot-reel {
          flex: 1;
          height: 100%;
          background: transparent;
          border-radius: 6px;
          overflow: hidden;
          position: relative;
          border: none;
        }

        .slot-reel-inner {
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          transition: transform 0.3s cubic-bezier(0.25, 0.1, 0.25, 1);
        }

        .slot-reel.spinning .slot-reel-inner {
          animation: reelSpin 0.15s linear infinite;
        }

        .slot-reel.stopped .slot-reel-inner {
          animation: none;
        }

        @keyframes reelSpin {
          0% { transform: translateY(0); }
          100% { transform: translateY(-120px); }
        }

        .slot-symbol {
          width: 100%;
          height: 120px;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 48px;
          font-weight: 900;
          color: #ffd700;
          text-shadow: 0 0 10px rgba(255, 215, 0, 0.6);
        }

        .slot-symbol img {
          width: 70px;
          height: 70px;
          object-fit: contain;
          filter: drop-shadow(0 0 8px rgba(255, 215, 0, 0.5));
        }




        /* Lever */
        .slot-lever-wrap {
          position: absolute;
          right: -10px;
          top: 40%;
          transform: translateY(-50%);
          z-index: 10;
        }

        .slot-lever-mount {
          width: 36px;
          height: 24px;
          background: linear-gradient(180deg, #888, #666, #555);
          border-radius: 6px 6px 8px 8px;
          position: absolute;
          left: 1px;
          bottom: -10px;
          box-shadow: -2px 2px 6px rgba(0,0,0,0.5);
          border: 2px solid #777;
          z-index: 1;
        }

        .slot-lever {
          cursor: pointer;
          transition: transform 0.4s cubic-bezier(0.4, 0, 0.2, 1);
          transform-origin: bottom center;
          position: relative;
          z-index: 2;
        }

        .slot-lever.pulled {
          transform: rotate(180deg);
        }

        .slot-lever-stick {
          width: 14px;
          height: 90px;
          background: linear-gradient(90deg, #777, #bbb, #ddd, #bbb, #777);
          border-radius: 4px;
          margin: 0 auto;
          box-shadow: 2px 0 4px rgba(0,0,0,0.3);
        }

        .slot-lever-ball {
          width: 36px;
          height: 36px;
          background: radial-gradient(circle at 35% 35%, #ff6666, #ff4444, #cc0000, #880000);
          border-radius: 50%;
          margin: 0 auto -4px;
          box-shadow:
            0 4px 8px rgba(0,0,0,0.4),
            inset 0 2px 4px rgba(255,255,255,0.3);
          border: 2px solid #aa0000;
        }

        .slot-lever-base {
          width: 24px;
          height: 16px;
          background: linear-gradient(180deg, #999, #666);
          border-radius: 0 0 6px 6px;
          margin: 0 auto;
          box-shadow: 0 2px 4px rgba(0,0,0,0.3);
        }

        /* Bottom panel - vùng cửa tròn */
        .slot-bottom-panel {
          position: absolute;
          bottom: 12%;
          left: 20%;
          right: 20%;
          text-align: center;
          z-index: 3;
        }

        .slot-play-btn {
          width: 100%;
          padding: 10px 16px;
          background: linear-gradient(180deg, #ff4444 0%, #cc0000 100%);
          color: white;
          font-size: 14px;
          font-weight: 900;
          border: none;
          border-radius: 10px;
          cursor: pointer;
          text-transform: uppercase;
          letter-spacing: 2px;
          box-shadow:
            0 4px 15px rgba(204, 0, 0, 0.5),
            inset 0 2px 4px rgba(255, 255, 255, 0.2);
          transition: all 0.2s;
        }

        .slot-play-btn:hover:not(:disabled) {
          transform: translateY(-2px);
          box-shadow: 0 6px 20px rgba(204, 0, 0, 0.7);
        }

        .slot-play-btn:disabled {
          opacity: 0.6;
          cursor: not-allowed;
        }

        .slot-turns {
          margin-top: 12px;
          color: #ffd700;
          font-size: 14px;
          font-weight: 600;
          text-shadow: 0 0 6px rgba(255, 215, 0, 0.4);
        }

        /* Decorative lights - ẩn vì hình đã trang trí */
        .slot-lights {
          display: none;
        }

        .slot-coins {
          display: none;
        }

        @keyframes lightBlink {
          0% { opacity: 0.4; transform: scale(0.8); }
          100% { opacity: 1; transform: scale(1.1); }
        }

        /* Win animation */
        .slot-win-flash .slot-reels-frame {
          animation: winFlash 0.3s ease-in-out 5;
        }

        @keyframes winFlash {
          0%, 100% { box-shadow: inset 0 4px 12px rgba(0, 0, 0, 0.8); }
          50% { box-shadow: inset 0 0 30px rgba(255, 215, 0, 0.8), 0 0 40px rgba(255, 215, 0, 0.6); }
        }

        /* Win popup */
        .slot-win-overlay {
          position: fixed;
          inset: 0;
          background: rgba(0, 0, 0, 0.85);
          z-index: 1000;
          display: flex;
          align-items: center;
          justify-content: center;
          animation: fadeIn 0.3s;
        }

        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }

        .slot-win-popup {
          background: linear-gradient(135deg, #1a0a2e 0%, #2d1b4e 50%, #1a0a2e 100%);
          border: 3px solid #ffd700;
          border-radius: 24px;
          padding: 32px;
          max-width: 400px;
          width: 90%;
          text-align: center;
          box-shadow: 0 0 60px rgba(255, 215, 0, 0.4);
          animation: popIn 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275);
        }

        @keyframes popIn {
          from { transform: scale(0.5); opacity: 0; }
          to { transform: scale(1); opacity: 1; }
        }

        .slot-win-popup h2 {
          font-size: 28px;
          font-weight: 900;
          color: #ffd700;
          text-shadow: 0 0 20px rgba(255, 215, 0, 0.6);
          margin-bottom: 16px;
        }

        .slot-win-popup .prize-image {
          width: 200px;
          height: 200px;
          object-fit: contain;
          margin: 16px auto;
          filter: drop-shadow(0 0 20px rgba(255, 215, 0, 0.5));
        }

        .slot-win-popup .prize-name {
          font-size: 20px;
          font-weight: 700;
          color: #fff;
          margin: 12px 0;
        }

        .slot-win-popup .btn-claim {
          padding: 12px 32px;
          background: linear-gradient(180deg, #ffd700, #daa520);
          color: #1a0a2e;
          font-weight: 800;
          font-size: 16px;
          border: none;
          border-radius: 12px;
          cursor: pointer;
          margin-top: 16px;
          transition: transform 0.2s;
        }

        .slot-win-popup .btn-claim:hover {
          transform: scale(1.05);
        }

        .slot-win-popup .btn-close {
          padding: 8px 24px;
          background: transparent;
          color: #aaa;
          border: 1px solid #555;
          border-radius: 8px;
          cursor: pointer;
          margin-top: 12px;
          font-size: 14px;
        }

        /* Info form */
        .slot-info-form {
          text-align: left;
          margin-top: 20px;
        }
        .slot-info-form label {
          display: block;
          color: #ccc;
          font-size: 13px;
          margin-bottom: 4px;
          margin-top: 12px;
        }
        .slot-info-form input {
          width: 100%;
          padding: 10px 12px;
          background: rgba(255, 255, 255, 0.1);
          border: 1px solid rgba(255, 215, 0, 0.3);
          border-radius: 8px;
          color: white;
          font-size: 14px;
          outline: none;
        }
        .slot-info-form input:focus {
          border-color: #ffd700;
          box-shadow: 0 0 8px rgba(255, 215, 0, 0.3);
        }

        /* Coin decorations */
        .slot-coins {
          position: absolute;
          bottom: -30px;
          left: 50%;
          transform: translateX(-50%);
          display: flex;
          gap: 4px;
        }

        .slot-coin {
          width: 20px;
          height: 20px;
          background: radial-gradient(circle at 35% 35%, #ffd700, #daa520, #b8860b);
          border-radius: 50%;
          border: 1px solid #8b6914;
          box-shadow: 0 2px 4px rgba(0,0,0,0.3);
        }

        @media (max-width: 500px) {
          .slot-bg-content {
            width: 290px;
            transform: translateX(-50%) scale(calc(100cqi / 500));
            transform-origin: top center;
          }
          .slot-bottom-panel {
            transform: translateY(30px);
          }
        }
      `}</style>

      <div className="slot-page">
        <div className="slot-bg-wrap">
          <img src="/vongquayjackpot.jpg" alt="" className="slot-bg-img" />
          <div className="slot-bg-content">
            <div className="slot-machine-container">
              {loading ? (
                <div style={{ textAlign: "center", padding: "60px 0" }}>
                  <div style={{ width: 48, height: 48, border: "3px solid #ffd700", borderTopColor: "transparent", borderRadius: "50%", margin: "0 auto", animation: "spin 1s linear infinite" }} />
                  <p style={{ color: "#ffd700", marginTop: 16 }}>Đang tải...</p>
                </div>
              ) : !config ? (
                <div style={{ textAlign: "center", padding: "60px 20px" }}>
                  <p style={{ color: "#ffd700", fontSize: 18 }}>Chưa có sự kiện nào đang diễn ra</p>
                </div>
              ) : (
                <>
                  {/* Machine */}
                  <div className={`slot-machine-body ${result?.type === "prize" && reelsStopped.every(Boolean) ? "slot-win-flash" : ""}`}>
                    {/* Lights */}
                    <div className="slot-lights">
                      {Array.from({ length: 11 }).map((_, i) => (
                        <div key={i} className="slot-light" />
                      ))}
                    </div>

                    {/* JACKPOT Header */}
                    <div className="slot-jackpot-header">
                      <h2>JACKPOT</h2>
                    </div>

                    {/* Reels */}
                    <div className="slot-reels-frame" style={{ position: "relative" }}>
                      {[0, 1, 2].map(reelIndex => (
                        <div
                          key={reelIndex}
                          className={`slot-reel ${spinning && !reelsStopped[reelIndex] ? "spinning" : "stopped"}`}
                        >
                          <div
                            className="slot-reel-inner"
                            style={{
                              transform: reelsStopped[reelIndex]
                                ? `translateY(-${reels[reelIndex] * 120}px)`
                                : undefined,
                            }}
                          >
                            {config.symbols.map((symbol, sIdx) => (
                              <div key={sIdx} className="slot-symbol">
                                {symbol.image ? (
                                  <img src={symbol.image} alt={symbol.label} />
                                ) : (
                                  <span>{symbol.label}</span>
                                )}
                              </div>
                            ))}
                            {/* Duplicate for seamless loop */}
                            {config.symbols.map((symbol, sIdx) => (
                              <div key={`dup-${sIdx}`} className="slot-symbol">
                                {symbol.image ? (
                                  <img src={symbol.image} alt={symbol.label} />
                                ) : (
                                  <span>{symbol.label}</span>
                                )}
                              </div>
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>

                    {/* Lever */}
                    <div className="slot-lever-wrap">
                      <div className="slot-lever-mount" />
                      <div
                        className={`slot-lever ${leverPulled ? "pulled" : ""}`}
                        onClick={handlePlay}
                        title="Kéo cần gạt để chơi!"
                      >
                        <div className="slot-lever-ball" />
                        <div className="slot-lever-stick" />
                        <div className="slot-lever-base" />
                      </div>
                    </div>

                    {/* Bottom */}
                    <div className="slot-bottom-panel">
                      <button
                        className="slot-play-btn"
                        onClick={handlePlay}
                        disabled={spinning || !config}
                      >
                        {spinning ? "Đang quay..." : "🎰 QUAY SỐ"}
                      </button>

                      {turns && (
                        <p className="slot-turns">
                          Lượt chơi: {turns.remainingTurns} / {turns.totalTurns}
                        </p>
                      )}
                    </div>

                    {/* Coins */}
                    <div className="slot-coins">
                      {Array.from({ length: 7 }).map((_, i) => (
                        <div key={i} className="slot-coin" />
                      ))}
                    </div>
                  </div>

                  {/* Event info */}
                  <div style={{ textAlign: "center", marginTop: 50, color: "#ffd700", fontSize: 14, opacity: 0.7 }}>
                    <p>{config.name}</p>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>

        {/* History - ngoài nền */}
        {history.length > 0 && (() => {
          const totalPages = Math.ceil(history.length / HISTORY_PER_PAGE);
          const paged = history.slice(historyPage * HISTORY_PER_PAGE, (historyPage + 1) * HISTORY_PER_PAGE);
          return (
            <div style={{ marginTop: 40, width: "100%", maxWidth: 420 }}>
              <h3 style={{ color: "#ffd700", fontSize: 18, fontWeight: 700, marginBottom: 16, textAlign: "center" }}>📋 Lịch sử quay</h3>
              {paged.map((item) => {
                const isPrize = item.type === "prize";
                const hasSentInfo = isPrize && !!item.fullName;
                const isEditing = editingId === item._id;
                return (
                  <div key={item._id} style={{ marginBottom: 12 }}>
                    <div style={{
                      display: "flex", alignItems: "center", gap: 12, padding: "12px 16px",
                      background: isPrize ? "rgba(255,215,0,0.1)" : "rgba(255,255,255,0.05)",
                      borderRadius: 12, border: `1px solid ${isPrize ? "rgba(255,215,0,0.3)" : "rgba(255,255,255,0.1)"}`,
                    }}>
                      {isPrize && item.prizeImage && (
                        <img src={item.prizeImage} alt="" style={{ width: 40, height: 40, objectFit: "contain", borderRadius: 8 }} />
                      )}
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ color: isPrize ? "#ffd700" : "#aaa", fontSize: 14, fontWeight: 600 }}>
                          {isPrize ? item.prizeLabel : "Chưa trúng"}
                        </div>
                        <div style={{ color: "#888", fontSize: 12, marginTop: 2 }}>
                          {new Date(item.createdAt).toLocaleString("vi-VN")}
                        </div>
                      </div>
                      {isPrize ? (
                        hasSentInfo ? (
                          <span style={{ color: "#4ade80", fontSize: 12, fontWeight: 600 }}>✅ Đã gửi</span>
                        ) : (
                          <button
                            onClick={() => { setEditingId(isEditing ? null : item._id); setHistoryForm({ fullName: "", phone: "", email: "", address: "" }); }}
                            style={{ background: "rgba(255,215,0,0.2)", border: "1px solid rgba(255,215,0,0.4)", color: "#ffd700", padding: "6px 12px", borderRadius: 8, cursor: "pointer", fontSize: 12, fontWeight: 600 }}
                          >
                            📝 Gửi info
                          </button>
                        )
                      ) : (
                        <span style={{ color: "#888", fontSize: 12 }}>Chưa trúng</span>
                      )}
                    </div>
                    {isEditing && (
                      <div style={{ padding: "12px 16px", background: "rgba(255,255,255,0.05)", borderRadius: "0 0 12px 12px", marginTop: -1, border: "1px solid rgba(255,215,0,0.2)", borderTop: "none" }}>
                        <div className="slot-info-form">
                          <label>Họ tên *</label>
                          <input value={historyForm.fullName} onChange={(e) => setHistoryForm({ ...historyForm, fullName: e.target.value })} placeholder="Nhập họ tên" />
                          <label>SĐT *</label>
                          <input value={historyForm.phone} onChange={(e) => setHistoryForm({ ...historyForm, phone: e.target.value })} placeholder="Nhập SĐT" />
                          <label>Email</label>
                          <input value={historyForm.email} onChange={(e) => setHistoryForm({ ...historyForm, email: e.target.value })} placeholder="Nhập email" />
                          <label>Địa chỉ</label>
                          <input value={historyForm.address} onChange={(e) => setHistoryForm({ ...historyForm, address: e.target.value })} placeholder="Nhập địa chỉ" />
                        </div>
                        <div style={{ display: "flex", gap: 8, marginTop: 12, justifyContent: "center" }}>
                          <button className="btn-claim" style={{ fontSize: 13, padding: "8px 20px" }} onClick={() => handleHistorySubmit(item._id)} disabled={historySubmitting}>
                            {historySubmitting ? "Đang gửi..." : "Gửi"}
                          </button>
                          <button className="btn-close" style={{ fontSize: 13, padding: "8px 16px" }} onClick={() => setEditingId(null)}>Hủy</button>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
              {totalPages > 1 && (
                <div style={{ display: "flex", justifyContent: "center", alignItems: "center", gap: 16, marginTop: 16 }}>
                  <button
                    onClick={() => setHistoryPage((p) => Math.max(0, p - 1))}
                    disabled={historyPage === 0}
                    style={{
                      background: "rgba(255,215,0,0.15)", border: "1px solid rgba(255,215,0,0.3)",
                      color: historyPage === 0 ? "#666" : "#ffd700", padding: "6px 16px",
                      borderRadius: 8, cursor: historyPage === 0 ? "not-allowed" : "pointer", fontSize: 13,
                    }}
                  >
                    ← Trước
                  </button>
                  <span style={{ color: "#aaa", fontSize: 13 }}>{historyPage + 1} / {totalPages}</span>
                  <button
                    onClick={() => setHistoryPage((p) => Math.min(totalPages - 1, p + 1))}
                    disabled={historyPage >= totalPages - 1}
                    style={{
                      background: "rgba(255,215,0,0.15)", border: "1px solid rgba(255,215,0,0.3)",
                      color: historyPage >= totalPages - 1 ? "#666" : "#ffd700", padding: "6px 16px",
                      borderRadius: 8, cursor: historyPage >= totalPages - 1 ? "not-allowed" : "pointer", fontSize: 13,
                    }}
                  >
                    Sau →
                  </button>
                </div>
              )}
            </div>
          );
        })()}

        {/* Lose Popup */}
        {showLosePopup && (
          <div className="slot-win-overlay" onClick={() => setShowLosePopup(false)}>
            <div className="slot-win-popup" onClick={(e) => e.stopPropagation()}>
              <div style={{ fontSize: 64, marginBottom: 12 }}>😢</div>
              <p style={{ color: "#aaa", fontSize: 18, fontWeight: 600, marginBottom: 20 }}>
                Chúc bạn may mắn lần sau!
              </p>
              <button className="btn-close" onClick={() => setShowLosePopup(false)}>
                Đóng
              </button>
            </div>
          </div>
        )}

        {/* Win Popup */}
        {showWinPopup && result && result.type === "prize" && (
          <div className="slot-win-overlay" onClick={() => !showInfoForm && setShowWinPopup(false)}>
            <div className="slot-win-popup" onClick={e => e.stopPropagation()}>
              <h2>🎉 CHÚC MỪNG! 🎉</h2>
              <p style={{ color: "#ffd700", fontSize: 16 }}>Bạn đã trúng thưởng!</p>

              {result.prizeImage && (
                <img src={result.prizeImage} alt={result.prizeLabel} className="prize-image" />
              )}
              <p className="prize-name">{result.prizeLabel}</p>

              {!showInfoForm ? (
                <>
                  <button className="btn-claim" onClick={() => setShowInfoForm(true)}>
                    Nhận thưởng
                  </button>
                  <br />
                  <button className="btn-close" onClick={() => setShowWinPopup(false)}>
                    Đóng
                  </button>
                </>
              ) : (
                <div className="slot-info-form">
                  <label>Họ tên *</label>
                  <input value={fullName} onChange={e => setFullName(e.target.value)} placeholder="Nhập họ tên" />

                  <label>Số điện thoại *</label>
                  <input value={phone} onChange={e => setPhone(e.target.value)} placeholder="Nhập SĐT" />

                  <label>Email</label>
                  <input value={email} onChange={e => setEmail(e.target.value)} placeholder="Nhập email" />

                  <label>Địa chỉ nhận quà</label>
                  <input value={address} onChange={e => setAddress(e.target.value)} placeholder="Nhập địa chỉ" />

                  <div style={{ display: "flex", gap: 12, marginTop: 20, justifyContent: "center" }}>
                    <button className="btn-close" onClick={() => setShowInfoForm(false)}>Quay lại</button>
                    <button className="btn-claim" onClick={handleSubmitInfo} disabled={submitting}>
                      {submitting ? "Đang gửi..." : "Gửi thông tin"}
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      <style jsx global>{`
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}</style>
    </Layout>
  );
}
