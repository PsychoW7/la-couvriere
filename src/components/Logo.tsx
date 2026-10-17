import { gite } from "../../config/gite";
import { MountainIcon } from "./Icons";

export function Logo({
  tone = "light",
  className = "",
}: {
  tone?: "light" | "dark";
  className?: string;
}) {
  const text = tone === "light" ? "text-white" : "text-deep";
  const badge =
    tone === "light" ? "bg-white/10 text-amber" : "bg-surface text-forest";
  return (
    <span className={`inline-flex items-center gap-2.5 ${text} ${className}`}>
      <span
        className={`grid size-9 place-items-center rounded-xl ${badge}`}
        aria-hidden="true"
      >
        <MountainIcon width={20} height={20} strokeWidth={2.2} />
      </span>
      <span className="font-display text-lg font-extrabold tracking-[-0.02em]">
        {gite.name}
      </span>
    </span>
  );
}
