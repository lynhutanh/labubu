import { Html, Head, Main, NextScript } from 'next/document';

export default function Document() {
  return (
    <Html lang="vi">
      <Head>
        <meta httpEquiv="X-UA-Compatible" content="IE=edge,chrome=1" />
        <meta charSet="utf-8" />
        <link rel="icon" href="/favicon.ico" type="image/x-icon" />
        <meta name="theme-color" content="#ec4899" />
        <meta name="description" content="Cosmetics Admin Dashboard" />
      </Head>
      <body>
        <Main />
        <NextScript />
      </body>
    </Html>
  );
}

