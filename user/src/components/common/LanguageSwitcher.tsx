import { useRouter } from "next/router";
import { Globe } from "lucide-react";
import { useState } from "react";

export default function LanguageSwitcher() {
  const router = useRouter();
  const [showMenu, setShowMenu] = useState(false);

  const languages = [
    { code: "vi", name: "Tiếng Việt", flag: "🇻🇳" },
    { code: "en", name: "English", flag: "🇺🇸" },
  ];

  const changeLanguage = (locale: string) => {
    router.push(router.pathname, router.asPath, { locale });
    setShowMenu(false);
  };

  return (
    <div className="relative">
      <button
        onClick={() => setShowMenu(!showMenu)}
        className="p-2 text-white hover:text-yellow-400 transition-colors flex items-center gap-1"
        aria-label="Language"
      >
        <Globe className="w-5 h-5" />
      </button>

      {showMenu && (
        <>
          <div
            className="fixed inset-0 z-10"
            onClick={() => setShowMenu(false)}
          />
          <div className="absolute right-0 mt-2 w-48 bg-black border border-gray-700 rounded-lg shadow-xl py-2 z-20">
            {languages.map((lang) => (
              <button
                key={lang.code}
                onClick={() => changeLanguage(lang.code)}
                className={`w-full flex items-center gap-3 px-4 py-2 text-sm transition-colors ${
                  router.locale === lang.code
                    ? "bg-yellow-400/20 text-yellow-400"
                    : "text-white hover:bg-gray-800"
                }`}
              >
                <span className="text-xl">{lang.flag}</span>
                <span>{lang.name}</span>
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
