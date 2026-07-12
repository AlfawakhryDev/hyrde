import type { Metadata } from "next";
import { notFound, redirect } from "next/navigation";
import { supabaseServer } from "@/lib/supabase/server";
import TaskDetailClient from "./TaskDetailClient";

export const metadata: Metadata = {
  title: "Task",
  robots: { index: false },
};

export const dynamic = "force-dynamic";

export default async function TaskPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await supabaseServer();

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect(`/login?next=/t/${id}`);

  const { data: task } = await supabase
    .from("tasks")
    .select("*")
    .eq("id", id)
    .maybeSingle();

  if (!task) notFound();

  // Badges for the specialist the AI matched to this task (shown to both sides).
  const [{ data: claimerVettings }, { data: attachments }] = await Promise.all([
    task.claimed_by_user_id
      ? supabase
          .from("vettings")
          .select("category, band, score")
          .eq("user_id", task.claimed_by_user_id)
          .eq("status", "passed")
      : Promise.resolve({ data: [] as { category: string; band: string; score: number }[] }),
    supabase
      .from("task_attachments")
      .select("id, file_name, file_size, storage_path")
      .eq("task_id", task.id)
      .order("created_at"),
  ]);

  return (
    <TaskDetailClient
      initialTask={task}
      userId={user.id}
      claimerBadges={claimerVettings ?? []}
      attachments={attachments ?? []}
    />
  );
}
