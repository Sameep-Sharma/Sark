import { LumaSpin } from "@/components/ui/luma-spin";

export default function Loading() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-[#050505] text-white p-4">
      <div className="flex flex-col items-center gap-6">
        <LumaSpin />
        <p className="text-xs uppercase tracking-widest text-neutral-400 font-mono animate-pulse">
          Loading...
        </p>
      </div>
    </div>
  );
}
