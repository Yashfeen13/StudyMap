

async function testGemini() {
  const geminiApiKey = process.env.GEMINI_API_KEY;
  if (!geminiApiKey) {
    console.error("No GEMINI_API_KEY found in .env.local");
    return;
  }

  const geminiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-3.5-flash-lite:generateContent?key=${geminiApiKey}`;
  
  const response = await fetch(geminiUrl, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      systemInstruction: {
        parts: [{ text: "You are a test." }]
      },
      contents: [
        { parts: [{ text: "Hello" }] }
      ],
      generationConfig: {
        responseMimeType: 'application/json',
        temperature: 0.3
      }
    })
  });

  const text = await response.text();
  console.log("Status:", response.status);
  console.log("Response:", text);
}

testGemini();
