
import { GoogleGenAI, Type } from "@google/genai";
import { AnalysisResponse, TargetModel } from "../types";

export const analyzeVideo = async (videoBase64: string, mimeType: string, targetModel: TargetModel): Promise<AnalysisResponse> => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  
  const response = await ai.models.generateContent({
    model: 'gemini-3-pro-preview',
    contents: {
      parts: [
        {
          inlineData: {
            mimeType: mimeType,
            data: videoBase64,
          },
        },
        {
          text: `Act as a Forensics Cinematographer and Senior AI Prompt Engineer. Your task is to perform an exhaustive frame-by-frame deconstruction of this video to create high-fidelity replication prompts.

          STRICT REQUIREMENTS:
          1. **Temporal Segmentation**: Identify every distinct camera or action shift. Do not skip transitions; analyze the 'energy' of the motion between key moments.
          2. **Frame-by-Frame Scrub**: In the 'frameByFrameAnalysis', describe the physics of the scene. Mention how light hits surfaces as they move, the inertia of the camera, and micro-expressions or background shifts.
          3. **Technical Metadata**:
             - **Camera**: Specific lens choice (e.g., 35mm anamorphic), aperture (f/1.8 for shallow DOF), and the exact physical path (e.g., 'subtle handheld jitter with a slow push-in').
             - **Lighting**: Map the light sources. Identify key, fill, and rim lights. Mention the 'Color Science' (e.g., teal/orange, high-contrast noir).
             - **Materiality**: Describe how textures (fabric, skin, metal) react to the environment's physics.
          4. **Model Specifics**:
             - For ${targetModel}: If it's Sora 2, emphasize complex interaction between multiple characters and their environment with perfect temporal consistency. 
             - If it's Veo 3, focus on creative aesthetic control, lighting nuances, and high-quality cinematic grain.
             - The 'aiPrompt' must be a master-class narrative that guides the AI model through the entire duration of the segment, specifying the 'start state' and the 'end state' of the motion.

          Return the analysis in the requested JSON format.`
        }
      ]
    },
    config: {
      thinkingConfig: { thinkingBudget: 8000 },
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          overallStyle: {
            type: Type.STRING,
            description: "A comprehensive summary of the visual language and cinematic soul of the video."
          },
          segments: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                startTime: { type: Type.STRING },
                endTime: { type: Type.STRING },
                description: { type: Type.STRING },
                frameByFrameAnalysis: { type: Type.STRING, description: "Detailed description of movement progression across frames." },
                cameraTechnical: { type: Type.STRING, description: "Lens, aperture, and precise camera pathing data." },
                lightingTechnical: { type: Type.STRING, description: "Technical light positioning and color temperature analysis." },
                composition: { type: Type.STRING, description: "Framing, geometry, and visual balance details." },
                motionIntensity: { type: Type.STRING, enum: ["Low", "Medium", "High"] },
                aiPrompt: { type: Type.STRING, description: "The final, master-engineered prompt for ${targetModel}." }
              },
              required: ["startTime", "endTime", "description", "frameByFrameAnalysis", "cameraTechnical", "lightingTechnical", "aiPrompt"]
            }
          }
        },
        required: ["segments", "overallStyle"]
      }
    }
  });

  try {
    const data = JSON.parse(response.text);
    return data as AnalysisResponse;
  } catch (error) {
    console.error("Failed to parse Gemini response:", error);
    throw new Error("Analysis failed to generate a valid structure. Please try a different sequence or target model.");
  }
};
