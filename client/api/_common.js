import OpenAI from 'openai';
export const getAI=()=>process.env.OPENAI_API_KEY?new OpenAI({apiKey:process.env.OPENAI_API_KEY}):null;
export function error(res,e){console.error(e);return res.status(500).json({error:'AI request failed. Check the server API key, model, and Vercel Function logs.'});}
export const system='You are Flashora, a supportive, accurate, clear exam tutor. Ground study questions in the supplied material. Do not invent details. When material is insufficient, say so. Use short explanations and effective recall questions.';
