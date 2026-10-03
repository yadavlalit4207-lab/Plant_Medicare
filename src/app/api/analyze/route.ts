import { NextRequest, NextResponse } from 'next/server';
import { ApiError, GoogleGenAI } from '@google/genai';

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const image = formData.get('image') as File;

    if (!image) {
      return NextResponse.json({ error: 'No image provided' }, { status: 400 });
    }

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      return NextResponse.json({ error: 'GEMINI_API_KEY is not set' }, { status: 500 });
    }

    const ai = new GoogleGenAI({ apiKey });

    // Convert file to base64
    const buffer = Buffer.from(await image.arrayBuffer());
    
    let response;
    let lastApiError: ApiError | undefined;

    for (const model of ['gemini-3.8-flash', 'gemini-3.7-flash', 'gemini-3.5-flash']) {
      try {
        response = await ai.models.generateContent({
          model,
          contents: [
            {
              role: 'user',
              parts: [
                {
                  inlineData: {
                    data: buffer.toString("base64"),
                    mimeType: image.type,
                  },
                },
                {
                  text: `Analyze this image of a plant or leaf. Return a JSON object with the following exact fields. IMPORTANT: Write your explanations in very simple, easy-to-understand language so that anyone (even without a background in plants) can understand:
                  - "illness": The name of the plant's illness or condition. If healthy, say "Healthy".
                  - "cause": A brief, simple explanation of what causes this illness.
                  - "cure": Easy-to-follow steps to cure the illness.
                  - "prevention": Simple steps to prevent this in the future.
                  Only return valid JSON without markdown wrapping.`,
                },
              ],
            },
          ],
          config: {
            responseMimeType: "application/json",
          }
        });
        break;
      } catch (error: unknown) {
        if (!(error instanceof ApiError) || (error.status !== 429 && error.status !== 503)) {
          throw error;
        }

        lastApiError = error;
        console.warn(`Gemini model ${model} returned ${error.status}; trying the next available model.`);
      }
    }

    if (!response) {
      const quotaExceeded = lastApiError?.status === 429;
      return NextResponse.json(
        {
          error: quotaExceeded
            ? 'Gemini API quota exceeded for the available models. Check your API plan and rate limits.'
            : 'The AI service is temporarily unavailable. Please try again shortly.',
        },
        { status: quotaExceeded ? 429 : 503 },
      );
    }

    if (!response.text) {
      return NextResponse.json({ error: 'Failed to generate response' }, { status: 500 });
    }

    const result = JSON.parse(response.text);

    return NextResponse.json(result);
  } catch (error: unknown) {
    console.error('Error analyzing image:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Something went wrong' },
      { status: 500 },
    );
  }
}
