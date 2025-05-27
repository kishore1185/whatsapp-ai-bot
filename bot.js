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

let currentModel = 'llama3-8b-8192'; // Default Groq model

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
                message.reply("⚠️ Usage: !model <model-id>\nExample: !model llama3-8b-8192");
                return;
            }
            currentModel = parts[1];
            message.reply(`✅ Model switched to: ${currentModel}`);
            return;
        }

        // Handle question asking
        if (body.startsWith('!ask')) {
            const prompt = body.slice(4).trim();
            if (!prompt) {
                message.reply("⚠️ Please provide a question. Example: !ask What is AI?");
                return;
            }

            message.reply("⏳ Thinking...");

            try {
                const response = await axios.post("https://api.groq.com/openai/v1/chat/completions", {
                    model: currentModel,
                    messages: [
                        { role: "user", content: prompt }
                    ]
                }, {
                    headers: {
                        "Authorization": "Bearer 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",
                        "Content-Type": "application/json"
                    }
                });

                const reply = response.data.choices[0].message.content.trim();
                message.reply(reply);
            } catch (error) {
                console.error("❌ API error:", error.response?.data || error.message);
                message.reply("❌ Error: Could not get a response from Groq API.");
            }
        }
    }
});

client.initialize();
