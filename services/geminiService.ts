import { GoogleGenAI, Type, Schema, Chat } from "@google/genai";
import { QuizQuestion, Difficulty } from "../types";

const apiKey = process.env.API_KEY || '';
const ai = new GoogleGenAI({ apiKey });

export const createChatSession = (): Chat => {
  return ai.chats.create({
    model: 'gemini-2.5-flash',
    config: {
      systemInstruction: `You are JavaBot, an advanced AI tutor specializing in Java programming.
      
      **Your Goals:**
      1. **Deep Investigation:** Help students understand *how* and *why* Java works (e.g., Memory Stack vs Heap, JVM internals, Bytecode).
      2. **Code Helper:** Debug snippets provided by users and explain the fix.
      3. **Socratic Teacher:** Don't just give answers; guide the user to the solution.

      **Formatting Guidelines:**
      - Use Markdown for all text.
      - Use Code Blocks for Java code.
      - Use **Bold** for key terms.
      - Keep responses concise unless asked for a "deep dive".
      - Use the following special blockquote styles for emphasis:
        - \`> **Concept**:\` for definitions.
        - \`> **Tip**:\` for helpful hints.
      `,
    },
  });
};

export const explainTopicStream = async function* (topicTitle: string, difficulty: Difficulty) {
  try {
    const prompt = `
      You are an expert Java Tutor designed to make learning attractive, visual, and professional. 
      Explain the concept of "${topicTitle}" to a ${difficulty} level student.
      
      **Formatting Rules (Strictly Follow):**
      1. **Colored Boxes:** Use blockquotes (>) starting with specific bold labels to create colored boxes:
         - \`> **Core Concept**:\` for the main definition (Blue box).
         - \`> **Real World Analogy**:\` for a comparison (Orange box).
         - \`> **Why it Matters**:\` for importance (Purple box).
         - \`> **Warning**:\` for common mistakes (Red box).
         - \`> **Pro Tip**:\` for best practices (Green box).
      
      2. **Points-Wise:** Use bullet points (-) for lists. Keep bullet text concise and punchy.
      
      3. **Diagrams:** If a structure or flow is needed, draw a clean ASCII diagram wrapped in a code block marked as \`diagram\`.

      **Content Structure:**
      1. Start with a \`> **Core Concept**:\` block.
      2. Give a \`> **Real World Analogy**:\` block.
      3. **How it Works** (Header): Explain simply in bullet points.
      4. **Syntax Blueprint** (Header): Show the general syntax rule.
      5. **Code in Action** (Header): A clean, commented Java example.
      6. End with a \`> **Pro Tip**:\` or \`> **Warning**:\`.

      **Tone:** Professional yet accessible, like a high-quality coding bootcamp documentation.
      
      Start streaming immediately.
    `;

    const stream = await ai.models.generateContentStream({
      model: 'gemini-2.5-flash',
      contents: prompt,
    });

    for await (const chunk of stream) {
      if (chunk.text) {
        yield chunk.text;
      }
    }
  } catch (error) {
    console.error("Error explaining topic:", error);
    yield "Sorry, I encountered an error while connecting to the AI tutor.";
  }
};

export const explainTopic = async (topicTitle: string, difficulty: Difficulty): Promise<string> => {
  // Fallback to non-streaming if needed, essentially same logic wrapped
  let result = "";
  for await (const chunk of explainTopicStream(topicTitle, difficulty)) {
    result += chunk;
  }
  return result;
};

export const analyzeCode = async (code: string): Promise<string> => {
  try {
    const prompt = `
      You are a Java Code Analyzer.
      Analyze the following Java code snippet:
      
      \`\`\`java
      ${code}
      \`\`\`
      
      Provide:
      1. **Compilation Check**: Will this compile? If not, why?
      2. **Output Prediction**: What will be the output if run?
      3. **Explanation**: Briefly explain the logic or any potential pitfalls (exceptions, logic errors).
      
      Be concise.
    `;

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
    });

    return response.text || "Analysis failed.";
  } catch (error) {
    console.error("Error analyzing code:", error);
    return "Error analyzing code.";
  }
};

export const visualizeCode = async (code: string): Promise<string> => {
  try {
    const prompt = `
      You are a Software Architecture Visualizer.
      Create a clear, professional SVG Flowchart representing the logic of the provided Java code.
      
      Code:
      \`\`\`java
      ${code}
      \`\`\`
      
      **SVG Requirements:**
      1. **Style:** Dark Mode compliant.
         - Background: Transparent (do not add a rect background).
         - Nodes: Rounded rectangles with dark fill (#1e293b) and bright borders (#38bdf8) for steps.
         - Decisions: Diamonds with orange borders (#f97316) for 'if/else'.
         - Text: White (#f1f5f9) or Light Gray, Sans-serif font.
         - Arrows: Light Gray (#94a3b8) with clear arrowheads.
      2. **Content:** Visual flow of the logic (Start -> Logic -> End).
      3. **Dimensions:** Use a responsive viewBox. Ensure all text is visible.
      4. **Output:** RETURN ONLY THE RAW SVG STRING. No markdown ticks (\`\`\`). No preamble.
    `;

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
    });

    let svg = response.text || "";
    svg = svg.replace(/```xml/g, '').replace(/```svg/g, '').replace(/```/g, '').trim();
    // Ensure it starts with <svg
    if (!svg.includes('<svg')) return "";
    return svg;
  } catch (error) {
    console.error("Visualization error:", error);
    return "";
  }
};

export const simulateJavaOutput = async (code: string): Promise<string> => {
  try {
    const prompt = `
      Act as a Java Console. 
      Execute the following code mentally and return ONLY the output that would appear in the terminal.
      
      Code:
      \`\`\`java
      ${code}
      \`\`\`
      
      Rules:
      1. If the code compiles and runs, show only the standard output (System.out.println).
      2. If there is a compilation error, start with "Error: [Brief description]".
      3. Do NOT add markdown ticks, preamble, or post-script. Just the raw output text.
    `;

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
    });

    return response.text || "> No output";
  } catch (error) {
    console.error("Error simulating code:", error);
    return "Error connecting to execution engine.";
  }
};

export const generateQuiz = async (topic: string, difficulty: Difficulty): Promise<QuizQuestion[]> => {
  const schema: Schema = {
    type: Type.ARRAY,
    items: {
      type: Type.OBJECT,
      properties: {
        id: { type: Type.INTEGER },
        question: { type: Type.STRING },
        options: { 
          type: Type.ARRAY,
          items: { type: Type.STRING }
        },
        correctAnswerIndex: { type: Type.INTEGER },
        explanation: { type: Type.STRING }
      },
      required: ["id", "question", "options", "correctAnswerIndex", "explanation"]
    }
  };

  try {
    const prompt = `Generate 3 ${difficulty} level multiple-choice questions about ${topic} in Java.`;
    
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: schema
      }
    });

    const text = response.text;
    if (!text) return [];
    return JSON.parse(text) as QuizQuestion[];
  } catch (error) {
    console.error("Error generating quiz:", error);
    return [];
  }
};