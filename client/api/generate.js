import {askAI,error,ready} from './_common.js';
export default async function handler(req,res){
 if(req.method!=='POST')return res.status(405).json({error:'Method not allowed'});
 if(!ready())return res.status(503).json({error:'Basic study mode is available without an API key.'});
 const {kind,text,exam,subject,chapter,difficulty,count}=req.body||{};
 if(!['flashcards','quiz'].includes(kind)||typeof text!=='string'||text.trim().length<40)return res.status(400).json({error:'Paste or upload at least 40 characters of study notes.'});
 const n=Math.min(20,Math.max(3,Number(count)||8));
 const schema=kind==='flashcards'?`Return JSON {"items":[{"front":"one clear active recall question","back":"accurate answer","explanation":"short helpful explanation"}]}. Exactly ${n} distinct questions.`:`Return JSON {"items":[{"question":"specific multiple choice question","options":["option A","option B","option C","option D"],"answer":0,"explanation":"why correct answer is right"}]}. Exactly ${n} distinct MCQs. Only one correct answer. answer is the zero-based option index (0 to 3).`;
 try {
  const raw=await askAI(`${schema}\nExam: ${exam||'General'}; Subject: ${subject||'General'}; Chapter: ${chapter||'All'}; Difficulty: ${difficulty||'Medium'}.\nGenerate questions based on these study notes, avoiding unsupported claims. Output valid JSON only.\nSTUDY NOTES:\n${text.slice(0,35000)}`,true);
  const data=JSON.parse(raw);if(!Array.isArray(data.items)||!data.items.length)throw new Error('Unexpected response format');
  if(kind==='quiz')data.items=data.items.filter(x=>Array.isArray(x.options)&&x.options.length===4&&Number.isInteger(x.answer)&&x.answer>=0&&x.answer<=3);
  if(!data.items.length)throw new Error('No valid questions generated');
  return res.status(200).json({items:data.items.slice(0,n)});
 }catch(e){return error(res,e)}
}
