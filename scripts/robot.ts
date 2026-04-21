import { config } from "dotenv";
import { resolve } from "path";

config({ path: resolve(__dirname, "../.env") });

import OpenAI from "openai";

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

async function runRobot() {
  console.log("🤖 Iniciando o Robô Seeder...");

  const { getAllExistingThemes, createPreformedPage } =
    await import("../lib/notion");

  console.log("🔍 Analisando banco de dados...");
  const existingThemes = await getAllExistingThemes();
  console.log(`✅ ${existingThemes.length} tópicos existentes.`);

  const prompt = `
Gere 2 posts para LinkedIn sobre saúde preventiva no trabalho.

REGRAS:
- Linguagem simples
- Sem relatos pessoais
- Sem promessas ou medicamentos
- Evite temas similares a:
${existingThemes
  .slice(0, 20)
  .map((t) => `- ${t}`)
  .join("\n")}

FORMATO:
Retorne JSON no formato:
{ "items": [ { "theme": "...", "text": "..." } ] }

Cada "text" deve ter 5 parágrafos separados por \\n\\n:
1. Situação comum
2. Explicação simples
3. Dicas com "•"
4. Quando buscar ajuda
5. Fechamento
`;

  console.log("🧠 Gerando conteúdos...");

  try {
    const response = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "system",
          content: "Você escreve conteúdos de saúde corporativa.",
        },
        { role: "user", content: prompt },
      ],
      response_format: {
        type: "json_schema",
        json_schema: {
          name: "posts",
          schema: {
            type: "object",
            properties: {
              items: {
                type: "array",
                items: {
                  type: "object",
                  properties: {
                    theme: { type: "string" },
                    text: { type: "string" },
                  },
                  required: ["theme", "text"],
                },
                minItems: 2,
                maxItems: 2,
              },
            },
            required: ["items"],
          },
        },
      },
    });

    const content = response.choices[0].message.content || '{"items":[]}';

    let parsed;
    try {
      parsed = JSON.parse(content);
    } catch (err) {
      console.log("❌ Erro ao fazer parse do JSON:", err);
      return;
    }

    const data = parsed.items;

    if (!Array.isArray(data) || data.length === 0) {
      console.log("❌ Nenhum conteúdo válido retornado.");
      return;
    }

    console.log(`🔌 Validando e salvando ${data.length} posts...`);

    for (const post of data) {
      const paragraphs = post.text.split("\n\n");

      if (paragraphs.length !== 5) {
        console.log(`⚠️ Estrutura inválida: ${post.theme}`);
        continue;
      }

      if (!post.text.includes("•")) {
        console.log(`⚠️ Sem bullet points: ${post.theme}`);
        continue;
      }

      console.log(`  -> Criando post: "${post.theme}"`);

      await createPreformedPage(post.theme, post.text);

      await new Promise((r) => setTimeout(r, 1000));
    }

    console.log("🎉 Robô finalizado com sucesso!");
  } catch (error) {
    console.error("❌ Erro no robô:", error);
  }
}

runRobot();
