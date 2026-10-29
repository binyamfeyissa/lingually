import Link from "next/link";
import { ArrowLeft, Edit3, Home } from "lucide-react";

export default function NotFound() {
  return (
    <div className="min-h-screen bg-bg text-ink flex flex-col items-center justify-center p-6 select-none font-mono">
      <div className="relative max-w-md w-full border border-line bg-bg-raised p-8 space-y-6 shadow-sm">
        {/* Corner ticks */}
        <span className="tick top-[-5px] left-[-5px]" />
        <span className="tick top-[-5px] right-[-5px]" />
        <span className="tick bottom-[-5px] left-[-5px]" />
        <span className="tick bottom-[-5px] right-[-5px]" />

        <div className="space-y-2 border-b border-line pb-4">
          <span className="text-[10px] text-danger uppercase tracking-[0.2em] font-semibold">
            ERROR 404 // NOT FOUND
          </span>
          <h1 className="font-display text-2xl font-bold tracking-tight text-ink">
            Page Not Found
          </h1>
          <p className="font-sans text-xs text-muted leading-relaxed">
            The requested route does not exist in the Lingually workspace.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row gap-2.5 pt-2">
          <Link
            href="/"
            className="flex-1 inline-flex items-center justify-center gap-1.5 h-9 px-4 text-xs uppercase tracking-wider font-semibold border border-line bg-bg text-ink hover:bg-bg-raised transition"
          >
            <Home className="h-3.5 w-3.5 text-muted" />
            <span>BACK TO HOME</span>
          </Link>

          <Link
            href="/editor"
            className="flex-1 inline-flex items-center justify-center gap-1.5 h-9 px-4 text-xs uppercase tracking-wider font-semibold bg-invert-bg text-invert-fg hover:opacity-85 transition"
          >
            <Edit3 className="h-3.5 w-3.5" />
            <span>OPEN EDITOR</span>
          </Link>
        </div>
      </div>
    </div>
  );
}
