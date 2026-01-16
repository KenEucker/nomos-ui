<script lang="ts">
  import type { ZodSchema } from "zod"
  import { Input } from "../ui/input"
  import { Textarea } from "../ui/textarea"
  import { Button } from "../ui/button"
  import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "../ui/card"
  import RelationSelect from "./RelationSelect.svelte"
  import LookupDialog from "./LookupDialog.svelte"

  export type FormField = {
    name: string
    label: string
    type: "text" | "textarea" | "email" | "password" | "relation" | "multiselect" | "lookup"
    placeholder?: string
    helperText?: string
    loadOptions?: (search: string) => Promise<Array<{ value: string; label: string }>>
    options?: Array<{ value: string; label: string }>
    lookup?: {
      title: string
      description?: string
      submitLabel?: string
      fields: Array<{ name: string; label: string; type?: "text" | "email" }>
      onLookup: (values: Record<string, any>) => Promise<Record<string, any>>
      applyResult: (result: Record<string, any>) => Record<string, any>
    }
  }

  export let id: string
  export let title: string | undefined = undefined
  export let description: string | undefined = undefined
  export let schema: ZodSchema
  export let fields: FormField[] = []
  export let submitLabel = "Save"
  export let initialValues: Record<string, any> = {}
  export let onSubmit: (values: Record<string, any>) => Promise<void> | void

  let values: Record<string, any> = { ...initialValues }
  let fieldErrors: Record<string, string> = {}
  let formError: string | null = null
  let submitting = false

  const validate = () => {
    const result = schema.safeParse(values)
    if (result.success) {
      fieldErrors = {}
      formError = null
      return true
    }

    const nextErrors: Record<string, string> = {}
    for (const issue of result.error.issues) {
      if (issue.path.length) {
        nextErrors[issue.path.join(".")] = issue.message
      }
    }

    fieldErrors = nextErrors
    formError = "Please fix the errors below."
    return false
  }

  const updateValue = (name: string, next: any) => {
    values = { ...values, [name]: next }
  }

  const updateValues = (next: Record<string, any>) => {
    values = { ...values, ...next }
  }

  const submit = async () => {
    if (!validate()) return
    submitting = true
    formError = null
    try {
      await onSubmit(values)
    } catch (err: any) {
      formError = err?.message ?? "Submission failed"
    } finally {
      submitting = false
    }
  }
</script>

<Card>
  {#if title || description}
    <CardHeader>
      {#if title}
        <CardTitle>{title}</CardTitle>
      {/if}
      {#if description}
        <CardDescription>{description}</CardDescription>
      {/if}
    </CardHeader>
  {/if}

  <CardContent class="space-y-4">
    {#if formError}
      <div class="rounded-md border border-destructive/30 bg-destructive/10 p-3 text-sm text-destructive">
        {formError}
      </div>
    {/if}

    {#each fields as field (field.name)}
      <div class="space-y-2">
        <label class="text-sm font-medium" for={`${id}-${field.name}`}>{field.label}</label>

        {#if field.type === "textarea"}
          <Textarea
            id={`${id}-${field.name}`}
            placeholder={field.placeholder}
            value={values[field.name] ?? ""}
            oninput={(e) => updateValue(field.name, (e.currentTarget as HTMLTextAreaElement).value)}
          />
        {:else if field.type === "relation" || field.type === "multiselect"}
          <RelationSelect
            label=""
            multiple={field.type === "multiselect"}
            value={values[field.name] ?? (field.type === "multiselect" ? [] : null)}
            placeholder={field.placeholder ?? "Search…"}
            loadOptions={field.loadOptions!}
            onChange={(next) => updateValue(field.name, next)}
          />
        {:else if field.type === "lookup" && field.lookup}
          <div class="space-y-2">
            <Input id={`${id}-${field.name}`} readonly value={values[field.name] ?? ""} />
            <div class="flex items-center justify-between gap-3 rounded-md border p-3">
              <div class="text-sm text-muted-foreground">
                {field.helperText ?? "Use the lookup to populate this field."}
              </div>
              <LookupDialog
                title={field.lookup.title}
                description={field.lookup.description}
                submitLabel={field.lookup.submitLabel ?? "Run lookup"}
                fields={field.lookup.fields}
                onLookup={field.lookup.onLookup}
                onApply={(result) => updateValues(field.lookup!.applyResult(result))}
              />
            </div>
          </div>
        {:else}
          <Input
            id={`${id}-${field.name}`}
            type={field.type}
            placeholder={field.placeholder}
            value={values[field.name] ?? ""}
            oninput={(e) => updateValue(field.name, (e.currentTarget as HTMLInputElement).value)}
          />
        {/if}

        {#if field.helperText}
          <div class="text-xs text-muted-foreground">{field.helperText}</div>
        {/if}

        {#if fieldErrors[field.name]}
          <div class="text-xs text-destructive">{fieldErrors[field.name]}</div>
        {/if}
      </div>
    {/each}

    <div class="flex justify-end">
      <Button onclick={submit} disabled={submitting}>
        {submitting ? "Saving…" : submitLabel}
      </Button>
    </div>
  </CardContent>
</Card>
