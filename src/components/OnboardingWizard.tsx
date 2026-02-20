import { useState } from "react";

export type OnboardingStepId = "country" | "channels" | "alerts" | "storage" | "categories" | "tags" | "account";

export type OnboardingWizardStep = {
  id: OnboardingStepId;
  label: string;
};

const STEP_ORDER: OnboardingStepId[] = ["country", "channels", "alerts", "storage", "categories", "tags", "account"];

export type Props = {
  steps: OnboardingWizardStep[];
  completedSteps: Set<OnboardingStepId>;
  /** stepIndex: 0-based index in the displayed list (same order as STEP_ORDER) */
  onStepNavigate: (stepIndex: number) => void;
  onStepToggle: (stepId: OnboardingStepId) => void;
  onDismiss: () => void;
  minimized: boolean;
  onMinimizeChange: (minimized: boolean) => void;
  t: {
    wizardTitle: string;
    wizardClose: string;
    wizardMinimize: string;
    wizardExpand: string;
  };
};

export default function OnboardingWizard({
  steps,
  completedSteps,
  onStepNavigate,
  onStepToggle,
  onDismiss,
  minimized,
  onMinimizeChange,
  t,
}: Props) {
  const [isExpandedFromMinimized, setIsExpandedFromMinimized] = useState(false);

  const orderedSteps = steps.length
    ? [...steps].sort((a, b) => STEP_ORDER.indexOf(a.id) - STEP_ORDER.indexOf(b.id))
    : STEP_ORDER.map((id) => ({ id, label: id }));

  if (minimized && !isExpandedFromMinimized) {
    return (
      <div
        className="onboarding-wizard onboarding-wizard--minimized"
        style={{
          position: "fixed",
          left: "1rem",
          bottom: "1rem",
          zIndex: 40,
          display: "flex",
          alignItems: "center",
          gap: "0.5rem",
          padding: "0.5rem 0.75rem",
          borderRadius: "12px",
          boxShadow: "0 4px 12px rgba(0,0,0,0.15)",
          background: "var(--surface)",
          border: "1px solid var(--border)",
          color: "var(--text)",
        }}
      >
        <button
          type="button"
          className="inline-flex items-center gap-2 text-sm font-medium"
          style={{ color: "var(--text)" }}
          onClick={() => setIsExpandedFromMinimized(true)}
          aria-label={t.wizardExpand}
        >
          <i className="fa-solid fa-list-check" aria-hidden />
          <span>{t.wizardTitle} {completedSteps.size}/{orderedSteps.length}</span>
        </button>
        <button
          type="button"
          className="inline-flex items-center justify-center w-8 h-8 rounded-lg border shrink-0 transition-colors hover:opacity-80"
          style={{
            borderColor: "var(--border)",
            background: "var(--surface-hover)",
            color: "var(--text-secondary)",
          }}
          title={t.wizardClose}
          aria-label={t.wizardClose}
          onClick={onDismiss}
        >
          <i className="fa-solid fa-times" aria-hidden />
        </button>
      </div>
    );
  }

  return (
    <div
      className="onboarding-wizard"
      style={{
        position: "fixed",
        left: "1rem",
        bottom: "1rem",
        zIndex: 40,
        width: "min(320px, calc(100vw - 2rem))",
        borderRadius: "12px",
        boxShadow: "0 8px 24px rgba(0,0,0,0.18)",
        background: "var(--surface)",
        border: "1px solid var(--border)",
        color: "var(--text)",
        overflow: "hidden",
      }}
    >
      <div
        className="flex items-center justify-between gap-2 px-4 py-3 border-b"
        style={{ borderColor: "var(--border)", background: "var(--surface-hover)" }}
      >
        <h3 className="text-sm font-semibold m-0" style={{ color: "var(--text)" }}>
          {t.wizardTitle} {completedSteps.size}/{orderedSteps.length}
        </h3>
        <div className="flex items-center gap-1 shrink-0">
          <button
            type="button"
            className="inline-flex items-center justify-center w-8 h-8 rounded-lg border transition-colors hover:opacity-80"
            style={{
              borderColor: "var(--border)",
              background: "var(--surface)",
              color: "var(--text-secondary)",
            }}
            title={t.wizardMinimize}
            aria-label={t.wizardMinimize}
            onClick={() => {
              onMinimizeChange(true);
              setIsExpandedFromMinimized(false);
            }}
          >
            <i className="fa-solid fa-minus" aria-hidden />
          </button>
          <button
            type="button"
            className="inline-flex items-center justify-center w-8 h-8 rounded-lg border transition-colors hover:opacity-80"
            style={{
              borderColor: "var(--border)",
              background: "var(--surface)",
              color: "var(--text-secondary)",
            }}
            title={t.wizardClose}
            aria-label={t.wizardClose}
            onClick={onDismiss}
          >
            <i className="fa-solid fa-times" aria-hidden />
          </button>
        </div>
      </div>
      <ul
        className="list-none m-0 p-3 space-y-2"
        style={{ maxHeight: "min(50vh, 280px)", overflowY: "auto" }}
      >
        {orderedSteps.map((step, stepIndex) => {
          const done = completedSteps.has(step.id);
          return (
            <li key={step.id} className="flex items-center gap-3">
              <div
                className="flex items-center gap-3 w-full rounded-lg px-2 py-2 border transition-colors hover:bg-[var(--surface-hover)]"
                style={{
                  borderColor: "var(--border)",
                  background: done ? "var(--surface-hover)" : "transparent",
                }}
              >
                <button
                  type="button"
                  className="inline-flex items-center justify-center w-5 h-5 rounded-full border shrink-0 transition-colors hover:opacity-80"
                  style={{
                    borderColor: done ? "var(--primary)" : "var(--border)",
                    background: done ? "var(--primary)" : "transparent",
                    color: done ? "white" : "var(--text-secondary)",
                  }}
                  onClick={(e) => {
                    e.stopPropagation();
                    onStepToggle(step.id);
                  }}
                  aria-pressed={done}
                  aria-label={done ? `${step.label} (done)` : step.label}
                >
                  {done ? (
                    <i className="fa-solid fa-check text-xs" />
                  ) : (
                    <span className="w-2 h-2 rounded-full bg-transparent" />
                  )}
                </button>
                <button
                  type="button"
                  className="flex-1 text-left text-sm min-w-0"
                  style={{
                    color: done ? "var(--text-secondary)" : "var(--text)",
                    textDecoration: done ? "line-through" : "none",
                  }}
                  onClick={() => onStepNavigate(stepIndex)}
                  aria-label={done ? `${step.label} (done)` : step.label}
                >
                  {step.label}
                </button>
              </div>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
