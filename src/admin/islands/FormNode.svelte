<script lang="ts">
  import type { FieldDef, MethodAction } from "../types"

  export let key: string
  export let fields: FieldDef[] = []
  export let submit: MethodAction
  export let onMethodAction: (action: MethodAction, payload?: Record<string, any>) => void

  let values: Record<string, any> = {}

  const handleSubmit = (event: Event) => {
    event.preventDefault()
    onMethodAction(submit, { ...values })
  }
</script>

<form class="space-y-4" on:submit={handleSubmit}>
  {#each fields as field (field.name)}
    <div class="space-y-1">
      <label class="text-sm font-medium text-foreground" for={`${key}-${field.name}`}
        >{field.label}</label
      >
      {#if field.type === "textarea"}
        <textarea
          id={`${key}-${field.name}`}
          class="min-h-[100px] w-full rounded-md border bg-background px-3 py-2 text-sm"
          placeholder={field.placeholder}
          bind:value={values[field.name]}
        ></textarea>
      {:else}
        <input
          id={`${key}-${field.name}`}
          class="h-10 w-full rounded-md border bg-background px-3 text-sm"
          type={field.type}
          placeholder={field.placeholder}
          bind:value={values[field.name]}
        />
      {/if}
    </div>
  {/each}
  <button class="rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground" type="submit">
    {submit.label}
  </button>
</form>
