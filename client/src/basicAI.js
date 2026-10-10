// No-key study helper. This is a limited, deterministic study tool, not a general-purpose LLM.
const clean=s=>String(s||'').replace(/\s+/g,' ').trim();
const stop=/^(the|this|that|these|those|and|but|or|also|however|therefore|for example)\b/i;
export function basicCards(text,count=8){
 const sentences=clean(text).split(/(?<=[.!?])\s+|\n+/).map(s=>s.trim()).filter(s=>s.length>28&&!stop.test(s)).slice(0,80);
 const result=[];
 for(const s of sentences){
  let m=s.match(/^(.{3,65}?)\s+(?:is|are|refers to|means|can be defined as)\s+(.{12,})/i);
  if(m){result.push({front:`What ${/\bare\b/i.test(s)?'are':'is'} ${m[1].replace(/^the /i,'')}?`,back:clean(m[2]),explanation:`From your notes: ${s}`});}
  else {const words=s.split(' ');const topic=words.slice(0,Math.min(6,Math.max(2,Math.floor(words.length/3)))).join(' ');result.push({front:`Explain the concept: ${topic}…`,back:s,explanation:'Review the original sentence in your notes.'});}
  if(result.length>=count)break;
 }
 if(!result.length)throw Error('Please paste a few complete sentences to create study cards.');
 while(result.length<count&&result.length>1){const x=result[result.length%Math.min(result.length,4)];result.push({front:`Quick revision: ${x.front}`,back:x.back,explanation:'Practice recalling the same key concept.'});}
 return result.slice(0,count);
}
export function basicQuiz(text,count=8){
 const cards=basicCards(text,Math.max(5,count));const items=[];
 cards.forEach((c,i)=>{
  const distractors=cards.filter((_,j)=>j!==i).map(x=>x.back).filter(x=>x!==c.back).slice(0,3);
  if(distractors.length<3)return;
  const answer=i%4;const options=[...distractors];options.splice(answer,0,c.back);
  items.push({question:c.front,options,answer,explanation:`Correct answer: ${c.back}`});
 });
 if(!items.length)throw Error('Add more detailed notes (at least four distinct concepts) for a meaningful quiz.');
 return items.slice(0,count);
}
function calculate(q){
 const lower=q.toLowerCase();
 const match=q.match(/(?:calculate|solve|what is|evaluate)?\s*([\d.]+)\s*([+*/×÷−-])\s*([\d.]+)/i);
 if(match){const a=Number(match[1]),b=Number(match[3]),op=match[2];if(op==='/'||op==='÷'){if(b===0)return 'Division by zero is undefined.';return `${a} ÷ ${b} = ${a/b}`;}const n=op==='+'?a+b:op==='*'||op==='×'?a*b:a-b;return `${a} ${op} ${b} = ${n}`;}
 const eq=q.match(/(?:solve\s*)?([+-]?\d*\.?\d*)\s*x\s*([+-])\s*(\d+(?:\.\d+)?)\s*=\s*([+-]?\d+(?:\.\d+)?)/i);
 if(eq){let a=eq[1]===''||eq[1]==='+'?1:eq[1]==='-'?-1:Number(eq[1]);const b=Number(eq[3])*(eq[2]==='-'?-1:1),c=Number(eq[4]);if(!a)return 'The coefficient of x cannot be zero for this method.';return `Given ${a}x ${b<0?'-':'+'} ${Math.abs(b)} = ${c}\nStep 1: Move the constant: ${a}x = ${c} - (${b}) = ${c-b}\nStep 2: Divide by ${a}: x = ${(c-b)/a}`;}
 const nums=[...q.matchAll(/(\d+(?:\.\d+)?)\s*(?:v|volts?|a|amps?|ohms?|Ω)/gi)].map(m=>Number(m[1]));
 if(/ohm.?s law/i.test(lower))return 'Ohm’s law: V = I × R.\nV = voltage (volts), I = current (amperes), R = resistance (ohms).\nFor a numerical problem, give any two values and I can explain the formula.';
 return null;
}
const facts=[[/\b(thevenin|thevenin.s theorem)\b/i,'Thevenin’s theorem: a linear two-terminal circuit can be replaced by one equivalent voltage source Vth in series with one resistance Rth. Find open-circuit voltage for Vth, then equivalent resistance seen from the terminals for Rth.'],[/\bohm.?s law\b/i,'Ohm’s law states V = I × R, where V is voltage, I is current and R is resistance.'],[/\b(?:kirchhoff|kvl|kcl)\b/i,'Kirchhoff’s Current Law (KCL): total current entering a node equals total leaving it. Kirchhoff’s Voltage Law (KVL): the algebraic sum of voltages around a closed loop is zero.'],[/\b(?:capacitor|capacitance)\b/i,'A capacitor stores electrical energy in an electric field. Capacitance is C = Q/V, measured in farads.'],[/\b(?:resistor|resistance)\b/i,'Resistance opposes current flow and is measured in ohms (Ω). Ohm’s law is V = IR.'],[/\b(?:transformer)\b/i,'A transformer transfers AC electrical energy between circuits through electromagnetic induction. Ideally Vp/Vs = Np/Ns.'],[/\b(?:java class|object in java|oops)\b/i,'In Java, a class is a blueprint defining fields and methods. An object is an instance of that class, created using new.'],[/\b(?:photosynthesis)\b/i,'Photosynthesis converts light energy into chemical energy. Plants use carbon dioxide and water to produce glucose and oxygen.'],[/\b(?:mitochondria)\b/i,'Mitochondria are organelles involved in producing ATP during cellular respiration.']];
export function basicTutor(question,notes=''){
 const q=clean(question);if(!q)return 'Ask a study question to get started.';
 const math=calculate(q);if(math)return math;
 const fact=facts.find(([re])=>re.test(q));if(fact)return fact[1]+'\n\nWant to practice? Ask for a related numerical or example.';
 const terms=q.toLowerCase().replace(/^(what is|explain|define|describe|tell me about|how does|why does)\s+/,'').replace(/[?!.]/g,'').split(/\W+/).filter(w=>w.length>3);
 const lines=clean(notes).split(/(?<=[.!?])\s+/).filter(x=>x.length>15);
 const scored=lines.map(s=>({s,n:terms.filter(t=>s.toLowerCase().includes(t)).length})).sort((a,b)=>b.n-a.n);
 if(scored[0]?.n>0)return `From your uploaded notes:\n${scored.slice(0,2).filter(x=>x.n>0).map(x=>x.s).join('\n')}\n\nTry explaining this in your own words, then check your notes.`;
 return 'I can help with basic maths, electrical engineering, Java fundamentals, and questions from your pasted notes. For more open-ended questions and detailed step-by-step reasoning, connect the optional Groq AI key in Vercel. Please add more details or paste the relevant notes.';
}
