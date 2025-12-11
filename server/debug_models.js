const https = require('https');
require('dotenv').config();

console.log("1. Script started...");

// 1. Check API Key
const apiKey = process.env.GEMINI_API_KEY;
if (!apiKey) {
    console.error("❌ ERROR: No API Key found. Check your .env file.");
    console.error("   Make sure you have a line like: GEMINI_API_KEY=AIzaSy...");
    process.exit(1);
}
console.log("2. API Key found (starts with: " + apiKey.substring(0, 5) + "...)");

// 2. Define the URL
const url = `https://generativelanguage.googleapis.com/v1beta/models?key=${apiKey}`;
console.log("3. Requesting models from Google...");

// 3. Make the Request (using 'https' to avoid version issues)
https.get(url, (res) => {
    let data = '';

    // A chunk of data has been received.
    res.on('data', (chunk) => {
        data += chunk;
    });

    // The whole response has been received.
    res.on('end', () => {
        console.log(`4. Response received (Status Code: ${res.statusCode})`);

        if (res.statusCode !== 200) {
            console.error("❌ API Error. Response body:");
            console.error(data);
            return;
        }

        try {
            const json = JSON.parse(data);
            if (!json.models) {
                console.log("⚠️ No 'models' list found in response.");
                console.log(json);
                return;
            }

            console.log("\n✅ AVAILABLE MODELS:");
            console.log("===================");
            
            // Filter and print models
            const chatModels = json.models.filter(m => 
                m.supportedGenerationMethods && 
                m.supportedGenerationMethods.includes("generateContent")
            );

            if (chatModels.length === 0) {
                console.log("No models found that support 'generateContent'.");
                console.log("Raw List:", json.models.map(m => m.name));
            }

            chatModels.forEach(model => {
                const name = model.name.replace('models/', '');
                console.log(`- ${name}`);
            });
            console.log("===================\n");

        } catch (e) {
            console.error("❌ Error parsing JSON:", e.message);
        }
    });

}).on("error", (err) => {
    console.error("❌ Network Error:", err.message);
});