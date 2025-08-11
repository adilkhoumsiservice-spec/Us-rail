const express = require("express");
const axios = require("axios");
require("dotenv").config();

const app = express();
const PORT = process.env.PORT || 3000;

app.get("/", async (req, res) => {
  try {
    // جلب الأخبار من NewsAPI
    const newsResponse = await axios.get("https://newsapi.org/v2/top-headlines", {
      params: {
        country: "us",
        apiKey: process.env.NEWS_API_KEY
      }
    });

    const articles = newsResponse.data.articles.slice(0, 5); // أول 5 أخبار
    let summaries = [];

    // تلخيص الأخبار باستخدام OpenAI
    for (const article of articles) {
      const prompt = `لخص الخبر التالي بأسلوب بسيط:\n\n${article.title}\n\n${article.description}`;
      
      const aiResponse = await axios.post(
        "https://api.openai.com/v1/completions",
        {
          model: "text-davinci-003",
          prompt: prompt,
          max_tokens: 100
        },
        {
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${process.env.OPENAI_API_KEY}`
          }
        }
      );

      summaries.push({
        title: article.title,
        summary: aiResponse.data.choices[0].text.trim()
      });
    }

    res.json({ summaries });
  } catch (error) {
    console.error(error);
    res.status(500).send("حدث خطأ أثناء جلب الأخبار");
  }
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});