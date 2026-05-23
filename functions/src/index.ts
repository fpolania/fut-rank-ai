import { onCall } from 'firebase-functions/v2/https';
import { defineSecret } from 'firebase-functions/params';
import OpenAI from 'openai';
import axios from 'axios';
import * as fs from 'fs';
import * as path from 'path';
import * as os from 'os';
import ffmpeg from 'fluent-ffmpeg';
import ffmpegPath from 'ffmpeg-static';
import { onRequest } from 'firebase-functions/v2/https';

const openAiKey = defineSecret('OPENAI_API_KEY');
ffmpeg.setFfmpegPath(ffmpegPath as string);

/* PLAYER INSIGHT */

export const generatePlayerInsight = onCall(
  {
    secrets: [openAiKey],

    invoker: 'public',
  },

  async (request) => {
    try {
      const openai = new OpenAI({
        apiKey: openAiKey.value(),
      });

      const player = request.data.player;

      const comments = request.data.comments || [];

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

Formato obligatorio:

{
  "strengths": [],
  "weaknesses": [],
  "tips": []
}

                `,
          },

          {
            role: 'user',

            content: `

Jugador:
${player?.name || 'Sin nombre'}

Posición:
${player?.position || 'Sin posición'}

Partidos:
${player?.totalMatches || 0}

Rating:
${player?.averageRating || 0}

Goles:
${player?.goals || 0}

Asistencias:
${player?.assists || 0}

MVPs:
${player?.mvps || 0}

Comentarios:
${comments.join('. ') || 'Sin comentarios'}

                `,
          },
        ],
      });

      const content = String(completion.choices[0]?.message?.content || '{}');

      let parsedInsight;

      try {
        parsedInsight = JSON.parse(content);
      } catch {
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

/* MATCH ANALYSIS */

export const generateMatchAnalysis = onRequest(
  {
    secrets: [openAiKey],

    cors: true,

    timeoutSeconds: 540,

    memory: '2GiB',
  },

  async (req, res) => {
    try {
      /* OPENAI */

      const openai = new OpenAI({
        apiKey: openAiKey.value(),
      });

      /* DATA */

      const { videoUrl, teamColor, matchType, focus } = req.body;

      /* PATHS */

      const tempDir = os.tmpdir();

      const timestamp = Date.now();

      const videoPath = path.join(tempDir, `video-${timestamp}.mp4`);

      const framesDir = path.join(tempDir, `frames-${timestamp}`);

      /* CREATE DIR */

      if (!fs.existsSync(framesDir)) {
        fs.mkdirSync(framesDir);
      }

      /* DOWNLOAD VIDEO */

      console.log('DOWNLOADING VIDEO...');

      const response = await axios({
        url: videoUrl,

        method: 'GET',

        responseType: 'stream',
      });

      const writer = fs.createWriteStream(videoPath);

      response.data.pipe(writer);

      await new Promise((resolve, reject) => {
        writer.on('finish', resolve);

        writer.on('error', reject);
      });

      console.log('VIDEO DOWNLOADED');

      /* EXTRACT FRAMES */

      console.log('EXTRACTING FRAMES...');

      await new Promise((resolve, reject) => {
        ffmpeg(videoPath)
          .output(path.join(framesDir, 'frame-%03d.jpg'))

          .outputOptions(['-vf fps=0.25,scale=640:-1', '-q:v 12'])

          .on(
            'end',

            () => {
              console.log('FRAMES EXTRACTED');

              resolve(true);
            },
          )

          .on(
            'error',

            (error: any) => {
              console.error('FFMPEG ERROR:', error);

              reject(error);
            },
          )

          .run();
      });

      /* FRAMES */

      const frames = fs.readdirSync(framesDir).slice(0, 6);

      console.log('TOTAL FRAMES:', frames.length);

      /* IMAGES */

      const imageMessages = frames.map((frame) => {
        const imagePath = path.join(framesDir, frame);

        const imageBuffer = fs.readFileSync(imagePath);

        const base64 = imageBuffer.toString('base64');

        return {
          type: 'image_url' as const,

          image_url: {
            url: `data:image/jpeg;base64,${base64}`,
          },
        };
      });

      /* GPT */

      console.log('SENDING TO OPENAI...');

      const completion = await openai.chat.completions.create({
        model: 'gpt-4.1-mini',

        temperature: 0.2,

        messages: [
          {
            role: 'system',

            content: `

Eres un analista táctico
de fútbol amateur.

Tu trabajo es analizar
SOLO patrones visuales
claramente visibles.

NO inventes:
- dorsales
- posiciones exactas
- nombres
- roles tácticos
- sistemas
- movimientos específicos
- jugadas no visibles

NO afirmes cosas
con certeza absoluta
si no son evidentes.

Usa lenguaje prudente:
- "parece"
- "se observa"
- "probablemente"
- "da la impresión"

NO digas:
- "el #6"
- "el pivote"
- "el lateral"

porque no puedes
identificar jugadores
con precisión.

Solo analiza:
- compactación
- espacios
- amplitud
- intensidad general
- presión aproximada
- ocupación de cancha
- velocidad de transición
- orden defensivo
- comportamiento colectivo

Si no hay suficiente
información visual,
dilo claramente.

IMPORTANTE:

Debes analizar SOLO
al equipo indicado.

NO analices:
- rival
- equipo contrario
- jugadores rivales

NO cambies de equipo
durante el análisis.

Habla como entrenador
de fútbol amateur.

RESPONDE EN FORMATO MARKDOWN.

Formato obligatorio:

## 🔥 Presión

texto...

## 🛡 Defensa

texto...

## ⚡ Transiciones

texto...

## 📈 Recomendaciones

texto...

Reglas:

- máximo 2 párrafos
  por sección

- evita textos largos

- frases claras

- lenguaje futbolero

- NO inventes detalles
  tácticos avanzados

- NO sobreanalices

              `,
          },

          {
            role: 'user',

            content: [
              {
                type: 'text',

                text: `

IMPORTANTE:

Analiza ÚNICAMENTE
al equipo con:

${teamColor}

IGNORA completamente
al equipo rival.

NO describas acciones
del equipo contrario.

NO cambies de equipo
durante el análisis.

Si el equipo con
${teamColor}
no se ve claramente,
indica que no hay
suficiente información visual.

Tipo:
${matchType}

Enfoque:
${focus || 'General'}

Analiza únicamente
lo claramente visible
en las imágenes.

NO inventes
detalles tácticos.

                  `,
              },

              ...imageMessages,
            ],
          },
        ],
      });

      /* RESPONSE */

      const analysis = completion.choices[0]?.message?.content || '';

      console.log('AI ANALYSIS:', analysis);

      /* CLEAN FILES */

      try {
        fs.rmSync(framesDir, {
          recursive: true,
          force: true,
        });

        if (fs.existsSync(videoPath)) {
          fs.unlinkSync(videoPath);
        }
      } catch (cleanError) {
        console.error('CLEAN ERROR:', cleanError);
      }

      /* RETURN */

      res.status(200).json({
        success: true,

        analysis,
      });
    } catch (error) {
      console.error('MATCH AI ERROR:', error);

      res.status(500).json({
        success: false,

        analysis: '',
      });
    }
  },
);
