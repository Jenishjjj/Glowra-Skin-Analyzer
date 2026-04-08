import { Router } from "express";
import { ai } from "@workspace/integrations-gemini-ai";

const router = Router();

router.post("/analyze-skin", async (req, res) => {
  const { imageBase64, mimeType = "image/jpeg" } = req.body as {
    imageBase64: string;
    mimeType?: string;
  };

  if (!imageBase64) {
    res.status(400).json({ error: "imageBase64 is required" });
    return;
  }

  try {
    const prompt = `You are a professional AI dermatologist. Analyze the skin in this selfie and return a JSON object with skin health metrics.

CRITICAL: Return ONLY a raw JSON object. No markdown, no code blocks, no text before or after. Just the JSON.

Score each metric 0-100 where higher means healthier/better:
- hydration: skin moisture level (0=very dry, 100=perfectly hydrated)
- pigmentation: skin tone evenness (0=heavy dark spots, 100=perfectly even)
- texture: skin surface smoothness (0=very rough, 100=very smooth)
- pores: pore visibility (0=very enlarged, 100=barely visible)
- elasticity: skin firmness (0=very loose, 100=very firm)

Also provide:
- skinScore: overall 1.0-10.0 (one decimal)
- skinAge: estimated skin biological age in years
- actualAge: estimated real age of person in years
- summary: one sentence describing the main skin characteristic

Return exactly this JSON structure:
{
  "skinScore": 7.5,
  "skinAge": 28,
  "actualAge": 26,
  "hydration": 72,
  "pigmentation": 65,
  "texture": 80,
  "pores": 58,
  "elasticity": 75,
  "summary": "Well-hydrated skin with minor texture concerns."
}`;

    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: [
        {
          role: "user",
          parts: [
            { inlineData: { mimeType, data: imageBase64 } },
            { text: prompt },
          ],
        },
      ],
      config: { maxOutputTokens: 8192, responseMimeType: "application/json" },
    });

    const text = response.text ?? "";
    let result;
    try {
      result = JSON.parse(text);
    } catch {
      const match = text.match(/\{[\s\S]*\}/);
      if (match) {
        result = JSON.parse(match[0]);
      } else {
        throw new Error("Could not parse Gemini response as JSON");
      }
    }

    res.json(result);
  } catch (error) {
    console.error("Skin analysis error:", error);
    res.status(500).json({ error: "Failed to analyze skin image" });
  }
});

router.post("/generate-routine", async (req, res) => {
  const { skinScore, hydration, pigmentation, texture, pores, elasticity, skinAge, actualAge } = req.body as {
    skinScore: number;
    hydration: number;
    pigmentation: number;
    texture: number;
    pores: number;
    elasticity: number;
    skinAge: number;
    actualAge: number;
  };

  try {
    const prompt = `You are an expert dermatologist creating a fully personalized skincare routine.

Patient Skin Analysis:
- Overall Score: ${skinScore}/10
- Skin Age: ${skinAge} | Actual Age: ${actualAge}
- Hydration: ${hydration}/100
- Pigmentation: ${pigmentation}/100
- Texture: ${texture}/100
- Pores: ${pores}/100
- Elasticity: ${elasticity}/100

CRITICAL: Return ONLY a raw JSON object. No markdown, no code blocks. Just JSON.

Create a targeted routine addressing the weakest scores first. Include specific ingredient recommendations.

Return exactly this JSON structure:
{
  "morningSteps": [
    {
      "step": 1,
      "title": "Step name",
      "product": "Specific product type and key ingredients",
      "duration": "30 sec",
      "tip": "Why this step helps this person's specific skin"
    }
  ],
  "eveningSteps": [
    {
      "step": 1,
      "title": "Step name",
      "product": "Specific product type and ingredients",
      "duration": "45 sec",
      "tip": "Why this step matters for their skin"
    }
  ],
  "skinInsights": [
    {
      "category": "Hydration",
      "title": "Short action title",
      "desc": "Specific advice targeting their actual score",
      "priority": "high"
    }
  ],
  "overallAdvice": "One paragraph of personalized skin advice."
}

Morning: 4 steps. Evening: 4-5 steps. Insights: 4 items (target the weakest metrics).`;

    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: [{ role: "user", parts: [{ text: prompt }] }],
      config: { maxOutputTokens: 8192, responseMimeType: "application/json" },
    });

    const text = response.text ?? "";
    let result;
    try {
      result = JSON.parse(text);
    } catch {
      const match = text.match(/\{[\s\S]*\}/);
      if (match) {
        result = JSON.parse(match[0]);
      } else {
        throw new Error("Could not parse Gemini response as JSON");
      }
    }

    res.json(result);
  } catch (error) {
    console.error("Routine generation error:", error);
    res.status(500).json({ error: "Failed to generate routine" });
  }
});

export default router;
