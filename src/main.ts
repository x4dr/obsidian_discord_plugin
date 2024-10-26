import {
	App,
	CachedMetadata,
	Plugin,
	PluginSettingTab,
	Setting,
	TFile,
	requestUrl,
} from "obsidian";
import { DiscordReminderSettings, Task } from "types";

const DEFAULT_SETTINGS: DiscordReminderSettings = {
	webhookUrl: "",
};

export default class DiscordReminder extends Plugin {
	settings: DiscordReminderSettings;
	notifiedTasks: Set<string> = new Set();
	taskCache: Set<Task> = new Set();

	async onload() {
		await this.loadSettings();
		await this.loadNotifiedTasks();

		this.addSettingTab(new Settingstab(this.app, this));

		this.registerEvent(
			this.app.metadataCache.on(
				"changed",
				this.handleFileChange.bind(this)
			)
		);

		this.registerInterval(
			setInterval(this.checkTasks.bind(this), 3 * 60 * 1000) as any
		);

		this.initializeTaskCache();
	}

	async initializeTaskCache() {
		this.taskCache = new Set();

		const files = this.app.vault.getMarkdownFiles();
		for (const file of files) {
			this.addToTaskCache(file);
		}
	}

	handleFileChange(file: TFile, _data: string, _cache: CachedMetadata) {
		this.addToTaskCache(file);
	}

	async addToTaskCache(file: TFile) {
		if (file.extension !== "md") return;
		const fileContent = await this.app.vault.read(file);
		const tasks = this.extractTasks(fileContent);
		tasks.forEach((task) => this.taskCache.add(task));
	}

	checkTasks() {
		this.taskCache.forEach((task) => {
			const { content, dueDateTime } = task;
			this.checkTask(content, dueDateTime);
		});
	}

	extractTasks(content: string) {
		const regex = /(.*?)(\(discord@(\d{4}-\d{2}-\d{2} \d{2}:\d{2})\))/g;
		let match;
		const tasks = [];

		while ((match = regex.exec(content)) !== null) {
			let reminderText = match[1].trim();

			if (reminderText.startsWith("- [ ]")) {
				reminderText = reminderText.replace("- [ ]", "").trim();
			}

			const dueDateTime = new Date(match[3]);
			tasks.push({ content: reminderText, dueDateTime });
		}

		return tasks;
	}

	checkTask(content: string, dueDateTime: Date) {
		const now = new Date();
		const taskId = `${content}-${dueDateTime.toISOString()}`;

		if (dueDateTime <= now && !this.notifiedTasks.has(taskId)) {
			this.notifiedTasks.add(taskId);
			this.saveNotifiedTasks();
			this.sendNotification(content, dueDateTime.toISOString());
		}
	}

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

	async loadNotifiedTasks() {
		const savedTasks = await this.loadData();
		if (savedTasks && savedTasks.notifiedTasks) {
			this.notifiedTasks = new Set(savedTasks.notifiedTasks);
		}
	}

	async saveNotifiedTasks() {
		await this.saveData({ notifiedTasks: [...this.notifiedTasks] });
	}

	async sendNotification(reminderText: string, dateTime: string) {
		const { webhookUrl } = this.settings;

		if (!webhookUrl || webhookUrl.trim() === "") {
			console.warn(
				"Discord webhook URL is not set. Notification is not sent."
			);
			return;
		}

		const payload = {
				content: "",  // Primary message text or can be empty if using only embeds
				embeds: [
					{
						title: "Obsidian Reminder",
						description: "Task is due!",
						color: 3447003,
						thumbnail: {
							url: "https://obsidian.md/images/2023-06-logo.png"
					},
					fields: [
						{
							name: "Due Date",
							value: `${dateTime}`,  // Replace with actual dateTime
					  		inline: true
					},
					{
						name: "Task",
						value: `${reminderText}`,
						inline: false
					}
				  ]
			  }
		  ]
	};

		try {
			const response = await requestUrl({
				method: "POST",
				url: `${webhookUrl}`,
				headers: {
					"Content-Type": "application/json",
				},
				body: JSON.stringify(payload),
			});

			if (response.status != 200) {
				console.error("Error sending Discord Notifcation:", response.status);
			}
		} catch (error) {
			console.error("Error sending Discord Notifcation:", error);
		}
	}
}

class Settingstab extends PluginSettingTab {
	plugin: DiscordReminder;

	constructor(app: App, plugin: DiscordReminder) {
		super(app, plugin);
		this.plugin = plugin;
	}

	display(): void {
		const { containerEl } = this;

		containerEl.empty();

		new Setting(containerEl)
			.setName("Webhook-URL")
			.setDesc("URL to which the notifications are sent")
			.addText((text) =>
				text
					.setPlaceholder("Enter your URL")
					.setValue(this.plugin.settings.webhookUrl)
					.onChange(async (value) => {
						this.plugin.settings.webhookUrl = value;
						await this.plugin.saveSettings();
					})
			);
	}
}
