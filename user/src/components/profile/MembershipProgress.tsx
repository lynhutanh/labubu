import { useState, useEffect } from "react";
import { Crown, Star, Trophy } from "lucide-react";
import { rankService, Rank } from "../../services/rank.service";

interface MembershipProgressProps {
  user: any;
}

export default function MembershipProgress({ user }: MembershipProgressProps) {
  const [ranks, setRanks] = useState<Rank[]>([]);

  useEffect(() => {
    const loadRanks = async () => {
      try {
        const data = await rankService.getRanks();
        const sorted = [...data].sort((a, b) => a.threshold - b.threshold);
        setRanks(sorted);
      } catch (error) {
        console.error("Failed to load ranks", error);
      }
    };
    loadRanks();
  }, []);

  const totalSpent = user.totalSpent || 0;

  let currentRankObj: any = null;
  let currentIndex = -1;

  for (let i = ranks.length - 1; i >= 0; i--) {
    if (totalSpent >= ranks[i].threshold) {
      currentRankObj = ranks[i];
      currentIndex = i;
      break;
    }
  }

  const nextRankObj = currentIndex === -1 && ranks.length > 0 ? ranks[0] : (currentIndex < ranks.length - 1 ? ranks[currentIndex + 1] : null);

  const currentRankName = currentRankObj?.name || "Thành viên mới";
  const nextRankName = nextRankObj?.name;
  const nextThreshold = nextRankObj?.threshold;

  const progress = nextThreshold ? Math.min(100, (totalSpent / nextThreshold) * 100) : 100;

  const parseColor = (colorStr: string | undefined): Record<string, any> => {
    const color = colorStr || '#fbbf24';
    return {
      style: { color },
      bgStyle: { backgroundColor: `${color}15` },
      borderStyle: { borderColor: `${color}40` }
    };
  };

  const theme = currentRankObj ? parseColor(currentRankObj.color) : parseColor('#9ca3af');

  // Helper to get full image path
  const getLogoUrl = (path: string, key: string) => {
    // If we have a key, try the local public/ranks folder first
    if (key) {
      return `/ranks/${key}.png`;
    }
    if (!path) return null;
    if (path.startsWith('http')) return path;
    const apiEndpoint = process.env.NEXT_PUBLIC_API_ENDPOINT || 'http://localhost:5001';
    return `${apiEndpoint}${path.startsWith('/public') ? path : '/public' + path}`;
  };

  if (ranks.length === 0) {
    return (
      <div className="bg-white rounded-2xl shadow-sm p-8 mb-8 border border-gray-100 flex items-center justify-center min-h-[200px]">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-orange-500"></div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl shadow-md p-8 mb-8 border border-gray-100 relative overflow-hidden group">
      {/* Background Accent */}
      <div
        className="absolute -right-20 -top-20 w-64 h-64 rounded-full blur-3xl opacity-10 transition-all duration-700 group-hover:scale-110"
        style={{ backgroundColor: currentRankObj?.color || '#fbbf24' }}
      />

      <div className="flex flex-col md:flex-row md:items-center gap-8 relative z-10">
        {/* Rank Emblem */}
        <div className="flex-shrink-0 relative">
          <div
            className="w-24 h-24 rounded-2xl flex items-center justify-center border-2 rotate-3 group-hover:rotate-0 transition-transform duration-500 overflow-hidden bg-white shadow-inner"
            style={{ ...theme.borderStyle }}
          >
            {currentRankObj?.logoPath ? (
              <img
                src={getLogoUrl(currentRankObj.logoPath, currentRankObj.key)}
                alt={currentRankName}
                className="w-20 h-20 object-contain drop-shadow-lg"
                onError={(e) => {
                  (e.target as HTMLImageElement).src = 'https://cdn-icons-png.flaticon.com/512/610/610120.png';
                }}
              />
            ) : (
              <Trophy className="w-12 h-12" style={theme.style} />
            )}
          </div>
        </div>

        <div className="flex-grow space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-1">Cấp độ hiện tại</h3>
              <div className="flex items-center gap-3">
                <span className="text-3xl font-black uppercase italic tracking-tighter" style={theme.style}>
                  {currentRankName}
                </span>
                {currentRankObj && (
                  <span
                    className="px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-tighter border animate-pulse"
                    style={{ ...theme.style, ...theme.bgStyle, ...theme.borderStyle }}
                  >
                    VIP Member
                  </span>
                )}
              </div>
            </div>

            <div className="text-right">
              <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-1">Tổng chi tiêu</p>
              <p className="text-2xl font-black text-gray-900 leading-none">
                {totalSpent.toLocaleString('vi-VN')}<span className="text-sm ml-1">đ</span>
              </p>
            </div>
          </div>

          {/* Progress Bar Container */}
          <div className="space-y-3 pt-2">
            <div className="relative h-3 w-full bg-gray-100 rounded-full overflow-hidden shadow-inner">
              <div
                className="absolute top-0 left-0 h-full transition-all duration-1000 ease-out rounded-full shadow-lg"
                style={{
                  width: `${progress}%`,
                  backgroundColor: currentRankObj?.color || '#fbbf24',
                  backgroundImage: 'linear-gradient(90deg, rgba(255,255,255,0) 0%, rgba(255,255,255,0.4) 50%, rgba(255,255,255,0) 100%)',
                  backgroundSize: '200% 100%'
                }}
              />
            </div>

            <div className="flex justify-between items-center text-[10px] font-black uppercase tracking-widest">
              <span className="text-gray-400">{currentRankName}</span>
              {nextRankObj ? (
                <span className="text-gray-900">Tiến tới {nextRankName}</span>
              ) : (
                <span className="text-emerald-500">Đã đạt cấp tối đa</span>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Reward Information */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-8 pt-6 border-t border-gray-50 relative z-10">
        <div className="flex items-center gap-4 bg-gray-50 p-4 rounded-xl border border-gray-100">
          <div className="w-10 h-10 rounded-lg bg-orange-100 flex items-center justify-center flex-shrink-0">
            <Star className="w-5 h-5 text-orange-600" />
          </div>
          <div>
            <p className="text-[10px] font-bold text-gray-400 uppercase">Hạng tiếp theo</p>
            <p className="text-sm font-bold text-gray-800">
              {nextRankObj ? (
                <>Cần thêm <span className="text-orange-600">{(nextThreshold! - totalSpent).toLocaleString('vi-VN')}đ</span></>
              ) : (
                "Bạn là khách hàng thân thiết nhất"
              )}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-4 bg-emerald-50 p-4 rounded-xl border border-emerald-100">
          <div className="w-10 h-10 rounded-lg bg-emerald-100 flex items-center justify-center flex-shrink-0">
            <Trophy className="w-5 h-5 text-emerald-600" />
          </div>
          <div>
            <p className="text-[10px] font-bold text-gray-400 uppercase">Voucher phần thưởng</p>
            <p className="text-sm font-bold text-emerald-800">
              {nextRankObj?.rewardVoucherCode ? (
                <>Mã <span className="bg-white px-2 py-0.5 rounded border border-emerald-200">{nextRankObj.rewardVoucherCode}</span> khi lên hạng</>
              ) : (
                currentRankObj?.rewardVoucherCode ? `Đang hưởng: ${currentRankObj.rewardVoucherCode}` : "Chưa có ưu đãi"
              )}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

