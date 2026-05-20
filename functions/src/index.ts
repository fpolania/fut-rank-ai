import { onCall } from 'firebase-functions/v2/https';
import { defineSecret } from 'firebase-functions/params';
import OpenAI from 'openai';
import axios from 'axios';
import * as fs from 'fs';
import * as path from 'path';
import * as os from 'os';
import ffmpeg from 'fluent-ffmpeg';
import ffmpegPath from 'ffmpeg-static';

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

export const generateMatchAnalysis = onCall(
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

      const { videoUrl, teamColor, matchType, focus } = request.data;

      /* PATHS */

      const tempDir = os.tmpdir();

      const videoPath = path.join(tempDir, `video-${Date.now()}.mp4`);

      const framesDir = path.join(tempDir, `frames-${Date.now()}`);

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

          .outputOptions(['-vf fps=0.5'])

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
              console.error(error);

              reject(error);
            },
          )

          .run();
      });

      /* FRAMES */

      const frames = fs.readdirSync(framesDir).slice(0, 8);

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

      const completion = await openai.chat.completions.create({
        model: 'gpt-4.1-mini',

        messages: [
          {
            role: 'system',

            content: `

Eres un analista táctico
de fútbol amateur.

Analiza:
- presión
- espacios
- líneas defensivas
- transiciones
- posicionamiento
- errores tácticos
- organización colectiva

NO inventes jugadas.

Habla como entrenador profesional.

RESPONDE EN FORMATO MARKDOWN.

Usa títulos cortos.

Divide el análisis
por secciones.

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

- evita bloques
  gigantes

- frases claras

- lenguaje futbolero

- sé directo

              `,
          },

          {
            role: 'user',

            content: [
              {
                type: 'text',

                text: `

Analiza al equipo:
${teamColor}

Tipo:
${matchType}

Enfoque:
${focus || 'General'}

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

      fs.rmSync(framesDir, {
        recursive: true,

        force: true,
      });

      fs.unlinkSync(videoPath);

      /* RETURN */

      return {
        success: true,

        analysis,
      };
    } catch (error) {
      console.error('MATCH AI ERROR:', error);

      return {
        success: false,

        analysis: '',
      };
    }
  },
);
