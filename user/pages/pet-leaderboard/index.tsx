import { useState, useEffect } from "react";
import Head from "next/head";
import Link from "next/link";
import Layout from "../../src/components/layout/Layout";
import { petService, LeaderboardEntry } from "../../src/services/pet.service";

const RANK_IMGS = [
  "/images/top2-removebg-preview.png",
  "/images/top1-removebg-preview.png",
  "/images/top3-removebg-preview.png",
];

export default function PetLeaderboardPage() {
  const [entries, setEntries] = useState<LeaderboardEntry[]>([]);
  const [loading, setLoading] = useState(true);

  const apiUrl = process.env.NEXT_PUBLIC_API_ENDPOINT || "http://localhost:5001";

  const getImageUrl = (url: string) => {
    if (!url) return "";
    if (url.startsWith("http")) return url;
    return `${apiUrl}${url}`;
  };

  const isVideo = (url: string) => {
    if (!url) return false;
    const ext = url.split("?")[0].split(".").pop()?.toLowerCase() || "";
    return ["mp4", "webm", "mov", "avi"].includes(ext);
  };

  const renderPetMedia = (url: string, alt: string, className: string) => {
    if (!url) return null;
    const fullUrl = getImageUrl(url);
    if (isVideo(url)) {
      return <video src={fullUrl} className={className} autoPlay loop muted playsInline />;
    }
    return <img src={fullUrl} alt={alt} className={className} />;
  };

  const maskName = (name: string) => {
    if (!name) return "—";
    if (name.length <= 5) return name[0] + "x".repeat(name.length - 1);
    return name.slice(0, 5) + "x".repeat(name.length - 5);
  };

  useEffect(() => {
    petService
      .getLeaderboard()
      .then((data) => setEntries(data))
      .catch(() => { })
      .finally(() => setLoading(false));
  }, []);

  const top3 = entries.slice(0, 3);
  const rest = entries.slice(3, 10);

  // [top2, top1, top3]
  const podiumOrder = [top3[1] ?? null, top3[0] ?? null, top3[2] ?? null];
  const podiumRanks = [2, 1, 3];
  const podiumHeights = ["240px", "320px", "200px"];
  const podiumPillars = [
    "/images/pillar-silver-removebg-preview.png",
    "/images/pillar-gold-removebg-preview.png",
    "/images/pillar-bronze-removebg-preview.png",
  ];

  return (
    <Layout>
      <Head>
        <title>Bảng xếp hạng nuôi thú</title>
        <meta name="description" content="Top người dùng nuôi thú nhiều điểm nhất" />
      </Head>

      <style jsx global>{`
        .lb-page {
          min-height: 100vh;
          background: #0a1628;
          font-family: "Roboto", "Segoe UI", sans-serif;
          padding-bottom: 80px;
        }

        /* ===== BACK LINK ===== */
        .lb-topbar {
          padding: 16px 20px 0;
          position: relative;
          z-index: 10;
        }

        .lb-back-link {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          color: rgba(255,255,255,0.55);
          font-size: 13px;
          text-decoration: none;
          transition: color 0.2s;
        }

        .lb-back-link:hover { color: rgba(255,255,255,0.9); }

        /* ===== ARENA (ảnh bìa full-width) ===== */
        .lb-arena {
          position: relative;
          width: 100%;
          min-height: 2600px;
          overflow: hidden;
        }

        .lb-arena-bg {
          position: absolute;
          inset: 0;
          background-image: url("/images/backgroundbxh.jpg");
          background-size: cover;
          background-position: center top;
          background-repeat: no-repeat;
          width: 100%;
          height: 100%;
        }

        /* lớp tối nhẹ phía dưới để bục nổi lên */
        .lb-arena-fade {
          position: absolute;
          bottom: 0;
          left: 0;
          right: 0;
          height: 55%;
          background: linear-gradient(
            0deg,
            rgba(5, 10, 25, 0.72) 0%,
            rgba(5, 10, 25, 0.0) 100%
          );
          pointer-events: none;
        }

        /* nội dung bên trong arena */
        .lb-arena-inner {
          position: relative;
          z-index: 2;
          display: flex;
          flex-direction: column;
          align-items: center;
          height: 100%;
          min-height: 760px;
          padding: 20px 12px 0;
        }

        /* ===== LOGO title in arena ===== */
        .lb-arena-logo-img {
          width: auto;
          max-width: 420px;
          height: auto;
          max-height: 160px;
          object-fit: contain;
          display: block;
          margin: 0 auto 0;
          filter: drop-shadow(0 6px 24px rgba(0,0,0,0.7));
          animation: logoFloat 4s ease-in-out infinite;
        }

        @keyframes logoFloat {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-8px); }
        }

        /* ===== PODIUM bên trong arena ===== */
        .lb-podium-row {
          display: flex;
          align-items: flex-end;
          justify-content: center;
          gap: 10px;
          width: 100%;
          max-width: 2400px;
          /* đẩy podium xuống sát đáy arena */
          margin-top: auto;
        }

        .lb-podium-col {
          display: flex;
          flex-direction: column;
          align-items: center;
          flex: 1;
          min-width: 0;
        }

        /* Rank badge img */
        .lb-rank-img {
          height: 130px;
          width: auto;
          object-fit: contain;
          filter: drop-shadow(0 4px 12px rgba(0,0,0,0.7));
          margin-bottom: 4px;
        }

        .lb-rank-img-lg {
          height: 170px;
          width: auto;
          object-fit: contain;
          filter: drop-shadow(0 6px 20px rgba(251,191,36,0.6));
          margin-bottom: 4px;
        }

        /* User avatar */
        .lb-avatar {
          width: 72px;
          height: 72px;
          border-radius: 50%;
          object-fit: cover;
          border: 2px solid rgba(255,255,255,0.4);
          box-shadow: 0 4px 16px rgba(0,0,0,0.5);
          margin-bottom: 4px;
        }

        .lb-avatar-placeholder {
          width: 72px;
          height: 72px;
          border-radius: 50%;
          background: rgba(255,255,255,0.12);
          border: 2px solid rgba(255,255,255,0.25);
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 24px;
          font-weight: 900;
          color: #e2e8f0;
          margin-bottom: 4px;
        }

        /* Pet images */
        .lb-pet-img {
          width: 100% !important;
          max-width: none !important;
          height: auto !important;
          min-height: 180px;
          object-fit: contain;
          filter: drop-shadow(0 6px 20px rgba(0,0,0,0.6));
        }

        .lb-pet-img-lg {
          width: 100% !important;
          max-width: none !important;
          height: auto !important;
          min-height: 280px;
          object-fit: contain;
          filter: drop-shadow(0 10px 32px rgba(251,191,36,0.4));
          animation: petFloat 3s ease-in-out infinite;
        }

        @keyframes petFloat {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-10px); }
        }

        .lb-pet-placeholder {
          font-size: 40px;
          opacity: 0.3;
          width: 100px;
          height: 100px;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .lb-user-name {
          font-size: 13px;
          font-weight: 800;
          color: #fff;
          text-align: center;
          max-width: 130px;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
          text-shadow: 0 2px 8px rgba(0,0,0,0.8);
          margin-top: 4px;
        }

        .lb-user-points {
          font-size: 16px;
          font-weight: 900;
          color: #fbbf24;
          -webkit-text-stroke: 0.5px rgba(0, 0, 0, 0.6);
          text-shadow:
            0 1px 4px rgba(0, 0, 0, 0.9),
            0 0 12px rgba(251, 191, 36, 0.4);
          margin-top: 4px;
          margin-bottom: 8px;
        }

        /* Bục podium */
        .lb-podium-block {
          width: 100%;
          display: flex;
          align-items: center;
          justify-content: center;
          position: relative;
          overflow: visible;
        }

        /* Hình cột pillar */
        .lb-pillar-img {
          position: absolute;
          inset: 0;
          width: 100%;
          height: 100%;
          object-fit: fill;
          filter: drop-shadow(0 8px 24px rgba(0, 0, 0, 0.5));
          pointer-events: none;
        }

        /* Glow cho cột top 1 */
        .lb-podium-col:nth-child(2) .lb-pillar-img {
          filter:
            drop-shadow(0 0 30px rgba(251, 191, 36, 0.4))
            drop-shadow(0 8px 24px rgba(0, 0, 0, 0.5));
        }

        /* Số thứ hạng đậm nổi bật */
        .lb-podium-rank {
          position: relative;
          z-index: 2;
          font-size: 72px;
          font-weight: 900;
          color: rgba(255, 255, 255, 0.45);
          user-select: none;
          letter-spacing: 3px;
          -webkit-text-stroke: 2px rgba(255, 255, 255, 0.2);
          text-shadow:
            0 0 20px rgba(255, 255, 255, 0.25),
            0 4px 16px rgba(0, 0, 0, 0.6);
        }

        /* Top 1 vàng */
        .lb-podium-col:nth-child(2) .lb-podium-rank {
          font-size: 90px;
          color: rgba(255, 240, 180, 0.55);
          -webkit-text-stroke: 2px rgba(255, 215, 0, 0.35);
          text-shadow:
            0 0 30px rgba(251, 191, 36, 0.5),
            0 0 60px rgba(251, 191, 36, 0.2),
            0 4px 20px rgba(0, 0, 0, 0.6);
        }

        /* Top 2 bạc */
        .lb-podium-col:nth-child(1) .lb-podium-rank {
          color: rgba(220, 230, 245, 0.45);
          -webkit-text-stroke: 2px rgba(192, 210, 235, 0.3);
          text-shadow:
            0 0 24px rgba(192, 210, 235, 0.35),
            0 4px 16px rgba(0, 0, 0, 0.6);
        }

        /* Top 3 đồng */
        .lb-podium-col:nth-child(3) .lb-podium-rank {
          color: rgba(240, 180, 120, 0.45);
          -webkit-text-stroke: 2px rgba(205, 124, 62, 0.3);
          text-shadow:
            0 0 24px rgba(205, 124, 62, 0.35),
            0 4px 16px rgba(0, 0, 0, 0.6);
        }

        /* ===== TABLE (nằm trong arena) ===== */
        .lb-table-wrapper {
          width: 100%;
          max-width: 900px;
          margin: 0 auto;
          padding: 28px 28px 32px;
          background:
            linear-gradient(
              135deg,
              rgba(10, 22, 40, 0.85) 0%,
              rgba(15, 30, 55, 0.9) 50%,
              rgba(10, 22, 40, 0.85) 100%
            );
          backdrop-filter: blur(20px);
          -webkit-backdrop-filter: blur(20px);
          border: 1px solid rgba(251, 191, 36, 0.25);
          border-top: 2px solid rgba(251, 191, 36, 0.4);
          border-radius: 20px;
          margin-top: 16px;
          margin-bottom: 24px;
          box-shadow:
            0 8px 40px rgba(0, 0, 0, 0.5),
            inset 0 1px 0 rgba(255, 255, 255, 0.08);
          position: relative;
          overflow: hidden;
        }

        /* Shimmer trên bảng */
        .lb-table-wrapper::before {
          content: "";
          position: absolute;
          top: 0;
          left: -100%;
          width: 60%;
          height: 100%;
          background: linear-gradient(
            90deg,
            transparent,
            rgba(251, 191, 36, 0.04),
            transparent
          );
          animation: tableShimmer 5s ease-in-out infinite;
        }

        @keyframes tableShimmer {
          0% { left: -60%; }
          100% { left: 160%; }
        }

        .lb-table-header {
          display: flex;
          align-items: center;
          gap: 10px;
          margin-bottom: 18px;
          padding-bottom: 14px;
          border-bottom: 1px solid rgba(251, 191, 36, 0.15);
        }

        .lb-table-header-icon {
          width: 32px;
          height: 32px;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 22px;
          background: linear-gradient(
            135deg,
            rgba(251, 191, 36, 0.2),
            rgba(251, 191, 36, 0.05)
          );
          border-radius: 10px;
          border: 1px solid rgba(251, 191, 36, 0.3);
        }

        .lb-table-title {
          font-size: 15px;
          font-weight: 800;
          color: rgba(255, 255, 255, 0.6);
          text-transform: uppercase;
          letter-spacing: 3px;
          margin: 0;
        }

        .lb-table {
          width: 100%;
          border-collapse: separate;
          border-spacing: 0 6px;
        }

        .lb-table-row {
          background: linear-gradient(
            90deg,
            rgba(255, 255, 255, 0.04) 0%,
            rgba(255, 255, 255, 0.07) 50%,
            rgba(255, 255, 255, 0.04) 100%
          );
          border-radius: 14px;
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
          position: relative;
        }

        .lb-table-row:hover {
          background: linear-gradient(
            90deg,
            rgba(251, 191, 36, 0.06) 0%,
            rgba(251, 191, 36, 0.12) 50%,
            rgba(251, 191, 36, 0.06) 100%
          );
          transform: translateY(-2px) scale(1.01);
          box-shadow:
            0 4px 20px rgba(251, 191, 36, 0.1),
            0 2px 8px rgba(0, 0, 0, 0.3);
        }

        .lb-table td {
          padding: 16px 20px;
          color: #cbd5e1;
          font-size: 16px;
          vertical-align: middle;
        }

        .lb-table td:first-child {
          border-radius: 14px 0 0 14px;
        }
        .lb-table td:last-child {
          border-radius: 0 14px 14px 0;
        }

        .lb-table-rank {
          font-weight: 900;
          font-size: 20px;
          color: rgba(255, 255, 255, 0.45);
          width: 70px;
          text-align: center;
          text-shadow: 0 0 12px rgba(255, 255, 255, 0.1);
        }

        .lb-table-medal {
          width: 40px;
          text-align: center;
          font-size: 20px;
        }

        .lb-table-name {
          font-weight: 700;
          font-size: 17px;
          color: #f1f5f9;
          letter-spacing: 0.3px;
        }

        .lb-table-points {
          font-weight: 800;
          font-size: 17px;
          color: #fbbf24;
          text-align: right;
          white-space: nowrap;
          text-shadow: 0 0 10px rgba(251, 191, 36, 0.2);
        }

        /* Loading */
        .lb-loading {
          display: flex;
          justify-content: center;
          align-items: center;
          padding: 80px 0;
        }

        .lb-spinner {
          width: 40px;
          height: 40px;
          border: 3px solid rgba(255,255,255,0.1);
          border-top-color: #34d399;
          border-radius: 50%;
          animation: spin 0.8s linear infinite;
        }

        @keyframes spin { to { transform: rotate(360deg); } }

        .lb-empty {
          text-align: center;
          padding: 60px 16px;
          color: rgba(255,255,255,0.4);
          font-size: 15px;
        }

        @media (max-width: 640px) {
          .lb-arena {
            min-height: auto;
          }

          .lb-arena-inner {
            min-height: auto;
            padding: 12px 8px 0;
          }

          .lb-arena-logo-img {
            max-width: 220px;
            max-height: 100px;
          }

          .lb-podium-row {
            gap: 4px;
          }

          .lb-rank-img {
            height: 70px;
          }

          .lb-rank-img-lg {
            height: 90px;
          }

          .lb-pet-img {
            min-height: 100px !important;
          }

          .lb-pet-img-lg {
            min-height: 140px !important;
          }

          .lb-pet-placeholder {
            font-size: 28px;
            width: 70px;
            height: 70px;
          }

          .lb-user-name {
            font-size: 10px;
            max-width: 90px;
          }

          .lb-user-points {
            font-size: 11px;
          }

          .lb-podium-block {
            height: auto !important;
          }

          .lb-pillar-img {
            position: relative;
          }

          .lb-podium-col:nth-child(1) .lb-podium-block {
            max-height: 160px;
          }

          .lb-podium-col:nth-child(2) .lb-podium-block {
            max-height: 220px;
          }

          .lb-podium-col:nth-child(3) .lb-podium-block {
            max-height: 130px;
          }

          .lb-podium-rank {
            font-size: 36px !important;
          }

          .lb-table-wrapper {
            padding: 16px 12px 20px;
            margin-top: 12px;
            border-radius: 14px;
          }

          .lb-table-header-icon {
            width: 26px;
            height: 26px;
            font-size: 16px;
          }

          .lb-table-title {
            font-size: 12px;
            letter-spacing: 1.5px;
          }

          .lb-table td {
            padding: 10px 10px;
            font-size: 13px;
          }

          .lb-table-rank {
            font-size: 15px;
            width: 45px;
          }

          .lb-table-name {
            font-size: 13px;
          }

          .lb-table-points {
            font-size: 13px;
          }
        }
      `}</style>

      <div className="lb-page">
        {/* Back link */}
        <div className="lb-topbar">
          <Link href="/pet-farm" className="lb-back-link">
            ← Đảo rồng
          </Link>
        </div>

        {/* ===== ARENA: ảnh bìa full-width + podium chồng lên ===== */}
        <div className="lb-arena">
          <div className="lb-arena-bg" />
          <div className="lb-arena-fade" />

          <div className="lb-arena-inner">
            {/* Logo BXH ở trên cùng giữa arena */}
            <img
              src="/images/logobxh-removebg-preview.png"
              alt="Bảng xếp hạng"
              className="lb-arena-logo-img"
            />

            {loading ? (
              <div className="lb-loading">
                <div className="lb-spinner" />
              </div>
            ) : entries.length === 0 ? (
              <div className="lb-empty">Chưa có dữ liệu xếp hạng.</div>
            ) : (
              <div className="lb-podium-row">
                {podiumOrder.map((entry, idx) => {
                  const rank = podiumRanks[idx];
                  const isFirst = rank === 1;
                  return (
                    <div key={rank} className="lb-podium-col">
                      {/* Rank badge */}
                      <img
                        src={RANK_IMGS[idx]}
                        alt={`Top ${rank}`}
                        className={isFirst ? "lb-rank-img-lg" : "lb-rank-img"}
                      />


                      {/* Pet */}
                      {entry?.pet?.hatchImage ? (
                        renderPetMedia(
                          entry.pet.hatchImage,
                          entry.pet.name,
                          isFirst ? "lb-pet-img-lg" : "lb-pet-img",
                        )
                      ) : (
                        <div className="lb-pet-placeholder">🐲</div>
                      )}

                      <div className="lb-user-name">{maskName(entry?.name || "")}</div>
                      <div className="lb-user-points">
                        {entry ? `${entry.totalPoints.toLocaleString()} điểm` : ""}
                      </div>

                      {/* Podium pillar */}
                      <div
                        className="lb-podium-block"
                        style={{ height: podiumHeights[idx] }}
                      >
                        <img
                          src={podiumPillars[idx]}
                          alt={`Pillar top ${rank}`}
                          className="lb-pillar-img"
                        />
                        <span className="lb-podium-rank">#{rank}</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            {/* ===== BẢNG top 4–10 ===== */}
            {rest.length > 0 && (
              <div className="lb-table-wrapper">
                <div className="lb-table-header">
                  <div className="lb-table-header-icon">🏅</div>
                  <p className="lb-table-title">Bảng xếp hạng</p>
                </div>
                <table className="lb-table">
                  <tbody>
                    {rest.map((entry, idx) => (
                      <tr key={entry.userId} className="lb-table-row">
                        <td className="lb-table-rank">#{idx + 4}</td>
                        <td className="lb-table-name">{maskName(entry.name)}</td>
                        <td className="lb-table-points">
                          {entry.totalPoints.toLocaleString()} điểm
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </div>
    </Layout>
  );
}
