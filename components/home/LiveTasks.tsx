"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { supabaseBrowser } from "@/lib/supabase/client";

// Real tasks from the live database — no fake tickers, no seeded theater.
interface Row {
  id: string;
  title: string;
  category: string | null;
  agent_completion: number;
  claimed_by_user_id: string | null;
}

export default function LiveTasks() {
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
      <div className="flex items-center gap-2 mb-4">
        <span className="w-1.5 h-1.5 rounded-full bg-[#059669]" />
        <h2 className="text-[13px] font-medium text-[#8A8A94]">Live in the Arena right now</h2>
      </div>
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
        {rows.map((t, i) => (
          <Link
            key={t.id}
            href="/signup"
            className="group bg-[#F4F3F8] rounded-2xl p-4 hover:bg-[#EEEDF4] transition-colors animate-fadeup"
            style={{ animationDelay: `${i * 70}ms` }}
          >
            <div className="flex items-center gap-2 mb-2">
              {t.category && (
                <span className="text-[11px] font-medium text-[#5B4FCF] bg-[#5B4FCF]/10 px-2 py-0.5 rounded-full">
                  {t.category}
                </span>
              )}
              <span className={`ml-auto text-[11px] font-medium px-2 py-0.5 rounded ${
                t.claimed_by_user_id
                  ? "text-[#B45309] bg-[#B45309]/10"
                  : "text-[#047857] bg-[#047857]/10"
              }`}>
                {t.claimed_by_user_id ? "Claimed" : "Open"}
              </span>
            </div>
            <p className="text-[14px] font-medium text-[#232329] leading-snug line-clamp-1 mb-2.5">{t.title}</p>
            <p className="text-[12px] text-[#8A8A94]">
              {t.claimed_by_user_id ? "In progress with a vetted Pilot" : "Waiting for a vetted Pilot"}
            </p>
          </Link>
        ))}
      </div>
    </section>
  );
}
