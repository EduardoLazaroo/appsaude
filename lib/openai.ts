import OpenAI from 'openai';

const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

export async function generatePostDraft(theme: string, subtheme: string, recentThemes: string[]) {
  const prompt = `Você é Isabela, uma Enfermeira atuando em saúde corporativa. 
Seu objetivo é criar conteúdo pronto para LinkedIn sobre saúde preventiva, educando funcionários com foco em hábitos e rotina real.

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

EXEMPLO DE FORMATO DE POST BEM SUCEDIDO (SIGA EXATAMENTE ESTE ESTILO, MAS INVENTE UMA IDEIA BASEADA NO TEMA E SUBTEMA):
Sentir cansaço ao longo do expediente nem sempre está ligado à quantidade de trabalho.

Muitas vezes, isso tem relação com hábitos do dia a dia, como pouca ingestão de água, ausência de pausas e sono irregular.

No ambiente corporativo, esses fatores impactam diretamente na disposição e na concentração. Algumas práticas simples podem ajudar:
• fazer pequenas pausas durante o dia
• manter a hidratação
• cuidar da rotina de sono

Quando o cansaço se torna frequente, é importante observar com mais atenção e, se necessário, buscar orientação profissional.

Ajustes simples na rotina já podem fazer diferença.

AGORA GERE O POST COM O SEGUINTE ASSUNTO:
Tema principal: ${theme}
Subtema: ${subtheme}`;

  const response = await client.responses.create({
    model: 'gpt-4.1-mini',
    input: prompt,
    max_output_tokens: 600,
  });

  return response.output_text?.trim() ?? '';
}
