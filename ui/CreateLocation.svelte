<script lang="ts">
  export let defaultWorld: string;
  export let isSub: boolean = false;
  export let onSubmit: (data: {
    name: string;
    world: string;
    parentId?: string | null;
    tier: number;
    aliases?: string[];
  }) => void;

  let name = "";
  let world = defaultWorld;
  let tier = isSub ? 2 : 1;
  let parentId: string | null = null;
  let aliasesRaw = "";

  function submit() {
    onSubmit({
      name,
      world,
      parentId: isSub ? parentId : null,
      tier,
      aliases: aliasesRaw.split(",").map(s => s.trim()).filter(Boolean)
    });
  }
</script>

<div class="p-4">
  <h2>Create {isSub ? "Sub-location" : "Location"}</h2>
  <label class="field">
    <span>Name</span>
    <input bind:value={name} placeholder="E.g., Westgate" />
  </label>
  <label class="field">
    <span>World</span>
    <input bind:value={world} />
  </label>

  <div class="row">
    <label class="field">
      <span>Tier</span>
      <input type="number" bind:value={tier} min="0" />
    </label>
    {#if isSub}
      <label class="field">
        <span>Parent ID</span>
        <input bind:value={parentId} placeholder="loc_parent_..." />
      </label>
    {/if}
  </div>

  <label class="field">
    <span>Aliases (comma-separated)</span>
    <input bind:value={aliasesRaw} placeholder="Old Gate, West Gate" />
  </label>

  <div class="actions">
    <button on:click={submit} disabled={!name}>Create</button>
  </div>
</div>

<style>
  .field { margin: 8px 0; display: flex; flex-direction: column; gap: 4px; }
  .row { display: flex; gap: 12px; }
  .actions { margin-top: 12px; display: flex; gap: 8px; justify-content: flex-end; }
  input { padding: 6px 8px; }
  h2 { margin: 0 0 8px; }
</style>
