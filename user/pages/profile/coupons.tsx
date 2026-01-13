import Head from "next/head";
import { useState, useEffect } from "react";
import { useRouter } from "next/router";
import Layout from "../../src/components/layout/Layout";
import ProfileLayout from "../../src/components/profile/ProfileLayout";
import { storage } from "../../src/utils/storage";
import { CreditCard } from "lucide-react";

export default function ProfileCouponsPage() {
    const router = useRouter();
    const [user, setUser] = useState<any>(null);

    useEffect(() => {
        const currentUser = storage.getUser();
        if (!currentUser) {
            router.push("/login");
            return;
        }
        setUser(currentUser);
    }, [router]);

    if (!user) {
        return null;
    }

    return (
        <Layout>
            <Head>
                <title>Phiếu giảm giá - Labubu Store</title>
            </Head>
            <ProfileLayout>
                <div className="bg-white rounded-lg shadow-sm p-6">
                    <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                        <CreditCard className="w-6 h-6" />
                        Phiếu giảm giá
                    </h2>
                    <p className="text-gray-600">
                        Danh sách phiếu giảm giá sẽ được hiển thị ở đây
                    </p>
                </div>
            </ProfileLayout>
        </Layout>
    );
}
