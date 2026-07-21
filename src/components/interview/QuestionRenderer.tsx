"use client";

import { cn } from "@/lib/utils";
import type { AnswerValue, QuestionOption, RuntimeQuestion } from "@/lib/types";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface QuestionRendererProps {
  runtime: RuntimeQuestion;
  value: AnswerValue;
  onChange: (value: AnswerValue) => void;
  onSubmit?: () => void;
}

function ChoiceButton({
  selected,
  label,
  hint,
  onClick,
}: {
  selected: boolean;
  label: string;
  hint?: string;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "group flex w-full items-center gap-3 rounded-xl border px-4 py-3.5 text-left transition-all",
        "hover:border-primary/60 hover:bg-primary/5",
        selected
          ? "border-primary bg-primary/10 shadow-sm"
          : "border-border bg-background"
      )}
    >
      <span
        className={cn(
          "flex h-7 w-7 shrink-0 items-center justify-center rounded-md border text-xs font-semibold",
          selected
            ? "border-primary bg-primary text-primary-foreground"
            : "border-border text-muted-foreground group-hover:border-primary/50"
        )}
      >
        {hint ?? (selected ? "✓" : "")}
      </span>
      <span className="text-base font-medium">{label}</span>
    </button>
  );
}

export function QuestionRenderer({
  runtime,
  value,
  onChange,
  onSubmit,
}: QuestionRendererProps) {
  const { question, options } = runtime;
  const letters = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";

  switch (question.type) {
    case "short_text":
      return (
        <Input
          autoFocus
          type={question.config.inputType === "email" ? "email" : "text"}
          inputMode={question.config.inputType === "email" ? "email" : undefined}
          autoComplete={
            question.config.inputType === "email" ? "email" : undefined
          }
          value={typeof value === "string" ? value : ""}
          placeholder={question.config.placeholder ?? "Type your answer…"}
          onChange={(e) => onChange(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter" && !e.shiftKey) {
              e.preventDefault();
              onSubmit?.();
            }
          }}
        />
      );

    case "long_text":
      return (
        <Textarea
          autoFocus
          value={typeof value === "string" ? value : ""}
          placeholder={question.config.placeholder ?? "Share as much detail as you’d like…"}
          onChange={(e) => onChange(e.target.value)}
          className="min-h-[160px]"
        />
      );

    case "multiple_choice":
      return (
        <div className="flex flex-col gap-2.5">
          {options.map((opt, i) => (
            <ChoiceButton
              key={opt.id}
              selected={value === opt.value}
              label={opt.label}
              hint={letters[i] ?? String(i + 1)}
              onClick={() => {
                onChange(opt.value);
                // Auto-advance shortly after selection for Typeform feel
                setTimeout(() => onSubmit?.(), 220);
              }}
            />
          ))}
        </div>
      );

    case "multiple_select": {
      const selected = Array.isArray(value) ? value : [];
      const toggle = (opt: QuestionOption) => {
        if (selected.includes(opt.value)) {
          onChange(selected.filter((v) => v !== opt.value));
        } else {
          onChange([...selected, opt.value]);
        }
      };
      return (
        <div className="flex flex-col gap-2.5">
          {options.map((opt, i) => (
            <ChoiceButton
              key={opt.id}
              selected={selected.includes(opt.value)}
              label={opt.label}
              hint={letters[i] ?? String(i + 1)}
              onClick={() => toggle(opt)}
            />
          ))}
          <p className="mt-1 text-xs text-muted-foreground">
            Select all that apply · press Enter to continue
          </p>
        </div>
      );
    }

    case "dropdown":
      return (
        <Select
          value={typeof value === "string" ? value : undefined}
          onValueChange={(v) => {
            onChange(v);
            setTimeout(() => onSubmit?.(), 180);
          }}
        >
          <SelectTrigger>
            <SelectValue placeholder="Select an option…" />
          </SelectTrigger>
          <SelectContent>
            {options.map((opt) => (
              <SelectItem key={opt.id} value={opt.value}>
                {opt.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      );

    case "yes_no":
      return (
        <div className="flex flex-col gap-2.5 sm:flex-row">
          {[
            { label: "Yes", value: "yes", hint: "Y" },
            { label: "No", value: "no", hint: "N" },
          ].map((opt) => (
            <ChoiceButton
              key={opt.value}
              selected={value === opt.value}
              label={opt.label}
              hint={opt.hint}
              onClick={() => {
                onChange(opt.value);
                setTimeout(() => onSubmit?.(), 220);
              }}
            />
          ))}
        </div>
      );

    case "rating": {
      const max = question.config.ratingMax ?? 5;
      const current =
        typeof value === "number" ? value : value ? Number(value) : null;
      return (
        <div className="flex flex-wrap gap-2">
          {Array.from({ length: max }, (_, i) => i + 1).map((n) => (
            <button
              key={n}
              type="button"
              onClick={() => {
                onChange(n);
                setTimeout(() => onSubmit?.(), 220);
              }}
              className={cn(
                "flex h-12 w-12 items-center justify-center rounded-xl border text-base font-semibold transition-all",
                current === n
                  ? "border-primary bg-primary text-primary-foreground"
                  : "border-border hover:border-primary/60 hover:bg-primary/5"
              )}
            >
              {n}
            </button>
          ))}
        </div>
      );
    }

    default:
      return <p className="text-muted-foreground">Unsupported question type.</p>;
  }
}

export function QuestionHeader({
  runtime,
  index,
  total,
}: {
  runtime: RuntimeQuestion;
  index: number;
  total: number;
}) {
  return (
    <div className="mb-8 space-y-3">
      {runtime.section && (
        <p className="text-xs font-semibold uppercase tracking-[0.14em] text-primary">
          {runtime.section.title}
        </p>
      )}
      <p className="text-sm text-muted-foreground">
        {index + 1} → {total}
      </p>
      <h1 className="font-display text-2xl font-semibold leading-tight tracking-tight text-foreground sm:text-3xl md:text-4xl">
        {runtime.title}
      </h1>
      {(runtime.question.description || runtime.instanceLabel) && (
        <p className="max-w-2xl text-base text-muted-foreground">
          {runtime.question.description}
        </p>
      )}
    </div>
  );
}
