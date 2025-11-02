import { App, PluginSettingTab, Setting } from "obsidian";

export interface NodeQuestPluginSettings {
	defaultWorld: string;
	basePath: string;
}

export const DEFAULT_SETTINGS: NodeQuestPluginSettings = {
	defaultWorld: "MyWorld",
	basePath: "Worlds",
};

export class NodeQuestSettingTab extends PluginSettingTab {
	plugin: any;
	constructor(app: App, plugin: any) {
		super(app, plugin);
		this.plugin = plugin;
	}
	display(): void {
		const { containerEl } = this;
		containerEl.empty();
		new Setting(containerEl).setName("Default world").addText((t) =>
			t
				.setPlaceholder("MyWorld")
				.setValue(this.plugin.settings.defaultWorld)
				.onChange(async (v) => {
					this.plugin.settings.defaultWorld = v || "MyWorld";
					await this.plugin.saveSettings();
				}),
		);
		new Setting(containerEl)
			.setName("Base path")
			.setDesc("Root folder where worlds are stored")
			.addText((t) =>
				t
					.setPlaceholder("Worlds")
					.setValue(this.plugin.settings.basePath)
					.onChange(async (v) => {
						this.plugin.settings.basePath = v || "Worlds";
						await this.plugin.saveSettings();
					}),
			);
	}
}
