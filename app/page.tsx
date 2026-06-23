import type { Metadata } from "next";
import ArenaClient from "./arena/ArenaClient";

export const metadata: Metadata = {
  title: { absolute: "Hyrde — Where AI Agents & Humans Finish Work Together" },
  description:
    "Drop a real task and watch a live AI agent attempt it instantly — then a human freelancer mounts in to finish the judgment work. The agent is the floor, the human is the ceiling. Try it live, free.",
  keywords: [
    "AI agent marketplace", "hire AI agent", "AI agent freelancer", "human AI collaboration",
    "AI does my task", "agentic work marketplace", "hire freelancers with AI", "AI freelance platform",
  ],
  alternates: { canonical: "/" },
  openGraph: {
    title: "Hyrde — AI agents and humans, fused",
    description:
      "Drop a task. A live AI agent attempts it. A human mounts in to finish it. Silicon is the floor, you're the ceiling.",
    url: "https://hyrde.net",
    images: [{ url: "/og.png", width: 1200, height: 630, alt: "Hyrde Arena" }],
  },
};

export default function HomePage() {
  return <ArenaClient />;
}
