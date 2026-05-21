import { Suspense } from "react";
import EventContent from "./EventContent";

export const runtime = "edge";

export default function EventPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-[60vh] flex flex-col items-center justify-center">
          <div className="animate-pulse-soft text-4xl mb-4">🌙</div>
          <p className="text-muted">Loading story...</p>
        </div>
      }
    >
      <EventContent />
    </Suspense>
  );
}
