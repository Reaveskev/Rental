import "./globals.css";
import { Inter } from "next/font/google";
import { UserProvider } from "./userContext";

const inter = Inter({ subsets: ["latin"] });

export const metadata = {
  title: "Blockchain App",
  description: "Created by Kevin",
};

export default function RootLayout({ children }) {
  return (
    <UserProvider>
      <html lang="en">
        <body className={inter.className}>{children}</body>
      </html>
    </UserProvider>
  );
}
