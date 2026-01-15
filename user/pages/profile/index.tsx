import { useState, useEffect } from "react";
import { useRouter } from "next/router";
import Head from "next/head";
import Layout from "../../src/components/layout/Layout";
import ProfileLayout from "../../src/components/profile/ProfileLayout";
import { storage } from "../../src/utils/storage";
import { User, Lock } from "lucide-react";
import { toast } from "react-hot-toast";
import { useTrans } from "../../src/hooks/useTrans";

export default function ProfilePage() {
    const router = useRouter();
    const t = useTrans();
    const [user, setUser] = useState<any>(null);
    const [isEditingEmail, setIsEditingEmail] = useState(false);
    const [formData, setFormData] = useState({
        nickname: "",
        email: "",
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
    });

    useEffect(() => {
        const currentUser = storage.getUser();
        if (!currentUser) {
            router.push("/login");
            return;
        }
        setUser(currentUser);
        setFormData({
            nickname: currentUser.username || currentUser.name || "",
            email: currentUser.email || "",
            currentPassword: "",
            newPassword: "",
            confirmPassword: "",
        });
    }, [router]);

    const handleSavePersonalInfo = async () => {
        try {
            toast.success(t.profile.saveSuccess);
        } catch {
            toast.error(t.profile.saveError);
        }
    };

    const handleChangePassword = async () => {
        if (formData.newPassword !== formData.confirmPassword) {
            toast.error(t.profile.passwordNotMatch);
            return;
        }
        if (formData.newPassword.length < 6) {
            toast.error(t.profile.passwordMinLength);
            return;
        }
        try {
            toast.success(t.profile.changePasswordSuccess);
            setFormData({
                ...formData,
                currentPassword: "",
                newPassword: "",
                confirmPassword: "",
            });
        } catch {
            toast.error(t.profile.changePasswordError);
        }
    };

    if (!user) {
        return null;
    }

    return (
        <Layout>
            <Head>
                <title>{t.profile.title}</title>
            </Head>
            <ProfileLayout>
                <div className="bg-white rounded-lg shadow-sm p-6 space-y-8">
                    <div>
                        <h2 className="text-xl font-bold text-gray-900 mb-6">
                            {t.profile.personalInfo}
                        </h2>

                        <div className="mb-6">
                            <label
                                htmlFor="nickname"
                                className="block text-sm font-medium text-gray-700 mb-2"
                            >
                                {t.profile.nickname} *
                            </label>
                            <input
                                type="text"
                                id="nickname"
                                value={formData.nickname}
                                onChange={(e) =>
                                    setFormData({
                                        ...formData,
                                        nickname: e.target.value,
                                    })
                                }
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-gray-400 focus:border-gray-400"
                                placeholder={t.profile.nicknamePlaceholder}
                            />
                            <p className="mt-1 text-xs text-gray-500">
                                {t.profile.nicknameDesc}
                            </p>
                        </div>

                        <div className="mb-6">
                            <label
                                htmlFor="email"
                                className="block text-sm font-medium text-gray-700 mb-2"
                            >
                                {t.profile.email} *
                            </label>
                            <div className="flex items-center gap-3">
                                <input
                                    type="email"
                                    id="email"
                                    value={formData.email}
                                    onChange={(e) =>
                                        setFormData({
                                            ...formData,
                                            email: e.target.value,
                                        })
                                    }
                                    disabled={!isEditingEmail}
                                    className={`flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent ${!isEditingEmail
                                            ? "bg-gray-100 cursor-not-allowed"
                                            : ""
                                        }`}
                                    placeholder={t.profile.emailPlaceholder}
                                />
                                <button
                                    onClick={() => setIsEditingEmail(!isEditingEmail)}
                                    className="px-4 py-2 bg-white border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors text-sm font-medium"
                                >
                                    {isEditingEmail ? t.profile.cancel : t.profile.edit}
                                </button>
                            </div>
                        </div>

                        <button
                            onClick={handleSavePersonalInfo}
                            className="px-6 py-3 bg-black text-white rounded-lg font-semibold hover:bg-gray-800 transition-colors"
                        >
                            {t.profile.save}
                        </button>
                    </div>

                    <div className="border-t border-gray-200 pt-8">
                        <h2 className="text-xl font-bold text-gray-900 mb-6">
                            {t.profile.changePassword}
                        </h2>

                        <div className="mb-4">
                            <label
                                htmlFor="currentPassword"
                                className="block text-sm font-medium text-gray-700 mb-2"
                            >
                                {t.profile.currentPassword}
                            </label>
                            <input
                                type="password"
                                id="currentPassword"
                                value={formData.currentPassword}
                                onChange={(e) =>
                                    setFormData({
                                        ...formData,
                                        currentPassword: e.target.value,
                                    })
                                }
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-gray-400 focus:border-gray-400"
                                placeholder={t.profile.currentPasswordPlaceholder}
                            />
                        </div>

                        <div className="mb-4">
                            <label
                                htmlFor="newPassword"
                                className="block text-sm font-medium text-gray-700 mb-2"
                            >
                                {t.profile.newPassword}
                            </label>
                            <input
                                type="password"
                                id="newPassword"
                                value={formData.newPassword}
                                onChange={(e) =>
                                    setFormData({
                                        ...formData,
                                        newPassword: e.target.value,
                                    })
                                }
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-gray-400 focus:border-gray-400"
                                placeholder={t.profile.newPasswordPlaceholder}
                            />
                        </div>

                        <div className="mb-6">
                            <label
                                htmlFor="confirmPassword"
                                className="block text-sm font-medium text-gray-700 mb-2"
                            >
                                {t.profile.confirmPassword}
                            </label>
                            <input
                                type="password"
                                id="confirmPassword"
                                value={formData.confirmPassword}
                                onChange={(e) =>
                                    setFormData({
                                        ...formData,
                                        confirmPassword: e.target.value,
                                    })
                                }
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-gray-400 focus:border-gray-400"
                                placeholder={t.profile.confirmPasswordPlaceholder}
                            />
                        </div>

                        <button
                            onClick={handleChangePassword}
                            className="px-6 py-3 bg-black text-white rounded-lg font-semibold hover:bg-gray-800 transition-colors flex items-center gap-2"
                        >
                            <Lock className="w-5 h-5" />
                            {t.profile.changePassword}
                        </button>
                    </div>
                </div>
            </ProfileLayout>
        </Layout>
    );
}

