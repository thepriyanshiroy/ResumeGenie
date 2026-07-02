import { Playfair_Display, Inter, JetBrains_Mono } from "next/font/google";
import { Toaster } from "react-hot-toast";
import "./globals.css";

const playfair = Playfair_Display({
  subsets: ["latin"],
  variable: "--font-display",
  weight: ["400", "500", "600", "700", "800"],
});

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-body",
  weight: ["300", "400", "500", "600", "700"],
});

const jetbrains = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-mono",
  weight: ["400", "500"],
});

export const metadata = {
  title: "ResumeAI — AI Resume Analyzer & ATS Score Checker",
  description: "Analyze your resume against any job description. Get an instant ATS score, keyword gaps, and AI-powered rewrite suggestions.",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className={`${playfair.variable} ${inter.variable} ${jetbrains.variable} font-body antialiased min-h-screen flex flex-col bg-background text-foreground`}>
        {children}
        <Toaster position="top-right" />
      </body>
    </html>
  );
}
