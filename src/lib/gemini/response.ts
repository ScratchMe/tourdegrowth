/** Navigates the Gemini `generateContent` response shape to the raw text it produced. */
export function extractGeminiText(data: unknown): string {
  const text = (data as { candidates?: { content?: { parts?: { text?: unknown }[] } }[] } | null)?.candidates?.[0]
    ?.content?.parts?.[0]?.text;

  if (typeof text !== "string") {
    throw new Error(
      `Unexpected Gemini response shape: no text found at candidates[0].content.parts[0].text (got: ${JSON.stringify(data)})`,
    );
  }

  return text;
}
