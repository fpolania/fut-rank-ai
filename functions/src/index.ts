import { onCall }
    from "firebase-functions/v2/https";

import {
    defineSecret
} from "firebase-functions/params";

import OpenAI
    from "openai";

/* SECRET */

const openAiKey =

    defineSecret(
        "OPENAI_API_KEY"
    );

/* FUNCTION */

export const generatePlayerInsight =

    onCall(

        {

            secrets: [openAiKey],

            invoker: "public"

        },

        async (request) => {

            try {

                /* OPENAI */

                const openai =

                    new OpenAI({

                        apiKey:
                            openAiKey.value()

                    });

                /* DATA */

                const player =
                    request.data.player;

                const comments =
                    request.data.comments || [];

                /* LOGS */

                console.log(
                    "PLAYER:",
                    player
                );

                console.log(
                    "COMMENTS:",
                    comments
                );

                /* GPT */

                const completion =

                    await openai
                        .chat
                        .completions
                        .create({

                            model:
                                "gpt-4.1-mini",

                            messages: [

                                {

                                    role: "system",

                                    content:
                                        `
                    Eres un entrenador
                    profesional de fútbol.

                    Analiza fortalezas,
                    debilidades y consejos
                    para mejorar.
                    `

                                },

                                {

                                    role: "user",

                                    content:
                                        `
Jugador:
${player?.name || "Sin nombre"}

Posición:
${player?.position || "Sin posición"}

Rating:
${player?.averageRating || 0}

Goles:
${player?.goals || 0}

Asistencias:
${player?.assists || 0}

MVPs:
${player?.mvps || 0}

Comentarios:
${comments?.join(", ") || "Sin comentarios"}
`

                                }

                            ]

                        });

                /* RESPONSE */

                return {

                    insight:

                        completion
                            .choices[0]
                            .message
                            .content

                };

            } catch (error) {

                console.error(
                    "ERROR IA:",
                    error
                );

                return {

                    insight:
                        "Error generando insight IA"

                };

            }

        }

    );