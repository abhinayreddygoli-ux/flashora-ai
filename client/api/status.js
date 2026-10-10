export default function handler(req,res){res.status(200).json({aiReady:!!process.env.GEMINI_API_KEY,provider:'Gemini'});}
