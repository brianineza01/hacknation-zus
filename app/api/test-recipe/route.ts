import { createOpenRouter } from '@openrouter/ai-sdk-provider';
import { generateText } from 'ai';

export async function POST(request: Request) {
  try {
    const { recipe } = await request.json();
    
    if (!recipe) {
      return Response.json({ error: 'Recipe parameter is required' }, { status: 400 });
    }
    
    const openrouter = createOpenRouter({
      apiKey: process.env.OPENROUTER_API_KEY,
    });
    
    const { text } = await generateText({
      model: openrouter.chat('google/gemini-2.0-flash-exp:free'),
      prompt: `Generate a simple recipe for ${recipe}`,
    });
    
    return Response.json({ recipe: text });
  } catch (error) {
    console.error('Recipe generation error:', error);
    return Response.json({ error: 'Failed to generate recipe' }, { status: 500 });
  }
}