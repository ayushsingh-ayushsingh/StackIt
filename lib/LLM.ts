import { Groq } from 'groq-sdk';
import { marked } from 'marked';

const groq = new Groq({
    apiKey: process.env.GROQ_API_KEY,
});

export interface QuestionAnswer {
    question: string;
    answer: string;
    confidence: number;
}

// Fallback responses for testing when API key is not available
const fallbackResponses = [
    "This is a programming question that would typically be answered by the AI. For now, this is a placeholder response. Please set up your Groq API key to get real AI answers.",
    "I'd help you with this programming question, but I need a valid API key to access the AI service. Please check your environment configuration.",
    "This appears to be a technical question that I could assist with. To get a proper AI response, please ensure your GROQ_API_KEY is set in your environment variables."
];

function ensureHtml(answer: string): string {
    // If the answer looks like HTML, return as is. Otherwise, convert markdown/plain to HTML.
    if (/<[a-z][\s\S]*>/i.test(answer.trim())) {
        return answer;
    }
    // Use parseSync if available, otherwise cast parse as string
    if (typeof (marked as { parseSync?: unknown }).parseSync === 'function') {
        return (marked as unknown as { parseSync: (input: string) => string }).parseSync(answer);
    }
    return marked.parse(answer) as string;
}

export async function generateAnswer(question: string): Promise<QuestionAnswer> {
    try {
        // Check if API key is available
        if (!process.env.GROQ_API_KEY) {
            const fallbackResponse = fallbackResponses[Math.floor(Math.random() * fallbackResponses.length)];
            return {
                question,
                answer: ensureHtml(fallbackResponse),
                confidence: 0.3
            };
        }

        const systemPrompt = `You are a helpful programming assistant. Provide clear, concise, and accurate answers to programming questions. 
    Focus on practical solutions and best practices. If the question is not programming-related, politely redirect to programming topics.
    Keep answers under 200 words unless more detail is specifically requested. Format your answer in markdown for best display.`;

        const chatCompletion = await groq.chat.completions.create({
            messages: [
                {
                    role: "system",
                    content: systemPrompt
                },
                {
                    role: "user",
                    content: question
                }
            ],
            model: "llama-3.1-8b-instant",
            temperature: 0.7,
            max_tokens: 500,
            top_p: 1,
            stream: false,
        });

        const answer = chatCompletion.choices[0]?.message?.content || 'Sorry, I could not generate an answer at this time.';

        return {
            question,
            answer: ensureHtml(answer),
            confidence: 0.99 // You could implement a more sophisticated confidence scoring
        };
    } catch (error) {
        console.error('Error generating answer:', error);
        return {
            question,
            answer: ensureHtml('Sorry, I encountered an error while processing your question. Please try again.'),
            confidence: 0
        };
    }
}

export async function generateStreamingAnswer(question: string, onChunk: (chunk: string) => void): Promise<void> {
    try {
        // Check if API key is available
        if (!process.env.GROQ_API_KEY) {
            const fallbackResponse = fallbackResponses[Math.floor(Math.random() * fallbackResponses.length)];
            onChunk(ensureHtml(fallbackResponse));
            return;
        }

        const systemPrompt = `You are a helpful programming assistant. Provide clear, concise, and accurate answers to programming questions. 
    Focus on practical solutions and best practices. If the question is not programming-related, politely redirect to programming topics.
    Keep answers under 200 words unless more detail is specifically requested. Format your answer in markdown for best display.`;

        const chatCompletion = await groq.chat.completions.create({
            messages: [
                {
                    role: "system",
                    content: systemPrompt
                },
                {
                    role: "user",
                    content: question
                }
            ],
            model: "llama-3.1-8b-instant",
            temperature: 0.7,
            max_tokens: 500,
            top_p: 1,
            stream: true,
        });

        let buffer = '';
        for await (const chunk of chatCompletion) {
            const content = chunk.choices[0]?.delta?.content || '';
            if (content) {
                buffer += content;
                // Optionally, you could stream HTML, but for now, just buffer and send at the end
            }
        }
        if (buffer) {
            onChunk(ensureHtml(buffer));
        }
    } catch (error) {
        console.error('Error generating streaming answer:', error);
        onChunk(ensureHtml('Sorry, I encountered an error while processing your question. Please try again.'));
    }
}

