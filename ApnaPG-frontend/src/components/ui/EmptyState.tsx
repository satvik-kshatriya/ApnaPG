import type { LucideIcon } from "lucide-react";

interface EmptyStateProps {
  icon: LucideIcon;
  title: string;
  description: string;
  actionLabel?: string;
  onAction?: () => void;
}

export function EmptyState({ icon: Icon, title, description, actionLabel, onAction }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center p-12 bg-white rounded-[2rem] border border-zinc-100 shadow-sm animate-in fade-in zoom-in duration-500">
      <div className="p-6 bg-zinc-50 rounded-3xl mb-6 group transition-colors hover:bg-indigo-50">
        <Icon size={48} className="text-zinc-300 group-hover:text-indigo-400 transition-colors duration-500" />
      </div>
      <h3 className="text-xl font-black text-zinc-900 mb-2 tracking-tight">
        {title}
      </h3>
      <p className="text-zinc-400 text-sm font-medium max-w-[280px] text-center mb-8 leading-relaxed">
        {description}
      </p>
      {actionLabel && onAction && (
        <button
          onClick={onAction}
          className="px-8 py-3 bg-indigo-600 text-white rounded-xl font-bold text-sm shadow-xl shadow-indigo-500/20 hover:bg-indigo-700 transition-all active:scale-95 uppercase tracking-widest"
        >
          {actionLabel}
        </button>
      )}
    </div>
  );
}
