import Head from "next/head";
import { motion } from "framer-motion";
import {
  Mail,
  Phone,
  MessageCircle,
  Send,
  Facebook,
  Instagram,
} from "lucide-react";
import Image from "next/image";
import Layout from "../../src/components/layout/Layout";
import { useTrans } from "../../src/hooks/useTrans";

export default function ContactPage() {
  const t = useTrans();
  return (
    <Layout>
      <Head>
        <title>{t.contact.title}</title>
        <meta
          name="description"
          content={t.contact.description}
        />
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

          <div className="grid grid-cols-1 lg:grid-cols-5 gap-12 items-start">
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
                    src="./logo.png"
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
                  {t.contact.storeName}
                </h1>
              </div>

              <div className="mb-6">
                <p className="text-base md:text-lg text-white leading-relaxed">
                  {t.contact.descriptionText}
                </p>
              </div>

              <div className="space-y-3 text-white text-base md:text-lg leading-relaxed">
                <p>
                  <span className="font-semibold text-white">{t.contact.hotline}</span> +84 123 456 789 {t.contact.clickHere}{" "}
                  <a
                    href="tel:+84123456789"
                    className="text-yellow-300 hover:text-yellow-200 underline"
                  >
                    {t.contact.callNow}
                  </a>
                </p>

                <p>
                  <span className="font-semibold text-white">{t.contact.whatsapp}</span> +84 123 456 789 {t.contact.clickHere}{" "}
                  <a
                    href="https://wa.me/84123456789"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-yellow-300 hover:text-yellow-200 underline"
                  >
                    [wa.me/84123456789]
                  </a>
                </p>

                <p>
                  <span className="font-semibold text-white">{t.contact.zalo}</span> {t.contact.zaloClick}{" "}
                  <a
                    href="https://zalo.me/84123456789"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-yellow-300 hover:text-yellow-200 underline"
                  >
                    [zalo.me/84123456789]
                  </a>
                </p>

                <p>
                  <span className="font-semibold text-white">{t.contact.email}</span>{" "}
                  <a
                    href="mailto:contact@labubustore.com"
                    className="text-yellow-300 hover:text-yellow-200 underline"
                  >
                    contact@labubustore.com
                  </a>{" "}
                  {t.contact.languages}
                </p>

                <p>
                  {t.contact.socialMedia}{" "}
                  <a
                    href="#"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-yellow-300 hover:text-yellow-200 underline"
                  >
                    {t.contact.facebook}
                  </a>{" "}
                  <a
                    href="#"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-yellow-300 hover:text-yellow-200 underline"
                  >
                    {t.contact.instagram}
                  </a>
                </p>
              </div>
            </motion.div>
          </div>
        </div>
      </section>
    </Layout>
  );
}

