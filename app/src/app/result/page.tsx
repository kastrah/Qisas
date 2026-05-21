import { Suspense } from "react";
import ResultContent from "./ResultContent";

export const runtime = "edge";

export default function ResultPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-[60vh] flex flex-col items-center justify-center">
          <div className="animate-pulse-soft text-4xl mb-4">🌙</div>
          <p className="text-muted text-lg">Finding your story...</p>
        </div>
      }
    >
      <ResultContent />
    </Suspense>
  );
}
