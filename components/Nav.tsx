"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";

export default function Nav() {
  const path = usePathname();

  return (
    <nav
      className="sticky top-0 z-50 flex items-center justify-between px-6 py-4"
      style={{
        background: "rgba(10,10,15,0.85)",
        backdropFilter: "blur(16px)",
        borderBottom: "1px solid #1e1e2e",
      }}
    >
      <Link href="/" className="flex items-center gap-2 group">
        <div
          className="w-7 h-7 rounded-md flex items-center justify-center text-xs font-bold"
          style={{ background: "linear-gradient(135deg,#7c3aed,#5b21b6)" }}
        >
          C
        </div>
        <span className="font-bold text-lg tracking-tight text-white">
          cypra
        </span>
      </Link>

      <div className="flex items-center gap-1">
        <Link
          href="/vision"
          className={`px-4 py-1.5 rounded-md text-sm font-medium transition-all ${
            path === "/vision"
              ? "bg-violet-900/40 text-violet-300"
              : "text-gray-400 hover:text-white hover:bg-white/5"
          }`}
        >
          Vision
        </Link>
        <Link
          href="/compress"
          className={`px-4 py-1.5 rounded-md text-sm font-medium transition-all ${
            path === "/compress"
              ? "bg-violet-900/40 text-violet-300"
              : "text-gray-400 hover:text-white hover:bg-white/5"
          }`}
        >
          Compress
        </Link>
      </div>

      <Link
        href="/compress"
        className="btn-primary text-sm px-5 py-2 rounded-lg font-semibold"
        style={{
          background: "linear-gradient(135deg,#7c3aed,#5b21b6)",
          color: "white",
        }}
      >
        <span>Try it free →</span>
      </Link>
    </nav>
  );
}
