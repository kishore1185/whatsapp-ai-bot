console.log("🤖 Starting WhatsApp bot...");

const { Client, LocalAuth } = require('whatsapp-web.js');
const qrcode = require('qrcode-terminal');
const axios = require('axios');

const client = new Client({
    authStrategy: new LocalAuth(),
    puppeteer: {
        headless: true,
        args: ['--no-sandbox', '--disable-setuid-sandbox']
    }
});

let currentModel = 'model id'; 

client.on('qr', (qr) => {
    console.log("📲 Scan this QR code to connect:");
    qrcode.generate(qr, { small: true });
});

client.on('ready', () => {
    console.log("✅ WhatsApp bot is ready!");
});

client.on('message', async (message) => {
    const chat = await message.getChat();

    // Support group and individual messages
    if (chat.isGroup || message.from) {
        const body = message.body.trim();

        // Handle model switching
        if (body.startsWith('!model')) {
            const parts = body.split(' ');
            if (parts.length < 2) {
                message.reply("⚠️ Usage: !model <model-id>\nExample: model id");
                return;
            }
            currentModel = parts[1];
            message.reply(`✅ Model switched to: ${currentModel}`);
            return;
        }

       
        if (body.startsWith('!ask')) {
            const prompt = body.slice(4).trim();
            if (!prompt) {
                message.reply("⚠️ Please provide a question. Example: !ask What is AI?");
                return;
            }

            message.reply("⏳ Thinking...");

            try {
                const response = await axios.post("api endpoint", {
                    model: currentModel,
                    messages: [
                        { role: "user", content: prompt }
                    ]
                }, {
                    headers: {
                        "Authorization": "Bearer open_api_key_here",
                        "Content-Type": "application/json"
                    }
                });

                const reply = response.data.choices[0].message.content.trim();
                message.reply(reply);
            } catch (error) {
                console.error("❌ API error:", error.response?.data || error.message);
                message.reply("❌ Error: Could not get a response .");
            }
        }
    }
});

client.initialize();
