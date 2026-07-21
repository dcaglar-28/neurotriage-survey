import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  createTemplateSchema,
  type CreateTemplateInput,
} from "@/lib/validations/schemas";

export function CreateTemplateForm({
  onCreated,
  onCancel,
}: {
  onCreated: (id: string) => void;
  onCancel: () => void;
}) {
  const form = useForm<CreateTemplateInput>({
    resolver: zodResolver(createTemplateSchema),
    defaultValues: { title: "", description: "" },
  });

  async function onSubmit(values: CreateTemplateInput) {
    const res = await fetch("/api/templates", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(values),
    });
    const data = await res.json();
    if (!res.ok) {
      form.setError("title", { message: "Could not create template" });
      return;
    }
    onCreated(data.template.id);
  }

  return (
    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
      <div>
        <Input placeholder="Template title" {...form.register("title")} />
        {form.formState.errors.title && (
          <p className="mt-1 text-sm text-destructive">
            {form.formState.errors.title.message}
          </p>
        )}
      </div>
      <Textarea
        placeholder="Description"
        {...form.register("description")}
      />
      <div className="flex gap-2">
        <Button type="submit" disabled={form.formState.isSubmitting}>
          Create
        </Button>
        <Button type="button" variant="ghost" onClick={onCancel}>
          Cancel
        </Button>
      </div>
    </form>
  );
}
