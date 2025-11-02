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
  <div class="field">
    <label>Name</label>
    <input bind:value={name} placeholder="E.g., Westgate" />
  </div>
  <div class="field">
    <label>World</label>
    <input bind:value={world} />
  </div>

  <div class="row">
    <div class="field">
      <label>Tier</label>
      <input type="number" bind:value={tier} min="0" />
    </div>
    {#if isSub}
      <div class="field">
        <label>Parent ID</label>
        <input bind:value={parentId} placeholder="loc_parent_..." />
      </div>
    {/if}
  </div>

  <div class="field">
    <label>Aliases (comma-separated)</label>
    <input bind:value={aliasesRaw} placeholder="Old Gate, West Gate" />
  </div>

  <div class="actions">
    <button on:click={submit} disabled={!name}>Create</button>
  </div>
</div>

<style>
  .field { margin: 8px 0; display: flex; flex-direction: column; }
  .row { display: flex; gap: 12px; }
  .actions { margin-top: 12px; display: flex; gap: 8px; justify-content: flex-end; }
  input { padding: 6px 8px; }
  h2 { margin: 0 0 8px; }
</style>
