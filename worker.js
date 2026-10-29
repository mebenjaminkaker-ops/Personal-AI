export default {
  async fetch(request, env) {
    // حل مشکل CORS
    if (request.method === "OPTIONS") {
      return new Response(null, {
        headers: {
          "Access-Control-Allow-Origin": "*",
          "Access-Control-Allow-Headers": "Content-Type",
        },
      });
    }

    try {
      const body = await request.json();
      
      // اضافه کردن دستور سیستمی سخت‌گیرانه به پیام‌های کاربر
      const messagesWithSystemPrompt = [
        {
          role: "system",
          content: "تو یک دستیار ریاضی بسیار سخت‌گیر و متمرکز هستی. وظیفه تو فقط و فقط حل مسائل ریاضی، فرمول‌ها، معادلات، هندسه، حساب دیفرانسیل و انتگرال و آمار است. اگر کاربر سوالی پرسید که هیچ ربطی به ریاضی ندارد (مثل تاریخ، سیاست، افراد مشهور، برنامه‌نویسی، آشپزی یا هر چیز غیرریاضی)، تو باید دقیقاً و بدون هیچ توضیح اضافه‌ای فقط این جمله را بگویی: 'متاسفانه من اجازه بحث بیرون از چارچوب ریاضی رو ندارم'. تحت هیچ شرایطی به سوالات غیرریاضی جواب نده."
        },
        ...body.messages // پیام‌های خود کاربر
      ];

      const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
        method: "POST",
        headers: {
          "Authorization": "Bearer " + env.GROQ_API_KEY,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: "openai/gpt-oss-20b",
          messages: messagesWithSystemPrompt,
          temperature: 0.1 // دمای خیلی پایین تا مدل خیالبافی نکنه و دقیقاً به قانون پایبند باشه
        }),
      });

      const data = await response.json();

      return new Response(JSON.stringify(data), {
        headers: { 
          "Content-Type": "application/json", 
          "Access-Control-Allow-Origin": "*" 
        },
      });
    } catch (e) {
      return new Response(JSON.stringify({ error: e.message }), {
        status: 500,
        headers: { "Access-Control-Allow-Origin": "*" },
      });
    }
  },
};