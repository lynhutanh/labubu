import { useEffect } from "react";
import { useRouter } from "next/router";

export default function OrderDetailRedirectPage() {
  const router = useRouter();
  const { orderCode } = router.query;

  useEffect(() => {
    if (orderCode) {
      // Redirect to profile/order with orderCode as id
      router.replace(`/profile/order/${orderCode}`);
    } else {
      router.replace("/profile/order");
    }
  }, [orderCode, router]);

  return null;
}
