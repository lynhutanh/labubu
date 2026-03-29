import { useState, useEffect } from "react";
import { useRouter } from "next/router";

export default function PetFloating() {
  const router = useRouter();
  const [dismissed, setDismissed] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    if (typeof window !== "undefined") {
      const d = sessionStorage.getItem("pet_farm_dismissed");
      if (d === "1") {
        setDismissed(true);
      }
    }
  }, []);

  const handleDismiss = (e: React.MouseEvent) => {
    e.stopPropagation();
    setDismissed(true);
    sessionStorage.setItem("pet_farm_dismissed", "1");
  };

  const handleClick = () => {
    router.push("/pet-farm");
  };

  if (!mounted || dismissed) return null;
  if (router.pathname === "/pet-farm") return null;

  return (
    <>
      <style jsx>{`
        .pet-floating {
          position: fixed;
          bottom: 130px;
          right: 20px;
          z-index: 9999;
          cursor: pointer;
          animation: petFloat 3s ease-in-out infinite;
        }

        @keyframes petFloat {
          0%, 100% { transform: translateY(0) rotate(-3deg); }
          50% { transform: translateY(-12px) rotate(3deg); }
        }

        .pet-floating-inner {
          position: relative;
          width: 80px;
          height: 80px;
        }

        .pet-floating-icon {
          width: 80px;
          height: 80px;
          border-radius: 50%;
          object-fit: cover;
          filter: drop-shadow(0 4px 6px rgba(0,0,0,0.3));
        }

        .pet-floating-close {
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

        .pet-floating-close:hover {
          transform: scale(1.15);
          background: rgba(0, 0, 0, 0.9);
        }

        @media (max-width: 768px) {
          .pet-floating {
            bottom: 140px;
            right: 12px;
          }
          .pet-floating-inner {
            width: 64px;
            height: 64px;
          }
          .pet-floating-icon {
            width: 64px;
            height: 64px;
          }
        }
      `}</style>

      <div className="pet-floating" onClick={handleClick}>
        <div className="pet-floating-inner">
          <button className="pet-floating-close" onClick={handleDismiss}>
            ✕
          </button>
          <img src="/lgodaorong.png" alt="Đảo rồng" className="pet-floating-icon" />
        </div>
      </div>
    </>
  );
}
