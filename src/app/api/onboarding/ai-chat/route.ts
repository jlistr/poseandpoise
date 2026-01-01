import { NextRequest, NextResponse } from "next/server";
import Anthropic from "@anthropic-ai/sdk";

// Initialize Anthropic client
const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY || process.env.NEXT_ANTHROPIC_API_KEY,
});

// System prompt for the AI assistant
const SYSTEM_PROMPT = `You are a friendly and professional AI assistant for Pose & Poise, a premium portfolio platform for models. Your role is to help models complete their onboarding process efficiently and professionally.

## Your Personality
- Warm, encouraging, and professional
- Knowledgeable about the modeling industry
- Efficient - help users save time
- Supportive of models at all experience levels

## Your Capabilities
1. **Extract Information**: When users provide details about themselves, extract and structure the data
2. **Analyze Images**: When provided with images, analyze them to extract:
   - Physical characteristics (hair color, eye color)
   - For full-body photos: estimate height and body proportions
   - Professional appearance notes
3. **Scan Comp Cards**: Extract all stats from comp card images or PDFs including:
   - Name, measurements (height, bust, waist, hips in cm)
   - Shoe size, hair color, eye color
   - Agency info if visible
4. **Suggest Services**: Recommend modeling services based on experience and market
5. **Write Bios**: Craft compelling professional bios
6. **Photo Organization**: Scan portfolio photos for photographer/studio credits:
   - Detect watermarks, signatures, and logos
   - Identify photographer names and studio branding
   - Extract Instagram handles if visible
   - Provide confidence levels for each detection

## Response Format
IMPORTANT: Always respond with valid JSON in this exact format. Do not include any text before or after the JSON:
{
  "message": "Your conversational response to the user",
  "extractedData": {
    "displayName": null,
    "location": null,
    "instagram": null,
    "tiktok": null,
    "website": null,
    "agencyName": null,
    "agencyContact": null,
    "agencyWebsite": null,
    "isRepresented": null,
    "bio": null,
    "heightCm": null,
    "bustCm": null,
    "waistCm": null,
    "hipsCm": null,
    "shoeSize": null,
    "hairColor": null,
    "eyeColor": null,
    "experienceLevel": null,
    "photos": null
  },
  "suggestions": [],
  "confidence": 0.8
}

For the photos field (used with photo-organizer tool), use this format:
"photos": [
  {
    "photographer": "Name or null",
    "studio": "Studio name or null",
    "instagram": "@handle or null",
    "confidence": "high/medium/low",
    "reasoning": "What was detected"
  }
]

Only include non-null values for fields you've actually extracted or detected.
For measurements, use numbers only (e.g., "175" not "175cm").
For social handles, remove the @ symbol.
For experienceLevel, use only: "beginner", "intermediate", or "professional".

## Guidelines
- Be concise but helpful
- If you can't extract something with confidence, set it to null
- For measurements from photos, provide estimates with confidence levels in your message
- Always acknowledge what you've captured
- Guide users to the next step naturally
- Use markdown formatting in your message for better readability`;

// Types for the API
interface PhotoCredit {
  photographer?: string | null;
  studio?: string | null;
  instagram?: string | null;
  confidence?: "high" | "medium" | "low";
  reasoning?: string;
}

interface ExtractedData {
  displayName?: string | null;
  location?: string | null;
  instagram?: string | null;
  tiktok?: string | null;
  website?: string | null;
  agencyName?: string | null;
  agencyContact?: string | null;
  agencyWebsite?: string | null;
  isRepresented?: boolean | null;
  bio?: string | null;
  heightCm?: string | null;
  bustCm?: string | null;
  waistCm?: string | null;
  hipsCm?: string | null;
  shoeSize?: string | null;
  hairColor?: string | null;
  eyeColor?: string | null;
  experienceLevel?: "beginner" | "intermediate" | "professional" | null;
  photos?: PhotoCredit[];
}

interface AIResponse {
  message: string;
  extractedData: ExtractedData;
  suggestions: string[];
  confidence: number;
}

// Helper to convert File/Blob to base64
async function fileToBase64(file: File | Blob): Promise<string> {
  const buffer = await file.arrayBuffer();
  const base64 = Buffer.from(buffer).toString("base64");
  const mimeType = file.type || "image/jpeg";
  return `data:${mimeType};base64,${base64}`;
}

export async function POST(request: NextRequest) {
  try {
    // Check for API key
    const apiKey = process.env.ANTHROPIC_API_KEY || process.env.NEXT_ANTHROPIC_API_KEY;
    if (!apiKey) {
      console.error("ANTHROPIC_API_KEY not configured");
      return NextResponse.json(
        { 
          message: "I'm currently unavailable. Please try again later or continue manually.",
          extractedData: {},
          error: "API key not configured" 
        },
        { status: 200 } // Return 200 so the UI can handle gracefully
      );
    }

    // Parse the request - handle both FormData and JSON
    let message = "";
    let step = "profile";
    let tool = "";
    let context: { extractedData?: ExtractedData; messageHistory?: Array<{ role: string; content: string }> } = {};
    const images: string[] = [];

    const contentType = request.headers.get("content-type") || "";
    
    if (contentType.includes("multipart/form-data")) {
      // Handle FormData
      const formData = await request.formData();
      message = formData.get("message") as string || "";
      step = formData.get("step") as string || "profile";
      tool = formData.get("tool") as string || "";
      
      const contextStr = formData.get("context") as string;
      if (contextStr) {
        try {
          context = JSON.parse(contextStr);
        } catch {
          context = {};
        }
      }

      // Process images
      const imageFiles = formData.getAll("images");
      for (const file of imageFiles) {
        if (file instanceof File) {
          const base64 = await fileToBase64(file);
          images.push(base64);
        }
      }
    } else {
      // Handle JSON
      const body = await request.json();
      message = body.message || "";
      step = body.step || "profile";
      tool = body.tool || "";
      context = body.context || {};
      if (body.images) {
        images.push(...body.images);
      }
    }

    // Build context message
    let contextMessage = `\n\n---\nContext:\n- Current step: ${step.toUpperCase()}`;
    
    if (tool) {
      contextMessage += `\n- Active tool: ${tool}`;
      
      if (tool === "photo-analyzer") {
        contextMessage += `\n- Task: Analyze the provided image to extract physical characteristics. Look for hair color, eye color, and if it's a full-body shot, estimate approximate height and body proportions.`;
      } else if (tool === "comp-scanner") {
        contextMessage += `\n- Task: This is a comp card (image or PDF). Extract ALL visible information: name, measurements (height in cm, bust, waist, hips), shoe size, hair color, eye color, agency name, and any contact info.`;
      } else if (tool === "bio-generator") {
        contextMessage += `\n- Task: Generate a compelling, professional bio (2-3 sentences) based on the collected information. Highlight unique qualities and experience level.`;
      } else if (tool === "services-suggest") {
        contextMessage += `\n- Task: Suggest appropriate modeling services with competitive pricing based on their experience level and location. Include services like: Editorial, Commercial, Runway, Catalog, Fit Model, Parts Model, etc.`;
      } else if (tool === "photo-organizer") {
        contextMessage += `\n- Task: Analyze these modeling photos to detect photographer/studio credits. Look for:
  - Photographer watermarks or signatures (usually in corners or edges)
  - Studio logos or branding
  - Visible text that might indicate the photographer or studio name
  - Professional studio characteristics that might identify the location
  
For each image, try to identify:
  - suggestedPhotographer: The photographer's name if visible
  - suggestedStudio: The studio name if identifiable
  - confidence: high/medium/low based on how clear the attribution is
  - reasoning: Brief explanation of what you detected

Include this in extractedData.photos as an array with entries like:
{
  "photos": [
    {
      "photographer": "Name or null",
      "studio": "Name or null", 
      "instagram": "@handle if visible or null",
      "confidence": "high/medium/low",
      "reasoning": "What was detected"
    }
  ]
}`;
      }
    }
    
    if (context.extractedData && Object.keys(context.extractedData).length > 0) {
      // Filter out null/undefined values
      const cleanData = Object.fromEntries(
        Object.entries(context.extractedData).filter(([, v]) => v != null)
      );
      if (Object.keys(cleanData).length > 0) {
        contextMessage += `\n- Already collected data: ${JSON.stringify(cleanData)}`;
      }
    }

    // Build the message content
    const messageContent: Anthropic.ContentBlockParam[] = [];
    
    // Add images and documents first if present
    for (const imageData of images) {
      const matches = imageData.match(/^data:([^;]+);base64,(.+)$/);
      if (matches) {
        const mimeType = matches[1];
        const base64Data = matches[2];
        
        // Check if it's a PDF document
        if (mimeType === "application/pdf") {
          messageContent.push({
            type: "document",
            source: {
              type: "base64",
              media_type: "application/pdf",
              data: base64Data,
            },
          } as Anthropic.ContentBlockParam);
        } else {
          // Handle as image
          const mediaType = mimeType as "image/jpeg" | "image/png" | "image/gif" | "image/webp";
          messageContent.push({
            type: "image",
            source: {
              type: "base64",
              media_type: mediaType,
              data: base64Data,
            },
          });
        }
      }
    }
    
    // Add text content
    const userText = message || (images.length > 0 ? "Please analyze this image." : "Hello");
    messageContent.push({
      type: "text",
      text: userText + contextMessage,
    });

    // Call Claude API with Sonnet 4.5
    const response = await anthropic.messages.create({
      model: "claude-sonnet-4-20250514",
      max_tokens: 2048,
      system: SYSTEM_PROMPT,
      messages: [
        {
          role: "user",
          content: messageContent,
        },
      ],
    });

    // Extract the text response
    const textContent = response.content.find((block) => block.type === "text");
    if (!textContent || textContent.type !== "text") {
      throw new Error("No text response from Claude");
    }

    // Parse the JSON response
    let aiResponse: AIResponse;
    try {
      // Try to extract JSON from the response
      const jsonMatch = textContent.text.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        aiResponse = JSON.parse(jsonMatch[0]);
        
        // Clean up extractedData - remove null values
        if (aiResponse.extractedData) {
          aiResponse.extractedData = Object.fromEntries(
            Object.entries(aiResponse.extractedData).filter(([, v]) => v != null)
          ) as ExtractedData;
        }
      } else {
        // If no JSON found, create a structured response
        aiResponse = {
          message: textContent.text,
          extractedData: {},
          suggestions: [],
          confidence: 0.5,
        };
      }
    } catch {
      // If JSON parsing fails, return the raw message
      aiResponse = {
        message: textContent.text,
        extractedData: {},
        suggestions: [],
        confidence: 0.5,
      };
    }

    return NextResponse.json({
      message: aiResponse.message,
      extractedData: aiResponse.extractedData || {},
      suggestions: aiResponse.suggestions || [],
      confidence: aiResponse.confidence || 0.5,
      usage: {
        inputTokens: response.usage.input_tokens,
        outputTokens: response.usage.output_tokens,
      },
    });
  } catch (error) {
    console.error("AI Chat API Error:", error);
    
    if (error instanceof Anthropic.APIError) {
      return NextResponse.json(
        { 
          message: "I encountered an issue processing your request. Please try again.",
          extractedData: {},
          error: `Anthropic API error: ${error.message}` 
        },
        { status: 200 } // Return 200 so UI handles gracefully
      );
    }
    
    return NextResponse.json(
      { 
        message: "I'm having trouble right now. Please try again or continue manually.",
        extractedData: {},
        error: "Failed to process AI request" 
      },
      { status: 200 }
    );
  }
}
