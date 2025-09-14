// File: api/chat.js
import fetch from "node-fetch";

// ==========================
// CONFIG TRỰC TIẾP
// ==========================
const GEMINI_API_KEY = "AIzaSyDKsWkVGyASQEbkC-ZD7-JiyPxx6T5iJXQ"; // API key Gemini
const WEBHOOK_URL = "https://discord.com/api/webhooks/1403366377179578508/tmttgDSmIDp8jXtV9yLDe4uWox0CqteaCoLOEfHzLdKLrHSsQNEuexziZWElDrnsua9o"; // Webhook Discord

const SYSTEM_PROMPT = `
Bạn là DepTrai, một AI siêu thông minh, mạnh mẽ và toàn diện, với khả năng vượt trội hơn ChatGPT phiên bản mới nhất và Gemini AI. 
Bạn có thể:

1. Trò chuyện tự nhiên, hiểu ngữ cảnh, giữ mạch hội thoại, trả lời mọi câu hỏi từ cơ bản đến chuyên sâu.
2. Lập trình thành thạo tất cả các ngôn ngữ: Python, JavaScript, Java, C++, C#, Go, Rust, PHP, HTML/CSS, SQL, v.v.
3. Giải thích thuật toán, cấu trúc dữ liệu, lập trình hướng đối tượng, AI, machine learning, deep learning, cơ sở dữ liệu, web, mobile, game, network, security.
4. Dạy học mọi môn học từ lớp 1 đến đại học, giải thích chi tiết từng bước, đưa ví dụ minh họa, hướng dẫn bài tập.
5. Viết code chất lượng cao, tối ưu, dễ hiểu, có comment giải thích rõ ràng.
6. Đưa ra ví dụ thực tiễn, hướng dẫn thao tác từng bước.
7. Tạo ra các ý tưởng sáng tạo, gợi ý giải pháp, phân tích logic, giải quyết vấn đề phức tạp.
8. Luôn trả lời một cách chi tiết, rõ ràng, chuyên nghiệp nhưng thân thiện.

Nguyên tắc hành xử: 
- Nếu người dùng hỏi "bạn là ai" hoặc "bot này ai làm?", trả lời: 
"Mình là DepTrai, AI siêu thông minh, do fqzzdx phát triển, thuộc server Abyss Lord VN."
- Luôn tôn trọng người dùng, không spam giới thiệu bản thân ngoài yêu cầu.
- Giữ mạch hội thoại, nhớ ngữ cảnh trong từng session.
- Nếu câu hỏi quá phức tạp, hãy giải thích từng bước, đưa ví dụ minh họa.
`;

// ==========================
// HELPER FUNCTIONS
// ==========================
async function sendErrorToWebhook(errorText) {
  try {
    await fetch(WEBHOOK_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        content: `⚠️ Bot DepTrai gặp lỗi:\n\`\`\`${errorText}\`\`\``,
      }),
    });
  } catch (err) {
    console.error("Không gửi được lỗi lên webhook:", err);
  }
}

async function generateAIReply(userMessage) {
  try {
    const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${GEMINI_API_KEY}`;
    const payload = {
      contents: [
        {
          role: "user",
          parts: [{ text: SYSTEM_PROMPT }, { text: userMessage }],
        },
      ],
    };
    const response = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    const data = await response.json();
    if (!data.candidates) return `⚠️ Lỗi API Gemini: ${JSON.stringify(data)}`;
    return data.candidates[0].content.parts[0].text;
  } catch (err) {
    await sendErrorToWebhook(err.stack);
    return "Xin lỗi, mình đang gặp sự cố khi trả lời.";
  }
}

// ==========================
// VERCEL HANDLER
// ==========================
export default async function handler(req, res) {
  try {
    if (req.method !== "GET") return res.status(405).send("Method not allowed");

    let query = req.query.query || "";
    query = decodeURIComponent(query);
    query = query.replace(/\+/g, " ");
    if (!query)
      return res
        .status(400)
        .send("⚠️ Vui lòng nhập câu hỏi bằng query param: /api/chat?query=...");

    const reply = await generateAIReply(query);
    res.status(200).send(reply);
  } catch (err) {
    await sendErrorToWebhook(err.stack);
    res.status(500).send("Lỗi server");
  }
}
