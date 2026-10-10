import {getAI,error,system} from './_common.js';
export default async function handler(req,res){
 if(req.method!=='POST')return res.status(405).json({error:'Method not allowed'});
 const ai=getAI();if(!ai)return res.status(503).json({error:'AI is not connected yet. Add OPENAI_API_KEY in Vercel → Settings → Environment Variables, then redeploy.'});
 const {kind,text,exam,subject,chapter,difficulty,count}=req.body||{};
 if(!['flashcards','quiz'].includes(kind)||typeof text!=='string'||text.trim().length<40)return res.status(400).json({error:'Paste or upload at least 40 characters of study notes.'});
 const n=Math.min(20,Math.max(3,Number(count)||8));
 const schema=kind==='flashcards'?`Return JSON {"items":[{"front":"one clear active recall question","back":"accurate answer","explanation":"helpful short explanation"}]}. Exactly ${n} distinct questions.`:`Return JSON {"items":[{"question":"specific multiple choice question","options":["answer 1","answer 2","answer 3","answer 4"],"answer":0,"explanation":"why the correct answer is right"}]}. Exactly ${n} distinct MCQs. Only one correct answer per question. answer must be its zero-based index.`;
 try{const r=await ai.chat.completions.create({model:process.env.OPENAI_MODEL||'gpt-4o-mini',response_format:{type:'json_object'},messages:[{role:'system',content:system+' Respond with valid JSON only.'},{role:'user',content:`${schema}\nExam: ${exam||'General'}; Subject: ${subject||'General'}; Chapter: ${chapter||'All'}; Difficulty: ${difficulty||'Medium'}.\nSTUDY NOTES:\n${text.slice(0,35000)}`} ]});const data=JSON.parse(r.choices[0].message.content);if(!Array.isArray(data.items))throw Error('Bad response');res.json({items:data.items});}catch(e){return error(res,e)}
}
