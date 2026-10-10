export default function handler(req,res){res.status(200).json({aiReady:!!process.env.OPENAI_API_KEY});}
