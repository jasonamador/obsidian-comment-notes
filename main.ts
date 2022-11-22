import { DateTime } from "luxon";
import {
	App,
	Editor,
	MarkdownView,
	Plugin,
	PluginSettingTab,
	Setting,
} from "obsidian";

// Remember to rename these classes and interfaces!

interface CommentNotesSettings {
	commentLocation: string;
}

const DEFAULT_SETTINGS: CommentNotesSettings = {
	commentLocation: "comments",
};

export default class MyPlugin extends Plugin {
	settings: CommentNotesSettings;

	async onload() {
		await this.loadSettings();

		// This adds a simple command that can be triggered anywhere
		this.addCommand({
			id: "create-comment-note",
			name: "Create comment note",
			editorCallback: (editor: Editor, view: MarkdownView) => {
				const selection = editor.getSelection();
				const commentFile = `${
					this.settings.commentLocation
				}/${DateTime.now().toFormat("yyyyMMddHHmm")}.md`;
				editor.replaceSelection(`[${selection}](<${commentFile}>)`);
				const data = `>${selection}\n`;
				this.app.vault.create(commentFile, data);
			},
		});

		// This adds a settings tab so the user can configure various aspects of the plugin
		this.addSettingTab(new CommentNotesSettingTab(this.app, this));
	}

	onunload() {}

	async loadSettings() {
		this.settings = Object.assign(
			{},
			DEFAULT_SETTINGS,
			await this.loadData()
		);
	}

	async saveSettings() {
		await this.saveData(this.settings);
	}
}

class CommentNotesSettingTab extends PluginSettingTab {
	plugin: MyPlugin;

	constructor(app: App, plugin: MyPlugin) {
		super(app, plugin);
		this.plugin = plugin;
	}

	display(): void {
		const { containerEl } = this;

		containerEl.empty();

		containerEl.createEl("h2", { text: "Settings for my awesome plugin." });

		new Setting(containerEl)
			.setName("Comment note location")
			.setDesc("Where do you want to store your comments?")
			.addText((text) =>
				text
					.setPlaceholder("comments")
					.setValue(this.plugin.settings.commentLocation)
					.onChange(async (value) => {
						this.plugin.settings.commentLocation = value;
						await this.plugin.saveSettings();
					})
			);
	}
}
