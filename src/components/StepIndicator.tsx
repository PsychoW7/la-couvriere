import { useTranslations } from "next-intl";
import { CheckIcon } from "./Icons";

const steps = ["dates", "deposit", "confirmation"] as const;

interface Props {
  current: 1 | 2 | 3;
  tone?: "light" | "dark";
}

export function StepIndicator({ current, tone = "light" }: Props) {
  const t = useTranslations("reserve");
  const dark = tone === "dark";
  const colors = {
    active: dark ? "text-white" : "text-deep",
    done: dark ? "text-leaf-light" : "text-forest",
    todo: dark ? "text-white/45" : "text-muted/70",
    todoBadge: dark ? "bg-white/10 text-white/60" : "bg-surface-2 text-muted",
    line: dark ? "bg-white/15" : "bg-deep/15",
  };

  return (
    <ol
      className={`flex items-center gap-2 text-sm font-semibold sm:gap-4 ${
        dark ? "rounded-pill bg-white/5 px-4 py-3 ring-1 ring-white/10" : ""
      }`}
      aria-label={t("stepLabel", { current, total: steps.length })}
    >
      {steps.map((key, i) => {
        const n = i + 1;
        const done = n < current;
        const active = n === current;
        return (
          <li key={key} className="flex items-center gap-2 sm:gap-4">
            <span
              className={`flex items-center gap-2 ${
                active ? colors.active : done ? colors.done : colors.todo
              }`}
              aria-current={active ? "step" : undefined}
            >
              <span
                className={`grid size-8 place-items-center rounded-pill text-xs ${
                  active ? "bg-coral text-white" : done ? "bg-forest text-white" : colors.todoBadge
                }`}
                aria-hidden="true"
              >
                {done ? <CheckIcon width={16} height={16} strokeWidth={3} /> : n}
              </span>
              <span className={active || done ? "" : "hidden sm:inline"}>{t(`steps.${key}`)}</span>
            </span>
            {n < steps.length && <span className={`h-px w-6 sm:w-12 ${colors.line}`} aria-hidden="true" />}
          </li>
        );
      })}
    </ol>
  );
}
