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

        .slot-floating-img {
          width: 100%;
          height: 100%;
          object-fit: contain;
          filter: drop-shadow(0 4px 12px rgba(255, 215, 0, 0.5));
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
          <img src="/iconjackpot777.png" alt="Jackpot 777" className="slot-floating-img" />
          <div className="slot-floating-text">Jackpot 777</div>
        </div>
      </div>
    </>
  );
}
