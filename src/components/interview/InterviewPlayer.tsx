"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import { ArrowLeft, ArrowRight, Check, Loader2 } from "lucide-react";
import type { AnswerValue, InterviewSession, Template } from "@/lib/types";
import {
  buildRuntimePath,
  getAnswerMap,
  isAnswerValid,
} from "@/lib/interview/engine";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import {
  QuestionHeader,
  QuestionRenderer,
} from "@/components/interview/QuestionRenderer";

const TOKEN_KEY = (slug: string) => `eia-session-${slug}`;

interface InterviewPlayerProps {
  template: Template;
  initialSession: InterviewSession;
  preview?: boolean;
}

export function InterviewPlayer({
  template,
  initialSession,
  preview = false,
}: InterviewPlayerProps) {
  const router = useRouter();
  const [session, setSession] = useState(initialSession);
  const [answers, setAnswers] = useState<Map<string, AnswerValue>>(() =>
    getAnswerMap(initialSession.responses, template.questions)
  );
  const [stepIndex, setStepIndex] = useState(0);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [direction, setDirection] = useState(1);
  const [started, setStarted] = useState(
    () => initialSession.responses.length > 0
  );

  const path = useMemo(
    () => buildRuntimePath(template, answers),
    [template, answers]
  );

  // Keep step in bounds when path shrinks/grows due to branching
  useEffect(() => {
    if (stepIndex >= path.length && path.length > 0) {
      setStepIndex(path.length - 1);
    }
  }, [path.length, stepIndex]);

  // Resume at first unanswered question
  useEffect(() => {
    if (initialSession.responses.length === 0) return;
    const firstUnanswered = path.findIndex((r) => {
      const key = r.runtimeId;
      const val = answers.get(key) ?? (r.instanceKey ? undefined : answers.get(r.question.key));
      return !isAnswerValid(r.question, val);
    });
    if (firstUnanswered >= 0) setStepIndex(firstUnanswered);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (!preview && typeof window !== "undefined") {
      localStorage.setItem(TOKEN_KEY(template.slug), session.respondentToken);
    }
  }, [preview, session.respondentToken, template.slug]);

  const current = path[stepIndex];
  const progress =
    path.length === 0 ? 0 : Math.round(((stepIndex + 1) / path.length) * 100);

  const currentValue: AnswerValue = current
    ? (answers.get(current.runtimeId) ??
      (current.instanceKey ? null : answers.get(current.question.key)) ??
      null)
    : null;

  const setCurrentValue = useCallback(
    (value: AnswerValue) => {
      if (!current) return;
      setAnswers((prev) => {
        const next = new Map(prev);
        next.set(current.runtimeId, value);
        if (!current.instanceKey) {
          next.set(current.question.key, value);
        }
        return next;
      });
      setError(null);
    },
    [current]
  );

  const persist = useCallback(
    async (value: AnswerValue, nextKey: string | null, complete = false) => {
      if (preview || !current) return session;
      setSaving(true);
      try {
        const res = await fetch(`/api/sessions/${session.id}/responses`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            questionId: current.question.id,
            instanceKey: current.instanceKey,
            value,
            currentQuestionKey: nextKey,
            complete,
          }),
        });
        if (!res.ok) {
          const body = await res.json().catch(() => ({}));
          throw new Error(body.error ?? "Failed to save");
        }
        const data = await res.json();
        setSession(data.session);
        return data.session as InterviewSession;
      } finally {
        setSaving(false);
      }
    },
    [current, preview, session]
  );

  const goNext = useCallback(async () => {
    if (!current) return;
    if (!isAnswerValid(current.question, currentValue)) {
      setError(
        current.question.config.inputType === "email"
          ? "Please enter a valid email address."
          : "Please answer this question to continue."
      );
      return;
    }

    const nextAnswers = new Map(answers);
    nextAnswers.set(current.runtimeId, currentValue);
    if (!current.instanceKey) {
      nextAnswers.set(current.question.key, currentValue);
    }
    const nextPath = buildRuntimePath(template, nextAnswers);
    const isLast = stepIndex >= nextPath.length - 1;
    const nextRuntime = nextPath[stepIndex + 1];

    try {
      await persist(
        currentValue,
        isLast ? null : (nextRuntime?.question.key ?? null),
        isLast
      );
      setAnswers(nextAnswers);

      if (isLast) {
        if (preview) {
          router.push(`/admin/templates/${template.id}?previewComplete=1`);
        } else {
          localStorage.removeItem(TOKEN_KEY(template.slug));
          router.push(`/interview/${template.slug}/thank-you`);
        }
        return;
      }

      setDirection(1);
      setStepIndex((i) => i + 1);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Could not save answer");
    }
  }, [
    answers,
    current,
    currentValue,
    persist,
    preview,
    router,
    stepIndex,
    template,
  ]);

  const goBack = useCallback(() => {
    if (stepIndex <= 0) return;
    setDirection(-1);
    setStepIndex((i) => i - 1);
    setError(null);
  }, [stepIndex]);

  // Keyboard shortcuts
  useEffect(() => {
    if (!started) return;

    const handler = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement | null;
      const tag = target?.tagName?.toLowerCase();
      const isTextInput =
        tag === "input" || tag === "textarea" || target?.isContentEditable;

      if (e.key === "Enter" && !e.shiftKey) {
        if (tag === "textarea") return;
        e.preventDefault();
        void goNext();
        return;
      }

      if (
        (e.key === "Backspace" || e.key === "ArrowLeft") &&
        !isTextInput &&
        stepIndex > 0
      ) {
        e.preventDefault();
        goBack();
        return;
      }

      if (!current || isTextInput) return;

      if (current.question.type === "yes_no") {
        if (e.key.toLowerCase() === "y") {
          setCurrentValue("yes");
          setTimeout(() => void goNext(), 180);
        }
        if (e.key.toLowerCase() === "n") {
          setCurrentValue("no");
          setTimeout(() => void goNext(), 180);
        }
      }

      if (
        current.question.type === "multiple_choice" ||
        current.question.type === "multiple_select"
      ) {
        const idx = e.key.toUpperCase().charCodeAt(0) - 65;
        const opt = current.options[idx];
        if (opt && idx >= 0 && idx < 26) {
          if (current.question.type === "multiple_select") {
            const selected = Array.isArray(currentValue) ? currentValue : [];
            setCurrentValue(
              selected.includes(opt.value)
                ? selected.filter((v) => v !== opt.value)
                : [...selected, opt.value]
            );
          } else {
            setCurrentValue(opt.value);
            setTimeout(() => void goNext(), 180);
          }
        }
      }

      if (current.question.type === "rating") {
        const n = Number(e.key);
        const max = current.question.config.ratingMax ?? 5;
        if (n >= 1 && n <= max) {
          setCurrentValue(n);
          setTimeout(() => void goNext(), 180);
        }
      }
    };

    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [current, currentValue, goBack, goNext, setCurrentValue, started, stepIndex]);

  if (!started) {
    return (
      <div className="relative flex min-h-screen flex-col bg-background">
        <div className="interview-atmosphere pointer-events-none absolute inset-0" />
        <main className="relative z-10 flex flex-1 flex-col items-center justify-center px-4 py-16 text-center">
          <p className="font-display text-5xl font-semibold tracking-tight sm:text-6xl">
            NeuroTriage
          </p>
          <h1 className="mt-8 max-w-2xl text-xl font-medium leading-snug sm:text-2xl">
            {template.title}
          </h1>
          {template.description && (
            <p className="mt-4 max-w-xl text-base leading-relaxed text-muted-foreground sm:text-lg">
              {template.description}
            </p>
          )}
          <p className="mt-3 text-sm text-muted-foreground">
            Takes about 10–15 minutes · your answers are saved as you go
          </p>
          <Button
            size="lg"
            className="mt-10 gap-2 px-8"
            onClick={() => setStarted(true)}
          >
            Start survey
            <ArrowRight className="h-4 w-4" />
          </Button>
          {preview && (
            <p className="mt-4 text-xs text-amber-400">
              Preview mode — answers are not saved
            </p>
          )}
        </main>
      </div>
    );
  }

  if (!current) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="relative flex min-h-screen flex-col bg-background">
      <div className="interview-atmosphere pointer-events-none absolute inset-0" />

      <header className="relative z-10 border-b border-border/60 bg-background/80 backdrop-blur-md">
        <div className="mx-auto flex max-w-3xl items-center justify-between gap-4 px-4 py-3">
          <div className="min-w-0">
            <p className="text-xs font-semibold tracking-wide text-primary">
              NeuroTriage
            </p>
            <p className="truncate text-sm font-medium text-foreground">
              {template.title}
            </p>
            {preview && (
              <p className="text-xs text-amber-400">
                Preview mode — answers are not saved
              </p>
            )}
          </div>
          <span className="hidden text-xs text-muted-foreground sm:inline">
            {saving ? "Saving…" : "Saved"}
          </span>
        </div>
        <Progress value={progress} className="h-1 rounded-none" />
      </header>

      <main className="relative z-10 flex flex-1 items-center px-4 py-10 sm:py-16">
        <div className="mx-auto w-full max-w-2xl">
          <AnimatePresence mode="wait" custom={direction}>
            <motion.div
              key={current.runtimeId}
              custom={direction}
              initial={{ opacity: 0, y: direction > 0 ? 24 : -24 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: direction > 0 ? -24 : 24 }}
              transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
            >
              <QuestionHeader
                runtime={current}
                index={stepIndex}
                total={path.length}
              />
              <QuestionRenderer
                runtime={current}
                value={currentValue}
                onChange={setCurrentValue}
                onSubmit={() => void goNext()}
              />
              {error && (
                <p className="mt-4 text-sm text-destructive">{error}</p>
              )}
            </motion.div>
          </AnimatePresence>

          <div className="mt-10 flex items-center justify-between gap-3">
            <Button
              type="button"
              variant="ghost"
              onClick={goBack}
              disabled={stepIndex === 0}
              className="gap-2"
            >
              <ArrowLeft className="h-4 w-4" />
              Back
            </Button>
            <Button
              type="button"
              size="lg"
              onClick={() => void goNext()}
              disabled={saving}
              className="gap-2"
            >
              {stepIndex >= path.length - 1 ? (
                <>
                  Finish
                  <Check className="h-4 w-4" />
                </>
              ) : (
                <>
                  Next
                  <ArrowRight className="h-4 w-4" />
                </>
              )}
            </Button>
          </div>

          <p className="mt-8 text-center text-xs text-muted-foreground">
            Enter to continue · letters select choices · Esc not needed
          </p>
        </div>
      </main>
    </div>
  );
}
