import Head from "next/head";
import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import Image from "next/image";
import Layout from "../../src/components/layout/Layout";
import { useTrans } from "../../src/hooks/useTrans";
import { settingService, TeamInfo } from "../../src/services";

export default function ContactPage() {
  const t = useTrans();
  const [teamInfo, setTeamInfo] = useState<TeamInfo>({});

  useEffect(() => {
    const loadTeamInfo = async () => {
      try {
        const info = await settingService.getTeamInfo();
        console.log("Team info loaded:", info);
        setTeamInfo(info);
      } catch (error) {
        console.error("Error loading team info:", error);
      }
    };
    loadTeamInfo();
  }, []);
  return (
    <Layout>
      <Head>
        <title>{t.contact.title}</title>
        <meta name="description" content={t.contact.description} />
      </Head>

      <div
        className="fixed inset-0 bg-cover bg-center bg-no-repeat bg-fixed -z-10"
        style={{
          backgroundImage: "url('/bg.png')",
        }}
      />

      <section className="relative min-h-screen py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.header
            initial={{ opacity: 0, y: -16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center text-white mb-12"
          >
            <h1 className="text-3xl md:text-4xl font-semibold tracking-tight">
              {t.contact.contactUsHeading}
            </h1>
            <p className="mt-4 text-sm md:text-base text-white/80 leading-relaxed max-w-3xl mx-auto">
              {t.contact.contactUsLine1}
              <br />
              {t.contact.contactUsLine2}
            </p>
          </motion.header>

          <div className="grid grid-cols-1 lg:grid-cols-5 gap-12 items-center">
            <motion.div
              initial={{ opacity: 0, x: -50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8 }}
              className="flex justify-center lg:justify-start lg:col-span-2"
            >
              <div className="relative w-80 h-80 lg:w-96 lg:h-96 xl:w-[500px] xl:h-[500px]">
                <div className="relative w-full h-full">
                  <div className="pointer-events-none absolute -inset-3 rounded-full bg-orange-500/25 blur-2xl -z-10" />
                  <div className="relative z-10 w-full h-full rounded-full overflow-hidden bg-gray-200 border-4 border-orange-200/70 shadow-[0_18px_50px_rgba(249,115,22,0.28)]">
                    <Image
                      src={teamInfo.member1?.avatar || "./logo.png"}
                      alt="Contact Person"
                      width={600}
                      height={600}
                      className="w-full h-full object-cover"
                      unoptimized
                    />
                  </div>
                </div>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="space-y-4 lg:col-span-3"
            >
              <div>
                <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold text-white mb-4">
                  {teamInfo.member1?.name || "Tiểu Dương Doanh"}
                </h1>
              </div>

              <div className="mb-6">
                <p className="text-base md:text-lg text-white leading-relaxed">
                  {teamInfo.member1?.description ||
                    "Tôi có thể nói tiếng Anh và nhiều ngôn ngữ khác. Tôi làm việc với sự kiên nhẫn, kinh nghiệm và khiếu hài hước, và bạn sẽ nhận được lời khuyên chuyên nghiệp về lựa chọn sản phẩm, phản hồi nhanh chóng và giải quyết các vấn đề dịch vụ sau bán hàng. Vui lòng liên hệ với tôi!"}
                </p>
              </div>

              <div className="space-y-3 text-white text-base md:text-lg leading-relaxed">
                <p>
                  <span className="font-semibold text-white">
                    {t.contact.whatsapp}
                  </span>{" "}
                  {teamInfo.member1?.whatsapp || "( tự điền )"}{" "}
                  {t.contact.clickHere}{" "}
                  {teamInfo.member1?.whatsappLink && (
                    <a
                      href={teamInfo.member1.whatsappLink}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-yellow-300 hover:text-yellow-200 underline"
                    >
                      [
                      {teamInfo.member1.whatsappLink.replace(
                        /^https?:\/\//,
                        "",
                      )}
                      ]
                    </a>
                  )}
                </p>

                <p>
                  <span className="font-semibold text-white">Telegram:</span>{" "}
                  {teamInfo.member1?.telegram || "( tự điền )"}{" "}
                  {t.contact.clickHere}{" "}
                  {teamInfo.member1?.telegramLink && (
                    <a
                      href={teamInfo.member1.telegramLink}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-yellow-300 hover:text-yellow-200 underline"
                    >
                      [
                      {teamInfo.member1.telegramLink.replace(
                        /^https?:\/\//,
                        "",
                      )}
                      ]
                    </a>
                  )}
                </p>
              </div>
            </motion.div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-5 gap-12 items-center mt-20">
            <motion.div
              initial={{ opacity: 0, x: -50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8 }}
              className="flex justify-center lg:justify-start lg:col-span-2"
            >
              <div className="relative w-80 h-80 lg:w-96 lg:h-96 xl:w-[500px] xl:h-[500px]">
                <div className="relative w-full h-full">
                  <div className="pointer-events-none absolute -inset-3 rounded-full bg-orange-500/25 blur-2xl -z-10" />
                  <div className="relative z-10 w-full h-full rounded-full overflow-hidden bg-gray-200 border-4 border-orange-200/70 shadow-[0_18px_50px_rgba(249,115,22,0.28)]">
                    <Image
                      src={teamInfo.member2?.avatar || "./logo.png"}
                      alt="Contact Person"
                      width={600}
                      height={600}
                      className="w-full h-full object-cover"
                      unoptimized
                    />
                  </div>
                </div>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="space-y-4 lg:col-span-3"
            >
              <div>
                <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold text-white mb-4">
                  {teamInfo.member2?.name || "Tiểu Dương Lăng"}
                </h1>
              </div>

              <div className="mb-6">
                <p className="text-base md:text-lg text-white leading-relaxed">
                  {teamInfo.member2?.description ||
                    "Tôi thông thạo cả tiếng Anh và tiếng Pháp, luôn sẵn sàng hỗ trợ bạn mọi thắc mắc về mua hàng. Mục tiêu của cô ấy là tìm ra giải pháp tối ưu về giá cả, vận chuyển và giao hàng. Cảm ơn sự ủng hộ và tin tưởng của quý khách."}
                </p>
              </div>

              <div className="space-y-3 text-white text-base md:text-lg leading-relaxed">
                <p>
                  <span className="font-semibold text-white">
                    {t.contact.whatsapp}
                  </span>{" "}
                  {teamInfo.member2?.whatsapp || "( tự điền )"}{" "}
                  {t.contact.clickHere}{" "}
                  {teamInfo.member2?.whatsappLink && (
                    <a
                      href={teamInfo.member2.whatsappLink}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-yellow-300 hover:text-yellow-200 underline"
                    >
                      [
                      {teamInfo.member2.whatsappLink.replace(
                        /^https?:\/\//,
                        "",
                      )}
                      ]
                    </a>
                  )}
                </p>

                <p>
                  <span className="font-semibold text-white">Telegram:</span>{" "}
                  {teamInfo.member2?.telegram || "( tự điền )"}{" "}
                  {t.contact.clickHere}{" "}
                  {teamInfo.member2?.telegramLink && (
                    <a
                      href={teamInfo.member2.telegramLink}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-yellow-300 hover:text-yellow-200 underline"
                    >
                      [
                      {teamInfo.member2.telegramLink.replace(
                        /^https?:\/\//,
                        "",
                      )}
                      ]
                    </a>
                  )}
                </p>
              </div>
            </motion.div>
          </div>
        </div>
      </section>
    </Layout>
  );
}
