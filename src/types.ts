import chalk from "chalk";
import { REST, Routes, SlashCommandBuilder } from "discord.js";
import dotenv from "dotenv";

dotenv.config();

const commands = [
  new SlashCommandBuilder()
    .setName("jobs")
    .setDescription("Shows the most recent remote developer jobs"),
  new SlashCommandBuilder()
    .setName("clear")
    .setDescription("Clears all bot messages from the jobs channel"),
  new SlashCommandBuilder()
    .setName("trigger-jobs")
    .setDescription("Manually triggers job posting"),
].map(command => command.toJSON());

const rest = new REST({ version: "10" }).setToken(process.env.BOT_TOKEN as string);

(async () => {
  try {
    console.log("💾 Registering new (/) commands...");

    await rest.put(
      Routes.applicationCommands(process.env.CLIENT_ID as string),
      { body: commands }
    );

    console.log(chalk.green("✅ (/) Commands registered successfully!"));
  } catch (error) {
    console.error(chalk.red("⛔ Error registering the new commands", error));
  }
})();