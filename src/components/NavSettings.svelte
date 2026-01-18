<script lang="ts">
  import { Button } from "$ui/button"
  import { Switch } from "$ui/switch"
  import type { NavPreferences } from "$lib/navPreferences"
  import ArrowLeftIcon from "@lucide/svelte/icons/arrow-left"
  import CheckIcon from "@lucide/svelte/icons/check"
  import PanelLeftIcon from "@lucide/svelte/icons/panel-left"
  import PanelRightIcon from "@lucide/svelte/icons/panel-right"
  import ArrowUpIcon from "@lucide/svelte/icons/arrow-up"
  import ArrowDownIcon from "@lucide/svelte/icons/arrow-down"
  import Rows3Icon from "@lucide/svelte/icons/rows-3"
  import HeadingIcon from "@lucide/svelte/icons/heading-1"
  import MessageCircleIcon from "@lucide/svelte/icons/message-circle"
  import MonitorIcon from "@lucide/svelte/icons/monitor"
  import SmartphoneIcon from "@lucide/svelte/icons/smartphone"
  import SparklesIcon from "@lucide/svelte/icons/sparkles"

  export let variant: "form" | "quick"
  export let saved: NavPreferences
  export let draft: NavPreferences
  export let onChange: (draft: NavPreferences) => void
  export let onSave: () => void
  export let onBack: () => void

  type BooleanKey =
    | "sidebarCollapsed"
    | "denseMode"
    | "showGroupHeadings"
    | "enableTooltips"
    | "reduceMotion"

  const toggles: Array<{
    key: BooleanKey
    label: string
    description: string
    icon: typeof Rows3Icon
  }> = [
    {
      key: "sidebarCollapsed",
      label: "Icon-only sidebar",
      description: "Collapse the menu to icons only.",
      icon: PanelLeftIcon,
    },
    {
      key: "denseMode",
      label: "Dense spacing",
      description: "Tighter spacing for menu items.",
      icon: Rows3Icon,
    },
    {
      key: "showGroupHeadings",
      label: "Group headings",
      description: "Show labels for navigation groups.",
      icon: HeadingIcon,
    },
    {
      key: "enableTooltips",
      label: "Icon tooltips",
      description: "Show tooltips in icon-only mode.",
      icon: MessageCircleIcon,
    },
    {
      key: "reduceMotion",
      label: "Reduce motion",
      description: "Disable menu animations.",
      icon: SparklesIcon,
    },
  ]

  const updateDraft = (next: Partial<NavPreferences>) => {
    onChange({ ...draft, ...next })
  }

  const toggleValue = (key: BooleanKey) => {
    updateDraft({ [key]: !draft[key] })
  }

  const toggleDesktopDock = () => {
    updateDraft({
      desktopDock: draft.desktopDock === "left" ? "right" : "left",
    })
  }

  const toggleMobileDock = () => {
    updateDraft({
      mobileDock: draft.mobileDock === "top" ? "bottom" : "top",
    })
  }

  $: isDirty = JSON.stringify(saved) !== JSON.stringify(draft)
</script>

<div class="flex h-full flex-col">
  <div class="flex items-center justify-between border-b border-border px-3 py-2">
    <Button variant="ghost" size="sm" on:click={onBack} aria-label="Back to navigation">
      <ArrowLeftIcon class="size-4" />
      <span class="text-sm">Back</span>
    </Button>
    <div class="text-sm font-semibold">Screen Settings</div>
    <Button
      variant="default"
      size="sm"
      on:click={onSave}
      aria-label="Save screen settings"
      title={isDirty ? "Save changes" : "No changes to save"}
    >
      <CheckIcon class="size-4" />
      <span class="text-sm">Save</span>
    </Button>
  </div>

  {#if variant === "form"}
    <div class="flex-1 space-y-4 overflow-y-auto px-3 py-4">
      <div class="space-y-3">
        <div class="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
          Docking
        </div>
        <div class="flex items-center justify-between gap-3 rounded-lg border border-border px-3 py-2">
          <div class="flex items-center gap-2">
            <MonitorIcon class="size-4 text-muted-foreground" />
            <span class="text-sm">Desktop dock</span>
          </div>
          <div class="flex items-center gap-2">
            <Button
              variant={draft.desktopDock === "left" ? "secondary" : "outline"}
              size="icon-sm"
              aria-label="Dock sidebar left"
              aria-pressed={draft.desktopDock === "left"}
              on:click={() => updateDraft({ desktopDock: "left" })}
            >
              <PanelLeftIcon class="size-4" />
            </Button>
            <Button
              variant={draft.desktopDock === "right" ? "secondary" : "outline"}
              size="icon-sm"
              aria-label="Dock sidebar right"
              aria-pressed={draft.desktopDock === "right"}
              on:click={() => updateDraft({ desktopDock: "right" })}
            >
              <PanelRightIcon class="size-4" />
            </Button>
          </div>
        </div>
        <div class="flex items-center justify-between gap-3 rounded-lg border border-border px-3 py-2">
          <div class="flex items-center gap-2">
            <SmartphoneIcon class="size-4 text-muted-foreground" />
            <span class="text-sm">Mobile dock</span>
          </div>
          <div class="flex items-center gap-2">
            <Button
              variant={draft.mobileDock === "top" ? "secondary" : "outline"}
              size="icon-sm"
              aria-label="Dock menu to top"
              aria-pressed={draft.mobileDock === "top"}
              on:click={() => updateDraft({ mobileDock: "top" })}
            >
              <ArrowUpIcon class="size-4" />
            </Button>
            <Button
              variant={draft.mobileDock === "bottom" ? "secondary" : "outline"}
              size="icon-sm"
              aria-label="Dock menu to bottom"
              aria-pressed={draft.mobileDock === "bottom"}
              on:click={() => updateDraft({ mobileDock: "bottom" })}
            >
              <ArrowDownIcon class="size-4" />
            </Button>
          </div>
        </div>
      </div>

      <div class="space-y-3">
        <div class="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
          Menu behavior
        </div>
        {#each toggles as toggle}
          <div class="flex items-center justify-between gap-3 rounded-lg border border-border px-3 py-2">
            <div class="flex items-start gap-3">
              <svelte:component this={toggle.icon} class="mt-0.5 size-4 text-muted-foreground" />
              <div>
                <div class="text-sm font-medium">{toggle.label}</div>
                <div class="text-xs text-muted-foreground">{toggle.description}</div>
              </div>
            </div>
            <Switch
              checked={draft[toggle.key]}
              aria-label={toggle.label}
              on:click={() => toggleValue(toggle.key)}
            />
          </div>
        {/each}
      </div>
    </div>
  {:else}
    <div class="flex-1 overflow-y-auto px-3 py-4">
      <div class="grid grid-cols-2 gap-3">
        <button
          type="button"
          class={
            draft.desktopDock === "left"
              ? "flex flex-col items-center gap-2 rounded-xl border border-border bg-accent px-3 py-4 text-sm font-medium"
              : "flex flex-col items-center gap-2 rounded-xl border border-border px-3 py-4 text-sm"
          }
          aria-label={`Desktop dock ${draft.desktopDock === "left" ? "left" : "right"}`}
          aria-pressed={draft.desktopDock === "left"}
          on:click={toggleDesktopDock}
        >
          {#if draft.desktopDock === "left"}
            <PanelLeftIcon class="size-5" />
          {:else}
            <PanelRightIcon class="size-5" />
          {/if}
          <span class="text-xs text-muted-foreground">Desktop dock</span>
        </button>
        <button
          type="button"
          class={
            draft.mobileDock === "top"
              ? "flex flex-col items-center gap-2 rounded-xl border border-border bg-accent px-3 py-4 text-sm font-medium"
              : "flex flex-col items-center gap-2 rounded-xl border border-border px-3 py-4 text-sm"
          }
          aria-label={`Mobile dock ${draft.mobileDock === "top" ? "top" : "bottom"}`}
          aria-pressed={draft.mobileDock === "top"}
          on:click={toggleMobileDock}
        >
          {#if draft.mobileDock === "top"}
            <ArrowUpIcon class="size-5" />
          {:else}
            <ArrowDownIcon class="size-5" />
          {/if}
          <span class="text-xs text-muted-foreground">Mobile dock</span>
        </button>
        {#each toggles as toggle}
          <button
            type="button"
            class={
              draft[toggle.key]
                ? "flex flex-col items-center gap-2 rounded-xl border border-border bg-accent px-3 py-4 text-sm font-medium"
                : "flex flex-col items-center gap-2 rounded-xl border border-border px-3 py-4 text-sm"
            }
            aria-label={toggle.label}
            aria-pressed={draft[toggle.key]}
            on:click={() => toggleValue(toggle.key)}
          >
            <svelte:component this={toggle.icon} class="size-5" />
            <span class="text-xs text-muted-foreground">{toggle.label}</span>
          </button>
        {/each}
      </div>
    </div>
  {/if}
</div>
