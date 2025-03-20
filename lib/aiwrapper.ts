import Groq from 'groq-sdk';

const groqClient = new Groq({
  apiKey: process.env.GROQ_API_KEY,
});

export async function aiWrapper(title:string, description:string) {
  console.log(title, description);
  const prompt = "Give me a summary of the article in 200-300 words. This is the title - " + title + ". This is the description - " + description;
  const completion = await groqClient.chat.completions.create({
    messages: [{ role: 'user', content: prompt }],
    model: 'llama-3.3-70b-versatile',
  });
  return completion.choices[0]?.message?.content;
}