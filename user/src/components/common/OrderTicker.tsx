import { useEffect, useState } from "react";
import { orderService } from "../../services/order.service";

export default function OrderTicker() {
    const [orders, setOrders] = useState<any[]>([]);

    useEffect(() => {
        const fetchOrders = async () => {
            try {
                const data = await orderService.getRecentPublicOrders();
                setOrders(data);
            } catch (error) {
                console.error("Error fetching recent orders:", error);
            }
        };

        fetchOrders();
        const interval = setInterval(fetchOrders, 60000); // Refresh every minute
        return () => clearInterval(interval);
    }, []);

    if (orders.length === 0) return null;

    return (
        <div className="bg-black text-yellow-400 py-2 overflow-hidden whitespace-nowrap border-b border-yellow-400/30">
            <div className="inline-block animate-marquee px-4">
                {orders.map((order, index) => (
                    <span key={index} className="mx-8 font-bold text-sm uppercase tracking-wider">
                        {order.maskedName} vừa mua {order.productNames}
                    </span>
                ))}
            </div>
            <div className="inline-block animate-marquee-duplicate px-4">
                {orders.map((order, index) => (
                    <span key={index} className="mx-8 font-bold text-sm uppercase tracking-wider">
                        {order.maskedName} vừa mua {order.productNames}
                    </span>
                ))}
            </div>

            <style jsx>{`
        .animate-marquee {
          display: inline-block;
          animation: marquee 30s linear infinite;
        }
        .animate-marquee-duplicate {
          display: inline-block;
          animation: marquee-duplicate 30s linear infinite;
        }
        @keyframes marquee {
          from { transform: translateX(0); }
          to { transform: translateX(-100%); }
        }
        @keyframes marquee-duplicate {
          from { transform: translateX(0); }
          to { transform: translateX(-100%); }
        }
      `}</style>
        </div>
    );
}
