<script lang="ts">
  import { z } from "zod"
  import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "../../components/ui/card"
  import { Button } from "../../components/ui/button"
  import { Input } from "../../components/ui/input"
  import { Textarea } from "../../components/ui/textarea"
  import { Checkbox } from "../../components/ui/checkbox"
  import { NativeSelect, NativeSelectOption } from "../../components/ui/native-select"
  import type { FieldDef } from "../lib/types"

  export let id: string
  export let title: string | undefined = undefined
  export let description: string | undefined = undefined
  export let schema: { safeParse: (values: Record<string, any>) => { success: boolean; error?: any } } | undefined = undefined
  export let fields: FieldDef[] = []
  export let submitLabel: string | undefined = undefined
  export let submitEndpoint: string
  export let submitMethod: "POST" | "PUT" | "PATCH" | undefined = undefined
  export let initialValuesKey: string | undefined = undefined
  export let after: "refresh" | "navigate" | undefined = undefined
  export let redirectTo: string | undefined = undefined
  export let data: Record<string, any> = {}
  export let onRefresh: () => void

  const fallbackSchema = z.object(
    fields.reduce<Record<string, z.ZodTypeAny>>((acc, field) => {
      const base = field.type === "checkbox" ? z.boolean() : z.string()
      acc[field.name] = field.required ? base : base.optional()
      return acc
    }, {})
  )

  let values: Record<string, any> = {}
  let fieldErrors: Record<string, string> = {}
  let formError: string | null = null
  let submitting = false

  $: values = { ...values, ...(initialValuesKey ? data?.[initialValuesKey] ?? {} : {}) }

  const validate = () => {
    const activeSchema = schema?.safeParse ? schema : fallbackSchema
    const result = activeSchema.safeParse(values)
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

  const submit = async () => {
    if (!validate()) return
    submitting = true
    formError = null
    try {
      const response = await fetch(submitEndpoint, {
        method: submitMethod ?? "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify(values),
      })

      if (!response.ok) {
        throw new Error(`Request failed with status ${response.status}`)
      }

      if (after === "navigate" && redirectTo) {
        window.location.href = redirectTo
        return
      }

      if (after === "refresh") {
        onRefresh()
      }
    } catch (err) {
      formError = err instanceof Error ? err.message : "Submission failed"
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
        {:else if field.type === "checkbox"}
          <div class="flex items-center gap-2">
            <Checkbox
              id={`${id}-${field.name}`}
              checked={Boolean(values[field.name])}
              onCheckedChange={(checked: boolean) => updateValue(field.name, Boolean(checked))}
            />
            {#if field.helperText}
              <div class="text-xs text-muted-foreground">{field.helperText}</div>
            {/if}
          </div>
        {:else if field.type === "select"}
          <NativeSelect
            id={`${id}-${field.name}`}
            value={values[field.name] ?? ""}
            onchange={(event) => updateValue(field.name, (event.currentTarget as HTMLSelectElement).value)}
          >
            <NativeSelectOption value="">Select {field.label}</NativeSelectOption>
            {#each field.options ?? [] as option (option.value)}
              <NativeSelectOption value={option.value}>{option.label}</NativeSelectOption>
            {/each}
          </NativeSelect>
        {:else}
          <Input
            id={`${id}-${field.name}`}
            type={field.type === "email" ? "email" : field.type === "password" ? "password" : "text"}
            placeholder={field.placeholder}
            value={values[field.name] ?? ""}
            oninput={(e) => updateValue(field.name, (e.currentTarget as HTMLInputElement).value)}
          />
        {/if}

        {#if field.helperText && field.type !== "checkbox"}
          <div class="text-xs text-muted-foreground">{field.helperText}</div>
        {/if}

        {#if fieldErrors[field.name]}
          <div class="text-xs text-destructive">{fieldErrors[field.name]}</div>
        {/if}
      </div>
    {/each}

    <div class="flex justify-end">
      <Button onclick={submit} disabled={submitting}>
        {submitting ? "Saving…" : submitLabel ?? "Save"}
      </Button>
    </div>
  </CardContent>
</Card>
