import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/router";
import { spinService } from "../../services/spin.service";
import { slotMachineService } from "../../services/slot-machine.service";

interface FloatingItem {
  id: string;
  image: string;
  alt: string;
  href: string;
  hiddenOnPaths: string[];
}

const ITEMS: FloatingItem[] = [
  {
    id: "pet-farm",
    image: "/lgodaorong.png",
    alt: "Đảo rồng",
    href: "/pet-farm",
    hiddenOnPaths: ["/pet-farm"],
  },
  {
    id: "spin",
    image: "/vongquay.png",
    alt: "Vòng quay",
    href: "/spin",
    hiddenOnPaths: ["/spin"],
  },
  {
    id: "slot-machine",
    image: "/iconjackpot777.png",
    alt: "Jackpot 777",
    href: "/slot-machine",
    hiddenOnPaths: ["/slot-machine"],
  },
];

const INTERVAL_MS = 7000;

export default function GameFloating() {
  const router = useRouter();
  const [dismissed, setDismissed] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [activeIndex, setActiveIndex] = useState(0);
  const [fading, setFading] = useState(false);
  const [availableItems, setAvailableItems] = useState<FloatingItem[]>(ITEMS);

  useEffect(() => {
    setMounted(true);
    if (typeof window !== "undefined") {
      const d = sessionStorage.getItem("game_floating_dismissed");
      if (d === "1") {
        setDismissed(true);
        return;
      }
    }
    checkAvailability();
  }, []);

  const checkAvailability = async () => {
    const available: FloatingItem[] = [ITEMS[0]];

    try {
      const spinConfig = await spinService.getActiveConfig();
      if (spinConfig) available.push(ITEMS[1]);
    } catch {
      // spin not active
    }

    try {
      const slotConfig = await slotMachineService.getActiveConfig();
      if (slotConfig) available.push(ITEMS[2]);
    } catch {
      // slot not active
    }

    setAvailableItems(available);
  };

  useEffect(() => {
    if (dismissed || availableItems.length <= 1) return;

    const timer = setInterval(() => {
      setFading(true);
      setTimeout(() => {
        setActiveIndex((prev) => (prev + 1) % availableItems.length);
        setFading(false);
      }, 400);
    }, INTERVAL_MS);

    return () => clearInterval(timer);
  }, [dismissed, availableItems.length]);

  const handleDismiss = useCallback(
    (e: React.MouseEvent) => {
      e.stopPropagation();
      setDismissed(true);
      sessionStorage.setItem("game_floating_dismissed", "1");
    },
    [],
  );

  const handleClick = useCallback(() => {
    const item = availableItems[activeIndex];
    if (item) router.push(item.href);
  }, [availableItems, activeIndex, router]);

  if (!mounted || dismissed || !availableItems.length) return null;

  const current = availableItems[activeIndex % availableItems.length];
  if (current.hiddenOnPaths.includes(router.pathname)) return null;

  return (
    <>
      <style jsx>{`
        .game-floating {
          position: fixed;
          bottom: 130px;
          right: 20px;
          z-index: 9999;
          cursor: pointer;
          animation: gameFloat 3s ease-in-out infinite;
        }

        @keyframes gameFloat {
          0%,
          100% {
            transform: translateY(0) rotate(-2deg);
          }
          50% {
            transform: translateY(-10px) rotate(2deg);
          }
        }

        .game-floating-inner {
          position: relative;
          width: 80px;
          height: 80px;
        }

        .game-floating-icon {
          width: 80px;
          height: 80px;
          border-radius: 50%;
          object-fit: cover;
          filter: drop-shadow(0 4px 10px rgba(0, 0, 0, 0.4));
          transition: opacity 0.4s ease, transform 0.4s ease;
          opacity: 1;
          transform: scale(1);
        }

        .game-floating-icon.is-fading {
          opacity: 0;
          transform: scale(0.7);
        }

        .game-floating-close {
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

        .game-floating-close:hover {
          transform: scale(1.15);
          background: rgba(0, 0, 0, 0.9);
        }

        .game-floating-dots {
          display: flex;
          gap: 4px;
          justify-content: center;
          margin-top: 6px;
        }

        .game-floating-dot {
          width: 6px;
          height: 6px;
          border-radius: 50%;
          background: rgba(255, 255, 255, 0.35);
          transition: background 0.3s, transform 0.3s;
        }

        .game-floating-dot.is-active {
          background: #fbbf24;
          transform: scale(1.3);
        }

        @media (max-width: 768px) {
          .game-floating {
            bottom: 140px;
            right: 12px;
          }
          .game-floating-inner {
            width: 64px;
            height: 64px;
          }
          .game-floating-icon {
            width: 64px;
            height: 64px;
          }
          .game-floating-dot {
            width: 5px;
            height: 5px;
          }
        }
      `}</style>

      <div className="game-floating" onClick={handleClick}>
        <div className="game-floating-inner">
          <button className="game-floating-close" onClick={handleDismiss}>
            ✕
          </button>
          <img
            src={current.image}
            alt={current.alt}
            className={`game-floating-icon ${fading ? "is-fading" : ""}`}
          />
        </div>
        {availableItems.length > 1 && (
          <div className="game-floating-dots">
            {availableItems.map((item, i) => (
              <span
                key={item.id}
                className={`game-floating-dot ${i === activeIndex % availableItems.length ? "is-active" : ""}`}
              />
            ))}
          </div>
        )}
      </div>
    </>
  );
}
