import {askAI,error,ready} from './_common.js';
export default async function handler(req,res){
 if(req.method!=='POST')return res.status(405).json({error:'Method not allowed'});
 if(!ready())return res.status(503).json({error:'Basic study mode is available without an API key.'});
 const {question,text,history=[]}=req.body||{};
 if(typeof question!=='string'||!question.trim())return res.status(400).json({error:'Ask a question first.'});
 const h=Array.isArray(history)?history.slice(-6).filter(x=>x&&['user','assistant'].includes(x.role)).map(x=>`${x.role}: ${String(x.content).slice(0,1500)}`).join('\n'):'';
 try {const answer=await askAI(`Explain clearly and step by step. If the student asks a numerical problem, show formulas, substitution, and units.\nSTUDY NOTES:\n${String(text||'').slice(0,30000)}\nPREVIOUS CHAT:\n${h}\nSTUDENT QUESTION:\n${question.slice(0,3000)}`);return res.status(200).json({answer});}catch(e){return error(res,e)}
}
