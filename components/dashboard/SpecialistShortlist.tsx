"use client";
import BookCall from "@/components/BookCall";

// ── Who would work on this ──────────────────────────────────────────
// Lifted out of ProjectComposer, which had reached 675 lines by absorbing this
// shortlist alongside the intake state machine. They are about to change for
// different reasons: HYR-41 replaces the intake phases with a guided wizard,
// and HYR-44 turns this list into a real candidate pool. Separate files means
// those are separate diffs.
//
// Presentational on purpose. The parent owns fetching; this decides nothing
// except how a shortlist looks, including when it is legitimately empty.

export type Specialist = {
  id: string; name: string; band: string; score: number; headline: string;
  country: string; verifiedSkills: string[]; fit: number; milestone: string; reason: string;
};

export default function SpecialistShortlist({
  specialists, loading, projectTitle, siteUrl, planSummary, budgetUsd,
}: {
  /** null until the first fetch resolves. [] is a real answer, not a failure. */
  specialists: Specialist[] | null;
  loading: boolean;
  projectTitle: string;
  siteUrl?: string;
  planSummary: string;
  budgetUsd: number;
}) {
  return (
    <div className="border-t border-border-crisp pt-4 mb-2">
      <p className="text-[11px] uppercase tracking-[0.14em] text-on-surface-variant mb-3">
        Who would work on this
      </p>

      {loading && (
        <p className="text-[13px] text-on-surface-variant">Matching vetted specialists to this plan…</p>
      )}

      {!loading && specialists && specialists.length > 0 && (
        <>
          <div className="flex flex-col gap-2.5 mb-4">
            {specialists.map(sp => (
              <div key={sp.id} className="rounded-xl border border-border-crisp p-3.5">
                <div className="flex items-center justify-between gap-3 mb-1">
                  <span className="text-[14px] font-semibold text-on-surface">{sp.name}</span>
                  <span className="shrink-0 text-[11px] font-medium text-on-surface-variant">
                    {sp.band} · {sp.score}{sp.country ? ` · ${sp.country}` : ""}
                  </span>
                </div>
                {sp.milestone && (
                  <p className="text-[12px] text-on-surface-variant mb-1">For: {sp.milestone}</p>
                )}
                <p className="text-[12.5px] text-on-surface leading-snug">{sp.reason}</p>
                {sp.verifiedSkills.length > 0 && (
                  <div className="flex flex-wrap gap-1.5 mt-2">
                    {sp.verifiedSkills.slice(0, 3).map(k => (
                      <span key={k} className="rounded-full bg-surface-container px-2.5 py-1 text-[11px] text-on-surface-variant">
                        {k.length > 46 ? k.slice(0, 46) + "…" : k}
                      </span>
                    ))}
                  </div>
                )}
                {/* The call is with THIS specialist, not a Hyrde sales demo. */}
                <div className="mt-3">
                  <BookCall
                    target={{
                      freelancerId: sp.id,
                      freelancerName: sp.name,
                      milestone: sp.milestone,
                      projectTitle,
                      siteUrl,
                      planSummary,
                      budgetUsd,
                    }}
                  />
                </div>
              </div>
            ))}
          </div>
          <p className="text-[12px] text-on-surface-variant">
            Or skip the call: create the project below and we brief milestone 1 to them for you.
          </p>
        </>
      )}

      {!loading && specialists && specialists.length === 0 && (
        <div className="rounded-xl border border-border-crisp p-4">
          <p className="text-[13px] text-on-surface font-medium mb-1.5">
            No vetted specialist is a genuine fit for this yet.
          </p>
          <p className="text-[12.5px] text-on-surface-variant leading-relaxed">
            We will not put an unrelated freelancer in front of you. Create the project anyway and we
            will source and vet a specialist for it, then introduce you once they pass.
          </p>
        </div>
      )}
    </div>
  );
}
