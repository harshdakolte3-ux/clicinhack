import { NextRequest, NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';

export async function POST(req: NextRequest) {
  try {
    const { symptoms, services } = await req.json();

    if (!symptoms || !services || services.length === 0) {
      return NextResponse.json({ error: 'Symptoms and services are required.' }, { status: 400 });
    }

    const apiKey = process.env.GEMINI_API_KEY || process.env.NEXT_PUBLIC_GEMINI_API_KEY;
    if (!apiKey) {
      // Hackathon Fallback Mock - Smarter Simulation
      console.warn('No Gemini API Key found. Using smart mock triage response for demo.');
      const text = symptoms.toLowerCase();
      let targetService = services[0];
      let priority = 'REGULAR';
      let reasoning = 'Standard checkup assigned based on symptoms.';

      if (text.includes('chest') || text.includes('numb') || text.includes('heart')) {
        targetService = services.find((s: any) => s.name.toLowerCase().includes('general') || s.name.toLowerCase().includes('medicine')) || services[0];
        priority = 'EMERGENCY';
        reasoning = 'Critical symptoms detected. Immediate attention required.';
      } else if (text.includes('teeth') || text.includes('tooth') || text.includes('dental')) {
        targetService = services.find((s: any) => s.name.toLowerCase().includes('dental')) || services[0];
        reasoning = 'Symptoms indicate a dental issue. Routing to Dental OPD.';
      } else if (text.includes('child') || text.includes('baby') || text.includes('fever')) {
        targetService = services.find((s: any) => s.name.toLowerCase().includes('pediatric') || s.name.toLowerCase().includes('vaccin')) || services[0];
        reasoning = 'Pediatric symptoms detected. Routing to Pediatrics.';
      } else if (text.includes('medicine') || text.includes('pill') || text.includes('pharmacy')) {
        targetService = services.find((s: any) => s.name.toLowerCase().includes('pharmacy')) || services[0];
        reasoning = 'Routing directly to Pharmacy for medication dispensing.';
      }

      return NextResponse.json({
        serviceId: targetService?.id,
        priority: priority,
        reasoning: reasoning
      });
    }

    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

    const prompt = `
      You are an expert AI medical triage assistant for a hospital queue system.
      The patient reports the following symptoms: "${symptoms}"

      Here are the available hospital departments (Services):
      ${services.map((s: any) => `- ID: ${s.id} | Name: ${s.name}`).join('\n')}

      Your task is to:
      1. Determine the most appropriate department ID from the list.
      2. Determine the priority level. If the symptoms are life-threatening, urgent, or highly severe (like chest pain, severe bleeding, stroke symptoms, numbness), set it to "EMERGENCY". Otherwise, set it to "REGULAR".
      3. Provide a brief 1-sentence reasoning for your decision.

      Return EXACTLY and ONLY a raw JSON object (no markdown formatting, no backticks).
      Format:
      {
        "serviceId": "chosen_id_here",
        "priority": "EMERGENCY" or "REGULAR",
        "reasoning": "brief explanation here"
      }
    `;

    const result = await model.generateContent(prompt);
    let text = result.response.text().trim();
    
    // Strip markdown formatting if the model still returns it
    if (text.startsWith('\`\`\`json')) {
      text = text.replace(/^\`\`\`json\n?/, '').replace(/\n?\`\`\`$/, '');
    } else if (text.startsWith('\`\`\`')) {
      text = text.replace(/^\`\`\`\n?/, '').replace(/\n?\`\`\`$/, '');
    }

    const triageData = JSON.parse(text);

    return NextResponse.json(triageData);
  } catch (error: any) {
    console.error('AI Triage Error:', error);
    return NextResponse.json({ error: 'Failed to run AI triage.' }, { status: 500 });
  }
}
