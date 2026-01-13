import { useEffect } from "react";
import { useRouter } from "next/router";

export default function OrdersRedirectPage() {
  const router = useRouter();

  useEffect(() => {
    // Redirect to profile/order
    router.replace("/profile/order");
  }, [router]);

  return null;
}
