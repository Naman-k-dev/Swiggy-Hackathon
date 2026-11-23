/**
 * Server-side Google Gemini Service Client
 * Handles authenticated requests to Google AI Studio / Gemini API.
 * Never exposed to frontend bundles.
 */

export interface GeminiExplainRequest {
  restaurantName: string;
  planType: 'best_overall' | 'budget_friendly' | 'crowd_pleaser';
  groupSatisfactionScore: number;
  totalRupees: number;
  memberPlans: Array<{
    userName: string;
    dietaryPref: string;
    budgetRupees: number;
    dishName: string;
    dishPriceRupees: number;
    matchReason: string;
  }>;
}

export interface GeminiResponse {
  success: boolean;
  explanation?: string;
  provider: 'gemini' | 'deterministic';
  error?: string;
  errorCode?: 'MISSING_KEY' | 'RATE_LIMITED' | 'AUTH_FAILED' | 'TIMEOUT' | 'UNKNOWN';
}

export class GeminiService {
  private getApiKey(): string | undefined {
    return process.env.GEMINI_API_KEY;
  }

  /**
   * Generates a natural language group meal explanation using Gemini 1.5 Flash.
   */
  async generateGroupExplanation(req: GeminiExplainRequest): Promise<GeminiResponse> {
    const apiKey = this.getApiKey();

    if (!apiKey) {
      return {
        success: false,
        provider: 'deterministic',
        error: 'GEMINI_API_KEY is not configured in server environment',
        errorCode: 'MISSING_KEY',
      };
    }

    const prompt = `You are CircleMatch AI, an intelligent dining assistant for Indian college students.
Explain why "${req.restaurantName}" was selected for this group in 2-3 friendly, student-focused sentences.
Context:
- Plan Category: ${req.planType}
- Group Satisfaction: ${req.groupSatisfactionScore}%
- Total Cost: ₹${req.totalRupees}
- Member Choices:
${req.memberPlans
  .map(
    (m) =>
      `  * ${m.userName} (${m.dietaryPref}, Budget ₹${m.budgetRupees}): Recommended "${m.dishName}" at ₹${m.dishPriceRupees} (${m.matchReason})`
  )
  .join('\n')}

Rules:
1. Mention individual students by name, confirming their dietary restrictions (especially vegetarians) and budgets were strictly respected.
2. Emphasize why this restaurant balances everyone's cravings without budget overruns.
3. Keep it under 65 words. Do not invent any new dishes or prices.`;

    try {
      const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`;

      const res = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }],
          generationConfig: {
            maxOutputTokens: 120,
            temperature: 0.3,
          },
        }),
        signal: AbortSignal.timeout(4500),
      });

      if (!res.ok) {
        if (res.status === 429) {
          return {
            success: false,
            provider: 'deterministic',
            error: 'Google Gemini API rate limit reached',
            errorCode: 'RATE_LIMITED',
          };
        }
        if (res.status === 401 || res.status === 403) {
          return {
            success: false,
            provider: 'deterministic',
            error: 'Invalid or expired Google Gemini credential',
            errorCode: 'AUTH_FAILED',
          };
        }
        return {
          success: false,
          provider: 'deterministic',
          error: `Gemini API returned status ${res.status}`,
          errorCode: 'UNKNOWN',
        };
      }

      const data = await res.json();
      const text = data.candidates?.[0]?.content?.parts?.[0]?.text?.trim();

      if (!text) {
        return {
          success: false,
          provider: 'deterministic',
          error: 'Empty response candidate from Gemini',
          errorCode: 'UNKNOWN',
        };
      }

      return {
        success: true,
        explanation: text,
        provider: 'gemini',
      };
    } catch (err: unknown) {
      const isTimeout =
        err instanceof Error &&
        (err.name === 'TimeoutError' || err.message.includes('timeout'));

      return {
        success: false,
        provider: 'deterministic',
        error: isTimeout ? 'Gemini API request timed out (4.5s)' : 'Network or parse error',
        errorCode: isTimeout ? 'TIMEOUT' : 'UNKNOWN',
      };
    }
  }
}

export const geminiService = new GeminiService();
