"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import {
  Eye,
  GripVertical,
  Plus,
  Save,
  Trash2,
} from "lucide-react";
import type {
  BranchAction,
  BranchOperator,
  BranchRule,
  Question,
  QuestionType,
  Section,
  Template,
} from "@/lib/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

const QUESTION_TYPES: { value: QuestionType; label: string }[] = [
  { value: "short_text", label: "Short text" },
  { value: "long_text", label: "Long text" },
  { value: "multiple_choice", label: "Multiple choice" },
  { value: "multiple_select", label: "Multiple select" },
  { value: "dropdown", label: "Dropdown" },
  { value: "yes_no", label: "Yes / No" },
  { value: "rating", label: "Rating" },
];

function newId(prefix: string) {
  return `${prefix}_${crypto.randomUUID()}`;
}

function SortableQuestion({
  question,
  selected,
  onSelect,
}: {
  question: Question;
  selected: boolean;
  onSelect: () => void;
}) {
  const { attributes, listeners, setNodeRef, transform, transition } =
    useSortable({ id: question.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`flex items-center gap-2 rounded-lg border px-3 py-2 ${
        selected ? "border-primary bg-primary/5" : "border-border bg-card"
      }`}
    >
      <button
        type="button"
        className="cursor-grab text-muted-foreground active:cursor-grabbing"
        {...attributes}
        {...listeners}
      >
        <GripVertical className="h-4 w-4" />
      </button>
      <button
        type="button"
        onClick={onSelect}
        className="min-w-0 flex-1 text-left"
      >
        <p className="truncate text-sm font-medium">{question.title}</p>
        <p className="text-xs text-muted-foreground">
          {question.key} · {question.type}
          {question.repeatSourceQuestionId ? " · repeat" : ""}
        </p>
      </button>
    </div>
  );
}

export function TemplateEditor({ initial }: { initial: Template }) {
  const [template, setTemplate] = useState(initial);
  const [selectedId, setSelectedId] = useState<string | null>(
    initial.questions[0]?.id ?? null
  );
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const sortedQuestions = useMemo(
    () => [...template.questions].sort((a, b) => a.orderIndex - b.orderIndex),
    [template.questions]
  );

  const selected = sortedQuestions.find((q) => q.id === selectedId) ?? null;

  function updateQuestion(id: string, patch: Partial<Question>) {
    setTemplate((prev) => ({
      ...prev,
      questions: prev.questions.map((q) =>
        q.id === id ? { ...q, ...patch } : q
      ),
    }));
  }

  function onDragEnd(event: DragEndEvent) {
    const { active, over } = event;
    if (!over || active.id === over.id) return;
    const oldIndex = sortedQuestions.findIndex((q) => q.id === active.id);
    const newIndex = sortedQuestions.findIndex((q) => q.id === over.id);
    const moved = arrayMove(sortedQuestions, oldIndex, newIndex).map(
      (q, i) => ({ ...q, orderIndex: i })
    );
    setTemplate((prev) => ({ ...prev, questions: moved }));
  }

  function addQuestion() {
    const orderIndex = template.questions.length;
    const question: Question = {
      id: newId("ques"),
      templateId: template.id,
      sectionId: template.sections[0]?.id ?? null,
      key: `question_${orderIndex + 1}`,
      type: "short_text",
      title: "New question",
      description: null,
      required: true,
      orderIndex,
      config: {},
      repeatSourceQuestionId: null,
      options: [],
    };
    setTemplate((prev) => ({
      ...prev,
      questions: [...prev.questions, question],
    }));
    setSelectedId(question.id);
  }

  function deleteQuestion(id: string) {
    setTemplate((prev) => ({
      ...prev,
      questions: prev.questions
        .filter((q) => q.id !== id)
        .map((q, i) => ({ ...q, orderIndex: i })),
      branchRules: prev.branchRules.filter(
        (r) => r.sourceQuestionId !== id && r.targetQuestionId !== id
      ),
    }));
    setSelectedId(null);
  }

  function addOption() {
    if (!selected) return;
    const options = [
      ...selected.options,
      {
        id: newId("opt"),
        questionId: selected.id,
        label: `Option ${selected.options.length + 1}`,
        value: `option_${selected.options.length + 1}`,
        orderIndex: selected.options.length,
      },
    ];
    updateQuestion(selected.id, { options });
  }

  function addSection() {
    const section: Section = {
      id: newId("sect"),
      templateId: template.id,
      title: `Section ${template.sections.length + 1}`,
      description: null,
      orderIndex: template.sections.length,
    };
    setTemplate((prev) => ({
      ...prev,
      sections: [...prev.sections, section],
    }));
  }

  function addBranchRule() {
    const source = sortedQuestions[0];
    if (!source) return;
    const rule: BranchRule = {
      id: newId("rule"),
      templateId: template.id,
      sourceQuestionId: source.id,
      operator: "equals",
      value: "",
      targetQuestionId: sortedQuestions[1]?.id ?? null,
      action: "hide",
      priority: template.branchRules.length,
    };
    setTemplate((prev) => ({
      ...prev,
      branchRules: [...prev.branchRules, rule],
    }));
  }

  async function save() {
    setSaving(true);
    setMessage(null);
    try {
      const res = await fetch(`/api/templates/${template.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: template.title,
          description: template.description,
          slug: template.slug,
          status: template.status,
          thankYouMessage: template.thankYouMessage,
          sections: template.sections,
          questions: template.questions,
          branchRules: template.branchRules,
        }),
      });
      if (!res.ok) throw new Error("Save failed");
      const data = await res.json();
      setTemplate(data.template);
      setMessage("Saved");
    } catch {
      setMessage("Could not save");
    } finally {
      setSaving(false);
    }
  }

  async function setStatus(status: Template["status"]) {
    setTemplate((prev) => ({ ...prev, status }));
    await fetch(`/api/templates/${template.id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status }),
    });
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div className="min-w-0 flex-1 space-y-3">
          <Input
            value={template.title}
            onChange={(e) =>
              setTemplate((prev) => ({ ...prev, title: e.target.value }))
            }
            className="h-auto border-0 bg-transparent px-0 text-3xl font-semibold shadow-none focus-visible:ring-0"
          />
          <Textarea
            value={template.description ?? ""}
            onChange={(e) =>
              setTemplate((prev) => ({
                ...prev,
                description: e.target.value,
              }))
            }
            className="min-h-[60px] resize-none border-0 bg-transparent px-0 shadow-none focus-visible:ring-0"
            placeholder="Description"
          />
          <div className="flex flex-wrap items-center gap-2">
            <Badge
              variant={
                template.status === "published" ? "success" : "warning"
              }
            >
              {template.status}
            </Badge>
            <span className="text-xs text-muted-foreground">
              /{template.slug}
            </span>
          </div>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button asChild variant="outline" className="gap-1.5">
            <Link href={`/admin/templates/${template.id}/preview`} target="_blank">
              <Eye className="h-4 w-4" />
              Preview
            </Link>
          </Button>
          <Button
            variant="outline"
            onClick={() =>
              void setStatus(
                template.status === "published" ? "draft" : "published"
              )
            }
          >
            {template.status === "published" ? "Unpublish" : "Publish"}
          </Button>
          <Button onClick={() => void save()} disabled={saving} className="gap-1.5">
            <Save className="h-4 w-4" />
            {saving ? "Saving…" : "Save"}
          </Button>
        </div>
      </div>
      {message && <p className="text-sm text-muted-foreground">{message}</p>}

      <Tabs defaultValue="questions">
        <TabsList>
          <TabsTrigger value="questions">Questions</TabsTrigger>
          <TabsTrigger value="branches">Branching</TabsTrigger>
          <TabsTrigger value="sections">Sections</TabsTrigger>
          <TabsTrigger value="settings">Settings</TabsTrigger>
        </TabsList>

        <TabsContent value="questions">
          <div className="grid gap-6 lg:grid-cols-[320px_1fr]">
            <Card>
              <CardHeader className="flex-row items-center justify-between space-y-0 pb-3">
                <CardTitle className="text-base">Order</CardTitle>
                <Button size="sm" variant="outline" onClick={addQuestion}>
                  <Plus className="h-4 w-4" />
                </Button>
              </CardHeader>
              <CardContent className="space-y-2">
                <DndContext
                  sensors={sensors}
                  collisionDetection={closestCenter}
                  onDragEnd={onDragEnd}
                >
                  <SortableContext
                    items={sortedQuestions.map((q) => q.id)}
                    strategy={verticalListSortingStrategy}
                  >
                    {sortedQuestions.map((q) => (
                      <SortableQuestion
                        key={q.id}
                        question={q}
                        selected={q.id === selectedId}
                        onSelect={() => setSelectedId(q.id)}
                      />
                    ))}
                  </SortableContext>
                </DndContext>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-base">
                  {selected ? "Edit question" : "Select a question"}
                </CardTitle>
                <CardDescription>
                  Question types, options, and repeat loops are editable without code.
                </CardDescription>
              </CardHeader>
              <CardContent>
                {!selected ? (
                  <p className="text-sm text-muted-foreground">
                    Choose a question from the list.
                  </p>
                ) : (
                  <div className="space-y-4">
                    <div className="grid gap-4 sm:grid-cols-2">
                      <div className="space-y-2">
                        <Label>Key</Label>
                        <Input
                          value={selected.key}
                          onChange={(e) =>
                            updateQuestion(selected.id, { key: e.target.value })
                          }
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>Type</Label>
                        <Select
                          value={selected.type}
                          onValueChange={(v) =>
                            updateQuestion(selected.id, {
                              type: v as QuestionType,
                            })
                          }
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {QUESTION_TYPES.map((t) => (
                              <SelectItem key={t.value} value={t.value}>
                                {t.label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label>Title</Label>
                      <Textarea
                        value={selected.title}
                        onChange={(e) =>
                          updateQuestion(selected.id, { title: e.target.value })
                        }
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Description</Label>
                      <Textarea
                        value={selected.description ?? ""}
                        onChange={(e) =>
                          updateQuestion(selected.id, {
                            description: e.target.value || null,
                          })
                        }
                      />
                    </div>
                    <div className="grid gap-4 sm:grid-cols-2">
                      <div className="space-y-2">
                        <Label>Section</Label>
                        <Select
                          value={selected.sectionId ?? "none"}
                          onValueChange={(v) =>
                            updateQuestion(selected.id, {
                              sectionId: v === "none" ? null : v,
                            })
                          }
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="none">None</SelectItem>
                            {template.sections.map((s) => (
                              <SelectItem key={s.id} value={s.id}>
                                {s.title}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-2">
                        <Label>Repeat for options of</Label>
                        <Select
                          value={selected.repeatSourceQuestionId ?? "none"}
                          onValueChange={(v) =>
                            updateQuestion(selected.id, {
                              repeatSourceQuestionId:
                                v === "none" ? null : v,
                            })
                          }
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="none">Not a repeat</SelectItem>
                            {sortedQuestions
                              .filter(
                                (q) =>
                                  q.id !== selected.id &&
                                  (q.type === "multiple_select" ||
                                    q.type === "multiple_choice")
                              )
                              .map((q) => (
                                <SelectItem key={q.id} value={q.id}>
                                  {q.title}
                                </SelectItem>
                              ))}
                          </SelectContent>
                        </Select>
                      </div>
                    </div>

                    {selected.type === "rating" && (
                      <div className="space-y-2">
                        <Label>Rating max</Label>
                        <Select
                          value={String(selected.config.ratingMax ?? 5)}
                          onValueChange={(v) =>
                            updateQuestion(selected.id, {
                              config: {
                                ...selected.config,
                                ratingMax: Number(v) as 5 | 10,
                              },
                            })
                          }
                        >
                          <SelectTrigger className="w-40">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="5">1–5</SelectItem>
                            <SelectItem value="10">1–10</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    )}

                    {selected.type === "dropdown" && (
                      <div className="space-y-2">
                        <Label>Options from question key</Label>
                        <Input
                          value={selected.config.optionsFromQuestionKey ?? ""}
                          placeholder="e.g. devices_routine"
                          onChange={(e) =>
                            updateQuestion(selected.id, {
                              config: {
                                ...selected.config,
                                optionsFromQuestionKey:
                                  e.target.value || undefined,
                              },
                            })
                          }
                        />
                      </div>
                    )}

                    {[
                      "multiple_choice",
                      "multiple_select",
                      "dropdown",
                    ].includes(selected.type) &&
                      !selected.config.optionsFromQuestionKey && (
                        <div className="space-y-3">
                          <div className="flex items-center justify-between">
                            <Label>Options</Label>
                            <Button
                              type="button"
                              size="sm"
                              variant="outline"
                              onClick={addOption}
                            >
                              Add option
                            </Button>
                          </div>
                          {selected.options.map((opt, idx) => (
                            <div key={opt.id} className="grid gap-2 sm:grid-cols-2">
                              <Input
                                value={opt.label}
                                onChange={(e) => {
                                  const options = selected.options.map((o) =>
                                    o.id === opt.id
                                      ? { ...o, label: e.target.value }
                                      : o
                                  );
                                  updateQuestion(selected.id, { options });
                                }}
                                placeholder="Label"
                              />
                              <div className="flex gap-2">
                                <Input
                                  value={opt.value}
                                  onChange={(e) => {
                                    const options = selected.options.map((o) =>
                                      o.id === opt.id
                                        ? { ...o, value: e.target.value }
                                        : o
                                    );
                                    updateQuestion(selected.id, { options });
                                  }}
                                  placeholder="Value"
                                />
                                <Button
                                  type="button"
                                  size="icon"
                                  variant="ghost"
                                  onClick={() => {
                                    const options = selected.options
                                      .filter((o) => o.id !== opt.id)
                                      .map((o, i) => ({ ...o, orderIndex: i }));
                                    updateQuestion(selected.id, { options });
                                  }}
                                >
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              </div>
                              <span className="sr-only">{idx}</span>
                            </div>
                          ))}
                        </div>
                      )}

                    <div className="flex justify-between border-t pt-4">
                      <label className="flex items-center gap-2 text-sm">
                        <input
                          type="checkbox"
                          checked={selected.required}
                          onChange={(e) =>
                            updateQuestion(selected.id, {
                              required: e.target.checked,
                            })
                          }
                        />
                        Required
                      </label>
                      <Button
                        type="button"
                        variant="destructive"
                        size="sm"
                        onClick={() => deleteQuestion(selected.id)}
                      >
                        Delete question
                      </Button>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="branches">
          <Card>
            <CardHeader className="flex-row items-center justify-between">
              <div>
                <CardTitle>Branching rules</CardTitle>
                <CardDescription>
                  Visually configure hide / show / goto / end based on answers.
                </CardDescription>
              </div>
              <Button onClick={addBranchRule} className="gap-1.5">
                <Plus className="h-4 w-4" />
                Add rule
              </Button>
            </CardHeader>
            <CardContent className="space-y-4">
              {template.branchRules.length === 0 && (
                <p className="text-sm text-muted-foreground">
                  No rules yet. Adaptive paths use hide/show rules stored in the database.
                </p>
              )}
              {template.branchRules.map((rule) => (
                <div
                  key={rule.id}
                  className="grid gap-3 rounded-xl border p-4 md:grid-cols-5"
                >
                  <div className="space-y-1">
                    <Label className="text-xs">When question</Label>
                    <Select
                      value={rule.sourceQuestionId}
                      onValueChange={(v) =>
                        setTemplate((prev) => ({
                          ...prev,
                          branchRules: prev.branchRules.map((r) =>
                            r.id === rule.id
                              ? { ...r, sourceQuestionId: v }
                              : r
                          ),
                        }))
                      }
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {sortedQuestions.map((q) => (
                          <SelectItem key={q.id} value={q.id}>
                            {q.title}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-1">
                    <Label className="text-xs">Operator</Label>
                    <Select
                      value={rule.operator}
                      onValueChange={(v) =>
                        setTemplate((prev) => ({
                          ...prev,
                          branchRules: prev.branchRules.map((r) =>
                            r.id === rule.id
                              ? { ...r, operator: v as BranchOperator }
                              : r
                          ),
                        }))
                      }
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {(
                          [
                            "equals",
                            "not_equals",
                            "contains",
                            "not_contains",
                            "is_answered",
                            "is_empty",
                          ] as BranchOperator[]
                        ).map((op) => (
                          <SelectItem key={op} value={op}>
                            {op}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-1">
                    <Label className="text-xs">Value</Label>
                    <Input
                      value={rule.value ?? ""}
                      onChange={(e) =>
                        setTemplate((prev) => ({
                          ...prev,
                          branchRules: prev.branchRules.map((r) =>
                            r.id === rule.id
                              ? { ...r, value: e.target.value }
                              : r
                          ),
                        }))
                      }
                    />
                  </div>
                  <div className="space-y-1">
                    <Label className="text-xs">Action</Label>
                    <Select
                      value={rule.action}
                      onValueChange={(v) =>
                        setTemplate((prev) => ({
                          ...prev,
                          branchRules: prev.branchRules.map((r) =>
                            r.id === rule.id
                              ? { ...r, action: v as BranchAction }
                              : r
                          ),
                        }))
                      }
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {(
                          ["hide", "show", "goto", "end"] as BranchAction[]
                        ).map((a) => (
                          <SelectItem key={a} value={a}>
                            {a}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-1">
                    <Label className="text-xs">Target</Label>
                    <div className="flex gap-2">
                      <Select
                        value={rule.targetQuestionId ?? "none"}
                        onValueChange={(v) =>
                          setTemplate((prev) => ({
                            ...prev,
                            branchRules: prev.branchRules.map((r) =>
                              r.id === rule.id
                                ? {
                                    ...r,
                                    targetQuestionId:
                                      v === "none" ? null : v,
                                  }
                                : r
                            ),
                          }))
                        }
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="none">None</SelectItem>
                          {sortedQuestions.map((q) => (
                            <SelectItem key={q.id} value={q.id}>
                              {q.title}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <Button
                        type="button"
                        size="icon"
                        variant="ghost"
                        onClick={() =>
                          setTemplate((prev) => ({
                            ...prev,
                            branchRules: prev.branchRules.filter(
                              (r) => r.id !== rule.id
                            ),
                          }))
                        }
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="sections">
          <Card>
            <CardHeader className="flex-row items-center justify-between">
              <CardTitle>Sections</CardTitle>
              <Button onClick={addSection} size="sm" variant="outline">
                Add section
              </Button>
            </CardHeader>
            <CardContent className="space-y-3">
              {template.sections
                .sort((a, b) => a.orderIndex - b.orderIndex)
                .map((section) => (
                  <div key={section.id} className="grid gap-2 rounded-lg border p-3 sm:grid-cols-2">
                    <Input
                      value={section.title}
                      onChange={(e) =>
                        setTemplate((prev) => ({
                          ...prev,
                          sections: prev.sections.map((s) =>
                            s.id === section.id
                              ? { ...s, title: e.target.value }
                              : s
                          ),
                        }))
                      }
                    />
                    <Input
                      value={section.description ?? ""}
                      placeholder="Description"
                      onChange={(e) =>
                        setTemplate((prev) => ({
                          ...prev,
                          sections: prev.sections.map((s) =>
                            s.id === section.id
                              ? { ...s, description: e.target.value || null }
                              : s
                          ),
                        }))
                      }
                    />
                  </div>
                ))}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="settings">
          <Card>
            <CardHeader>
              <CardTitle>Settings</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>Slug</Label>
                <Input
                  value={template.slug}
                  onChange={(e) =>
                    setTemplate((prev) => ({ ...prev, slug: e.target.value }))
                  }
                />
              </div>
              <div className="space-y-2">
                <Label>Thank you message</Label>
                <Textarea
                  value={template.thankYouMessage ?? ""}
                  onChange={(e) =>
                    setTemplate((prev) => ({
                      ...prev,
                      thankYouMessage: e.target.value,
                    }))
                  }
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
