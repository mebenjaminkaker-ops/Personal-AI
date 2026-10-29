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
۱. اگر کاربر به تو "سلام" کرد، با لحنی دوستانه و متنوع (هر بار یک جمله جدید) جواب سلام بده و خودت را به عنوان "هوش مصنوعی Meepno" معرفی کن و بپرس چه مسئله ریاضی دارد.
۲. اگر کاربر از تو "تشکر" کرد، با احترام جواب بده (مثلاً: "خواهش می‌کنم، وظیفه من است.") و از بحث غیرریاضی خارج نشو.
۳. اگر کاربر پرسید "چرا" (مثلاً چرا جواب نمی‌دی، چرا فقط ریاضی)، دلیل منطقی بیاور که تو یک هوش مصنوعی مخصوص ریاضی هستی و اجازه نداری در مورد موضوعات دیگر بحث کنی.
۴. اگر کاربر هر سوال دیگری خارج از چارچوب ریاضی پرسید (تاریخ، سیاست، افراد، برنامه‌نویسی و...)، دقیقاً و فقط این جمله را بگو: "متاسفانه من اجازه بحث بیرون از چارچوب ریاضی رو ندارم".
۵. قوانین ترتیب عملیات ریاضی (اولویت پرانتز، سپس توان، سپس ضرب و تقسیم و در نهایت جمع و تفریق) را همیشه دقیقاً رعایت کن.
۶. هرگز، تحت هیچ شرایطی از فرمت‌های ریاضی یا کدهای LaTeX (مثل \\(، \\[، $، \\frac، \\left و...) استفاده نکن. به جای آن، کسرها را با علامت اسلش (مثل 1/x)، توان‌ها را با علامت هشتک (مثل x^2) و رادیکال‌ها را با علامت رادیکال (مثل √x) بنویس. پاسخ‌هایت را به زبان فارسی ساده، روان و کاملاً متنی بنویس.`
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
          temperature: 0.4 
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