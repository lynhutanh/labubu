import { useState, useEffect } from "react";
import { useRouter } from "next/router";
import {
  slotMachineService,
  SlotMachineConfig,
} from "../../services/slot-machine.service";

export default function SlotMachineFloating() {
  const router = useRouter();
  const [config, setConfig] = useState<SlotMachineConfig | null>(null);
  const [dismissed, setDismissed] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    if (typeof window !== "undefined") {
      const d = sessionStorage.getItem("slot_machine_dismissed");
      if (d === "1") {
        setDismissed(true);
        return;
      }
    }
    loadConfig();
  }, []);

  const loadConfig = async () => {
    try {
      const data = await slotMachineService.getActiveConfig();
      setConfig(data);
    } catch {
      // no active config
    }
  };

  const handleDismiss = (e: React.MouseEvent) => {
    e.stopPropagation();
    setDismissed(true);
    sessionStorage.setItem("slot_machine_dismissed", "1");
  };

  const handleClick = () => {
    router.push("/slot-machine");
  };

  if (!mounted || dismissed || !config) return null;
  if (router.pathname === "/slot-machine") return null;

  return (
    <>
      <style jsx>{`
        .slot-floating {
          position: fixed;
          bottom: 390px;
          right: 20px;
          z-index: 9999;
          cursor: pointer;
          animation: slotFloat 3s ease-in-out infinite;
        }

        @keyframes slotFloat {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-10px); }
        }

        .slot-floating-inner {
          position: relative;
          width: 90px;
          height: 90px;
        }

        .slot-floating-machine {
          width: 90px;
          height: 90px;
          border-radius: 16px;
          background: linear-gradient(180deg, #c8920e 0%, #8b6914 50%, #c8920e 100%);
          border: 3px solid #daa520;
          box-shadow: 0 4px 25px rgba(200, 146, 14, 0.5), 0 0 15px rgba(255, 215, 0, 0.4);
          display: flex;
          align-items: center;
          justify-content: center;
          flex-direction: column;
          gap: 2px;
        }

        .slot-floating-reels {
          display: flex;
          gap: 3px;
          background: #1a1a2e;
          border-radius: 6px;
          padding: 4px 6px;
          border: 2px solid #daa520;
        }

        .slot-floating-reel {
          width: 18px;
          height: 22px;
          background: linear-gradient(180deg, #0a0a1a, #1a1a3e, #0a0a1a);
          border-radius: 3px;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 12px;
          font-weight: 900;
          color: #ffd700;
          border: 1px solid #333;
          animation: slotReelFlick 1.5s ease-in-out infinite alternate;
        }

        .slot-floating-reel:nth-child(2) {
          animation-delay: 0.3s;
        }
        .slot-floating-reel:nth-child(3) {
          animation-delay: 0.6s;
        }

        @keyframes slotReelFlick {
          0% { opacity: 0.6; }
          50% { opacity: 1; }
          100% { opacity: 0.6; }
        }

        .slot-floating-lever {
          position: absolute;
          right: -12px;
          top: 50%;
          transform: translateY(-50%);
        }

        .slot-floating-lever-stick {
          width: 6px;
          height: 28px;
          background: linear-gradient(90deg, #888, #ccc, #888);
          border-radius: 2px;
          margin: 0 auto;
        }

        .slot-floating-lever-ball {
          width: 14px;
          height: 14px;
          background: radial-gradient(circle at 35% 35%, #ff4444, #cc0000);
          border-radius: 50%;
          margin: -2px auto 0;
          border: 1px solid #aa0000;
        }

        .slot-floating-close {
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

        .slot-floating-close:hover {
          transform: scale(1.15);
          background: rgba(0, 0, 0, 0.9);
        }

        .slot-floating-text {
          position: absolute;
          bottom: -22px;
          left: 50%;
          transform: translateX(-50%);
          background: linear-gradient(135deg, #c8920e, #8b6914);
          color: #fff;
          font-size: 9px;
          font-weight: 900;
          padding: 3px 10px;
          border-radius: 10px;
          white-space: nowrap;
          text-transform: uppercase;
          letter-spacing: 0.5px;
          box-shadow: 0 2px 8px rgba(200, 146, 14, 0.4);
        }

        @media (max-width: 768px) {
          .slot-floating {
            bottom: 400px;
            right: 12px;
          }
          .slot-floating-inner {
            width: 72px;
            height: 72px;
          }
          .slot-floating-machine {
            width: 72px;
            height: 72px;
          }
          .slot-floating-reel {
            width: 14px;
            height: 18px;
            font-size: 10px;
          }
          .slot-floating-text {
            font-size: 8px;
            bottom: -18px;
          }
        }
      `}</style>

      <div className="slot-floating" onClick={handleClick}>
        <div className="slot-floating-inner">
          <button className="slot-floating-close" onClick={handleDismiss}>
            ✕
          </button>
          <div className="slot-floating-machine">
            <div className="slot-floating-reels">
              <div className="slot-floating-reel">7</div>
              <div className="slot-floating-reel">7</div>
              <div className="slot-floating-reel">7</div>
            </div>
          </div>
          <div className="slot-floating-lever">
            <div className="slot-floating-lever-stick" />
            <div className="slot-floating-lever-ball" />
          </div>
          <div className="slot-floating-text">Quay số 777</div>
        </div>
      </div>
    </>
  );
}
