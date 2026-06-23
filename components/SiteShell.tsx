"use client";
import { usePathname } from "next/navigation";
import Navbar from "./Navbar";
import Footer from "./Footer";

// Immersive routes render full-bleed with no marketing navbar/footer.
const IMMERSIVE = ["/arena"];

export default function SiteShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const immersive = IMMERSIVE.some(p => pathname === p || pathname?.startsWith(p + "/"));

  if (immersive) return <>{children}</>;

  return (
    <>
      <Navbar />
      <main className="pt-16">{children}</main>
      <Footer />
    </>
  );
}
