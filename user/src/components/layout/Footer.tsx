import Link from "next/link";
import { useState, useEffect } from "react";
import { Mail, Phone, Clock } from "lucide-react";
import { useTrans } from "../../hooks/useTrans";
import { settingService, ContactInfo } from "../../services";

export default function Footer() {
  const t = useTrans();
  const [contactInfo, setContactInfo] = useState<ContactInfo>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadContactInfo = async () => {
      try {
        const info = await settingService.getContactInfo();
        setContactInfo(info);
      } catch (error) {
        console.error("Error loading contact info:", error);
      } finally {
        setLoading(false);
      }
    };
    loadContactInfo();
  }, []);

  return (
    <footer className="bg-gray-900 text-gray-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="flex flex-col md:flex-row justify-center items-start gap-8">
          <div className="flex-1 max-w-[50%]">
            <h3 className="text-white text-lg font-semibold mb-4">
              {t.footer.aboutUs}
            </h3>
            <p className="text-sm text-gray-400 mb-4">
              {t.footer.aboutUsDescription}
            </p>
          </div>

          <div className="flex-1 max-w-[50%]">
            <h3 className="text-white text-lg font-semibold mb-4">
              {t.footer.contactInfo}
            </h3>
            <ul className="space-y-3 text-sm">
              {contactInfo.phone && (
                <li className="flex items-center gap-3">
                  <Phone className="w-5 h-5 text-pink-500 flex-shrink-0" />
                  <a
                    href={`tel:${contactInfo.phone.replace(/\s/g, "")}`}
                    className="hover:text-pink-400 transition-colors"
                  >
                    {contactInfo.phone}
                  </a>
                </li>
              )}
              {contactInfo.email && (
                <li className="flex items-center gap-3">
                  <Mail className="w-5 h-5 text-pink-500 flex-shrink-0" />
                  <a
                    href={`mailto:${contactInfo.email}`}
                    className="hover:text-pink-400 transition-colors"
                  >
                    {contactInfo.email}
                  </a>
                </li>
              )}
              {(contactInfo.workingHours || !loading) && (
                <li className="flex items-start gap-3">
                  <Clock className="w-5 h-5 text-pink-500 flex-shrink-0 mt-0.5" />
                  <span>
                    {contactInfo.workingHours || t.footer.workingHours}
                    {contactInfo.workingHoursNote && (
                      <>
                        <br />
                        {contactInfo.workingHoursNote}
                      </>
                    )}
                    {!contactInfo.workingHoursNote && (
                      <>
                        <br />
                        {t.footer.workingHoursNote}
                      </>
                    )}
                  </span>
                </li>
              )}
            </ul>
          </div>
        </div>

        <div className="border-t border-gray-800 mt-8 pt-8">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-sm text-gray-400">
              {t.footer.copyright.replace(
                "{year}",
                new Date().getFullYear().toString(),
              )}
            </p>
            <div className="flex gap-6 text-sm">
              <Link
                href="/privacy"
                className="hover:text-pink-400 transition-colors"
              >
                {t.footer.privacy}
              </Link>
              <Link
                href="/terms"
                className="hover:text-pink-400 transition-colors"
              >
                {t.footer.terms}
              </Link>
              <Link
                href="/sitemap"
                className="hover:text-pink-400 transition-colors"
              >
                {t.footer.sitemap}
              </Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
