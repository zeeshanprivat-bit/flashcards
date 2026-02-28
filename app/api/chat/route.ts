import { NextRequest } from 'next/server';
import { createOpenAICompatible } from '@ai-sdk/openai-compatible';
import { streamText } from 'ai';
import { createClient } from '@/lib/supabase/server';

export async function POST(request: NextRequest) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return new Response('Unauthorized', { status: 401 });

  const { messages } = await request.json();

  const gateway = createOpenAICompatible({
    name: 'vercel-gateway',
    apiKey: process.env.AI_GATEWAY_API_KEY,
    baseURL: 'https://ai-gateway.vercel.sh/v1',
  });

  const result = await streamText({
    model: gateway('openai/gpt-4o-mini'),
    system: `Du er en medisinsk AI-assistent for medisinstudenter. Du svarer på norsk med mindre brukeren skriver på engelsk.

Du hjelper med:
- Forklaring av medisinske konsepter og mekanismer
- Differensialdiagnoser
- Farmakologi og virkningsmekanismer
- Kliniske scenarioer
- Eksamensrelaterte spørsmål

Vær presis, klinisk relevant og akademisk. Bruk strukturerte svar med overskrifter og punktlister når det er hensiktsmessig.
Presiser alltid at svarene er for læringsformål og ikke erstatter klinisk vurdering.`,
    messages,
    temperature: 0.4,
  });

  return result.toTextStreamResponse();
}
