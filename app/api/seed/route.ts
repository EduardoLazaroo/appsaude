import { NextResponse } from 'next/server';
import { revalidatePath } from 'next/cache';

import OpenAI from 'openai';
import { getAllExistingThemes, createPreformedPage } from '@/lib/notion';
import { getClientIp, requireAdmin } from '@/lib/admin';
import { rateLimitOrNull } from '@/lib/rateLimit';

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

// Permite execução mais longa (Vercel maxDuration se exportar no Next)
export const maxDuration = 60; 

export async function POST(request: Request) {
  const auth = requireAdmin(request);
  if (auth) return auth;

  const ip = getClientIp(request);
  const limited = rateLimitOrNull({ key: `seed:${ip}`, limit: 3, windowMs: 60 * 60_000 });
  if (limited) return limited;

  try {
    // 1. Puxa temas para blacklist
    const existingThemes = await getAllExistingThemes();

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

Retorne APENAS um Array JSON puro, contendo 2 objetos com "theme" e "text". Exemplo do JSON:
[
  {
    "theme": "A importância da pausa visual",
    "text": "Sabe aquele momento no final do expediente em que os olhos ardem e a tela do computador parece sua pior inimiga?\\n\\nNosso olho não foi feito para encarar a luz azul por tantas horas seguidas. Que tal testarmos algo amanhã no escritório?\\n\\nAplicar algumas práticas simples ajudam nesta fadiga:\\n• a cada 20 minutos tire os olhos da tela\\n• olhe para um ponto distante por alguns segundos\\n• pisque intencionalmente\\n\\nQuando o incômodo na visão se torna frequente e não passa com o descanso, é importante buscar um oftalmologista.\\n\\nCuidar do seu corpo nas pequenas pausas é um ótimo investimento na sua saúde."
  }
]`;

    const response = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [{ role: 'system', content: prompt }],
      response_format: { type: 'json_object' }
    });

    const responseContent = response.choices[0].message.content || '{"items":[]}';
    let data;
    try {
        data = JSON.parse(responseContent);
        if (data.items) data = data.items;
        else if (!Array.isArray(data)) data = Object.values(data)[0]; 
    } catch {
        return NextResponse.json({ error: '❌ O GPT não retornou JSON amigável.' }, { status: 500 });
    }

    if (!Array.isArray(data) || data.length === 0) {
      return NextResponse.json({ error: '❌ Dados vazios gerados.' }, { status: 500 });
    }
    
    let processados = 0;
    // Injetar
    for (const post of data) {
      await createPreformedPage(post.theme, post.text);
      processados++;
    }
    revalidatePath('/');
    return NextResponse.json({ success: true, count: processados });
  } catch (error) {
    console.error('Error in seed route:', error);
    return NextResponse.json({ error: 'Erro no processo do Robô Seeder.' }, { status: 500 });
  }
}
