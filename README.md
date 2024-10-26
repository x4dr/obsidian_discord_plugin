# Discord Reminder for Obsidian

This Obsidian plugin allows tasks within notes to be marked with a specific format, triggering automatic reminders to Discord when they are due. Once a task is identified as due, a notification is sent to Discord via a webhook.

## Details

**Task Marking Format**:  
Tasks can be marked using the format `(discord@YYYY-MM-DD HH:MM)` to set their due dates and times.

**Webhook URL Configuration**:  
Navigate to the plugin settings in Obsidian and input the Webhook URL for your Discord room.

**Scan Interval**:  
The plugin checks all notes for due tasks every 3 minutes.

**Network Considerations**:  
This plugin communicates with Discord via the internet. It sends only the content of the marked reminder and its associated due date. No other data from your Obsidian Vault is transmitted or stored externally.

## Usage

1. **Mark Your Tasks**: Within your Obsidian notes, mark any task with the specified format.
   <img width="598" alt="image" src="https://github.com/x4dr/obsidian_discord_plugin/assets/81299222/fe2d9235-60ca-4f83-a348-061c505147ac">
2. **Set Webhook**: Input the webhook URL in the plugin settings.
   <img width="820" alt="image" src="https://github.com/x4dr/obsidian_discord_plugin/assets/81299222/0f53e222-1adb-4320-be1d-a33ce5792f4e">
3. **Receive Notifications**: Once a task reaches its due date and time, you'll receive a notification in Discord.
<img width="820" alt="image" src="https://github.com/x4dr/obsidian_discord_plugin/assets/81299222/908f618a-eead-4511-883f-f3414b02d5fe">


# Attribution
This plugin is a fork from https://github.com/anil-e/obsidian_gchat_plugin and features mostly minor adjustments from Google Chat to Discord
