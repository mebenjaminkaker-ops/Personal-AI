export default {
  async fetch(request, env, ctx) {
    // ۱. حل مشکل CORS
    if (request.method === "OPTIONS") {
      return new Response(null, {
        headers: {
          "Access-Control-Allow-Origin": "*",
          "Access-Control-Allow-Methods": "POST, OPTIONS",
          "Access-Control-Allow-Headers": "Content-Type, Authorization",
        },
      });
    }

    if (request.method !== "POST") return new Response("Method Not Allowed", { status: 405 });

    try {
      const requestData = await request.json();
      const groqKey = env.GROQ_API_KEY;
      const geminiKey = env.GEMINI_API_KEY;

      let finalResponse = null;

      // ۲. اولویت اول: گروک با مدل GPT-OSS-20B
      if (groqKey) {
        try {
          const groqRes = await fetch("https://api.groq.com/openai/v1/chat/completions", {
            method: "POST",
            headers: {
              "Authorization": `Bearer ${groqKey}`,
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              // ⬇️ مدل دقیقاً اینجا قفل شد ⬇️
              model: "openai/gpt-oss-20b", 
              messages: requestData.messages,
              temperature: 0.5 // دمای پایین برای دقت بالای ریاضی
            }),
          });

          if (groqRes.ok) {
            finalResponse = await groqRes.json();
          } else {
            console.log("Groq Error:", await groqRes.text());
          }
        } catch (e) {
          console.log("Groq connection failed, switching to Gemini");
        }
      }

      // ۳. اولویت دوم (پشتیبان): گوگل
      if (!finalResponse && geminiKey) {
        const messages = requestData.messages.map(msg => ({
          role: msg.role === 'assistant' ? 'model' : 'user',
          parts: [{ text: msg.content }]
        }));

        const geminiRes = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${geminiKey}`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            contents: messages,
            systemInstruction: {
              parts: [{ text: "شما یک دستیار هوشمند ریاضی هستید. به زبان فارسی جواب بده." }]
            }
          }),
        });

        if (geminiRes.ok) {
          const gData = await geminiRes.json();
          const botText = gData.candidates?.[0]?.content?.parts?.[0]?.text || "پاسخی یافت نشد.";
          finalResponse = { choices: [{ message: { role: "assistant", content: botText } }] };
        }
      }

      // ۴. اگر هیچ‌کدام جواب ندادند
      if (!finalResponse) {
        return new Response(JSON.stringify({ error: "Both APIs failed" }), {
          status: 500,
          headers: { "Content-Type": "application/json", "Access-Control-Allow-Origin": "*" },
        });
      }

      // ۵. برگرداندن جواب
      return new Response(JSON.stringify(finalResponse), {
        status: 200,
        headers: { "Content-Type": "application/json", "Access-Control-Allow-Origin": "*" },
      });

    } catch (error) {
      return new Response(JSON.stringify({ error: error.message }), {
        status: 500,
        headers: { "Content-Type": "application/json", "Access-Control-Allow-Origin": "*" },
      });
    }
  },
};