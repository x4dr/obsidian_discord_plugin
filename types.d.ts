export interface DiscordReminderSettings {
	webhookUrl: string;
}

export interface Task {
	content: string;
	dueDateTime: Date;
}
