const { Client, GatewayIntentBits } = require('discord.js');
const fetch = require('node-fetch');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

const client = new Client({ intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMessages, GatewayIntentBits.MessageContent, GatewayIntentBits.GuildMembers] });

const keysUrl = 'https://raw.githubusercontent.com/ShokeyCorporation/SmartSystems-online-/main/keys.json';
const localKeysPath = path.join(__dirname, 'data', 'keys.json');

const allowedGuildId = '1157043603386941530'; // Ваш ID сервера

client.once('ready', () => {
    console.log('Bot is online!');
});

client.on('messageCreate', async message => {
    // Проверяем, что сообщение пришло с определённого сервера
    if (message.guild.id !== allowedGuildId) {
        return;
    }

    if (message.author.bot) return;

    const roleName = 'Get-SmartSys'; // Название роли
    const role = message.guild.roles.cache.find(role => role.name === roleName);

    if (!role || !message.member.roles.cache.has(role.id)) {
        return message.reply('У вас нет нужной роли для выполнения этой команды.');
    }

    if (message.content === '!generatekey') {
        await message.reply('Пожалуйста, введите ваш ник в игре:');

        const filter = response => response.author.id === message.author.id;
        const collectedNickname = await message.channel.awaitMessages({ filter, max: 1, time: 30000 });

        if (!collectedNickname.size) {
            return message.reply('Вы не указали ник.');
        }

        const nickname = collectedNickname.first().content;

        await message.reply('Пожалуйста, введите название вашей группы:');
        const collectedGroup = await message.channel.awaitMessages({ filter, max: 1, time: 30000 });

        if (!collectedGroup.size) {
            return message.reply('Вы не указали название группы.');
        }

        const groupName = collectedGroup.first().content;

        let keysData = {};
        try {
            const response = await fetch(keysUrl);
            if (!response.ok) throw new Error('Не удалось загрузить файл с ключами');
            keysData = await response.json();
        } catch (error) {
            console.error('Ошибка при загрузке файла:', error);
            return message.reply('Ошибка при загрузке базы данных ключей.');
        }

        const generatedKey = Math.random().toString(36).substring(2, 10).toUpperCase();

        keysData[generatedKey] = {
            "creator": nickname,
            "group": groupName
        };

        fs.writeFileSync(localKeysPath, JSON.stringify(keysData, null, 2));

        await message.reply(`Ваш ключ: ${generatedKey}\nНик в игре: ${nickname}\nНазвание группы: ${groupName}`);
    }
});

client.login(process.env.DISCORD_TOKEN);

module.exports = (req, res) => {
    res.status(200).send('Bot is running');
};
