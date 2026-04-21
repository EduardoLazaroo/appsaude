import { config } from 'dotenv';
import { resolve } from 'path';

// Carrega variáveis sincronicamente antes das importações estáticas complexas
config({ path: resolve(__dirname, '../.env') });

import OpenAI from 'openai';
import * as notionModule from '../lib/notion';

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

async function runRobot() {
  console.log('🤖 Iniciando o Robô Seeder...');
  
  // 1. Puxa os temas já existentes para evitar repetição (Guarda-Costas)
  console.log('🔍 Analisando banco de dados para evitar tópicos duplicados...');
  const { getAllExistingThemes, createPreformedPage } = await import('../lib/notion');
  const existingThemes = await getAllExistingThemes();
  console.log(`✅ ${existingThemes.length} tópicos existentes memorizados.`);

  const prompt = `Você é Isabela, uma Enfermeira atuando em saúde corporativa. 
Gere exatamente 2 ideias de conteúdos prontos para LinkedIn sobre saúde preventiva, com foco em hábitos e rotina real do trabalhador.

REGRAS:
- NUNCA escreva títulos, marcações ou rótulos como "[Gancho]", "Gancho:", "Dicas:", ou números como "1. Gancho". Retorne APENAS o texto final do post.
- Use linguagem simples e acessível.
- Foque APENAS em prevenção e orientação leve.
- NUNCA prometa curas, não cite remédios ou vacinas, sem sensacionalismo.
- Não repita ideias: ${existingThemes.slice(0, 50).join(', ')}.

CADA POST DEVE CONTER EXATAMENTE 5 PARTES, DIVIDIDAS POR PARÁGRAFOS (pulando linha):
1º parágrafo: Gancho (fala de uma situação comum, sem relato pessoal).
2º parágrafo: Explicação simples (explica a causa não técnica).
3º parte: Orientações práticas (direto ao ponto, usando "•").
4º parágrafo: Observação responsável (ex: Quando se torna frequente, busque ajuda profissional).
5º parágrafo: Fechamento simples (ex: Pequenos ajustes fazem diferença).

EXEMPLO DO TEXTO ESPERADO:
Sentir cansaço ao longo do expediente nem sempre está ligado à quantidade de trabalho.

Muitas vezes, isso tem relação com hábitos do dia a dia, como pouca ingestão de água, ausência de pausas e sono irregular.

No ambiente corporativo, esses fatores impactam diretamente na disposição e na concentração. Algumas práticas simples podem ajudar:
• fazer pequenas pausas durante o dia
• manter a hidratação
• cuidar da rotina de sono

Quando o cansaço se torna frequente, é importante observar com mais atenção e buscar orientação profissional.

Ajustes simples na rotina já podem fazer diferença.

Retorne APENAS um Array JSON puro, contendo 2 objetos. Exemplo de JSON:
[
  {
    "theme": "A importância da pausa visual",
    "text": "Sabe aquele momento no final do expediente em que os olhos ardem e a tela do computador parece sua pior inimiga?\\n\\nNosso olho não foi feito para encarar a luz azul por tantas horas seguidas. Que tal testarmos algo amanhã no escritório?\\n\\nAplicar algumas práticas simples ajudam nesta fadiga:\\n• a cada 20 minutos tire os olhos da tela\\n• olhe para um ponto distante por alguns segundos\\n• pisque intencionalmente\\n\\nQuando o incômodo na visão se torna frequente e não passa com o descanso, é importante buscar um oftalmologista.\\n\\nCuidar do seu corpo nas pequenas pausas é um ótimo investimento na sua saúde."
  }
]`;

  console.log('🧠 Solicitando novos conteúdos para a Inteligência Artificial...');
  
  try {
    const response = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [{ role: 'system', content: prompt }],
      response_format: { type: 'json_object' }
    });

    const responseContent = response.choices[0].message.content || '{"items":[]}';
    let data;
    try {
        data = JSON.parse(responseContent);
        if (data.items) {
          data = data.items;
        } else if (!Array.isArray(data)) {
          data = Object.values(data)[0]; 
        }
    } catch {
        console.log('❌ O GPT não retornou um formato JSON amigável.');
        return;
    }

    if (!Array.isArray(data) || data.length === 0) {
      console.log('❌ Dados inválidos ou vazios gerados.');
      return;
    }

    console.log(`🔌 Injetando ${data.length} novos posts no final do seu arquivo do Notion...`);
    
    // Injeção lenta para não tomar Rate Limit do Notion
    for (const post of data) {
      console.log(`  -> Criando post: "${post.theme}"`);
      await createPreformedPage(post.theme, post.text);
      await new Promise(r => setTimeout(r, 1000));
    }

    console.log('🎉 Robô finalizou com sucesso! Sua base de dados foi alimentada e cresceu.');

  } catch (error) {
    console.error('❌ Ocorreu um erro no pipeline do Robô:', error);
  }
}


runRobot();
