import { App, Modal, Notice, Plugin } from "obsidian";
import CreateLocation from "./ui/CreateLocation.svelte";
import { DEFAULT_SETTINGS, type NodeQuestPluginSettings, NodeQuestSettingTab } from "./settings";
import { slugify } from "./utils/slug";
import { tsId } from "./utils/ids";

export default class NodeQuestPlugin extends Plugin {
  settings: NodeQuestPluginSettings;

  async onload() {
    await this.loadSettings();
    this.addSettingTab(new NodeQuestSettingTab(this.app, this));

    this.addCommand({
      id: "create-location",
      name: "World: Create Location",
      callback: () => this.openLocationModal(),
    });

    this.addCommand({
      id: "create-sublocation",
      name: "World: Create Sub-location",
      callback: () => this.openLocationModal({ isSub: true }),
    });

    this.addCommand({
      id: "create-npc",
      name: "World: Create NPC",
      callback: () => this.openNPCModal(),
    });

    this.addCommand({
      id: "create-faction",
      name: "World: Create Faction",
      callback: () => this.openFactionModal(),
    });
  }

  onunload() {}

  async loadSettings() {
    this.settings = Object.assign({}, DEFAULT_SETTINGS, await this.loadData());
  }

  async saveSettings() { await this.saveData(this.settings); }

  // ---- Modals ----
  openLocationModal(opts?: { isSub?: boolean }) {
    new SvelteModal(this.app, (container) => {
      const comp = new CreateLocation({
        target: container,
        props: {
          defaultWorld: this.settings.defaultWorld,
          isSub: !!opts?.isSub,
          onSubmit: (data: {
            name: string;
            world: string;
            parentId?: string | null;
            tier: number;
            aliases?: string[];
          }) => this.createLocation(data),
        },
      });
      return () => comp.$destroy();
    }).open();
  }

  openNPCModal() {
    new SvelteModal(this.app, (container) => {
      const comp = new CreateNPC({
        target: container,
        props: {
          defaultWorld: this.settings.defaultWorld,
          onSubmit: (data: {
            name: string;
            world: string;
            locationId?: string | null;
            factionIds?: string[];
            aliases?: string[];
          }) => this.createNPC(data),
        },
      });
      return () => comp.$destroy();
    }).open();
  }

  openFactionModal() {
    new SvelteModal(this.app, (container) => {
      const comp = new CreateFaction({
        target: container,
        props: {
          defaultWorld: this.settings.defaultWorld,
          onSubmit: (data: {
            name: string;
            world: string;
            locationId?: string | null;
            aliases?: string[];
          }) => this.createFaction(data),
        },
      });
      return () => comp.$destroy();
    }).open();
  }

  // ---- File creation helpers ----
  async ensureScaffold(world: string) {
    const base = this.settings.basePath;
    const dirs = [
      `${base}/${world}`,
      `${base}/${world}/Locations`,
      `${base}/${world}/NPCs`,
      `${base}/${world}/Factions`,
    ];
    for (const d of dirs) {
      if (!await this.app.vault.adapter.exists(d)) {
        await this.app.vault.createFolder(d);
      }
    }
  }

  private pathFor(world: string, kind: "location"|"npc"|"faction", slug: string) {
    const base = this.settings.basePath;
    const folder = kind === "location" ? "Locations" : kind === "npc" ? "NPCs" : "Factions";
    return `${base}/${world}/${folder}/${slug}.md`;
  }

  async createLocation({ name, world, parentId = null, tier, aliases = [] }: any) {
    const slug = slugify(name);
    const id = tsId("loc", slug);
    await this.ensureScaffold(world);

    const fm = [
      "---",
      `id: ${id}`,
      `type: location`,
      `title: "${name}"`,
      `parent: ${parentId ? `"${parentId}"` : "null"}`,
      `tier: ${tier ?? 1}`,
      `tags: ["ttrpg/location", "${world}"]`,
      `coords: { x: null, y: null, map: null }`,
      `children: []`,
      `world: "${world}"`,
      `aliases: [${aliases.map(a => `"${a}"`).join(", ")}]`,
      "---",
      "",
      "## Summary",
      "",
      "## Details",
      "",
      "## Sub-locations",
      "",
    ].join("\n");

    const filePath = this.pathFor(world, "location", slug);
    const file = await this.app.vault.create(filePath, fm);
    new Notice(`Created location: ${name}`);

    // optional: append child id to parent note
    if (parentId) await this.tryAppendChildToParent(parentId, id);

    await this.app.workspace.getLeaf(true).openFile(file);
  }

  async createNPC({ name, world, locationId = null, factionIds = [], aliases = [] }: any) {
    const slug = slugify(name);
    const id = tsId("npc", slug);
    await this.ensureScaffold(world);

    const fm = [
      "---",
      `id: ${id}`,
      `type: npc`,
      `title: "${name}"`,
      `world: "${world}"`,
      `location_id: ${locationId ? `"${locationId}"` : "null"}`,
      `faction_ids: [${(factionIds||[]).map((f: string) => `"${f}"`).join(", ")}]`,
      `tags: ["ttrpg/npc", "${world}"]`,
      `aliases: [${aliases.map((a: string) => `"${a}"`).join(", ")}]`,
      "---",
      "",
      "## Description",
      "",
      "## Hooks",
      "",
      "## Connections",
      "",
    ].join("\n");

    const filePath = this.pathFor(world, "npc", slug);
    const file = await this.app.vault.create(filePath, fm);
    new Notice(`Created NPC: ${name}`);
    await this.app.workspace.getLeaf(true).openFile(file);
  }

  async createFaction({ name, world, locationId = null, aliases = [] }: any) {
    const slug = slugify(name);
    const id = tsId("fac", slug);
    await this.ensureScaffold(world);

    const fm = [
      "---",
      `id: ${id}`,
      `type: faction`,
      `title: "${name}"`,
      `world: "${world}"`,
      `hq_location_id: ${locationId ? `"${locationId}"` : "null"}`,
      `tags: ["ttrpg/faction", "${world}"]`,
      `aliases: [${aliases.map((a: string) => `"${a}"`).join(", ")}]`,
      "---",
      "",
      "## Mandate",
      "",
      "## Assets",
      "",
      "## NPCs",
      "",
    ].join("\n");

    const filePath = this.pathFor(world, "faction", slug);
    const file = await this.app.vault.create(filePath, fm);
    new Notice(`Created faction: ${name}`);
    await this.app.workspace.getLeaf(true).openFile(file);
  }

  private async tryAppendChildToParent(parentId: string, childId: string) {
    // naive approach: search for file with frontmatter id == parentId
    const files = this.app.vault.getMarkdownFiles();
    for (const f of files) {
      const cache = this.app.metadataCache.getFileCache(f);
      // @ts-ignore
      const fm = cache?.frontmatter;
      if (fm?.id === parentId && fm?.type === "location") {
        const content = await this.app.vault.read(f);
        // update children array in frontmatter (simple regex replace)
        const updated = content.replace(
          /children:\s*\[(.*?)\]/s,
          (m, inner) => {
            const list = inner.trim().length ? inner.split(",").map(s => s.trim()) : [];
            if (!list.find(x => x.replace(/["']/g,"") === childId)) list.push(`"${childId}"`);
            return `children: [${list.join(", ")}]`;
          }
        );
        await this.app.vault.modify(f, updated);
        new Notice("Parent updated with child link");
        break;
      }
    }
  }
}

class SvelteModal extends Modal {
  private unmount?: () => void;
  private mountFn: (container: HTMLElement) => (() => void);
  constructor(app: App, mountFn: (container: HTMLElement) => (() => void)) {
    super(app);
    this.mountFn = mountFn;
  }
  onOpen() { this.unmount = this.mountFn(this.contentEl); }
  onClose() { this.contentEl.empty(); this.unmount?.(); }
}

