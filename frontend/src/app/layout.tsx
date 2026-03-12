import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Task Management",
  description: "クラウドネイティブなタスク管理アプリケーション",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ja">
      <body>{children}</body>
    </html>
  );
}
