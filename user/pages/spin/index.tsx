import { useState, useEffect, useRef } from "react";
import Head from "next/head";
import { spinService, SpinConfig, SpinResult } from "../../src/services/spin.service";
import Layout from "../../src/components/layout/Layout";

const STORAGE_KEY = "spin_result_ids";

const getSavedResultIds = (): string[] => {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY) || "[]");
  } catch {
    return [];
  }
};

const saveResultId = (id: string) => {
  const ids = getSavedResultIds();
  if (!ids.includes(id)) {
    ids.unshift(id);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(ids));
  }
};

export default function SpinPage() {
  const [config, setConfig] = useState<SpinConfig | null>(null);
  const [loading, setLoading] = useState(true);
  const [spinning, setSpinning] = useState(false);
  const [result, setResult] = useState<SpinResult | null>(null);
  const [showResult, setShowResult] = useState(false);
  const [showInfoForm, setShowInfoForm] = useState(false);
  const [rotation, setRotation] = useState(0);
  const [hasSpun, setHasSpun] = useState(false);
  const wheelRef = useRef<HTMLDivElement>(null);

  // Info form
  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [address, setAddress] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  // History
  const [history, setHistory] = useState<SpinResult[]>([]);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [historyForm, setHistoryForm] = useState({ fullName: "", phone: "", email: "", address: "" });
  const [historySubmitting, setHistorySubmitting] = useState(false);

  useEffect(() => {
    loadConfig();
    loadHistory();
  }, []);

  const loadConfig = async () => {
    try {
      const data = await spinService.getActiveConfig();
      setConfig(data);
    } catch {
      // no active config
    } finally {
      setLoading(false);
    }
  };

  const handleSpin = async () => {
    if (!config || spinning) return;

    setSpinning(true);
    setShowResult(false);
    setResult(null);

    try {
      const res = await spinService.play(config._id);

      if (!res || typeof res.slotIndex !== "number") {
        console.error("Invalid spin result:", res);
        setSpinning(false);
        alert("Kết quả quay không hợp lệ");
        return;
      }

      setResult(res);
      saveResultId(res._id);

      const slotCount = config.slots.length;
      const slotAngle = 360 / slotCount;
      const targetAngle = res.slotIndex * slotAngle + slotAngle / 2;
      const spins = 5 + Math.floor(Math.random() * 3);
      const baseRotation = hasSpun ? rotation : 0;
      const currentAngle = baseRotation % 360;
      const additionalRotation = (targetAngle - currentAngle + 360) % 360;
      const finalRotation = baseRotation + spins * 360 + additionalRotation;

      if (!hasSpun) {
        setHasSpun(true);
        requestAnimationFrame(() => {
          requestAnimationFrame(() => {
            setRotation(finalRotation);
          });
        });
      } else {
        setRotation(finalRotation);
      }

      setTimeout(() => {
        setSpinning(false);
        setShowResult(true);
        loadHistory();
      }, 5000);
    } catch (err: any) {
      console.error("Spin error:", err);
      setSpinning(false);
      const msg = err?.message || err?.data?.message || "Quay thất bại";
      alert(msg);
    }
  };

  const handleSubmitInfo = async () => {
    if (!result || result.type !== "prize") return;
    if (!fullName.trim() || !phone.trim() || !email.trim() || !address.trim()) {
      alert("Vui lòng nhập đầy đủ thông tin");
      return;
    }
    try {
      setSubmitting(true);
      await spinService.submitInfo(result._id, {
        fullName: fullName.trim(),
        phone: phone.trim(),
        email: email.trim(),
        address: address.trim(),
      });
      setSubmitted(true);
    } catch {
      alert("Gửi thông tin thất bại");
    } finally {
      setSubmitting(false);
    }
  };

  const closeResult = () => {
    setShowResult(false);
    setShowInfoForm(false);
    setResult(null);
    setSubmitted(false);
    setFullName("");
    setPhone("");
    setEmail("");
    setAddress("");
    loadHistory();
  };

  const loadHistory = async () => {
    const ids = getSavedResultIds();
    if (!ids.length) return;
    try {
      const results = await spinService.getResultsByIds(ids);
      setHistory(results);
    } catch {
      // ignore
    }
  };

  const handleHistorySubmit = async (resultId: string) => {
    const { fullName: fn, phone: ph, email: em, address: addr } = historyForm;
    if (!fn.trim() || !ph.trim() || !em.trim() || !addr.trim()) {
      alert("Vui lòng nhập đầy đủ thông tin");
      return;
    }
    try {
      setHistorySubmitting(true);
      await spinService.submitInfo(resultId, {
        fullName: fn.trim(),
        phone: ph.trim(),
        email: em.trim(),
        address: addr.trim(),
      });
      setEditingId(null);
      setHistoryForm({ fullName: "", phone: "", email: "", address: "" });
      loadHistory();
    } catch {
      alert("Gửi thông tin thất bại");
    } finally {
      setHistorySubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="spin-page">
        <div className="spin-loading">Đang tải...</div>
      </div>
    );
  }

  if (!config) {
    return (
      <div className="spin-page">
        <div className="spin-no-event">
          <h2>Hiện chưa có sự kiện vòng quay nào</h2>
          <p>Vui lòng quay lại sau!</p>
        </div>
      </div>
    );
  }

  const slotCount = config.slots.length;
  const slotAngle = 360 / slotCount;
  const now = new Date();
  const isActive = new Date(config.startDate) <= now && new Date(config.endDate) >= now;
  const apiUrl = process.env.NEXT_PUBLIC_API_ENDPOINT || "http://localhost:5001";

  const getImageUrl = (url: string) => {
    if (!url) return "";
    if (url.startsWith("http")) return url;
    return `${apiUrl}${url}`;
  };

  return (
    <Layout>
      <Head>
        <title>Vòng Quay May Mắn - Labubu</title>
        <meta name="description" content="Vòng quay may mắn - Cơ hội trúng thưởng lớn!" />
      </Head>

      <style jsx global>{`
        .spin-page {
          min-height: 100vh;
          background: linear-gradient(135deg, #fff5f5 0%, #fff0e6 30%, #fef3c7 50%, #fff0e6 70%, #fff5f5 100%);
          display: flex;
          flex-direction: column;
          align-items: center;
          font-family: 'Roboto', 'Segoe UI', sans-serif;
          overflow-x: hidden;
        }

        .spin-header {
          width: 100%;
          max-width: 500px;
          margin: 0 auto;
          padding: 16px;
          text-align: center;
        }

        .spin-title {
          background: linear-gradient(135deg, #8B0000, #a80000);
          color: #FFD700;
          font-size: 28px;
          font-weight: 900;
          padding: 14px 32px;
          border-radius: 8px;
          text-transform: uppercase;
          letter-spacing: 2px;
          border: 3px solid #FFD700;
          box-shadow: 0 4px 20px rgba(139, 0, 0, 0.4);
          text-shadow: 2px 2px 4px rgba(0,0,0,0.5);
        }

        .spin-event-time {
          background: white;
          border-radius: 16px;
          padding: 14px 20px;
          margin: 16px auto;
          max-width: 460px;
          box-shadow: 0 2px 15px rgba(0,0,0,0.08);
          display: flex;
          align-items: center;
          gap: 12px;
        }

        .spin-event-time .icon { font-size: 28px; }
        .spin-event-time .time-label { font-weight: 700; color: #333; font-size: 15px; }
        .spin-event-time .time-value { color: #666; font-size: 13px; margin-top: 2px; }

        /* Wheel */
        .spin-wheel-container {
          position: relative;
          width: 340px;
          height: 340px;
          margin: 24px auto;
        }

        .spin-wheel-outer {
          position: absolute;
          inset: -12px;
          border-radius: 50%;
          background: linear-gradient(135deg, #dc2626, #991b1b);
          box-shadow: 0 0 30px rgba(220, 38, 38, 0.5), inset 0 0 20px rgba(0,0,0,0.2);
        }

        .spin-wheel-dots {
          position: absolute;
          inset: 0;
          border-radius: 50%;
        }

        .spin-wheel-dot {
          position: absolute;
          width: 8px;
          height: 8px;
          border-radius: 50%;
          background: #FFD700;
          box-shadow: 0 0 6px #FFD700;
        }

        .spin-wheel {
          position: absolute;
          inset: 0;
          border-radius: 50%;
          overflow: hidden;
          transition: transform 5s cubic-bezier(0.17, 0.67, 0.12, 0.99);
          background: white;
        }

        .spin-wheel.no-transition { transition: none; }

        .spin-slot {
          position: absolute;
          top: 0;
          left: 50%;
          width: 50%;
          height: 50%;
          transform-origin: 0% 100%;
          overflow: hidden;
          border-right: 1px solid rgba(200, 200, 200, 0.3);
        }

        .spin-slot-content {
          position: absolute;
          top: 15%;
          left: 25%;
          transform: translateX(-50%);
          text-align: center;
          width: 80px;
        }

        .spin-slot-image {
          width: 40px;
          height: 40px;
          object-fit: contain;
          margin: 0 auto 4px;
        }

        .spin-slot-label {
          font-size: 8px;
          font-weight: 600;
          color: #333;
          line-height: 1.2;
          max-width: 70px;
          margin: 0 auto;
          word-wrap: break-word;
        }

        .spin-slot-even { background: #fff5f5; }
        .spin-slot-odd { background: white; }

        /* Center button */
        .spin-center-btn {
          position: absolute;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%);
          width: 70px;
          height: 70px;
          border-radius: 50%;
          background: linear-gradient(135deg, #f59e0b, #f97316);
          border: 4px solid #FFD700;
          color: white;
          font-weight: 900;
          font-size: 13px;
          cursor: pointer;
          z-index: 10;
          box-shadow: 0 4px 20px rgba(245, 158, 11, 0.5);
          transition: transform 0.2s, box-shadow 0.2s;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .spin-center-btn:hover:not(:disabled) {
          transform: translate(-50%, -50%) scale(1.1);
          box-shadow: 0 6px 30px rgba(245, 158, 11, 0.7);
        }

        .spin-center-btn:disabled { opacity: 0.6; cursor: not-allowed; }

        /* Pointer */
        .spin-pointer {
          position: absolute;
          top: -8px;
          left: 50%;
          transform: translateX(-50%);
          width: 0;
          height: 0;
          border-left: 14px solid transparent;
          border-right: 14px solid transparent;
          border-top: 26px solid #FFD700;
          z-index: 20;
          filter: drop-shadow(0 2px 4px rgba(0,0,0,0.3));
        }

        /* Popup overlay */
        .spin-overlay {
          position: fixed;
          inset: 0;
          background: rgba(0,0,0,0.6);
          z-index: 100;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 20px;
          backdrop-filter: blur(4px);
        }

        .spin-popup {
          background: white;
          border-radius: 24px;
          padding: 32px 24px;
          max-width: 420px;
          width: 100%;
          text-align: center;
          box-shadow: 0 20px 60px rgba(0,0,0,0.3);
          animation: popupIn 0.3s ease;
        }

        @keyframes popupIn {
          from { opacity: 0; transform: scale(0.8); }
          to { opacity: 1; transform: scale(1); }
        }

        .spin-popup-prize { border: 3px solid #FFD700; }
        .spin-popup h2 { font-size: 24px; font-weight: 900; margin-bottom: 8px; }
        .spin-popup-prize h2 { color: #f59e0b; }
        .spin-popup-lose h2 { color: #666; }

        .spin-popup-image {
          width: 120px;
          height: 120px;
          object-fit: contain;
          margin: 16px auto;
        }

        .spin-popup-label {
          font-size: 18px;
          font-weight: 700;
          color: #333;
          margin-bottom: 20px;
        }

        .spin-popup-btn {
          padding: 14px 40px;
          border-radius: 30px;
          border: none;
          font-size: 16px;
          font-weight: 700;
          cursor: pointer;
          transition: transform 0.2s, box-shadow 0.2s;
        }

        .spin-popup-btn:hover { transform: scale(1.05); }

        .spin-popup-btn-primary {
          background: linear-gradient(135deg, #f59e0b, #f97316);
          color: white;
          box-shadow: 0 4px 15px rgba(245, 158, 11, 0.4);
        }

        .spin-popup-btn-secondary {
          background: #f3f4f6;
          color: #666;
          margin-left: 8px;
        }

        /* Info form */
        .spin-info-form { text-align: left; margin-top: 16px; }
        .spin-info-form label {
          display: block;
          font-size: 13px;
          font-weight: 600;
          color: #555;
          margin-bottom: 4px;
          margin-top: 12px;
        }
        .spin-info-form input {
          width: 100%;
          padding: 12px 16px;
          border: 2px solid #e5e7eb;
          border-radius: 12px;
          font-size: 15px;
          outline: none;
          transition: border-color 0.2s;
          box-sizing: border-box;
        }
        .spin-info-form input:focus { border-color: #f59e0b; }

        .spin-success-message {
          color: #16a34a;
          font-size: 18px;
          font-weight: 700;
          margin: 20px 0;
        }

        .spin-loading, .spin-no-event { text-align: center; padding: 60px 20px; }
        .spin-no-event h2 { font-size: 22px; color: #999; margin-bottom: 8px; }
        .spin-no-event p { color: #bbb; }

        /* History */
        .spin-history {
          width: 100%;
          max-width: 500px;
          margin: 32px auto;
          padding: 0 16px 40px;
        }

        .spin-history-title {
          font-size: 20px;
          font-weight: 800;
          color: #333;
          margin-bottom: 16px;
          display: flex;
          align-items: center;
          gap: 8px;
        }

        .spin-history-item {
          background: white;
          border-radius: 16px;
          padding: 16px;
          margin-bottom: 12px;
          box-shadow: 0 2px 12px rgba(0,0,0,0.06);
          display: flex;
          align-items: center;
          gap: 12px;
        }

        .spin-history-item.prize { border-left: 4px solid #f59e0b; }
        .spin-history-item.lose { border-left: 4px solid #d1d5db; }

        .spin-history-img {
          width: 48px;
          height: 48px;
          object-fit: contain;
          border-radius: 8px;
          background: #f9fafb;
          flex-shrink: 0;
        }

        .spin-history-info { flex: 1; min-width: 0; }

        .spin-history-label {
          font-size: 15px;
          font-weight: 700;
          color: #333;
          margin-bottom: 2px;
        }

        .spin-history-meta {
          font-size: 12px;
          color: #999;
        }

        .spin-history-badge {
          font-size: 11px;
          font-weight: 600;
          padding: 4px 10px;
          border-radius: 20px;
          white-space: nowrap;
        }

        .spin-history-badge.sent {
          background: #dcfce7;
          color: #16a34a;
        }

        .spin-history-badge.not-sent {
          background: linear-gradient(135deg, #f59e0b, #f97316);
          color: white;
          cursor: pointer;
          transition: transform 0.2s;
        }

        .spin-history-badge.not-sent:hover { transform: scale(1.05); }

        .spin-history-badge.lose-badge {
          background: #f3f4f6;
          color: #999;
        }

        .spin-history-form {
          background: #fffbeb;
          border-radius: 12px;
          padding: 16px;
          margin-top: 8px;
        }

        .spin-history-form label {
          display: block;
          font-size: 12px;
          font-weight: 600;
          color: #555;
          margin-bottom: 4px;
          margin-top: 10px;
        }

        .spin-history-form label:first-child { margin-top: 0; }

        .spin-history-form input {
          width: 100%;
          padding: 10px 12px;
          border: 2px solid #e5e7eb;
          border-radius: 10px;
          font-size: 14px;
          outline: none;
          transition: border-color 0.2s;
          box-sizing: border-box;
        }

        .spin-history-form input:focus { border-color: #f59e0b; }

        .spin-history-form-actions {
          display: flex;
          gap: 8px;
          margin-top: 12px;
        }

        .spin-history-empty {
          text-align: center;
          color: #bbb;
          padding: 20px;
          font-size: 14px;
        }
      `}</style>

      <div className="spin-page">
        {/* Header */}
        <div className="spin-header">
          <div className="spin-title">🎰 Vòng Quay May Mắn</div>
        </div>

        {/* Event Time */}
        <div className="spin-event-time">
          <span className="icon">⏰</span>
          <div>
            <div className="time-label">Thời gian sự kiện</div>
            <div className="time-value">
              {new Date(config.startDate).toLocaleString("vi-VN")} ~ {new Date(config.endDate).toLocaleString("vi-VN")}
            </div>
          </div>
        </div>

        {/* Wheel */}
        <div className="spin-wheel-container">
          <div className="spin-wheel-outer">
            <div className="spin-wheel-dots">
              {Array.from({ length: 24 }).map((_, i) => {
                const angle = (i * 360) / 24;
                const rad = (angle * Math.PI) / 180;
                const r = 170;
                const cx = 170 + r * Math.cos(rad);
                const cy = 170 + r * Math.sin(rad);
                return (
                  <div
                    key={i}
                    className="spin-wheel-dot"
                    style={{ left: cx, top: cy, transform: "translate(-50%, -50%)" }}
                  />
                );
              })}
            </div>
          </div>

          <div className="spin-pointer" />

          <div
            ref={wheelRef}
            className={`spin-wheel ${!hasSpun ? "no-transition" : ""}`}
            style={{ transform: `rotate(${rotation}deg)` }}
          >
            {config.slots.map((slot, i) => {
              const rotate = i * slotAngle - 90;
              const skew = -(90 - slotAngle);
              return (
                <div
                  key={i}
                  className={`spin-slot ${i % 2 === 0 ? "spin-slot-even" : "spin-slot-odd"}`}
                  style={{ transform: `rotate(${rotate}deg) skewY(${skew}deg)` }}
                >
                  <div
                    className="spin-slot-content"
                    style={{ transform: `skewY(${-skew}deg) rotate(${slotAngle / 2}deg)` }}
                  >
                    {slot.image && (
                      <img src={getImageUrl(slot.image)} alt={slot.label} className="spin-slot-image" />
                    )}
                    <div className="spin-slot-label">{slot.label}</div>
                  </div>
                </div>
              );
            })}
          </div>

          <button
            className="spin-center-btn"
            onClick={handleSpin}
            disabled={spinning || !isActive}
          >
            {spinning ? "..." : "Quay"}
          </button>
        </div>

        {/* Result Popup */}
        {showResult && result && (
          <div className="spin-overlay" onClick={e => { if (e.target === e.currentTarget) closeResult(); }}>
            <div className={`spin-popup ${result.type === "prize" ? "spin-popup-prize" : "spin-popup-lose"}`}>
              {!showInfoForm && !submitted ? (
                <>
                  <h2>{result.type === "prize" ? "🎉 Chúc mừng!" : "😊"}</h2>

                  {result.slotImage && (
                    <img src={getImageUrl(result.slotImage)} alt="" className="spin-popup-image" />
                  )}

                  <div className="spin-popup-label">{result.slotLabel}</div>

                  {result.type === "prize" ? (
                    <button
                      className="spin-popup-btn spin-popup-btn-primary"
                      onClick={() => setShowInfoForm(true)}
                    >
                      Nhận quà →
                    </button>
                  ) : (
                    <button className="spin-popup-btn spin-popup-btn-secondary" onClick={closeResult}>
                      Đóng
                    </button>
                  )}
                </>
              ) : submitted ? (
                <>
                  <h2 style={{ color: "#16a34a" }}>✅ Đã gửi!</h2>
                  <p className="spin-success-message">
                    Thông tin nhận quà đã được gửi thành công.
                    <br />Chúng tôi sẽ liên hệ bạn sớm nhất!
                  </p>
                  <button className="spin-popup-btn spin-popup-btn-primary" onClick={closeResult}>
                    Đóng
                  </button>
                </>
              ) : (
                <>
                  <h2 style={{ color: "#f59e0b" }}>📝 Thông tin nhận quà</h2>

                  {result.slotImage && (
                    <img src={getImageUrl(result.slotImage)} alt="" className="spin-popup-image" style={{ width: 80, height: 80 }} />
                  )}
                  <div className="spin-popup-label" style={{ fontSize: 14 }}>{result.slotLabel}</div>

                  <div className="spin-info-form">
                    <label>Họ tên</label>
                    <input value={fullName} onChange={e => setFullName(e.target.value)} placeholder="Nguyễn Văn A" />

                    <label>Số điện thoại</label>
                    <input value={phone} onChange={e => setPhone(e.target.value)} placeholder="0912345678" />

                    <label>Email</label>
                    <input value={email} onChange={e => setEmail(e.target.value)} placeholder="email@example.com" type="email" />

                    <label>Địa chỉ nhận quà</label>
                    <input value={address} onChange={e => setAddress(e.target.value)} placeholder="123 Nguyễn Huệ, Q1, TP.HCM" />
                  </div>

                  <div style={{ marginTop: 20, display: "flex", gap: 8, justifyContent: "center" }}>
                    <button
                      className="spin-popup-btn spin-popup-btn-primary"
                      onClick={handleSubmitInfo}
                      disabled={submitting}
                    >
                      {submitting ? "Đang gửi..." : "Gửi thông tin"}
                    </button>
                    <button className="spin-popup-btn spin-popup-btn-secondary" onClick={() => setShowInfoForm(false)}>
                      Quay lại
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>
        )}

        {/* History */}
        {history.length > 0 && (
          <div className="spin-history">
            <div className="spin-history-title">📋 Lịch sử quay</div>
            {history.map((item) => {
              const isPrize = item.type === "prize";
              const hasSentInfo = isPrize && !!item.fullName;
              const isEditing = editingId === item._id;

              return (
                <div key={item._id}>
                  <div className={`spin-history-item ${isPrize ? "prize" : "lose"}`}>
                    {item.slotImage && (
                      <img src={getImageUrl(item.slotImage)} alt="" className="spin-history-img" />
                    )}
                    <div className="spin-history-info">
                      <div className="spin-history-label">{item.slotLabel}</div>
                      <div className="spin-history-meta">
                        {new Date(item.createdAt).toLocaleString("vi-VN")}
                      </div>
                    </div>
                    {isPrize ? (
                      hasSentInfo ? (
                        <span className="spin-history-badge sent">✅ Đã gửi</span>
                      ) : (
                        <button
                          className="spin-history-badge not-sent"
                          onClick={() => {
                            setEditingId(isEditing ? null : item._id);
                            setHistoryForm({ fullName: "", phone: "", email: "", address: "" });
                          }}
                        >
                          📝 Gửi thông tin
                        </button>
                      )
                    ) : (
                      <span className="spin-history-badge lose-badge">Chưa trúng</span>
                    )}
                  </div>

                  {isEditing && (
                    <div className="spin-history-form">
                      <label>Họ tên</label>
                      <input
                        value={historyForm.fullName}
                        onChange={(e) => setHistoryForm({ ...historyForm, fullName: e.target.value })}
                        placeholder="Nguyễn Văn A"
                      />
                      <label>Số điện thoại</label>
                      <input
                        value={historyForm.phone}
                        onChange={(e) => setHistoryForm({ ...historyForm, phone: e.target.value })}
                        placeholder="0912345678"
                      />
                      <label>Email</label>
                      <input
                        value={historyForm.email}
                        onChange={(e) => setHistoryForm({ ...historyForm, email: e.target.value })}
                        placeholder="email@example.com"
                        type="email"
                      />
                      <label>Địa chỉ nhận quà</label>
                      <input
                        value={historyForm.address}
                        onChange={(e) => setHistoryForm({ ...historyForm, address: e.target.value })}
                        placeholder="123 Nguyễn Huệ, Q1, TP.HCM"
                      />
                      <div className="spin-history-form-actions">
                        <button
                          className="spin-popup-btn spin-popup-btn-primary"
                          style={{ fontSize: 13, padding: "10px 24px" }}
                          onClick={() => handleHistorySubmit(item._id)}
                          disabled={historySubmitting}
                        >
                          {historySubmitting ? "Đang gửi..." : "Gửi thông tin"}
                        </button>
                        <button
                          className="spin-popup-btn spin-popup-btn-secondary"
                          style={{ fontSize: 13, padding: "10px 16px" }}
                          onClick={() => setEditingId(null)}
                        >
                          Hủy
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </Layout>
  );
}
