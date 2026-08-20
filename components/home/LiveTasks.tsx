"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { supabaseBrowser } from "@/lib/supabase/client";
import { tFor, type Locale } from "@/lib/i18n";

// Real tasks from the live database — no fake tickers, no seeded theater.
interface Row {
  id: string;
  title: string;
  category: string | null;
  agent_completion: number;
  claimed_by_user_id: string | null;
}

export default function LiveTasks({ locale = "en" }: { locale?: Locale }) {
  const t = tFor(locale);
  const [rows, setRows] = useState<Row[]>([]);

  useEffect(() => {
    supabaseBrowser()
      .from("tasks")
      .select("id, title, category, agent_completion, claimed_by_user_id")
      .order("created_at", { ascending: false })
      .limit(6)
      .then(({ data }) => { if (data) setRows(data as Row[]); });
  }, []);

  if (!rows.length) return null;

  return (
    <section className="mx-auto max-w-[1120px] px-5 md:px-6 pb-16">
      <div className="flex items-center gap-2.5 mb-5">
        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
        <span className="font-mono text-[10.5px] uppercase tracking-[0.2em] text-[#8A887E]">{t("live.now")}</span>
      </div>
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
        {rows.map((row, i) => (
          <Link
            key={row.id}
            href="/signup"
            className="group rounded-[8px] border border-[#E7E4DB] bg-[#FBFAF6] p-4 hover:bg-[#F4F2EC] transition-colors animate-fadeup"
            style={{ animationDelay: `${i * 70}ms` }}
          >
            <div className="flex items-center gap-2 mb-2">
              {row.category && (
                <span className="text-[11px] font-medium text-[#57564F] bg-[#14140F]/[0.05] border border-[#E3E0D8] px-2 py-0.5 rounded-full">
                  {row.category}
                </span>
              )}
              <span className={`ml-auto text-[11px] font-medium px-2 py-0.5 rounded ${
                row.claimed_by_user_id
                  ? "text-[#B45309] bg-[#B45309]/10"
                  : "text-[#047857] bg-[#047857]/10"
              }`}>
                {row.claimed_by_user_id ? t("live.claimed") : t("live.open")}
              </span>
            </div>
            <p className="text-[14px] font-medium text-[#232329] leading-snug line-clamp-1 mb-2.5">{row.title}</p>
            <p className="text-[12px] text-[#8A8A94]">
              {row.claimed_by_user_id ? t("live.inProgress") : t("live.waiting")}
            </p>
          </Link>
        ))}
      </div>
    </section>
  );
}
