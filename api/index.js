const { Client, GatewayIntentBits } = require('discord.js');
require('dotenv').config();

const client = new Client({ intents: [GatewayIntentBits.Guilds] });

client.once('ready', () => {
    console.log('Ready!');
});

client.login(process.env.DISCORD_TOKEN);

module.exports = (req, res) => {
    res.status(200).send('Bot is running');
};
