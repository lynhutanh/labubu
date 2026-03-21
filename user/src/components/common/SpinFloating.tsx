import { useState, useEffect } from "react";
import { useRouter } from "next/router";
import { spinService, SpinConfig } from "../../services/spin.service";

export default function SpinFloating() {
  const router = useRouter();
  const [config, setConfig] = useState<SpinConfig | null>(null);
  const [dismissed, setDismissed] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    // Kiểm tra đã dismiss trong session chưa
    if (typeof window !== "undefined") {
      const d = sessionStorage.getItem("spin_dismissed");
      if (d === "1") {
        setDismissed(true);
        return;
      }
    }
    loadConfig();
  }, []);

  const loadConfig = async () => {
    try {
      const data = await spinService.getActiveConfig();
      setConfig(data);
    } catch {
      // no active config
    }
  };

  const handleDismiss = (e: React.MouseEvent) => {
    e.stopPropagation();
    setDismissed(true);
    sessionStorage.setItem("spin_dismissed", "1");
  };

  const handleClick = () => {
    router.push("/spin");
  };

  if (!mounted || dismissed || !config) return null;
  // Không hiện khi đang ở trang spin
  if (router.pathname === "/spin") return null;

  return (
    <>
      <style jsx>{`
        .spin-floating {
          position: fixed;
          bottom: 20px;
          right: 20px;
          z-index: 9999;
          cursor: pointer;
          animation: spinFloat 3s ease-in-out infinite;
        }

        @keyframes spinFloat {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-10px); }
        }

        .spin-floating-inner {
          position: relative;
          width: 100px;
          height: 100px;
        }

        .spin-floating-wheel {
          width: 100px;
          height: 100px;
          border-radius: 50%;
          background: conic-gradient(
            #dc2626 0deg, #fff 36deg,
            #dc2626 36deg, #fff 72deg,
            #dc2626 72deg, #fff 108deg,
            #dc2626 108deg, #fff 144deg,
            #dc2626 144deg, #fff 180deg,
            #dc2626 180deg, #fff 216deg,
            #dc2626 216deg, #fff 252deg,
            #dc2626 252deg, #fff 288deg,
            #dc2626 288deg, #fff 324deg,
            #dc2626 324deg, #fff 360deg
          );
          border: 4px solid #FFD700;
          box-shadow: 0 4px 25px rgba(220, 38, 38, 0.5), 0 0 15px rgba(255, 215, 0, 0.4);
          animation: spinWheelRotate 8s linear infinite;
        }

        @keyframes spinWheelRotate {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }

        .spin-floating-center {
          position: absolute;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%);
          width: 36px;
          height: 36px;
          border-radius: 50%;
          background: linear-gradient(135deg, #f59e0b, #f97316);
          border: 3px solid #FFD700;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 16px;
          box-shadow: 0 2px 10px rgba(245, 158, 11, 0.5);
        }

        .spin-floating-close {
          position: absolute;
          top: -8px;
          left: -8px;
          width: 26px;
          height: 26px;
          border-radius: 50%;
          background: rgba(0, 0, 0, 0.7);
          color: white;
          border: 2px solid white;
          font-size: 14px;
          font-weight: bold;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 10;
          transition: transform 0.2s;
          line-height: 1;
        }

        .spin-floating-close:hover {
          transform: scale(1.15);
          background: rgba(0, 0, 0, 0.9);
        }

        .spin-floating-text {
          position: absolute;
          bottom: -22px;
          left: 50%;
          transform: translateX(-50%);
          background: linear-gradient(135deg, #dc2626, #991b1b);
          color: #FFD700;
          font-size: 9px;
          font-weight: 900;
          padding: 3px 10px;
          border-radius: 10px;
          white-space: nowrap;
          text-transform: uppercase;
          letter-spacing: 0.5px;
          box-shadow: 0 2px 8px rgba(220, 38, 38, 0.4);
        }

        @media (max-width: 768px) {
          .spin-floating {
            bottom: 80px;
            right: 12px;
          }
          .spin-floating-inner {
            width: 80px;
            height: 80px;
          }
          .spin-floating-wheel {
            width: 80px;
            height: 80px;
          }
          .spin-floating-center {
            width: 28px;
            height: 28px;
            font-size: 13px;
          }
          .spin-floating-text {
            font-size: 8px;
            bottom: -18px;
          }
        }
      `}</style>

      <div className="spin-floating" onClick={handleClick}>
        <div className="spin-floating-inner">
          <button className="spin-floating-close" onClick={handleDismiss}>
            ✕
          </button>
          <div className="spin-floating-wheel" />
          <div className="spin-floating-center"></div>
          <div className="spin-floating-text">Quay thưởng</div>
        </div>
      </div>
    </>
  );
}
