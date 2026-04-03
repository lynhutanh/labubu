import { useState, useEffect, useCallback } from "react";
import Head from "next/head";
import Link from "next/link";
import Layout from "../../src/components/layout/Layout";
import {
  petService,
  PetChestConfig,
  PetFarm,
  PetFarmItem,
} from "../../src/services/pet.service";
import { Gift, X } from "lucide-react";
import { settingService } from "../../src/services/setting.service";

const STAGE_NAMES = ["Trứng", "Trứng vỡ", "Đã nở"];
const STAGE_EMOJIS = ["🥚", "🐣", "🐲"];

export default function PetFarmPage() {
  const [farm, setFarm] = useState<PetFarm | null>(null);
  const [loading, setLoading] = useState(true);
  const [claiming, setClaiming] = useState<string | null>(null);
  const [rewardPopup, setRewardPopup] = useState<{
    points: number;
    vnd: number;
  } | null>(null);
  const [guideContent, setGuideContent] = useState<string>("");
  const [showGuide, setShowGuide] = useState(false);
  const [chestConfig, setChestConfig] = useState<PetChestConfig | null>(null);
  const [showChestPopup, setShowChestPopup] = useState(false);
  const [openingChest, setOpeningChest] = useState(false);
  const [chestResult, setChestResult] = useState<{
    name: string;
    image?: string;
    rewardPoints: number;
    rewardVnd: number;
    remainingChestPoints: number;
  } | null>(null);

  const apiUrl =
    process.env.NEXT_PUBLIC_API_ENDPOINT || "http://localhost:5001";

  const getImageUrl = (url: string) => {
    if (!url) return "";
    if (url.startsWith("http")) return url;
    return `${apiUrl}${url}`;
  };

  const loadData = useCallback(async () => {
    const [farmRes, settingsRes, chestRes] = await Promise.allSettled([
      petService.getFarm(),
      settingService.getPublicSettings(),
      petService.getChestConfig(),
    ]);

    if (farmRes.status === "fulfilled") {
      setFarm(farmRes.value);
    }

    if (chestRes.status === "fulfilled") {
      setChestConfig(chestRes.value);
    } else {
      setChestConfig(null);
    }

    if (settingsRes.status === "fulfilled") {
      const guideObj = settingsRes.value.find((s) => s.key === "pet_farm_guide");
      if (guideObj && guideObj.value) {
        setGuideContent(guideObj.value);
      }
    }

    setLoading(false);
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleClaim = async (userPetId: string) => {
    try {
      setClaiming(userPetId);
      const result = await petService.claimReward(userPetId);
      setRewardPopup({ points: result.rewardPoints, vnd: result.rewardVnd });
      await loadData();
    } catch (err: any) {
      alert(err?.message || "Không thể nhận thưởng");
    } finally {
      setClaiming(null);
    }
  };

  const handleOpenChest = async () => {
    if (!chestConfig || !chestConfig.enabled) {
      alert("Rương may mắn hiện đang tạm khóa");
      return;
    }

    if ((chestConfig.availableChestPoints || 0) < chestConfig.openCostPoints) {
      alert(
        `Bạn cần ${chestConfig.openCostPoints} điểm để mở rương, hiện có ${chestConfig.availableChestPoints || 0}`,
      );
      return;
    }

    try {
      setOpeningChest(true);
      const result = await petService.openChest();
      setChestResult({
        name: result.prize.name,
        image: result.prize.image,
        rewardPoints: result.prize.rewardPoints,
        rewardVnd: result.prize.rewardVnd,
        remainingChestPoints: result.remainingChestPoints,
      });
      await loadData();
    } catch (err: any) {
      alert(err?.message || "Không thể mở rương lúc này");
    } finally {
      setOpeningChest(false);
    }
  };

  const getStageImage = (item: PetFarmItem, stage: number) => {
    if (stage === 0) return item.pet.eggImage;
    if (stage === 1) return item.pet.crackImage;
    return item.pet.hatchImage;
  };

  const isVideo = (url: string) => {
    if (!url) return false;
    const ext = url.split("?")[0].split(".").pop()?.toLowerCase() || "";
    return ["mp4", "webm", "mov", "avi"].includes(ext);
  };

  const renderMedia = (url: string, alt: string, className: string) => {
    if (!url) return null;
    const fullUrl = getImageUrl(url);
    if (isVideo(url)) {
      return (
        <video
          src={fullUrl}
          className={className}
          autoPlay
          loop
          muted
          playsInline
        />
      );
    }
    return <img src={fullUrl} alt={alt} className={className} />;
  };

  const getProgress = (item: PetFarmItem) => {
    if (!item.userPet || !farm) return 0;
    const totalPoints = farm.totalPointsEarned;
    const { minPoints, maxPoints } = item.pet;
    if (totalPoints >= maxPoints) return 100;
    if (totalPoints <= minPoints) return 0;
    return Math.floor(
      ((totalPoints - minPoints) / (maxPoints - minPoints)) * 100,
    );
  };

  const displayPoints =
    typeof farm?.availableChestPoints === "number"
      ? farm.availableChestPoints
      : (farm?.totalPointsEarned || 0);
  // Lấy danh sách pet đã qua giai đoạn trứng để hiển thị trong vườn
  const gardenPets =
    farm?.items.filter((i) => i.userPet && i.userPet.currentStage >= 1) || [];
  // Lấy danh sách pet đang nuôi hoặc chưa mở khóa
  const progressPets = farm?.items || [];

  return (
    <Layout>
      <Head>
        <title>Đảo rồng</title>
        <meta
          name="description"
          content="Tích điểm mua hàng để nở ra con vật yêu thích!"
        />
      </Head>

      <style jsx global>{`
        .pet-farm-page {
          min-height: 100vh;
          background: #0a1628;
          font-family: "Roboto", "Segoe UI", sans-serif;
          overflow-x: hidden;
          padding-bottom: 60px;
          display: flex;
          flex-direction: column;
        }

        .pet-farm-header {
          order: 1;
          text-align: center;
          padding: 28px 16px 16px;
          display: flex;
          flex-direction: column;
          align-items: center;
        }

        .pet-farm-points {
          order: 2;
          text-align: center;
          margin-bottom: 8px;
        }

        .pet-farm-title {
          font-size: 28px;
          font-weight: 900;
          background: linear-gradient(135deg, #fbbf24, #f59e0b, #34d399);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
          text-transform: uppercase;
          letter-spacing: 2px;
        }

        .pet-points-container {
          position: relative;
          display: inline-block;
          width: 340px;
          height: 70px;
        }

        .pet-points-bg {
          position: absolute;
          inset: 0;
          background-image: url('/images/123-removebg-preview.png');
          background-size: 100% 100%;
          background-repeat: no-repeat;
          background-position: center;
          pointer-events: none;
        }

        .pet-points-content {
          position: relative;
          z-index: 2;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          width: 100%;
          height: 100%;
          padding-right: 20px;
          padding-top: 20px;
        }

        .pet-points-content span {
          font-size: 14px;
          color: #fff;
          font-weight: 600;
          text-shadow: 0 1px 4px rgba(0, 0, 0, 0.6);
        }

        .pet-points-content strong {
          font-size: 24px;
          font-weight: 900;
          color: #fbbf24;
          text-shadow:
            0 1px 2px rgba(0, 0, 0, 0.8),
            0 0 10px rgba(251, 191, 36, 0.4);
        }

        /* ===== GARDEN AREA ===== */
        .pet-garden {
          order: 3;
          position: relative;
          width: 90vw;
          max-width: 1200px;
          margin: 20px auto;
          border-radius: 24px;
          aspect-ratio: 16 / 9;
          overflow: hidden;
          border: 2px solid rgba(52, 211, 153, 0.25);
          box-shadow:
            0 8px 32px rgba(0, 0, 0, 0.3),
            inset 0 0 60px rgba(52, 211, 153, 0.05);
          background-color: #0a1628;
        }

        .pet-garden-bg {
          position: absolute;
          inset: 0;
          background-image: url("/backgrounddaorong.jpg");
          background-size: 100% auto;
          background-position: center center;
          background-repeat: no-repeat;
          filter: brightness(0.85);
        }

        .pet-garden-overlay {
          position: absolute;
          inset: 0;
          background: linear-gradient(
            180deg,
            rgba(10, 22, 40, 0.15) 0%,
            rgba(10, 22, 40, 0) 30%,
            rgba(10, 22, 40, 0) 70%,
            rgba(10, 22, 40, 0.3) 100%
          );
          pointer-events: none;
        }

        .pet-garden-empty {
          position: absolute;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%);
          color: rgba(255, 255, 255, 0.6);
          font-size: 15px;
          text-align: center;
          text-shadow: 0 2px 8px rgba(0, 0, 0, 0.5);
        }

        /* ===== ROAMING PETS ===== */
        .pet-roaming {
          position: absolute;
          bottom: 30px;
          display: flex;
          flex-direction: column;
          align-items: center;
          z-index: 2;
        }

        .pet-roaming img, .pet-roaming video {
          width: 380px;
          height: 380px;
          object-fit: contain;
          filter: drop-shadow(0 4px 12px rgba(0, 0, 0, 0.4));
          transition: transform 0.3s;
        }

        .pet-roaming:hover img, .pet-roaming:hover video {
          transform: scale(1.2);
        }

        .pet-roaming-name {
          font-size: 13px;
          font-weight: 500;
          color: white;
          background: rgba(0, 0, 0, 0.5);
          padding: 3px 10px;
          border-radius: 8px;
          margin-top: 6px;
          white-space: nowrap;
          text-shadow: 0 1px 4px rgba(0, 0, 0, 0.8);
        }

        /* Bounce animation for walking feel */
        @keyframes petBounce {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-5px); }
        }

        .pet-roaming img, .pet-roaming video {
          animation: petBounce 0.5s ease-in-out infinite;
        }

        /* Roaming keyframes - vòng lên vòng xuống tự nhiên */
        @keyframes roam0 {
          0% { left: 5%; bottom: 5%; }
          15% { left: 35%; bottom: 40%; }
          30% { left: 62%; bottom: 15%; }
          50% { left: 75%; bottom: 45%; }
          65% { left: 55%; bottom: 25%; }
          80% { left: 25%; bottom: 35%; }
          100% { left: 5%; bottom: 5%; }
        }
        @keyframes roam1 {
          0% { left: 75%; bottom: 35%; }
          20% { left: 45%; bottom: 10%; }
          35% { left: 15%; bottom: 45%; }
          55% { left: 5%; bottom: 20%; }
          70% { left: 40%; bottom: 50%; }
          85% { left: 65%; bottom: 15%; }
          100% { left: 75%; bottom: 35%; }
        }
        @keyframes roam2 {
          0% { left: 45%; bottom: 25%; }
          12% { left: 15%; bottom: 10%; }
          28% { left: 5%; bottom: 40%; }
          45% { left: 30%; bottom: 50%; }
          60% { left: 65%; bottom: 20%; }
          78% { left: 80%; bottom: 45%; }
          100% { left: 45%; bottom: 25%; }
        }
        @keyframes roam3 {
          0% { left: 25%; bottom: 50%; }
          18% { left: 60%; bottom: 15%; }
          32% { left: 75%; bottom: 40%; }
          50% { left: 65%; bottom: 5%; }
          68% { left: 35%; bottom: 30%; }
          82% { left: 15%; bottom: 20%; }
          100% { left: 25%; bottom: 50%; }
        }
        @keyframes roam4 {
          0% { left: 60%; bottom: 15%; }
          16% { left: 75%; bottom: 40%; }
          33% { left: 65%; bottom: 50%; }
          50% { left: 35%; bottom: 25%; }
          66% { left: 15%; bottom: 45%; }
          83% { left: 5%; bottom: 30%; }
          100% { left: 60%; bottom: 15%; }
        }
        @keyframes roam5 {
          0% { left: 10%; bottom: 40%; }
          20% { left: 30%; bottom: 10%; }
          40% { left: 70%; bottom: 30%; }
          60% { left: 85%; bottom: 60%; }
          80% { left: 40%; bottom: 55%; }
          100% { left: 10%; bottom: 40%; }
        }
        @keyframes roam6 {
          0% { left: 80%; bottom: 10%; }
          15% { left: 50%; bottom: 40%; }
          35% { left: 20%; bottom: 20%; }
          55% { left: 10%; bottom: 60%; }
          75% { left: 45%; bottom: 15%; }
          100% { left: 80%; bottom: 10%; }
        }
        @keyframes roam7 {
          0% { left: 35%; bottom: 5%; }
          25% { left: 15%; bottom: 35%; }
          45% { left: 55%; bottom: 55%; }
          65% { left: 85%; bottom: 25%; }
          85% { left: 60%; bottom: 10%; }
          100% { left: 35%; bottom: 5%; }
        }
        @keyframes roam8 {
          0% { left: 90%; bottom: 45%; }
          20% { left: 65%; bottom: 15%; }
          40% { left: 25%; bottom: 10%; }
          60% { left: 5%; bottom: 35%; }
          80% { left: 45%; bottom: 65%; }
          100% { left: 90%; bottom: 45%; }
        }
        @keyframes roam9 {
          0% { left: 50%; bottom: 60%; }
          18% { left: 85%; bottom: 50%; }
          38% { left: 75%; bottom: 15%; }
          58% { left: 35%; bottom: 5%; }
          78% { left: 10%; bottom: 25%; }
          100% { left: 50%; bottom: 60%; }
        }

        @keyframes flip0 { 0%, 49.9% { transform: scaleX(1); } 50%, 99.9% { transform: scaleX(-1); } 100% { transform: scaleX(1); } }
        @keyframes flip1 { 0%, 54.9% { transform: scaleX(-1); } 55%, 99.9% { transform: scaleX(1); } 100% { transform: scaleX(-1); } }
        @keyframes flip2 { 0%, 27.9% { transform: scaleX(-1); } 28%, 77.9% { transform: scaleX(1); } 78%, 100% { transform: scaleX(-1); } }
        @keyframes flip3 { 0%, 31.9% { transform: scaleX(1); } 32%, 81.9% { transform: scaleX(-1); } 82%, 100% { transform: scaleX(1); } }
        @keyframes flip4 { 0%, 15.9% { transform: scaleX(1); } 16%, 82.9% { transform: scaleX(-1); } 83%, 100% { transform: scaleX(1); } }
        @keyframes flip5 { 0%, 39.9% { transform: scaleX(1); } 40%, 79.9% { transform: scaleX(-1); } 80%, 100% { transform: scaleX(1); } }
        @keyframes flip6 { 0%, 24.9% { transform: scaleX(-1); } 25%, 64.9% { transform: scaleX(1); } 65%, 100% { transform: scaleX(-1); } }
        @keyframes flip7 { 0%, 44.9% { transform: scaleX(-1); } 45%, 84.9% { transform: scaleX(1); } 85%, 100% { transform: scaleX(-1); } }
        @keyframes flip8 { 0%, 34.9% { transform: scaleX(-1); } 35%, 74.9% { transform: scaleX(1); } 75%, 100% { transform: scaleX(-1); } }
        @keyframes flip9 { 0%, 29.9% { transform: scaleX(1); } 30%, 69.9% { transform: scaleX(-1); } 70%, 100% { transform: scaleX(1); } }

        .pet-roam-0 { animation: roam0 38s ease-in-out infinite; }
        .pet-roam-1 { animation: roam1 43s ease-in-out infinite; }
        .pet-roam-2 { animation: roam2 47s ease-in-out infinite; }
        .pet-roam-3 { animation: roam3 53s ease-in-out infinite; }
        .pet-roam-4 { animation: roam4 59s ease-in-out infinite; }
        .pet-roam-5 { animation: roam5 41s ease-in-out infinite; }
        .pet-roam-6 { animation: roam6 61s ease-in-out infinite; }
        .pet-roam-7 { animation: roam7 37s ease-in-out infinite; }
        .pet-roam-8 { animation: roam8 49s ease-in-out infinite; }
        .pet-roam-9 { animation: roam9 55s ease-in-out infinite; }

        .pet-flip-0 { animation: flip0 38s linear infinite; transform-origin: center; }
        .pet-flip-1 { animation: flip1 43s linear infinite; transform-origin: center; }
        .pet-flip-2 { animation: flip2 47s linear infinite; transform-origin: center; }
        .pet-flip-3 { animation: flip3 53s linear infinite; transform-origin: center; }
        .pet-flip-4 { animation: flip4 59s linear infinite; transform-origin: center; }
        .pet-flip-5 { animation: flip5 41s linear infinite; transform-origin: center; }
        .pet-flip-6 { animation: flip6 61s linear infinite; transform-origin: center; }
        .pet-flip-7 { animation: flip7 37s linear infinite; transform-origin: center; }
        .pet-flip-8 { animation: flip8 49s linear infinite; transform-origin: center; }
        .pet-flip-9 { animation: flip9 55s linear infinite; transform-origin: center; }

        /* ===== PET LIST ===== */
        .pet-list {
          order: 4;
          max-width: 800px;
          margin: 0 auto;
          padding: 0 16px;
        }

        .pet-list-title {
          font-size: 18px;
          font-weight: 800;
          color: #e2e8f0;
          margin-bottom: 16px;
          padding-left: 4px;
        }

        .pet-card {
          background: rgba(255, 255, 255, 0.06);
          backdrop-filter: blur(10px);
          border: 1px solid rgba(255, 255, 255, 0.1);
          border-radius: 20px;
          padding: 20px;
          margin-bottom: 16px;
          transition: all 0.3s;
        }

        .pet-card.locked {
          opacity: 0.4;
          filter: grayscale(0.6);
        }

        .pet-card.completed {
          border-color: rgba(251, 191, 36, 0.3);
        }

        .pet-card-header {
          display: flex;
          align-items: center;
          gap: 16px;
          margin-bottom: 16px;
        }

        .pet-card-img {
          width: 64px;
          height: 64px;
          object-fit: contain;
          border-radius: 14px;
          background: rgba(255, 255, 255, 0.05);
          padding: 4px;
          border: 2px solid rgba(52, 211, 153, 0.3);
        }

        .pet-card.locked .pet-card-img {
          border-color: rgba(255, 255, 255, 0.1);
        }

        .pet-card.completed .pet-card-img {
          border-color: rgba(251, 191, 36, 0.4);
        }

        .pet-card-name {
          font-size: 18px;
          font-weight: 800;
          color: white;
        }

        .pet-card-stage {
          font-size: 13px;
          color: #94a3b8;
          margin-top: 2px;
        }

        .pet-card-range {
          font-size: 11px;
          color: #64748b;
          margin-top: 2px;
        }

        /* Stage flow */
        .pet-stages-flow {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 6px;
          margin-bottom: 16px;
        }

        .pet-stage-item {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 4px;
        }

        .pet-stage-dot {
          width: 50px;
          height: 50px;
          border-radius: 12px;
          background: rgba(255, 255, 255, 0.05);
          border: 2px solid rgba(255, 255, 255, 0.1);
          display: flex;
          align-items: center;
          justify-content: center;
          transition: all 0.3s;
        }

        .pet-stage-dot.active {
          border-color: #34d399;
          background: rgba(52, 211, 153, 0.1);
          box-shadow: 0 0 14px rgba(52, 211, 153, 0.3);
        }

        .pet-stage-dot.done {
          border-color: #fbbf24;
          background: rgba(251, 191, 36, 0.1);
        }

        .pet-stage-dot img, .pet-stage-dot video {
          width: 32px;
          height: 32px;
          object-fit: contain;
        }

        .pet-stage-label {
          font-size: 10px;
          color: #94a3b8;
        }

        .pet-stage-arrow {
          color: rgba(255, 255, 255, 0.15);
          font-size: 16px;
          margin-bottom: 16px;
        }

        /* Progress */
        .pet-progress-wrap { margin-bottom: 16px; }

        .pet-progress-labels {
          display: flex;
          justify-content: space-between;
          font-size: 12px;
          color: #94a3b8;
          margin-bottom: 6px;
        }

        .pet-progress-bar {
          height: 10px;
          background: rgba(255, 255, 255, 0.1);
          border-radius: 6px;
          overflow: hidden;
        }

        .pet-progress-fill {
          height: 100%;
          border-radius: 6px;
          background: linear-gradient(90deg, #34d399, #10b981);
          transition: width 0.5s ease;
          position: relative;
        }

        .pet-progress-fill::after {
          content: "";
          position: absolute;
          inset: 0;
          background: linear-gradient(
            90deg,
            transparent,
            rgba(255, 255, 255, 0.3),
            transparent
          );
          animation: shimmer 2s infinite;
        }

        @keyframes shimmer {
          0% { transform: translateX(-100%); }
          100% { transform: translateX(100%); }
        }

        /* Buttons */
        .pet-claim-btn {
          width: 100%;
          padding: 14px;
          background: linear-gradient(135deg, #fbbf24, #f59e0b);
          color: #1a1a1a;
          border: none;
          border-radius: 12px;
          font-weight: 800;
          font-size: 15px;
          cursor: pointer;
          transition: all 0.2s;
          text-transform: uppercase;
          letter-spacing: 1px;
        }

        .pet-claim-btn:hover:not(:disabled) {
          transform: scale(1.03);
          box-shadow: 0 4px 20px rgba(251, 191, 36, 0.5);
        }

        .pet-claim-btn:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }

        .pet-claimed-badge {
          text-align: center;
          padding: 12px;
          background: rgba(52, 211, 153, 0.1);
          border: 1px solid rgba(52, 211, 153, 0.3);
          border-radius: 12px;
          color: #34d399;
          font-weight: 700;
          font-size: 14px;
        }

        .pet-locked-badge {
          text-align: center;
          padding: 10px;
          background: rgba(255, 255, 255, 0.03);
          border: 1px solid rgba(255, 255, 255, 0.08);
          border-radius: 12px;
          color: #64748b;
          font-size: 13px;
        }

        /* Reward popup */
        .pet-reward-overlay {
          position: fixed;
          inset: 0;
          background: rgba(0, 0, 0, 0.7);
          z-index: 100;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 20px;
          backdrop-filter: blur(6px);
        }

        .pet-reward-popup {
          background: linear-gradient(135deg, #1a2948, #0f1f36);
          border: 2px solid #fbbf24;
          border-radius: 24px;
          padding: 40px 32px;
          max-width: 400px;
          width: 100%;
          text-align: center;
          animation: popIn 0.3s ease;
          box-shadow:
            0 20px 60px rgba(0, 0, 0, 0.5),
            0 0 40px rgba(251, 191, 36, 0.2);
        }

        @keyframes popIn {
          from { opacity: 0; transform: scale(0.8); }
          to { opacity: 1; transform: scale(1); }
        }

        /* Guide button & popup */
        .pet-guide-btn {
          position: absolute;
          bottom: 24px;
          left: 24px;
          z-index: 50;
          width: 76px;
          height: 76px;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          background: transparent !important;
          border: none !important;
          outline: none !important;
          box-shadow: none !important;
          padding: 0;
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
          animation: float 3s ease-in-out infinite;
        }

        .pet-guide-btn img {
          width: 100%;
          height: 100%;
          object-fit: contain;
          filter: drop-shadow(0 4px 6px rgba(0, 0, 0, 0.3));
        }

        .pet-guide-btn:hover {
          transform: scale(1.1);
        }

        .pet-guide-popup-overlay {
          position: fixed;
          inset: 0;
          background: rgba(0, 0, 0, 0.85);
          z-index: 1000;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 20px;
          backdrop-filter: blur(8px);
        }

        .pet-guide-popup {
          background: linear-gradient(180deg, rgba(30, 27, 75, 0.95) 0%, rgba(10, 22, 40, 0.98) 100%);
          backdrop-filter: blur(20px);
          border: 1px solid rgba(255, 255, 255, 0.15);
          border-radius: 20px;
          width: 100%;
          max-width: 600px;
          max-height: 80vh;
          display: flex;
          flex-direction: column;
          box-shadow: 0 10px 40px rgba(0, 0, 0, 0.6), inset 0 1px 0 rgba(255, 255, 255, 0.1);
          animation: popIn 0.3s cubic-bezier(0.16, 1, 0.3, 1);
          overflow: hidden;
          color: white;
        }

        .pet-guide-header {
          padding: 20px 24px;
          background: rgba(255, 255, 255, 0.05);
          border-bottom: 1px solid rgba(255, 255, 255, 0.1);
          display: flex;
          align-items: center;
          justify-content: space-between;
        }

        .pet-guide-title {
          font-size: 20px;
          font-weight: 700;
          color: #f8fafc;
          display: flex;
          align-items: center;
          gap: 10px;
          text-shadow: 0 2px 4px rgba(0, 0, 0, 0.3);
        }

        .pet-guide-close {
          width: 36px;
          height: 36px;
          border-radius: 50%;
          background: rgba(255, 255, 255, 0.1);
          border: 1px solid rgba(255, 255, 255, 0.05);
          color: #cbd5e1;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          transition: all 0.2s;
        }

        .pet-guide-close:hover {
          background: rgba(255, 255, 255, 0.2);
          color: white;
          transform: scale(1.05);
        }

        .pet-guide-body {
          padding: 24px;
          overflow-y: auto;
          color: #cbd5e1;
          font-size: 16px;
          line-height: 1.7;
        }

        .pet-guide-body::-webkit-scrollbar {
          width: 6px;
        }
        .pet-guide-body::-webkit-scrollbar-track {
          background: rgba(0, 0, 0, 0.2);
        }
        .pet-guide-body::-webkit-scrollbar-thumb {
          background: rgba(255, 255, 255, 0.2);
          border-radius: 4px;
        }
        .pet-guide-body::-webkit-scrollbar-thumb:hover {
          background: rgba(255, 255, 255, 0.4);
        }

        .pet-guide-body h1, .pet-guide-body h2, .pet-guide-body h3 {
          color: #f8fafc;
          margin-top: 0;
          margin-bottom: 16px;
          font-weight: 700;
        }

        .pet-guide-body p {
          margin-bottom: 16px;
        }
        
        .pet-guide-body ul, .pet-guide-body ol {
          margin-bottom: 16px;
          padding-left: 20px;
        }

        .pet-guide-body li {
          margin-bottom: 6px;
        }

        .pet-guide-body a {
          color: #34d399;
          text-decoration: underline;
        }

        .pet-guide-body img {
          max-width: 100%;
          border-radius: 12px;
          margin: 16px 0;
          box-shadow: 0 4px 15px rgba(0, 0, 0, 0.3);
          border: 1px solid rgba(255,255,255,0.1);
        }

        @keyframes float {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-10px); }
        }

        .pet-lb-btn {
          position: absolute;
          bottom: 24px;
          left: 108px;
          z-index: 50;
          width: 76px;
          height: 76px;
          display: flex;
          align-items: center;
          justify-content: center;
          background: transparent;
          border: none;
          outline: none;
          box-shadow: none;
          padding: 0;
          cursor: pointer;
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
          animation: float 3s ease-in-out infinite;
          animation-delay: 0.5s;
          text-decoration: none;
        }

        .pet-lb-btn img {
          width: 100%;
          height: 100%;
          object-fit: contain;
          filter: drop-shadow(0 4px 6px rgba(0, 0, 0, 0.3));
        }

        .pet-lb-btn:hover {
          transform: scale(1.1);
        }

        .pet-chest-btn {
          position: absolute;
          bottom: 24px;
          left: 188px;
          z-index: 50;
          width: 96px;
          height: 96px;
          display: flex;
          align-items: center;
          justify-content: center;
          background: transparent;
          border: none;
          outline: none;
          box-shadow: none;
          padding: 0;
          cursor: pointer;
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
          animation: float 3s ease-in-out infinite;
          animation-delay: 1s;
          text-decoration: none;
        }

        .pet-chest-btn img {
          width: 100%;
          height: 100%;
          object-fit: contain;
          filter: drop-shadow(0 4px 6px rgba(0, 0, 0, 0.3));
        }

        .pet-chest-btn:hover {
          transform: scale(1.1);
        }

        .pet-chest-overlay {
          position: fixed;
          inset: 0;
          background: rgba(0, 0, 0, 0.78);
          z-index: 1000;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 20px;
          backdrop-filter: blur(8px);
        }

        .pet-chest-popup {
          width: 100%;
          max-width: 640px;
          max-height: 85vh;
          overflow: auto;
          border-radius: 24px;
          border: 1px solid rgba(251, 191, 36, 0.35);
          background: linear-gradient(180deg, rgba(31, 41, 55, 0.98), rgba(17, 24, 39, 0.98));
          color: #f8fafc;
          box-shadow: 0 25px 50px rgba(0, 0, 0, 0.45);
        }

        @media (max-width: 640px) {
          .pet-guide-btn {
            bottom: 20px;
            left: 20px;
            width: 50px;
            height: 50px;
          }
          .pet-lb-btn {
            bottom: 20px;
            left: 78px;
            width: 50px;
            height: 50px;
          }
          .pet-chest-btn {
            bottom: 20px;
            left: 132px;
            width: 64px;
            height: 64px;
          }
          .pet-guide-popup {
            max-height: 90vh;
            border-radius: 20px;
          }
        }

        .pet-farm-loading {
          text-align: center;
          padding: 80px 20px;
          color: #94a3b8;
          font-size: 16px;
        }

        .mobile-points { display: none; }
        @media (max-width: 640px) {
          .desktop-points { display: none; }
          .mobile-points { display: block; text-align: center; margin-bottom: 24px; }
          .pet-farm-page {
            position: relative;
          }
          .pet-farm-header {
            order: 2;
            position: relative;
            z-index: 15;
            padding: 20px 10px;
            margin-bottom: -150px;
            /* Phủ xíu bóng mờ để dễ đọc chữ phía dưới */
            background: linear-gradient(180deg, rgba(10,22,40,0.4) 0%, transparent 100%);
          }
          .pet-farm-header img {
            width: 110px !important;
            height: 110px !important;
            margin-bottom: 4px !important;
          }
          .pet-farm-title { font-size: 22px; }
          .pet-garden {
            width: 100%;
            height: 85vh;
            min-height: 600px;
            aspect-ratio: auto;
            margin: 0;
            border-radius: 0;
          }
          .pet-garden-bg {
            background-image: url("/nenmobile.jpg");
            background-size: cover;
            background-position: center center;
          }
          .pet-roaming img, .pet-roaming video { width: 140px; height: 140px; object-fit: contain; }
          .pet-card { margin: 0 4px 12px; padding: 16px; }
          .pet-stage-dot { width: 42px; height: 42px; }
          .pet-stage-dot img, .pet-stage-dot video { width: 26px; height: 26px; object-fit: cover; }
        }
      `}</style>

      <div className="pet-farm-page">
        <div className="pet-farm-header">
          <img src="/lgodaorong.png" alt="Đảo Rồng" style={{ width: 160, height: 160, objectFit: "contain", marginBottom: 8 }} />

        </div>

        <div className="pet-farm-points desktop-points">
          {farm && (
            <div className="pet-points-container">
              <div className="pet-points-bg" />
              <div className="pet-points-content">
                <span>Diem kha dung:</span>
                <strong>{displayPoints}</strong>
              </div>
            </div>
          )}
        </div>

        {loading ? (
          <div className="pet-farm-loading">Đang tải trang trại...</div>
        ) : (
          <>
            {/* ===== KHU VƯỜN ===== */}
            <div className="pet-garden">
              <div className="pet-garden-bg" />
              <div className="pet-garden-overlay" />

              {gardenPets.length === 0 ? (
                <div className="pet-garden-empty">
                  <p style={{ fontSize: 40, marginBottom: 8 }}>🌱</p>
                  <p>Nuôi con vật đầu tiên để khu vườn thêm sống động!</p>
                </div>
              ) : (
                gardenPets.map((item, index) => {
                  const stageImg = getStageImage(item, item.userPet!.currentStage);
                  const delay = `-${(index * 13) % 100}s`;
                  return (
                    <div
                      key={item.pet._id}
                      className={`pet-roaming pet-roam-${index % 10}`}
                      style={{ animationDelay: delay }}
                      title={item.pet.name}
                    >
                      <div
                        className={`pet-roaming-media pet-flip-${index % 10}`}
                        style={{ animationDelay: delay }}
                      >
                        {stageImg && renderMedia(stageImg, item.pet.name, "")}
                      </div>
                      <span className="pet-roaming-name">{item.pet.name}</span>
                    </div>
                  );
                })
              )}
              {/* N�t hu?ng d?n */}
              {guideContent && (
                <button
                  className="pet-guide-btn"
                  onClick={() => setShowGuide(true)}
                  title="Hu?ng d?n"
                >
                  <img src="/logoquyensach.png" alt="Hu?ng d?n" />
                </button>
              )}

              {/* N�t b?ng x?p h?ng */}
              <Link href="/pet-leaderboard" className="pet-lb-btn" title="B?ng x?p h?ng">
                <img src="/images/logobxh-removebg-preview.png" alt="B?ng x?p h?ng" />
              </Link>

              {/* N�t m? ruong may m?n */}
              <Link
                href="/pet-chest"
                className="pet-chest-btn"
                title="M? ruong may m?n"
              >
                <img src="/images/iconhopqua.png" alt="Icon hop qua" />
              </Link>
            </div>

            {/* ===== DANH SÁCH PET ===== */}
            {progressPets.length > 0 && (
              <div className="pet-list">
                <h2 className="pet-list-title">📋 Tiến trình nuôi vật</h2>

                <div className="mobile-points">
                  {farm && (
                    <div className="pet-points-container">
                      <div className="pet-points-bg" />
                      <div className="pet-points-content">
                        <span>Diem kha dung:</span>
                        <strong>{displayPoints}</strong>
                      </div>
                    </div>
                  )}
                </div>

                {progressPets.map((item) => {
                  const isLocked = !item.userPet;
                  const currentStage = item.userPet?.currentStage ?? -1;
                  const isCompleted = item.userPet?.isCompleted || false;
                  const currentImage = isLocked
                    ? item.pet.eggImage
                    : getStageImage(item, currentStage);
                  const progress = getProgress(item);

                  return (
                    <div
                      key={item.pet._id}
                      className={`pet-card ${isLocked ? "locked" : ""} ${isCompleted ? "completed" : ""}`}
                    >
                      <div className="pet-card-header">
                        {currentImage && renderMedia(currentImage, item.pet.name, "pet-card-img")}
                        <div>
                          <div className="pet-card-name">{item.pet.name}</div>
                          <div className="pet-card-stage">
                            {isLocked
                              ? "🔒 Chưa mở khóa"
                              : isCompleted
                                ? "✨ Đã nở hoàn thành!"
                                : `${STAGE_EMOJIS[currentStage]} ${STAGE_NAMES[currentStage]}`}
                          </div>
                          <div className="pet-card-range">
                            Khoảng: {item.pet.minPoints} → {item.pet.maxPoints} điểm
                          </div>
                        </div>
                      </div>

                      {/* 3 stages */}
                      <div className="pet-stages-flow">
                        {[0, 1, 2].map((stage) => {
                          const stageImg = getStageImage(item, stage);
                          const isActive = !isLocked && currentStage === stage && !isCompleted;
                          const isDone = !isLocked && (currentStage > stage || isCompleted);
                          return (
                            <div
                              key={stage}
                              style={{
                                display: "flex",
                                alignItems: "center",
                                gap: 6,
                              }}
                            >
                              <div className="pet-stage-item">
                                <div
                                  className={`pet-stage-dot ${isActive ? "active" : ""} ${isDone ? "done" : ""}`}
                                >
                                  {stageImg ? (
                                    renderMedia(stageImg, STAGE_NAMES[stage], "")
                                  ) : (
                                    <span style={{ fontSize: 18 }}>
                                      {STAGE_EMOJIS[stage]}
                                    </span>
                                  )}
                                </div>
                                <span className="pet-stage-label">
                                  {STAGE_NAMES[stage]}
                                </span>
                              </div>
                              {stage < 2 && (
                                <span className="pet-stage-arrow">→</span>
                              )}
                            </div>
                          );
                        })}
                      </div>

                      {/* Progress */}
                      {!isLocked && !isCompleted && (
                        <div className="pet-progress-wrap">
                          <div className="pet-progress-labels">
                            <span>
                              {farm!.totalPointsEarned} điểm
                            </span>
                            <span>
                              {item.pet.maxPoints} điểm để hoàn thành
                            </span>
                          </div>
                          <div className="pet-progress-bar">
                            <div
                              className="pet-progress-fill"
                              style={{ width: `${progress}%` }}
                            />
                          </div>
                        </div>
                      )}

                      {/* Actions */}
                      {isLocked ? (
                        <div className="pet-locked-badge">
                          🔒 Cần {item.pet.minPoints} điểm để mở khóa
                        </div>
                      ) : isCompleted ? (
                        item.userPet!.rewardClaimed ? (
                          <div className="pet-claimed-badge">
                            ✅ Đã nhận thưởng {item.pet.rewardPoints} điểm (
                            {(item.pet.rewardPoints * 1000).toLocaleString(
                              "vi-VN",
                            )}
                            đ)
                          </div>
                        ) : (
                          <button
                            className="pet-claim-btn"
                            onClick={() => handleClaim(item.userPet!._id)}
                            disabled={claiming === item.userPet!._id}
                          >
                            {claiming === item.userPet!._id
                              ? "Đang nhận..."
                              : `🎉 Nhận thưởng ${item.pet.rewardPoints} điểm (${(item.pet.rewardPoints * 1000).toLocaleString("vi-VN")}đ)`}
                          </button>
                        )
                      ) : (
                        <div
                          style={{
                            textAlign: "center",
                            padding: 8,
                            color: "#94a3b8",
                            fontSize: 13,
                          }}
                        >
                          🛒 Mua hàng thêm để con vật tiến hóa!
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </>
        )}

        {/* Popup rương may mắn */}
        {showChestPopup && chestConfig && (
          <div className="pet-chest-overlay" onClick={() => setShowChestPopup(false)}>
            <div className="pet-chest-popup" onClick={(e) => e.stopPropagation()}>
              <div
                style={{
                  padding: "20px 24px",
                  borderBottom: "1px solid rgba(251,191,36,0.25)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                }}
              >
                <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                  <Gift size={22} color="#fbbf24" />
                  <strong style={{ fontSize: 20 }}>Rương may mắn</strong>
                </div>
                <button className="pet-guide-close" onClick={() => setShowChestPopup(false)}>
                  <X size={20} />
                </button>
              </div>

              <div style={{ padding: "20px 24px 24px" }}>
                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns: "repeat(auto-fit,minmax(170px,1fr))",
                    gap: 10,
                    marginBottom: 16,
                  }}
                >
                  <div
                    style={{
                      background: "rgba(30, 64, 175, 0.25)",
                      border: "1px solid rgba(96,165,250,0.4)",
                      borderRadius: 12,
                      padding: "10px 12px",
                    }}
                  >
                    <div style={{ fontSize: 12, color: "#bfdbfe" }}>Điểm khả dụng</div>
                    <div style={{ fontSize: 24, fontWeight: 900, color: "#dbeafe" }}>
                      {chestConfig.availableChestPoints}
                    </div>
                  </div>
                  <div
                    style={{
                      background: "rgba(133, 77, 14, 0.28)",
                      border: "1px solid rgba(251,191,36,0.45)",
                      borderRadius: 12,
                      padding: "10px 12px",
                    }}
                  >
                    <div style={{ fontSize: 12, color: "#fde68a" }}>Giá mở 1 lần</div>
                    <div style={{ fontSize: 24, fontWeight: 900, color: "#fef3c7" }}>
                      {chestConfig.openCostPoints}
                    </div>
                  </div>
                </div>

                <div
                  style={{
                    marginBottom: 14,
                    fontSize: 13,
                    color: "#94a3b8",
                  }}
                >
                  Danh sách quà và tỉ lệ:
                </div>
                <div style={{ display: "flex", flexDirection: "column", gap: 8, maxHeight: 240, overflowY: "auto" }}>
                  {(() => {
                    const activePrizes = chestConfig.prizes.filter((p) => p.active !== false);
                    const total = activePrizes.reduce((sum, p) => sum + p.weight, 0) || 1;
                    return activePrizes.map((prize) => (
                      <div
                        key={prize.id}
                        style={{
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "space-between",
                          gap: 10,
                          padding: "10px 12px",
                          borderRadius: 10,
                          border: "1px solid rgba(148,163,184,0.24)",
                          background: "rgba(255,255,255,0.03)",
                        }}
                      >
                        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                          {prize.image ? (
                            <img
                              src={getImageUrl(prize.image)}
                              alt={prize.name}
                              style={{ width: 34, height: 34, borderRadius: 8, objectFit: "cover" }}
                            />
                          ) : (
                            <div
                              style={{
                                width: 34,
                                height: 34,
                                borderRadius: 8,
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                                background: "rgba(251,191,36,0.2)",
                                color: "#fbbf24",
                              }}
                            >
                              <Gift size={16} />
                            </div>
                          )}
                          <div>
                            <div style={{ fontSize: 14, fontWeight: 700, color: "#f8fafc" }}>
                              {prize.name}
                            </div>
                            <div style={{ fontSize: 12, color: "#cbd5e1" }}>
                              +{prize.rewardVnd.toLocaleString("vi-VN")}đ
                            </div>
                          </div>
                        </div>
                        <div style={{ fontSize: 12, color: "#fbbf24", fontWeight: 700 }}>
                          {((prize.weight / total) * 100).toFixed(2)}%
                        </div>
                      </div>
                    ));
                  })()}
                </div>

                {chestResult && (
                  <div
                    style={{
                      marginTop: 14,
                      padding: "12px 14px",
                      borderRadius: 12,
                      border: "1px solid rgba(52,211,153,0.35)",
                      background: "rgba(16,185,129,0.15)",
                    }}
                  >
                    <div style={{ fontSize: 13, color: "#a7f3d0" }}>Bạn vừa nhận:</div>
                    <div style={{ fontSize: 18, fontWeight: 900, color: "#ecfeff", marginTop: 2 }}>
                      {chestResult.name} (+{chestResult.rewardVnd.toLocaleString("vi-VN")}đ)
                    </div>
                    <div style={{ fontSize: 12, color: "#bbf7d0", marginTop: 2 }}>
                      Điểm mở rương còn lại: {chestResult.remainingChestPoints}
                    </div>
                  </div>
                )}

                <button
                  onClick={handleOpenChest}
                  disabled={openingChest || !chestConfig.enabled || chestConfig.availableChestPoints < chestConfig.openCostPoints}
                  style={{
                    marginTop: 16,
                    width: "100%",
                    padding: "12px 16px",
                    borderRadius: 14,
                    border: "none",
                    fontWeight: 800,
                    color: "#1f2937",
                    background: "linear-gradient(135deg, #fbbf24, #f59e0b)",
                    cursor:
                      openingChest || !chestConfig.enabled || chestConfig.availableChestPoints < chestConfig.openCostPoints
                        ? "not-allowed"
                        : "pointer",
                    opacity:
                      openingChest || !chestConfig.enabled || chestConfig.availableChestPoints < chestConfig.openCostPoints
                        ? 0.6
                        : 1,
                  }}
                >
                  {openingChest ? "Đang mở rương..." : `Mở rương (${chestConfig.openCostPoints} điểm)`}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Reward popup */}
        {rewardPopup && (
          <div
            className="pet-reward-overlay"
            onClick={() => setRewardPopup(null)}
          >
            <div
              className="pet-reward-popup"
              onClick={(e) => e.stopPropagation()}
            >
              <div style={{ fontSize: 64, marginBottom: 16 }}>🎉</div>
              <div
                style={{
                  fontSize: 24,
                  fontWeight: 900,
                  background:
                    "linear-gradient(135deg, #fbbf24, #f59e0b)",
                  WebkitBackgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                  backgroundClip: "text",
                  marginBottom: 8,
                }}
              >
                Chúc mừng!
              </div>
              <div
                style={{
                  fontSize: 36,
                  fontWeight: 900,
                  color: "#34d399",
                  margin: "12px 0",
                }}
              >
                +{rewardPopup.vnd.toLocaleString("vi-VN")}đ
              </div>
              <div
                style={{
                  color: "#94a3b8",
                  fontSize: 14,
                  marginBottom: 24,
                }}
              >
                Bạn nhận được {rewardPopup.points} điểm thưởng ={" "}
                {rewardPopup.vnd.toLocaleString("vi-VN")}đ vào ví
              </div>
              <button
                onClick={() => setRewardPopup(null)}
                style={{
                  padding: "12px 40px",
                  background:
                    "linear-gradient(135deg, #fbbf24, #f59e0b)",
                  color: "#1a1a1a",
                  border: "none",
                  borderRadius: 30,
                  fontWeight: 800,
                  fontSize: 16,
                  cursor: "pointer",
                }}
              >
                Tuyệt vời!
              </button>
            </div>
          </div>
        )}

        {/* Popup Hướng Dẫn */}
        {showGuide && (
          <div className="pet-guide-popup-overlay" onClick={() => setShowGuide(false)}>
            <div className="pet-guide-popup" onClick={e => e.stopPropagation()}>
              <div className="pet-guide-header">
                <div className="pet-guide-title">
                  <img src="/logoquyensach.png" alt="Book Icon" style={{ width: 28, height: 28, objectFit: "contain", filter: "drop-shadow(0 2px 4px rgba(0,0,0,0.3))" }} />
                  <span>Hướng dẫn</span>
                </div>
                <button className="pet-guide-close" onClick={() => setShowGuide(false)}>
                  <X size={20} />
                </button>
              </div>
              <div
                className="pet-guide-body"
                dangerouslySetInnerHTML={{ __html: guideContent }}
              />
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
}


