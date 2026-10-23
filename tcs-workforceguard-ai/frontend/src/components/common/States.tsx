import { Loader2 } from "lucide-react";

export function LoadingState({ message = "Analyzing workforce intelligence..." }: { message?: string }) {
  return (
    <div className="flex flex-col items-center justify-center p-12 glass-panel rounded-2xl min-h-[350px]">
      <Loader2 className="w-10 h-10 text-sky-400 animate-spin mb-4" />
      <p className="text-slate-300 font-medium text-sm">{message}</p>
      <span className="text-xs text-slate-400 mt-1">Connecting to FastAPI analytics engine...</span>
    </div>
  );
}

export function ErrorState({ message, onRetry }: { message: string; onRetry?: () => void }) {
  return (
    <div className="p-8 glass-panel rounded-2xl border-rose-500/20 text-center space-y-4">
      <div className="w-12 h-12 rounded-full bg-rose-500/10 text-rose-400 flex items-center justify-center mx-auto">
        !
      </div>
      <h3 className="text-base font-semibold text-white">Analytics Unavailable</h3>
      <p className="text-xs text-slate-400 max-w-md mx-auto">{message}</p>
      {onRetry && (
        <button
          onClick={onRetry}
          className="px-4 py-2 rounded-lg bg-sky-500 hover:bg-sky-400 text-white text-xs font-medium transition"
        >
          Retry Connection
        </button>
      )}
    </div>
  );
}

export function EmptyState({ title, description, actionText, onAction }: { title: string; description: string; actionText?: string; onAction?: () => void }) {
  return (
    <div className="p-12 glass-panel rounded-2xl text-center space-y-3">
      <h3 className="text-base font-semibold text-white">{title}</h3>
      <p className="text-xs text-slate-400 max-w-md mx-auto">{description}</p>
      {actionText && onAction && (
        <button
          onClick={onAction}
          className="px-4 py-2 rounded-lg bg-sky-500 hover:bg-sky-400 text-white text-xs font-medium transition mt-2"
        >
          {actionText}
        </button>
      )}
    </div>
  );
}
