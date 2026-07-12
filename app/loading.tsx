import { BrandLoader } from "@/components/Loader";

// Instant loading state for any route without its own skeleton.
export default function Loading() {
  return (
    <div className="min-h-[60vh] flex items-center justify-center">
      <BrandLoader />
    </div>
  );
}
