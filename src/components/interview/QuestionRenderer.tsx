"use client";

import { useMemo } from "react";
import { cn } from "@/lib/utils";
import type { AnswerValue, QuestionOption, RuntimeQuestion } from "@/lib/types";
import { OTHER_VALUE } from "@/lib/types";
import {
  formatOtherAnswer,
  isOtherAnswer,
  otherDetail,
  questionAllowsOther,
} from "@/lib/interview/engine";
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
  onSubmit?: (value?: AnswerValue) => void;
  invalid?: boolean;
}

function ChoiceButton({
  selected,
  label,
  hint,
  onClick,
  invalid,
}: {
  selected: boolean;
  label: string;
  hint?: string;
  onClick: () => void;
  invalid?: boolean;
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
          : "border-border bg-background",
        invalid && !selected && "border-destructive/50"
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

function withOtherOption(
  questionId: string,
  options: QuestionOption[],
  allowOther: boolean
): QuestionOption[] {
  if (!allowOther) return options;
  if (options.some((o) => o.value === OTHER_VALUE || o.value === "other")) {
    return options;
  }
  return [
    ...options,
    {
      id: `${questionId}-opt-other`,
      questionId,
      label: "Other",
      value: OTHER_VALUE,
      orderIndex: options.length,
    },
  ];
}

function OtherSpecify({
  detail,
  onDetailChange,
  invalid,
  autoFocus,
}: {
  detail: string;
  onDetailChange: (detail: string) => void;
  invalid?: boolean;
  autoFocus?: boolean;
}) {
  return (
    <Input
      autoFocus={autoFocus}
      value={detail}
      placeholder="Please specify…"
      onChange={(e) => onDetailChange(e.target.value)}
      className={cn(invalid && "border-destructive focus-visible:ring-destructive")}
      aria-invalid={invalid || undefined}
    />
  );
}

export function QuestionRenderer({
  runtime,
  value,
  onChange,
  onSubmit,
  invalid = false,
}: QuestionRendererProps) {
  const { question } = runtime;
  const letters = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
  const allowOther = questionAllowsOther(question);
  const options = useMemo(
    () => withOtherOption(question.id, runtime.options, allowOther),
    [allowOther, question.id, runtime.options]
  );

  const fieldClass = cn(
    invalid && "border-destructive focus-visible:ring-destructive"
  );

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
          value={typeof value === "string" && value !== "__skipped__" ? value : ""}
          placeholder={question.config.placeholder ?? "Type your answer…"}
          onChange={(e) => onChange(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter" && !e.shiftKey) {
              e.preventDefault();
              onSubmit?.(
                typeof value === "string" && value !== "__skipped__"
                  ? value
                  : undefined
              );
            }
          }}
          className={fieldClass}
          aria-invalid={invalid || undefined}
        />
      );

    case "long_text":
      return (
        <Textarea
          autoFocus
          value={typeof value === "string" && value !== "__skipped__" ? value : ""}
          placeholder={
            question.config.placeholder ?? "Share as much detail as you’d like…"
          }
          onChange={(e) => onChange(e.target.value)}
          className={cn("min-h-[160px]", fieldClass)}
          aria-invalid={invalid || undefined}
        />
      );

    case "multiple_choice": {
      const stringValue = typeof value === "string" ? value : "";
      const otherSelected = isOtherAnswer(stringValue);
      return (
        <div className="flex flex-col gap-2.5">
          {options.map((opt, i) => {
            const isOther = opt.value === OTHER_VALUE;
            const selected = isOther
              ? otherSelected
              : stringValue === opt.value;
            return (
              <ChoiceButton
                key={opt.id}
                selected={selected}
                label={opt.label}
                hint={letters[i] ?? String(i + 1)}
                invalid={invalid}
                onClick={() => {
                  if (isOther) {
                    onChange(formatOtherAnswer(otherDetail(stringValue)));
                    return;
                  }
                  onChange(opt.value);
                  setTimeout(() => onSubmit?.(opt.value), 220);
                }}
              />
            );
          })}
          {otherSelected && (
            <OtherSpecify
              autoFocus
              detail={otherDetail(stringValue)}
              invalid={invalid}
              onDetailChange={(detail) => onChange(formatOtherAnswer(detail))}
            />
          )}
        </div>
      );
    }

    case "multiple_select": {
      const selected = Array.isArray(value) ? value : [];
      const otherEntry = selected.find((v) => isOtherAnswer(v));
      const otherSelected = Boolean(otherEntry);

      const toggle = (opt: QuestionOption) => {
        const isOther = opt.value === OTHER_VALUE;
        if (isOther) {
          if (otherSelected) {
            onChange(selected.filter((v) => !isOtherAnswer(v)));
          } else {
            onChange([...selected.filter((v) => !isOtherAnswer(v)), OTHER_VALUE]);
          }
          return;
        }
        if (selected.includes(opt.value)) {
          onChange(selected.filter((v) => v !== opt.value));
        } else {
          onChange([...selected, opt.value]);
        }
      };

      return (
        <div className="flex flex-col gap-2.5">
          {options.map((opt, i) => {
            const isOther = opt.value === OTHER_VALUE;
            return (
              <ChoiceButton
                key={opt.id}
                selected={
                  isOther ? otherSelected : selected.includes(opt.value)
                }
                label={opt.label}
                hint={letters[i] ?? String(i + 1)}
                invalid={invalid}
                onClick={() => toggle(opt)}
              />
            );
          })}
          {otherSelected && (
            <OtherSpecify
              autoFocus
              detail={otherDetail(otherEntry ?? OTHER_VALUE)}
              invalid={invalid}
              onDetailChange={(detail) => {
                const next = selected.filter((v) => !isOtherAnswer(v));
                next.push(formatOtherAnswer(detail));
                onChange(next);
              }}
            />
          )}
          <p className="mt-1 text-xs text-muted-foreground">
            Select all that apply · press Enter to continue
          </p>
        </div>
      );
    }

    case "dropdown": {
      const stringValue = typeof value === "string" ? value : "";
      const otherSelected = isOtherAnswer(stringValue);
      const selectValue = otherSelected
        ? OTHER_VALUE
        : stringValue || undefined;
      return (
        <div className="space-y-3">
          <Select
            value={selectValue}
            onValueChange={(v) => {
              if (v === OTHER_VALUE) {
                onChange(formatOtherAnswer(""));
                return;
              }
              onChange(v);
              setTimeout(() => onSubmit?.(v), 180);
            }}
          >
            <SelectTrigger
              className={cn(invalid && "border-destructive focus:ring-destructive")}
              aria-invalid={invalid || undefined}
            >
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
          {otherSelected && (
            <OtherSpecify
              autoFocus
              detail={otherDetail(stringValue)}
              invalid={invalid}
              onDetailChange={(detail) => onChange(formatOtherAnswer(detail))}
            />
          )}
        </div>
      );
    }

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
              invalid={invalid}
              onClick={() => {
                onChange(opt.value);
                setTimeout(() => onSubmit?.(opt.value), 220);
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
                setTimeout(() => onSubmit?.(n), 220);
              }}
              className={cn(
                "flex h-12 w-12 items-center justify-center rounded-xl border text-base font-semibold transition-all",
                current === n
                  ? "border-primary bg-primary text-primary-foreground"
                  : "border-border hover:border-primary/60 hover:bg-primary/5",
                invalid && current === null && "border-destructive/50"
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
}: {
  runtime: RuntimeQuestion;
}) {
  return (
    <div className="mb-8 space-y-3">
      {runtime.section && (
        <p className="text-xs font-semibold uppercase tracking-[0.14em] text-primary">
          {runtime.section.title}
        </p>
      )}
      <h1 className="font-display text-2xl font-semibold leading-tight tracking-tight text-foreground sm:text-3xl md:text-4xl">
        {runtime.title}
      </h1>
      {runtime.question.description && (
        <p className="max-w-2xl text-base text-muted-foreground">
          {runtime.question.description}
        </p>
      )}
    </div>
  );
}
