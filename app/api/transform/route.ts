import { NextResponse } from 'next/server';
import { getRecentThemes } from '@/lib/notion';
import OpenAI from 'openai';

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const input = body?.input?.trim();

    if (!input) {
      return NextResponse.json({ error: 'Input é obrigatório.' }, { status: 400 });
    }

    if (input.length > 500) {
      return NextResponse.json({ error: 'Input muito longo (máx 500 caracteres).' }, { status: 400 });
    }

    // Busca temas recentes para não repetir
    const recentThemes = await getRecentThemes(20);

    const prompt = `Você é Isabela, uma Enfermeira atuando em saúde corporativa.
Seu objetivo é criar conteúdo pronto para LinkedIn sobre saúde preventiva, educando funcionários com foco em hábitos e rotina real.

A enfermeira digitou a seguinte ideia:
"${input}"

REGRAS:
- NUNCA escreva títulos, marcações ou rótulos como "[Gancho]", "Gancho:", "Dicas:", ou números como "1. Gancho". Retorne APENAS o texto final do post.
- Use linguagem simples e acessível.
- Foque APENAS em prevenção e orientação leve.
- NUNCA prometa curas, não cite remédios ou vacinas, sem sensacionalismo.
- Não repita ideias: ${recentThemes.join(', ') || 'nenhum'}.

O POST DEVE CONTER EXATAMENTE 5 PARTES, DIVIDIDAS POR PARÁGRAFOS (pulando linha):
1º parágrafo: Gancho (fala de uma situação comum, sem relato pessoal).
2º parágrafo: Explicação simples (explica de forma não técnica a causa/influência na saúde).
3º parte: Orientações práticas (direto ao ponto, usando o símbolo "•" para a lista).
4º parágrafo: Observação responsável (ex: Quando esse tipo de sintoma se torna frequente, vale observar com atenção e buscar um profissional).
5º parágrafo: Fechamento simples (ex: Pequenos ajustes na rotina já trazem diferença).

EXEMPLO DE FORMATO (SIGA EXATAMENTE ESTE ESTILO):
Sentir cansaço ao longo do expediente nem sempre está ligado à quantidade de trabalho.

Muitas vezes, isso tem relação com hábitos do dia a dia, como pouca ingestão de água, ausência de pausas e sono irregular.

No ambiente corporativo, esses fatores impactam diretamente na disposição e na concentração. Algumas práticas simples podem ajudar:
• fazer pequenas pausas durante o dia
• manter a hidratação
• cuidar da rotina de sono

Quando o cansaço se torna frequente, é importante observar com mais atenção e, se necessário, buscar orientação profissional.

Ajustes simples na rotina já podem fazer diferença.

Agora gere um post baseado na ideia dela, mantendo a qualidade e o padrão acima.`;

    const response = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        {
          role: 'system',
          content: 'Você é um especialista em criar conteúdo de saúde corporativa para LinkedIn.',
        },
        {
          role: 'user',
          content: prompt,
        },
      ],
      temperature: 0.7,
      max_tokens: 800,
    });

    const text = response.choices[0].message.content?.trim() ?? '';

    if (!text) {
      return NextResponse.json({ error: 'Falha ao gerar conteúdo.' }, { status: 500 });
    }

    // Extrai o tema da ideia original (primeiras 60 caracteres)
    const theme = input.length > 60 ? input.substring(0, 60) + '...' : input;

    return NextResponse.json({ theme, text, success: true });
  } catch (error) {
    console.error('Transform error:', error);
    return NextResponse.json({ error: 'Falha ao transformar ideia em post.' }, { status: 500 });
  }
}
