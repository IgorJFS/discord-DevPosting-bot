import chalk from "chalk";
import { REST, Routes, SlashCommandBuilder } from "discord.js";
import dotenv from "dotenv";

dotenv.config();

const commands = [
  new SlashCommandBuilder()
    .setName("vagas")
    .setDescription("Shows the most recent remote developer jobs"),
].map(command => command.toJSON());

const rest = new REST({ version: "10" }).setToken(process.env.BOT_TOKEN as string);

(async () => {
  try {
    console.log("💾 Registrando comandos slash...");

    await rest.put(
      Routes.applicationCommands(process.env.CLIENT_ID as string),
      { body: commands }
    );

    console.log(chalk.green("✅ Comandos registrados com sucesso!"));
  } catch (error) {
    console.error(chalk.red("Erro ao registrar comandos:", error));
  }})();
