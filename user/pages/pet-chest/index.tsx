import Head from "next/head";
import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import Layout from "../../src/components/layout/Layout";
import {
  petService,
  PetChestConfig,
  PetChestHistoryResponse,
  OpenChestResult,
} from "../../src/services/pet.service";

export default function PetChestPage() {
  const HISTORY_PAGE_SIZE = 5;

  const [loading, setLoading] = useState(true);
  const [opening, setOpening] = useState(false);
  const [historyLoading, setHistoryLoading] = useState(false);
  const [historyPage, setHistoryPage] = useState(1);
  const [config, setConfig] = useState<PetChestConfig | null>(null);
  const [history, setHistory] = useState<PetChestHistoryResponse>({
    items: [],
    total: 0,
    page: 1,
    limit: HISTORY_PAGE_SIZE,
    totalPages: 1,
  });
  const [result, setResult] = useState<OpenChestResult | null>(null);
  const [isShaking, setIsShaking] = useState(false);
  const [showResultPopup, setShowResultPopup] = useState(false);

  const apiUrl = process.env.NEXT_PUBLIC_API_ENDPOINT || "http://localhost:5001";

  const getImageUrl = (url: string) => {
    if (!url) return "";
    if (url.startsWith("http")) return url;
    return `${apiUrl}${url}`;
  };

  const loadConfig = useCallback(async () => {
    try {
      setLoading(true);
      const chestConfig = await petService.getChestConfig();
      setConfig(chestConfig);
    } catch {
      setConfig(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadConfig();
  }, [loadConfig]);

  const loadHistory = useCallback(async (page: number) => {
    try {
      setHistoryLoading(true);
      const historyData = await petService.getChestHistory(page, HISTORY_PAGE_SIZE);
      setHistory(historyData);
      if (historyData.page !== page) {
        setHistoryPage(historyData.page);
      }
    } catch {
      setHistory({
        items: [],
        total: 0,
        page,
        limit: HISTORY_PAGE_SIZE,
        totalPages: 1,
      });
    } finally {
      setHistoryLoading(false);
    }
  }, []);

  useEffect(() => {
    loadHistory(historyPage);
  }, [historyPage, loadHistory]);

  const handleOpenChest = async () => {
    if (!config || !config.enabled) {
      alert("Rương may mắn hiện đang tạm khóa");
      return;
    }

    if ((config.availableChestPoints || 0) < config.openCostPoints) {
      alert(
        `Bạn cần ${config.openCostPoints} điểm để mở rương, hiện có ${config.availableChestPoints || 0}`,
      );
      return;
    }

    try {
      setOpening(true);
      setIsShaking(true);
      setShowResultPopup(false);

      const [openResult] = await Promise.all([
        petService.openChest(),
        new Promise((resolve) => setTimeout(resolve, 3000)),
      ]);

      setResult(openResult);
      setShowResultPopup(true);
      await loadConfig();
      if (historyPage === 1) {
        await loadHistory(1);
      } else {
        setHistoryPage(1);
      }
    } catch (error: any) {
      alert(error?.message || "Không thể mở rương lúc này");
    } finally {
      setIsShaking(false);
      setOpening(false);
    }
  };

  const formatHistoryTime = (value?: string) => {
    if (!value) return "--";
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return "--";
    return date.toLocaleString("vi-VN", { hour12: false });
  };

  return (
    <Layout>
      <Head>
        <title>Mở rương may mắn</title>
      </Head>

      <style jsx global>{`
        .pet-chest-page {
          min-height: 150vh;
          background-image: url("/images/nenhopqua.jpg");
          background-size: cover;
          background-position: center 62%;
          background-repeat: no-repeat;
          position: relative;
          overflow-x: hidden;
        }

        .pet-chest-overlay {
          min-height: 150vh;
          background: linear-gradient(
            180deg,
            rgba(9, 15, 24, 0.5) 0%,
            rgba(9, 15, 24, 0.68) 100%
          );
          padding: 24px 16px 40px;
          display: flex;
          flex-direction: column;
          align-items: center;
        }

        .pet-chest-topbar {
          width: 100%;
          max-width: 980px;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 12px;
          margin-bottom: 28px;
          flex-wrap: nowrap;
          position: relative;
          min-height: 150px;
        }

        .pet-chest-topbar-icon {
          width: 250px;
          height: 250px;
          object-fit: contain;
          filter: drop-shadow(0 8px 18px rgba(0, 0, 0, 0.45));
          flex-shrink: 0;
        }

        .pet-chest-back {
          color: #ffffff;
          text-decoration: none;
          font-weight: 800;
          width: 42px;
          height: 42px;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          border-radius: 12px;
          background: rgba(15, 23, 42, 0.55);
          border: 1px solid rgba(148, 163, 184, 0.38);
          font-size: 22px;
          line-height: 1;
          flex-shrink: 0;
          position: absolute;
          left: 0;
          top: 50%;
          transform: translateY(-50%);
        }

        .pet-chest-stats {
          display: flex;
          gap: 8px;
          flex-wrap: nowrap;
          justify-content: center;
          margin-top: 18px;
          width: 100%;
        }

        .pet-chest-stat {
          position: relative;
          width: 196px;
          height: 90px;
          flex-shrink: 0;
        }

        .pet-chest-stat-bg {
          position: absolute;
          inset: 0;
          background-size: 100% 100%;
          background-position: center;
          background-repeat: no-repeat;
          pointer-events: none;
        }

        .pet-chest-stat--points .pet-chest-stat-bg {
          background-image: url("/images/backgrounddiemtichluy.png");
        }

        .pet-chest-stat--points {
          --points-value-offset-y: 10px;
        }

        .pet-chest-stat--cost .pet-chest-stat-bg {
          background-image: url("/images/backgroundgiamo1lan.png");
        }

        .pet-chest-stat-content {
          position: relative;
          z-index: 1;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: flex-start;
          width: 100%;
          height: 100%;
          gap: 1px;
          padding-top: 40px;
        }

        .pet-chest-stat-label {
          display: block;
          font-size: 11px;
          font-weight: 700;
          line-height: 1.1;
          color: #ffffff;
          text-shadow: 0 1px 4px rgba(0, 0, 0, 0.55);
        }

        .pet-chest-stat-value {
          display: block;
          margin-top: 6px;
          font-size: 18px;
          font-weight: 900;
          color: #fde68a;
          line-height: 1;
          text-shadow: 0 2px 6px rgba(0, 0, 0, 0.55);
        }

        .pet-chest-stat-content--points {
          padding-top: 40px;
        }

        .pet-chest-stat-value--points {
          margin-top: 0;
          display: inline-block;
          transform: translateY(var(--points-value-offset-y));
        }

        .pet-chest-center {
          width: 100%;
          max-width: 980px;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          text-align: center;
          margin-top: 300px;
        }

        .pet-chest-open-btn {
          width: min(56vw, 320px);
          aspect-ratio: 1 / 1;
          border: none;
          background: transparent;
          padding: 0;
          cursor: pointer;
          transition: transform 0.25s ease;
          filter: drop-shadow(0 14px 28px rgba(0, 0, 0, 0.5));
          animation: chestFloat 2.8s ease-in-out infinite;
        }

        .pet-chest-open-btn.is-shaking {
          animation: chestShake 3s ease-in-out;
        }

        .pet-chest-open-btn:hover {
          transform: scale(1.06);
        }

        .pet-chest-open-btn:disabled {
          opacity: 0.65;
          cursor: not-allowed;
          transform: none;
        }

        .pet-chest-open-btn img {
          width: 100%;
          height: 100%;
          object-fit: contain;
          display: block;
        }

        .pet-chest-hint {
          margin-top: 14px;
          color: #f8fafc;
          font-weight: 700;
          text-shadow: 0 2px 12px rgba(0, 0, 0, 0.45);
        }

        .pet-chest-prize-list {
          width: 100%;
          max-width: 980px;
          margin-top: 28px;
          padding: 16px;
          border-radius: 16px;
          background: rgba(2, 6, 23, 0.58);
          border: 1px solid rgba(148, 163, 184, 0.3);
        }

        .pet-chest-prize-title {
          color: #f8fafc;
          font-weight: 800;
          margin-bottom: 10px;
        }

        .pet-chest-prize-item {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 10px;
          border-radius: 10px;
          padding: 10px 12px;
          border: 1px solid rgba(148, 163, 184, 0.24);
          background: rgba(255, 255, 255, 0.04);
        }

        .pet-chest-prize-item + .pet-chest-prize-item {
          margin-top: 8px;
        }

        .pet-chest-prize-left {
          display: flex;
          align-items: center;
          gap: 10px;
          color: #f8fafc;
          font-weight: 700;
        }

        .pet-chest-prize-left img {
          width: 36px;
          height: 36px;
          border-radius: 8px;
          object-fit: cover;
          border: 1px solid rgba(148, 163, 184, 0.4);
        }

        .pet-chest-prize-right {
          color: #fbbf24;
          font-weight: 800;
          font-size: 12px;
        }

        .pet-chest-prize-time {
          color: #cbd5e1;
          font-size: 12px;
          font-weight: 600;
          white-space: nowrap;
        }

        .pet-chest-history-empty {
          border-radius: 10px;
          padding: 14px 12px;
          border: 1px dashed rgba(148, 163, 184, 0.38);
          color: #cbd5e1;
          text-align: center;
        }

        .pet-chest-history-paging {
          margin-top: 12px;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 10px;
        }

        .pet-chest-page-btn {
          border: 1px solid rgba(148, 163, 184, 0.45);
          border-radius: 10px;
          background: rgba(15, 23, 42, 0.6);
          color: #f8fafc;
          padding: 6px 10px;
          font-size: 12px;
          font-weight: 700;
          cursor: pointer;
        }

        .pet-chest-page-btn:disabled {
          opacity: 0.45;
          cursor: not-allowed;
        }

        .pet-chest-page-number {
          color: #f8fafc;
          font-size: 12px;
          font-weight: 700;
          min-width: 72px;
          text-align: center;
        }

        .pet-chest-win-overlay {
          position: fixed;
          inset: 0;
          z-index: 1200;
          background: rgba(0, 0, 0, 0.72);
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 16px;
          backdrop-filter: blur(6px);
        }

        .pet-chest-win-popup {
          width: 100%;
          max-width: 420px;
          border-radius: 18px;
          border: 1px solid rgba(250, 204, 21, 0.48);
          background: linear-gradient(
            180deg,
            rgba(30, 41, 59, 0.96),
            rgba(15, 23, 42, 0.97)
          );
          box-shadow: 0 20px 40px rgba(0, 0, 0, 0.45);
          text-align: center;
          padding: 20px 18px;
          color: #f8fafc;
        }

        .pet-chest-win-title {
          font-size: 22px;
          font-weight: 900;
          color: #fef08a;
          margin-bottom: 10px;
        }

        .pet-chest-win-image {
          width: 88px;
          height: 88px;
          object-fit: cover;
          border-radius: 14px;
          border: 1px solid rgba(148, 163, 184, 0.45);
          margin: 0 auto 10px;
        }

        .pet-chest-win-name {
          font-size: 20px;
          font-weight: 800;
          color: #ffffff;
        }

        .pet-chest-win-amount {
          margin-top: 6px;
          font-size: 16px;
          font-weight: 700;
          color: #86efac;
        }

        .pet-chest-win-close {
          margin-top: 14px;
          border: none;
          border-radius: 12px;
          background: linear-gradient(135deg, #fbbf24, #f59e0b);
          color: #1f2937;
          font-weight: 900;
          padding: 10px 18px;
          cursor: pointer;
        }

        @keyframes chestFloat {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-8px); }
        }

        @keyframes chestShake {
          0% { transform: translateX(0) rotate(0deg); }
          15% { transform: translateX(-8px) rotate(-3deg); }
          30% { transform: translateX(8px) rotate(3deg); }
          45% { transform: translateX(-7px) rotate(-2deg); }
          60% { transform: translateX(7px) rotate(2deg); }
          75% { transform: translateX(-4px) rotate(-1deg); }
          90% { transform: translateX(4px) rotate(1deg); }
          100% { transform: translateX(0) rotate(0deg); }
        }

        @media (max-width: 640px) {
          .pet-chest-page,
          .pet-chest-overlay {
            min-height: 130vh;
          }

          .pet-chest-page {
            background-position: center 70%;
          }

          .pet-chest-overlay {
            padding: 16px 12px 28px;
          }

          .pet-chest-topbar {
            margin-bottom: 20px;
            gap: 8px;
            flex-wrap: nowrap;
            min-height: 96px;
          }

          .pet-chest-topbar-icon {
            width: 120px;
            height: 120px;
          }

          .pet-chest-stat {
            width: 156px;
            height: 74px;
          }

          .pet-chest-stat-content {
            padding-top: 30px;
          }

          .pet-chest-stat-label {
            font-size: 9px;
          }

          .pet-chest-stat-value {
            font-size: 15px;
            margin-top: 5px;
          }

          .pet-chest-stat-content--points {
            padding-top: 30px;
          }

          .pet-chest-stat--points {
            --points-value-offset-y: 10px;
          }

          .pet-chest-stat-value--points {
            margin-top: 0;
            transform: translateY(var(--points-value-offset-y));
          }

          .pet-chest-open-btn {
            width: min(50vw, 240px);
            margin-top: 200px;
          }

          .pet-chest-center {
            margin-top: 56px;
          }

          .pet-chest-back {
            width: 38px;
            height: 38px;
            font-size: 20px;
            left: 0;
          }

          .pet-chest-prize-item {
            flex-wrap: wrap;
            row-gap: 8px;
          }

          .pet-chest-prize-time {
            width: 100%;
            text-align: right;
          }
        }
      `}</style>

      <div className="pet-chest-page">
        <div className="pet-chest-overlay">
          <div className="pet-chest-topbar">
            <Link href="/pet-farm" className="pet-chest-back" aria-label="Về trang pet-farm">
              ←
            </Link>

            <img
              src="/images/iconhopqua.png"
              alt="Icon hop qua"
              className="pet-chest-topbar-icon"
            />
          </div>

          <div className="pet-chest-center">
            <button
              className={`pet-chest-open-btn ${isShaking ? "is-shaking" : ""}`}
              onClick={handleOpenChest}
              disabled={
                loading ||
                opening ||
                !config ||
                !config.enabled ||
                (config.availableChestPoints || 0) < config.openCostPoints
              }
              title="Mở rương"
            >
              <img src="/images/hopquaogiua.png" alt="Hộp quà" />
            </button>
            <div className="pet-chest-hint">
              {opening ? "Đang mở......." : "Chạm vào hộp quà để mở rương"}
            </div>
          </div>

          <div className="pet-chest-stats">
            <div className="pet-chest-stat pet-chest-stat--points">
              <div className="pet-chest-stat-bg" />
              <div className="pet-chest-stat-content pet-chest-stat-content--points">
                <span className="pet-chest-stat-value pet-chest-stat-value--points">
                  {config?.availableChestPoints ?? 0}
                </span>
              </div>
            </div>
            <div className="pet-chest-stat pet-chest-stat--cost">
              <div className="pet-chest-stat-bg" />
              <div className="pet-chest-stat-content">
                <span className="pet-chest-stat-value">{config?.openCostPoints ?? 0}</span>
              </div>
            </div>
          </div>

          <div className="pet-chest-prize-list">
            <div className="pet-chest-prize-title">Lịch sử trúng</div>
            {historyLoading ? (
              <div className="pet-chest-history-empty">Đang tải lịch sử...</div>
            ) : history.items.length ? (
              <>
                {history.items.map((item, index) => (
                  <div
                    key={`${item.prizeId}-${item.openedAt}-${index}`}
                    className="pet-chest-prize-item"
                  >
                    <div className="pet-chest-prize-left">
                      {item.prizeImage ? (
                        <img src={getImageUrl(item.prizeImage)} alt={item.prizeName} />
                      ) : (
                        <img src="/images/iconhopqua.png" alt={item.prizeName} />
                      )}
                      <span>{item.prizeName || "Phần quà"}</span>
                    </div>
                    <div className="pet-chest-prize-right">
                      +{Number(item.rewardVnd || 0).toLocaleString("vi-VN")}đ
                    </div>
                    <div className="pet-chest-prize-time">
                      {formatHistoryTime(item.openedAt)}
                    </div>
                  </div>
                ))}
                <div className="pet-chest-history-paging">
                  <button
                    type="button"
                    className="pet-chest-page-btn"
                    onClick={() => setHistoryPage((prev) => Math.max(1, prev - 1))}
                    disabled={history.page <= 1}
                  >
                    Trang trước
                  </button>
                  <span className="pet-chest-page-number">
                    {history.page}/{history.totalPages}
                  </span>
                  <button
                    type="button"
                    className="pet-chest-page-btn"
                    onClick={() =>
                      setHistoryPage((prev) => Math.min(history.totalPages, prev + 1))
                    }
                    disabled={history.page >= history.totalPages}
                  >
                    Trang sau
                  </button>
                </div>
              </>
            ) : (
              <div className="pet-chest-history-empty">
                Chưa có lịch sử trúng nào.
              </div>
            )}
          </div>

          {showResultPopup && result && (
            <div
              className="pet-chest-win-overlay"
              onClick={() => setShowResultPopup(false)}
            >
              <div
                className="pet-chest-win-popup"
                onClick={(e) => e.stopPropagation()}
              >
                <div className="pet-chest-win-title">Chúc mừng!</div>
                <img
                  className="pet-chest-win-image"
                  src={
                    result.prize.image
                      ? getImageUrl(result.prize.image)
                      : "/images/iconhopqua.png"
                  }
                  alt={result.prize.name}
                />
                <div className="pet-chest-win-name">{result.prize.name}</div>
                <div className="pet-chest-win-amount">
                  +{result.prize.rewardVnd.toLocaleString("vi-VN")}đ
                </div>
                <button
                  className="pet-chest-win-close"
                  onClick={() => setShowResultPopup(false)}
                >
                  Đã rõ
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
}
