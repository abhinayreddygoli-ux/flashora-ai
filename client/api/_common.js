export const system = 'You are Flashora, a helpful accurate exam tutor. Ground questions in the supplied notes, do not invent details, explain simply, and say when notes are insufficient.';
export const ready = () => Boolean(process.env.GEMINI_API_KEY);
export async function askGemini(prompt, json=false) {
  const key=process.env.GEMINI_API_KEY;
  if(!key) {const e=new Error('Missing GEMINI_API_KEY in Vercel Environment Variables.');e.status=503;throw e;}
  const model=process.env.GEMINI_MODEL||'gemini-2.5-flash-lite';
  const controller=new AbortController();const timer=setTimeout(()=>controller.abort(),45000);
  try {
    const r=await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(model)}:generateContent`,{
      method:'POST',headers:{'Content-Type':'application/json','x-goog-api-key':key},signal:controller.signal,
      body:JSON.stringify({systemInstruction:{parts:[{text:system}]},contents:[{role:'user',parts:[{text:prompt}]}],generationConfig:json?{responseMimeType:'application/json',temperature:0.5}:{temperature:0.5}})
    });
    const data=await r.json().catch(()=>({}));
    if(!r.ok){const e=new Error(data.error?.message||`Gemini HTTP ${r.status}`);e.status=r.status;throw e;}
    const text=(data.candidates?.[0]?.content?.parts||[]).map(x=>x.text||'').join('').trim();
    if(!text)throw new Error('Gemini returned no text. Try again.');
    return text;
  }finally{clearTimeout(timer)}
}
export function error(res,e){console.error('Gemini API:',e.status||500,e.message);let message='AI request failed. Check Vercel Function logs.';if(e.status===429)message='Free Gemini API quota or rate limit reached. Please try again later.';else if(e.status===403||e.status===401)message='Gemini API key is invalid or does not have access. Check Google AI Studio.';else if(e.status===404)message='Gemini model unavailable. Check GEMINI_MODEL.';else if(e.status===503)message=e.message;else if(e.name==='AbortError')message='AI request timed out. Please try again.';return res.status(e.status===429?429:e.status===503?503:500).json({error:message});}
