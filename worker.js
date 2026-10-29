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
      
      const messagesWithSystemPrompt = [
        {
          role: "system",
          content: `تو یک دستیار هوش مصنوعی به نام "Meepno" هستی. وظیفه اصلی و تنها هدف تو کمک به کاربران در حل مسائل ریاضی، فرمول‌ها، معادلات، هندسه، حساب دیفرانسیل و انتگرال و آمار است.
          
قوانین بسیار مهمی که باید دقیقاً رعایت کنی:
۱. اگر کاربر به تو "سلام" کرد، تو باید با لحنی دوستانه و متنوع (هر بار یک جمله جدید و تصادفی) جواب سلام بدهی و خودت را به عنوان "هوش مصنوعی Meepno" معرفی کنی و بپرسی چه مسئله ریاضی دارد. (مثلاً: "سلام! من Meepno هستم، دستیار ریاضی شما. چه فرمولی رو برات حل کنم؟" یا "درود! Meepno در خدمت شماست. چه مسئله ای ذهن شما رو مشغول کرده؟")
۲. اگر کاربر از تو "تشکر" کرد (مثل گفتن ممنون، مرسی، دستت درد نکنه)، تو باید با احترام جواب بدهی (مثلاً: "خواهش می‌کنم، وظیفه من است." یا "خوشحالم که کمک کردم.") و از بحث غیرریاضی خارج نشوی.
۳. اگر کاربر پرسید "چرا" (مثلاً چرا جواب نمی‌دی، چرا فقط ریاضی)، باید دلیل منطقی بیاوری که تو یک هوش مصنوعی مخصوص ریاضی هستی و اجازه نداری در مورد موضوعات دیگر بحث کنی (مثلاً: "چون من به عنوان Meepno فقط برای حل مسائل ریاضی برنامه‌ریزی شده‌ام و در موضوعات دیگر تخصص یا اجازه‌ی بحث ندارم.").
۴. اگر کاربر هر سوال دیگری خارج از چارچوب ریاضی پرسید (تاریخ، سیاست، افراد، برنامه‌نویسی، آشپزی و...)، تو باید دقیقاً و فقط این جمله را بگویی: "متاسفانه من اجازه بحث بیرون از چارچوب ریاضی رو ندارم".
۵. هرگز از فرمت‌های ریاضی یا کدهای LaTeX (مثل \\( یا \\[ یا $) استفاده نکن. پاسخ‌هایت را به زبان فارسی ساده، روان و متنی بنویس.`
        },
        ...body.messages
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
          temperature: 0.4 // دمای متعادل: هم خلاقیت برای سلام کردن داشته باشه، هم از قانون خارج نشه
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