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

- Analiza al jugador
  según su posición.

- Un arquero NO debe
  evaluarse por goles
  o aporte ofensivo.

- Un defensa debe
  priorizar:
  marca,
  orden,
  salida limpia
  y posicionamiento.

- Un mediocampista debe
  aportar:
  creación,
  recuperación
  y ritmo.

- Un delantero debe
  aportar:
  definición,
  movilidad
  y presencia ofensiva.

- Basa el análisis en:
  comentarios,
  rating promedio,
  posición del jugador,
  cantidad de partidos jugados,
  MVPs
  y contexto futbolístico.

- La posición del jugador
  es fundamental para
  interpretar correctamente
  el rendimiento.

- La cantidad de partidos
  debe influir en el nivel
  de confianza del análisis.

- Si el jugador tiene
  pocos partidos,
  evita conclusiones
  extremas o definitivas.

- Las recomendaciones deben
  ser coherentes con las
  estadísticas del jugador.

- Si el jugador tiene
  goles o asistencias,
  evita decir que no aporta
  ofensivamente, a menos
  que los comentarios
  lo indiquen claramente.

- No contradigas
  estadísticas positivas
  con críticas negativas
  sin contexto suficiente.

- NO inventes críticas
  ofensivas para
  defensas o arqueros
  si los comentarios
  no lo indican.

- Si hay comentarios
  repetidos sobre
  una debilidad,
  dale prioridad.

                  `,
          },

          {
            role: 'user',

            content: `

Jugador:
${player?.name || 'Sin nombre'}

Posición:
${player?.position || 'Sin posición'}

Partidos jugados:
${player?.totalMatches || 0}

Rating promedio:
${player?.averageRating || 0}

Goles:
${player?.goals || 0}

Asistencias:
${player?.assists || 0}

MVPs:
${player?.mvps || 0}

Votos MVP del partido:
${player?.totalMvpVotes || 0}

Comentarios:
${comments.join('. ') || 'Sin comentarios'}

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
