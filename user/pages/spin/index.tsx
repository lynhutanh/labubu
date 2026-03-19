import { useState, useEffect, useRef } from "react";
import Head from "next/head";
import { spinService, SpinConfig, SpinResult, SpinTurns } from "../../src/services/spin.service";
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

  // Turns
  const [turns, setTurns] = useState<SpinTurns | null>(null);
  const needsTurnsCheck = config ? ((config.minSpentAmount || 0) > 0 || (config.maxSpinsPerUser || 0) > 0) : false;

  useEffect(() => {
    loadConfig();
    loadHistory();
  }, []);

  const loadConfig = async () => {
    try {
      const data = await spinService.getActiveConfig();
      setConfig(data);
      if (data && ((data.minSpentAmount || 0) > 0 || (data.maxSpinsPerUser || 0) > 0)) {
        loadTurns(data._id);
      }
    } catch {
      // no active config
    } finally {
      setLoading(false);
    }
  };

  const loadTurns = async (configId: string) => {
    try {
      const data = await spinService.getSpinTurns(configId);
      setTurns(data);
    } catch {
      // chưa đăng nhập hoặc lỗi
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
      // Slot i bắt đầu ở góc (i * slotAngle) trên wheel (trước offset -90 render)
      // Giữa slot i nằm ở góc: i * slotAngle + slotAngle/2
      // Kim ở top = 0° (trước rotate). Wheel quay rotation°.
      // Để giữa slot i nằm dưới kim: rotation + (i * slotAngle + slotAngle/2) ≡ 0 (mod 360)
      // => rotation = -(i * slotAngle + slotAngle/2) = 360 - (i * slotAngle + slotAngle/2)
      const midSlotAngle = res.slotIndex * slotAngle + slotAngle / 2;
      const stopAngle = (360 - midSlotAngle + 360) % 360;
      const spins = 5 + Math.floor(Math.random() * 3);
      const baseRotation = hasSpun ? rotation : 0;
      const currentStop = ((baseRotation % 360) + 360) % 360;
      const delta = ((stopAngle - currentStop) % 360 + 360) % 360;
      const finalRotation = baseRotation + spins * 360 + delta;

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
        if (needsTurnsCheck) {
          loadTurns(config._id);
        }
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
          background: linear-gradient(180deg, #fce4ec 0%, #fff3e0 40%, #fce4ec 100%);
          display: flex;
          flex-direction: column;
          align-items: center;
          font-family: "Roboto", "Segoe UI", sans-serif;
          overflow-x: hidden;
          padding-bottom: 40px;
        }

        /* Header banner */
        .spin-header {
          width: 100%;
          max-width: 500px;
          padding: 16px 16px 0;
          text-align: center;
        }

        .spin-title {
          background: linear-gradient(180deg, #5d1212 0%, #3d0808 100%);
          color: #ffd700;
          font-size: 22px;
          font-weight: 900;
          padding: 16px 24px;
          border-radius: 12px;
          text-transform: uppercase;
          letter-spacing: 3px;
          border: 3px solid #c9953c;
          box-shadow: 0 4px 20px rgba(93, 18, 18, 0.5);
          text-shadow: 1px 1px 3px rgba(0, 0, 0, 0.6);
          position: relative;
        }

        /* Event time card */
        .spin-event-time {
          background: white;
          border-radius: 16px;
          padding: 14px 20px;
          margin: 14px auto 0;
          max-width: 460px;
          box-shadow: 0 2px 15px rgba(0, 0, 0, 0.08);
          display: flex;
          align-items: center;
          gap: 12px;
        }

        .spin-event-time .icon {
          font-size: 28px;
        }

        .spin-event-time .time-label {
          font-weight: 700;
          color: #333;
          font-size: 15px;
        }

        .spin-event-time .time-value {
          color: #666;
          font-size: 13px;
          margin-top: 2px;
        }

        /* Turns box */
        .spin-turns-box {
          margin: 16px auto;
          text-align: center;
        }

        .spin-turns-oval {
          display: inline-flex;
          flex-direction: column;
          align-items: center;
          background: white;
          border: 3px solid #c62828;
          border-radius: 40px;
          padding: 12px 40px;
          box-shadow: 0 4px 16px rgba(198, 40, 40, 0.15);
        }

        .spin-turns-label {
          font-size: 13px;
          color: #666;
          font-weight: 600;
        }

        .spin-turns-count {
          font-size: 36px;
          font-weight: 900;
          color: #c62828;
          line-height: 1;
          margin-top: 2px;
        }

        .spin-no-turns-msg {
          font-size: 12px;
          color: #ef4444;
          margin-top: 4px;
          font-weight: 600;
        }

        /* Wheel container */
        .spin-wheel-wrap {
          position: relative;
          width: 340px;
          height: 340px;
          margin: 20px auto;
          z-index: 2;
        }

        /* Outer ring */
        .spin-ring {
          position: absolute;
          inset: -18px;
          border-radius: 50%;
          background: linear-gradient(145deg, #e8a0a0, #d47070);
          box-shadow: 0 0 30px rgba(200, 80, 80, 0.4);
        }

        .spin-ring-inner {
          position: absolute;
          inset: 6px;
          border-radius: 50%;
          background: linear-gradient(145deg, #d47070, #c45050);
        }

        /* LED dots on ring */
        .spin-leds {
          position: absolute;
          inset: 0;
          border-radius: 50%;
        }

        .spin-led {
          position: absolute;
          width: 10px;
          height: 10px;
          border-radius: 50%;
          background: #ffd700;
          box-shadow: 0 0 6px #ffd700;
        }

        .spinning-active .spin-led {
          animation: ledFlash 0.3s infinite alternate;
        }

        .spinning-active .spin-led:nth-child(even) {
          animation-delay: 0.15s;
        }

        @keyframes ledFlash {
          0% {
            background: #ffd700;
            box-shadow: 0 0 8px #ffd700, 0 0 16px rgba(255, 215, 0, 0.5);
            transform: translate(-50%, -50%) scale(1.2);
          }
          100% {
            background: #8b5e00;
            box-shadow: 0 0 2px #8b5e00;
            transform: translate(-50%, -50%) scale(0.7);
          }
        }

        /* Wheel face */
        .spin-face {
          position: absolute;
          inset: 0;
          border-radius: 50%;
          overflow: hidden;
          transition: transform 5s cubic-bezier(0.17, 0.67, 0.12, 0.99);
          background: white;
          box-shadow: inset 0 0 8px rgba(0, 0, 0, 0.08);
        }

        .spin-face.no-anim {
          transition: none;
        }

        /* Slot clip */
        .spin-slice {
          position: absolute;
          inset: 0;
          border-radius: 50%;
        }

        .spin-slice-even {
          background: #f8d7da;
        }

        .spin-slice-odd {
          background: #fff;
        }

        /* Slot content */
        .spin-item {
          position: absolute;
          transform: translate(-50%, -50%);
          text-align: center;
          width: 80px;
          pointer-events: none;
        }

        .spin-item img {
          width: 44px;
          height: 44px;
          object-fit: cover;
          border-radius: 6px;
          margin: 0 auto 3px;
          display: block;
        }

        .spin-item-name {
          font-size: 8px;
          font-weight: 700;
          color: #333;
          line-height: 1.2;
          max-width: 70px;
          margin: 0 auto;
          word-wrap: break-word;
        }

        /* Center button */
        .spin-go {
          position: absolute;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%);
          width: 72px;
          height: 72px;
          border-radius: 50%;
          background: linear-gradient(145deg, #ff9800, #e65100);
          border: 4px solid #ffb74d;
          color: white;
          font-weight: 900;
          font-size: 14px;
          cursor: pointer;
          z-index: 10;
          box-shadow: 0 4px 16px rgba(230, 81, 0, 0.4);
          transition: transform 0.2s, box-shadow 0.2s;
          display: flex;
          align-items: center;
          justify-content: center;
          text-transform: uppercase;
          letter-spacing: 1px;
        }

        .spin-go:hover:not(:disabled) {
          transform: translate(-50%, -50%) scale(1.1);
          box-shadow: 0 6px 24px rgba(230, 81, 0, 0.6);
        }

        .spin-go:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }

        .spinning-active .spin-go {
          animation: goPulse 0.5s infinite alternate;
        }

        @keyframes goPulse {
          0% { box-shadow: 0 4px 16px rgba(230, 81, 0, 0.4); }
          100% { box-shadow: 0 4px 30px rgba(255, 152, 0, 0.8), 0 0 0 6px rgba(255, 183, 77, 0.3); }
        }

        /* Pointer (red gem) */
        .spin-arrow {
          position: absolute;
          top: -14px;
          left: 50%;
          transform: translateX(-50%);
          z-index: 20;
          width: 28px;
          height: 36px;
        }

        .spin-arrow::before {
          content: "";
          position: absolute;
          top: 0;
          left: 50%;
          transform: translateX(-50%);
          width: 20px;
          height: 20px;
          background: #c62828;
          border-radius: 50%;
          box-shadow: 0 0 8px rgba(198, 40, 40, 0.5);
        }

        .spin-arrow::after {
          content: "";
          position: absolute;
          top: 14px;
          left: 50%;
          transform: translateX(-50%);
          width: 0;
          height: 0;
          border-left: 10px solid transparent;
          border-right: 10px solid transparent;
          border-top: 18px solid #c62828;
          filter: drop-shadow(0 2px 3px rgba(0, 0, 0, 0.3));
        }

        .spinning-active .spin-arrow {
          animation: arrowBob 0.25s infinite alternate;
        }

        @keyframes arrowBob {
          0% { transform: translateX(-50%) translateY(0); }
          100% { transform: translateX(-50%) translateY(3px); }
        }

        /* Outer glow */
        .spinning-active .spin-ring {
          animation: ringGlow 0.4s infinite alternate;
        }

        @keyframes ringGlow {
          0% { box-shadow: 0 0 30px rgba(200, 80, 80, 0.4); }
          100% { box-shadow: 0 0 50px rgba(255, 215, 0, 0.5), 0 0 80px rgba(255, 152, 0, 0.2); }
        }

        /* Popup overlay */
        .spin-overlay {
          position: fixed;
          inset: 0;
          background: rgba(0, 0, 0, 0.6);
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
          box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
          animation: popIn 0.3s ease;
        }

        @keyframes popIn {
          from { opacity: 0; transform: scale(0.8); }
          to { opacity: 1; transform: scale(1); }
        }

        .spin-popup-prize {
          border: 3px solid #ffd700;
        }

        .spin-popup h2 {
          font-size: 24px;
          font-weight: 900;
          margin-bottom: 8px;
        }

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
          transition: transform 0.2s;
        }

        .spin-popup-btn:hover {
          transform: scale(1.05);
        }

        .spin-popup-btn-primary {
          background: linear-gradient(135deg, #ff9800, #e65100);
          color: white;
          box-shadow: 0 4px 15px rgba(230, 81, 0, 0.4);
        }

        .spin-popup-btn-secondary {
          background: #f3f4f6;
          color: #666;
          margin-left: 8px;
        }

        /* Info form */
        .spin-info-form {
          text-align: left;
          margin-top: 16px;
        }

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

        .spin-info-form input:focus {
          border-color: #ff9800;
        }

        .spin-success-message {
          color: #16a34a;
          font-size: 18px;
          font-weight: 700;
          margin: 20px 0;
        }

        .spin-loading,
        .spin-no-event {
          text-align: center;
          padding: 60px 20px;
        }

        .spin-no-event h2 { font-size: 22px; color: #999; margin-bottom: 8px; }
        .spin-no-event p { color: #bbb; }

        /* History */
        .spin-history {
          width: 100%;
          max-width: 500px;
          margin: 24px auto 0;
          padding: 0 16px;
        }

        .spin-history-title {
          font-size: 20px;
          font-weight: 800;
          color: #333;
          margin-bottom: 16px;
        }

        .spin-history-item {
          background: white;
          border-radius: 16px;
          padding: 16px;
          margin-bottom: 12px;
          box-shadow: 0 2px 12px rgba(0, 0, 0, 0.06);
          display: flex;
          align-items: center;
          gap: 12px;
        }

        .spin-history-item.prize { border-left: 4px solid #ff9800; }
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

        .spin-history-meta { font-size: 12px; color: #999; }

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
          background: linear-gradient(135deg, #ff9800, #e65100);
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

        .spin-history-form input:focus { border-color: #ff9800; }

        .spin-history-form-actions {
          display: flex;
          gap: 8px;
          margin-top: 12px;
        }

        /* Treasure image */
        .spin-treasure {
          width: 380px;
          max-width: 90%;
          margin-top: -60px;
          pointer-events: none;
          position: relative;
          z-index: 1;
        }

        @media (max-width: 420px) {
          .spin-wheel-wrap { width: 290px; height: 290px; }
          .spin-ring { inset: -14px; }
          .spin-title { font-size: 18px; padding: 12px 16px; letter-spacing: 2px; }
          .spin-go { width: 60px; height: 60px; font-size: 12px; }
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
              {new Date(config.startDate).toLocaleString("vi-VN")}
              {" ~ "}
              {new Date(config.endDate).toLocaleString("vi-VN")}
            </div>
          </div>
        </div>

        {/* Wheel */}
        <div className={`spin-wheel-wrap ${spinning ? "spinning-active" : ""}`}>
          <div className="spin-ring">
            <div className="spin-ring-inner" />
            <div className="spin-leds">
              {Array.from({ length: 24 }).map((_, i) => {
                const angle = (i * 360) / 24;
                const rad = (angle * Math.PI) / 180;
                const r = 50;
                const cx = 50 + r * Math.cos(rad);
                const cy = 50 + r * Math.sin(rad);
                return (
                  <div
                    key={i}
                    className="spin-led"
                    style={{
                      left: `${cx}%`,
                      top: `${cy}%`,
                      transform: "translate(-50%, -50%)",
                    }}
                  />
                );
              })}
            </div>
          </div>

          <div className="spin-arrow" />

          <div
            ref={wheelRef}
            className={`spin-face ${!hasSpun ? "no-anim" : ""}`}
            style={{ transform: `rotate(${rotation}deg)` }}
          >
            {config.slots.map((slot, i) => {
              const startAngle = i * slotAngle - 90;
              const midAngle = startAngle + slotAngle / 2;
              const toRad = (deg: number) => (deg * Math.PI) / 180;

              const points = ["50% 50%"];
              const steps = Math.max(2, Math.ceil(slotAngle / 10));
              for (let s = 0; s <= steps; s++) {
                const a = toRad(startAngle + (slotAngle * s) / steps);
                const px = 50 + 50 * Math.cos(a);
                const py = 50 + 50 * Math.sin(a);
                points.push(`${px}% ${py}%`);
              }
              const clipPath = `polygon(${points.join(", ")})`;

              const contentAngle = toRad(midAngle);
              const contentR = 32;
              const cx = 50 + contentR * Math.cos(contentAngle);
              const cy = 50 + contentR * Math.sin(contentAngle);

              return (
                <div
                  key={i}
                  className={`spin-slice ${i % 2 === 0 ? "spin-slice-even" : "spin-slice-odd"}`}
                  style={{ clipPath }}
                >
                  <div
                    className="spin-item"
                    style={{ left: `${cx}%`, top: `${cy}%` }}
                  >
                    {slot.image && (
                      <img
                        src={getImageUrl(slot.image)}
                        alt={slot.label}
                      />
                    )}
                    <div className="spin-item-name">{slot.label}</div>
                  </div>
                </div>
              );
            })}
          </div>

          <button
            className="spin-go"
            onClick={handleSpin}
            disabled={
              spinning ||
              !isActive ||
              (needsTurnsCheck && (!turns || turns.remainingTurns <= 0))
            }
          >
            {spinning ? "..." : "Bắt đầu"}
          </button>
        </div>

        {/* Treasure decoration */}
        <img
          src="/bannervongquay.png"
          alt=""
          className="spin-treasure"
        />

        {/* Turns */}
        {needsTurnsCheck && turns && (
          <div className="spin-turns-box">
            <div className="spin-turns-oval">
              <div className="spin-turns-label">Số cơ hội còn lại</div>
              <div className="spin-turns-count">{turns.remainingTurns}</div>
              {turns.remainingTurns <= 0 && (
                <div className="spin-no-turns-msg">Bạn đã hết lượt quay</div>
              )}
            </div>
          </div>
        )}

        {/* Result Popup */}
        {showResult && result && (
          <div
            className="spin-overlay"
            onClick={(e) => {
              if (e.target === e.currentTarget) closeResult();
            }}
          >
            <div className={`spin-popup ${result.type === "prize" ? "spin-popup-prize" : "spin-popup-lose"}`}>
              {!showInfoForm && !submitted ? (
                <>
                  <h2>{result.type === "prize" ? "🎉 Chúc mừng!" : "😊"}</h2>
                  {result.slotImage && (
                    <img
                      src={getImageUrl(result.slotImage)}
                      alt=""
                      className="spin-popup-image"
                    />
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
                    <button
                      className="spin-popup-btn spin-popup-btn-secondary"
                      onClick={closeResult}
                    >
                      Đóng
                    </button>
                  )}
                </>
              ) : submitted ? (
                <>
                  <h2 style={{ color: "#16a34a" }}>✅ Đã gửi!</h2>
                  <p className="spin-success-message">
                    Thông tin nhận quà đã được gửi thành công.
                    <br />
                    Chúng tôi sẽ liên hệ bạn sớm nhất!
                  </p>
                  <button
                    className="spin-popup-btn spin-popup-btn-primary"
                    onClick={closeResult}
                  >
                    Đóng
                  </button>
                </>
              ) : (
                <>
                  <h2 style={{ color: "#ff9800" }}>📝 Thông tin nhận quà</h2>
                  {result.slotImage && (
                    <img
                      src={getImageUrl(result.slotImage)}
                      alt=""
                      className="spin-popup-image"
                      style={{ width: 80, height: 80 }}
                    />
                  )}
                  <div className="spin-popup-label" style={{ fontSize: 14 }}>
                    {result.slotLabel}
                  </div>
                  <div className="spin-info-form">
                    <label>Họ tên</label>
                    <input
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      placeholder="Nguyễn Văn A"
                    />
                    <label>Số điện thoại</label>
                    <input
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder="0912345678"
                    />
                    <label>Email</label>
                    <input
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="email@example.com"
                      type="email"
                    />
                    <label>Địa chỉ nhận quà</label>
                    <input
                      value={address}
                      onChange={(e) => setAddress(e.target.value)}
                      placeholder="123 Nguyễn Huệ, Q1, TP.HCM"
                    />
                  </div>
                  <div style={{ marginTop: 20, display: "flex", gap: 8, justifyContent: "center" }}>
                    <button
                      className="spin-popup-btn spin-popup-btn-primary"
                      onClick={handleSubmitInfo}
                      disabled={submitting}
                    >
                      {submitting ? "Đang gửi..." : "Gửi thông tin"}
                    </button>
                    <button
                      className="spin-popup-btn spin-popup-btn-secondary"
                      onClick={() => setShowInfoForm(false)}
                    >
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
                      <img
                        src={getImageUrl(item.slotImage)}
                        alt=""
                        className="spin-history-img"
                      />
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
                            setHistoryForm({
                              fullName: "",
                              phone: "",
                              email: "",
                              address: "",
                            });
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
                        onChange={(e) =>
                          setHistoryForm({ ...historyForm, fullName: e.target.value })
                        }
                        placeholder="Nguyễn Văn A"
                      />
                      <label>Số điện thoại</label>
                      <input
                        value={historyForm.phone}
                        onChange={(e) =>
                          setHistoryForm({ ...historyForm, phone: e.target.value })
                        }
                        placeholder="0912345678"
                      />
                      <label>Email</label>
                      <input
                        value={historyForm.email}
                        onChange={(e) =>
                          setHistoryForm({ ...historyForm, email: e.target.value })
                        }
                        placeholder="email@example.com"
                        type="email"
                      />
                      <label>Địa chỉ nhận quà</label>
                      <input
                        value={historyForm.address}
                        onChange={(e) =>
                          setHistoryForm({ ...historyForm, address: e.target.value })
                        }
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
