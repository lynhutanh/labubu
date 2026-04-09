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
    alt: "Dao rong",
    href: "/pet-farm",
    hiddenOnPaths: ["/pet-farm"],
  },
  {
    id: "spin",
    image: "/vongquay.png",
    alt: "Vong quay",
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

export default function GameFloating() {
  const router = useRouter();
  const [dismissed, setDismissed] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [expanded, setExpanded] = useState(false);
  const [availableItems, setAvailableItems] = useState<FloatingItem[]>(ITEMS);

  const checkAvailability = useCallback(async () => {
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
  }, []);

  useEffect(() => {
    setMounted(true);
    if (typeof window !== "undefined") {
      const d = sessionStorage.getItem("game_floating_dismissed");
      if (d === "1") {
        setDismissed(true);
        return;
      }
    }
    void checkAvailability();
  }, [checkAvailability]);

  useEffect(() => {
    setExpanded(false);
  }, [router.pathname]);

  const handleDismiss = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
    setDismissed(true);
    sessionStorage.setItem("game_floating_dismissed", "1");
  }, []);

  const handleToggleMenu = useCallback(() => {
    setExpanded((prev) => !prev);
  }, []);

  const handleItemClick = useCallback(
    (e: React.MouseEvent, href: string) => {
      e.stopPropagation();
      setExpanded(false);
      router.push(href);
    },
    [router],
  );

  if (!mounted || dismissed || !availableItems.length) return null;

  const visibleItems = availableItems.filter(
    (item) => !item.hiddenOnPaths.includes(router.pathname),
  );
  if (!visibleItems.length) return null;

  return (
    <>
      <style jsx>{`
        .game-floating {
          position: fixed;
          bottom: 130px;
          right: 20px;
          z-index: 9999;
        }

        @keyframes gameFloat {
          0% {
            transform: translateY(0) rotate(0deg);
          }
          25% {
            transform: translateY(-8px) rotate(2deg);
          }
          50% {
            transform: translateY(-3px) rotate(-1.5deg);
          }
          75% {
            transform: translateY(-10px) rotate(1.5deg);
          }
          100% {
            transform: translateY(0) rotate(0deg);
          }
        }

        .game-floating-inner {
          position: relative;
          width: 80px;
          height: 80px;
          animation: gameFloat 4s ease-in-out infinite;
        }

        .game-floating-trigger {
          border: none;
          background: transparent;
          padding: 0;
          width: 100%;
          height: 100%;
          cursor: pointer;
        }

        .game-floating-icon {
          width: 80px;
          height: 80px;
          border-radius: 0;
          object-fit: contain;
          filter: drop-shadow(0 4px 10px rgba(0, 0, 0, 0.4));
          transition: transform 0.25s ease;
          transform: scale(1);
        }

        .game-floating.is-expanded .game-floating-icon {
          transform: scale(1.06);
        }

        .game-floating-close {
          position: absolute;
          top: -8px;
          left: -8px;
          width: 26px;
          height: 26px;
          border-radius: 50%;
          background: rgba(0, 0, 0, 0.7);
          color: #fff;
          border: 2px solid #fff;
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

        .game-floating-menu {
          position: absolute;
          right: 6px;
          bottom: calc(100% + 12px);
          display: flex;
          flex-direction: column;
          gap: 8px;
          opacity: 0;
          transform: translateY(8px) scale(0.95);
          pointer-events: none;
          transition:
            opacity 0.2s ease,
            transform 0.2s ease;
        }

        .game-floating-menu.is-open {
          opacity: 1;
          transform: translateY(0) scale(1);
          pointer-events: auto;
        }

        .game-floating-item {
          border: none;
          background: transparent;
          padding: 0;
          width: 74px;
          height: 74px;
          cursor: pointer;
          border-radius: 0;
          filter: drop-shadow(0 4px 8px rgba(0, 0, 0, 0.4));
          transition: filter 0.2s ease;
        }

        .game-floating-item:hover {
          filter: drop-shadow(0 4px 12px rgba(0, 0, 0, 0.6)) brightness(1.1);
        }

        .game-floating-item img {
          width: 100%;
          height: 100%;
          border-radius: 0;
          object-fit: contain;
        }

        @keyframes itemWobble0 {
          0% { transform: translateY(0) rotate(0deg); }
          30% { transform: translateY(-6px) rotate(2deg); }
          60% { transform: translateY(-2px) rotate(-1.5deg); }
          100% { transform: translateY(0) rotate(0deg); }
        }
        @keyframes itemWobble1 {
          0% { transform: translateY(0) rotate(0deg); }
          25% { transform: translateY(-8px) rotate(-2.5deg); }
          55% { transform: translateY(-3px) rotate(1.5deg); }
          100% { transform: translateY(0) rotate(0deg); }
        }
        @keyframes itemWobble2 {
          0% { transform: translateY(0) rotate(0deg); }
          35% { transform: translateY(-5px) rotate(1.8deg); }
          65% { transform: translateY(-9px) rotate(-2deg); }
          100% { transform: translateY(0) rotate(0deg); }
        }

        .game-floating-item-0 { animation: itemWobble0 2.8s ease-in-out infinite; }
        .game-floating-item-1 { animation: itemWobble1 3.2s ease-in-out infinite; }
        .game-floating-item-2 { animation: itemWobble2 3.6s ease-in-out infinite; }

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

          .game-floating-menu {
            right: 4px;
            bottom: calc(100% + 10px);
            gap: 7px;
          }

          .game-floating-item {
            width: 62px;
            height: 62px;
          }
        }
      `}</style>

      <div className={`game-floating ${expanded ? "is-expanded" : ""}`}>
        <div className={`game-floating-menu ${expanded ? "is-open" : ""}`}>
          {visibleItems.map((item, idx) => (
            <button
              key={item.id}
              type="button"
              className={`game-floating-item game-floating-item-${idx % 3}`}
              onClick={(e) => handleItemClick(e, item.href)}
              aria-label={item.alt}
              title={item.alt}
            >
              <img src={item.image} alt={item.alt} />
            </button>
          ))}
        </div>

        <div className="game-floating-inner">
          <button
            type="button"
            className="game-floating-close"
            onClick={handleDismiss}
            aria-label="Dong su kien"
          >
            x
          </button>
          <button
            type="button"
            className="game-floating-trigger"
            onClick={handleToggleMenu}
            aria-expanded={expanded}
            aria-label="Mo danh sach su kien"
          >
            <img
              src="/images/eventicon.png"
              alt="Su kien"
              className="game-floating-icon"
            />
          </button>
        </div>
      </div>
    </>
  );
}
