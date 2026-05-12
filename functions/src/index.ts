import { onCall } from 'firebase-functions/v2/https';

import { defineSecret } from 'firebase-functions/params';

import OpenAI from 'openai';

/* SECRET */

const openAiKey = defineSecret('OPENAI_API_KEY');

/* FUNCTION */

export const generatePlayerInsight = onCall(
  {
    secrets: [openAiKey],

    invoker: 'public',
  },

  async (request) => {
    try {
      /* OPENAI */

      const openai = new OpenAI({
        apiKey: openAiKey.value(),
      });

      /* DATA */

      const player = request.data.player;

      const comments = request.data.comments || [];

      /* GPT */

      const completion = await openai.chat.completions.create({
        model: 'gpt-4.1-mini',

        messages: [
          {
            role: 'system',

            content: `

Eres un entrenador profesional
de fútbol.

Analiza el rendimiento
del jugador.

RESPONDE SOLO
EN FORMATO JSON.

NO uses markdown.
NO agregues texto
fuera del JSON.

Formato obligatorio:

{
  "strengths": [
    "fortaleza 1",
    "fortaleza 2"
  ],

  "weaknesses": [
    "debilidad 1",
    "debilidad 2"
  ],

  "tips": [
    "consejo 1",
    "consejo 2"
  ]
}

Reglas:

- Máximo 4 items
  por sección.

- Frases cortas.

- Lenguaje futbolero.

- Consejos realistas.

                  `,
          },

          {
            role: 'user',

            content: `

Jugador:
${player?.name || 'Sin nombre'}

Posición:
${player?.position || 'Sin posición'}

Rating:
${player?.averageRating || 0}

Goles:
${player?.goals || 0}

Asistencias:
${player?.assists || 0}

MVPs:
${player?.mvps || 0}

Comentarios:
${comments.join(', ') || 'Sin comentarios'}

                  `,
          },
        ],
      });
      const content = String(completion.choices[0]?.message?.content || '{}');

      console.log('AI RESPONSE:', content);
      let parsedInsight;

      try {
        parsedInsight = JSON.parse(content);
      } catch (parseError) {
        console.error('JSON PARSE ERROR:', parseError);

        parsedInsight = {
          strengths: [],

          weaknesses: [],

          tips: [],
        };
      }

      return {
        insight: parsedInsight,
      };
    } catch (error) {
      console.error('ERROR IA:', error);

      return {
        insight: {
          strengths: [],

          weaknesses: [],

          tips: [],
        },
      };
    }
  },
);
