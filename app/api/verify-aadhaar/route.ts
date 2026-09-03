import { NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';

export async function POST(request: Request) {
  try {
    const { imageBase64 } = await request.json();
    if (!imageBase64) return NextResponse.json({ error: 'Image is required' }, { status: 400 });

    const apiKey = process.env.GEMINI_API_KEY || process.env.NEXT_PUBLIC_GEMINI_API_KEY;
    if (!apiKey) {
      return NextResponse.json({ success: true, age: 25, dob: "01/01/1999", isVerified: true, mocked: true });
    }

    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

    const prompt = `Extract the Date of Birth (DOB) or Year of Birth (YOB) from this Aadhaar card. 
Calculate the person's current age. 
Respond ONLY with a JSON object in this format: {"dob": "DD/MM/YYYY", "age": 25, "isVerified": true} 
If you cannot find the date of birth or verify it as an ID card, return {"isVerified": false}.`;

    const result = await model.generateContent([
      prompt,
      { inlineData: { data: imageBase64, mimeType: 'image/jpeg' } }
    ]);
    
    const responseText = result.response.text();
    const jsonMatch = responseText.match(/\{[\s\S]*\}/);
    
    if (jsonMatch) {
        return NextResponse.json({ success: true, ...JSON.parse(jsonMatch[0]) });
    } else {
        return NextResponse.json({ error: 'Failed to parse Gemini response' }, { status: 500 });
    }
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 });
  }
}
