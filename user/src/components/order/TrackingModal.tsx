import { useState, useEffect } from "react";
import { X, Package, Loader2, MapPin } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { orderService, TrackingInfo } from "../../services/order.service";
import toast from "react-hot-toast";

interface TrackingModalProps {
  isOpen: boolean;
  onClose: () => void;
  orderId: string;
  orderNumber: string;
}

export default function TrackingModal({
  isOpen,
  onClose,
  orderId,
  orderNumber,
}: TrackingModalProps) {
  const [trackingInfo, setTrackingInfo] = useState<TrackingInfo | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isOpen && orderId) {
      loadTrackingInfo();
    }
  }, [isOpen, orderId]);

  useEffect(() => {
    if (trackingInfo) {
      console.log("📊 [Frontend] Tracking info state updated:", {
        trackingInfo,
        hasTimeline: !!trackingInfo.timeline,
        timelineLength: trackingInfo.timeline?.length,
        timeline: trackingInfo.timeline,
        current_status: trackingInfo.current_status,
        current_station: trackingInfo.current_station,
      });
    }
  }, [trackingInfo]);

  const loadTrackingInfo = async () => {
    try {
      setLoading(true);
      console.log("🔍 [Frontend] Loading tracking info for orderId:", orderId);
      const info = await orderService.trackOrder(orderId);
      console.log("📦 [Frontend] Received tracking info:", JSON.stringify(info, null, 2));
      console.log("📦 [Frontend] Tracking info structure:", {
        hasInfo: !!info,
        order_code: info?.order_code,
        current_status: info?.current_status,
        timelineLength: info?.timeline?.length,
        timeline: info?.timeline,
      });
      setTrackingInfo(info);
    } catch (error: any) {
      console.error("❌ [Frontend] Error loading tracking info:", error);
      console.error("❌ [Frontend] Error details:", {
        message: error?.message,
        response: error?.response,
        data: error?.data,
      });
      toast.error(
        error?.message || "Không thể tải thông tin tracking. Vui lòng thử lại."
      );
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    try {
      const date = new Date(dateString);
      const monthNames = [
        "Jan",
        "Feb",
        "Mar",
        "Apr",
        "May",
        "Jun",
        "Jul",
        "Aug",
        "Sep",
        "Oct",
        "Nov",
        "Dec",
      ];
      const day = date.getDate();
      const month = monthNames[date.getMonth()];
      const year = date.getFullYear();
      const hours = date.getHours();
      const minutes = date.getMinutes();
      const ampm = hours >= 12 ? "PM" : "AM";
      const displayHours = hours % 12 || 12;
      const displayMinutes = minutes.toString().padStart(2, "0");
      return `${month} ${day}, ${year} ${displayHours}:${displayMinutes} ${ampm}`;
    } catch {
      return dateString;
    }
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4"
            onClick={onClose}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-hidden flex flex-col"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between p-6 border-b border-gray-200">
                <div>
                  <h2 className="text-2xl font-bold text-gray-900">
                    Theo dõi đơn hàng
                  </h2>
                  <p className="text-sm text-gray-600 mt-1">
                    Mã đơn: {orderNumber}
                  </p>
                </div>
                <button
                  onClick={onClose}
                  className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                >
                  <X className="w-5 h-5 text-gray-500" />
                </button>
              </div>

              <div className="flex-1 overflow-y-auto p-6">
                {loading ? (
                  <div className="flex items-center justify-center py-20">
                    <Loader2 className="w-8 h-8 animate-spin text-orange-500" />
                  </div>
                ) : trackingInfo ? (
                  <div className="space-y-6">
                    <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
                      <div className="flex items-start gap-3">
                        <Package className="w-5 h-5 text-orange-500 mt-0.5" />
                        <div className="flex-1">
                          <p className="text-sm text-gray-600 mb-1">
                            Trạng thái hiện tại
                          </p>
                          <p className="text-lg font-semibold text-gray-900">
                            {trackingInfo.current_status || "Chưa có thông tin"}
                          </p>
                          {trackingInfo.current_station && (
                            <p className="text-sm text-gray-600 mt-1 flex items-center gap-1">
                              <MapPin className="w-4 h-4" />
                              {trackingInfo.current_station}
                            </p>
                          )}
                          {trackingInfo.next_station && (
                            <p className="text-sm text-gray-600 mt-1">
                              Tiếp theo: {trackingInfo.next_station}
                            </p>
                          )}
                        </div>
                      </div>
                    </div>

                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-4">
                        Lịch sử vận chuyển
                      </h3>
                      {trackingInfo.timeline && trackingInfo.timeline.length > 0 ? (
                        <div className="relative">
                          <div className="absolute left-4 top-0 bottom-0 w-0.5 bg-gray-200" />
                          <div className="space-y-6">
                            {trackingInfo.timeline.map((item, index) => (
                            <div key={index} className="relative flex gap-4">
                              <div className="relative z-10 flex-shrink-0">
                                <div className="w-8 h-8 rounded-full bg-blue-500 flex items-center justify-center">
                                  <Package className="w-4 h-4 text-white" />
                                </div>
                              </div>
                              <div className="flex-1 pb-6">
                                <div className="bg-white border border-gray-200 rounded-lg p-4">
                                  <p className="text-sm text-gray-500 mb-2">
                                    {formatDate(item.time)}
                                  </p>
                                  {item.description && (
                                    <p className="text-gray-900 mb-1">
                                      {item.description}
                                    </p>
                                  )}
                                  <p className="font-semibold text-gray-900">
                                    {item.status}
                                  </p>
                                  {item.station && (
                                    <p className="text-sm text-gray-600 mt-2 flex items-center gap-1">
                                      <MapPin className="w-4 h-4" />
                                      {item.station}
                                    </p>
                                  )}
                                </div>
                              </div>
                            </div>
                            ))}
                          </div>
                        </div>
                      ) : (
                        <div className="text-center py-8 bg-gray-50 rounded-lg">
                          <p className="text-gray-600">
                            Chưa có lịch sử vận chuyển
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-20">
                    <Package className="w-16 h-16 mx-auto text-gray-400 mb-4" />
                    <p className="text-gray-600">
                      Không có thông tin tracking
                    </p>
                  </div>
                )}
              </div>
            </motion.div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
