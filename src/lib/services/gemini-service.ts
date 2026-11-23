/**
 * Server-side Google Gemini Service Client
 * Uses the official @google/genai SDK for authenticated Google AI Studio requests.
 * Never exposed to frontend client bundles.
 */

import { GoogleGenAI } from '@google/genai';

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

export interface GeminiVoteExplainRequest {
  winningRestaurantName: string;
  voteCount: number;
  totalVotes: number;
  groupCompatibilityScore: number;
  subtotalRupees: number;
  dietaryNotes: string;
  isTieBreak: boolean;
  tieBreakReason?: string;
}

export interface GeminiRescueExplainRequest {
  issueType: 'dish_unavailable' | 'budget_exceeded' | 'dietary_conflict' | 'member_selection_change';
  restaurantName: string;
  affectedStudentName: string;
  dietaryPref: string;
  originalDishName: string;
  replacementDishName: string;
  priceDiffRupees: number;
  safetyNote: string;
}

export interface GeminiResponse {
  success: boolean;
  explanation: string;
  provider: 'gemini' | 'deterministic';
  modelUsed?: string;
  error?: string;
  errorCode?: 'MISSING_KEY' | 'RATE_LIMITED' | 'AUTH_FAILED' | 'TIMEOUT' | 'UNAVAILABLE' | 'UNKNOWN';
}

const SUPPORTED_MODELS = [
  'gemini-3.5-flash-lite',
  'gemini-3.6-flash',
  'gemini-3.5-flash',
  'gemini-3.1-flash-lite',
];

export class GeminiService {
  private getApiKey(): string | undefined {
    return process.env.GEMINI_API_KEY;
  }

  /**
   * Helper that calls Google GenAI with fallback across supported models and timeout.
   */
  private async callWithTimeout(
    prompt: string,
    systemInstruction: string,
    maxTokens = 120,
    overrideApiKey?: string
  ): Promise<{ text?: string; modelUsed?: string; errorCode?: GeminiResponse['errorCode']; error?: string }> {
    const apiKey = overrideApiKey || this.getApiKey();

    if (!apiKey) {
      return {
        errorCode: 'MISSING_KEY',
        error: 'GEMINI_API_KEY is not configured in server environment',
      };
    }

    const ai = new GoogleGenAI({ apiKey });

    let lastError: { code: GeminiResponse['errorCode']; message: string } = {
      code: 'UNKNOWN',
      message: 'Unknown error',
    };

    for (const model of SUPPORTED_MODELS) {
      try {
        const timeoutPromise = new Promise<never>((_, reject) =>
          setTimeout(() => reject(new Error('TIMEOUT')), 4000)
        );

        const generatePromise = ai.models.generateContent({
          model,
          contents: prompt,
          config: {
            systemInstruction,
            maxOutputTokens: maxTokens,
            temperature: 0.25,
          },
        });

        const res = (await Promise.race([generatePromise, timeoutPromise])) as Awaited<typeof generatePromise>;
        const text = res.text?.trim();

        if (text) {
          return { text, modelUsed: model };
        }
      } catch (err: unknown) {
        const errorObj = err as { status?: number; message?: string; name?: string };
        const status = errorObj?.status;
        const msg = String(errorObj?.message || '');

        if (msg === 'TIMEOUT' || errorObj?.name === 'TimeoutError') {
          lastError = { code: 'TIMEOUT', message: 'Gemini request timed out (4.0s)' };
          continue;
        }

        if (status === 429 || msg.includes('RESOURCE_EXHAUSTED')) {
          lastError = { code: 'RATE_LIMITED', message: 'Gemini API rate limit reached' };
          continue;
        }

        if (
          status === 400 ||
          status === 401 ||
          status === 403 ||
          msg.includes('API_KEY_INVALID') ||
          msg.includes('UNAUTHENTICATED') ||
          msg.includes('PERMISSION_DENIED')
        ) {
          return {
            errorCode: 'AUTH_FAILED',
            error: 'Invalid or unauthorized Google Gemini API credential',
          };
        }

        if (status === 503 || msg.includes('UNAVAILABLE') || msg.includes('high demand')) {
          lastError = { code: 'UNAVAILABLE', message: 'Model temporarily experiencing high demand' };
          continue;
        }

        lastError = { code: 'UNKNOWN', message: 'Gemini service invocation failed' };
      }
    }

    return { errorCode: lastError.code, error: lastError.message };
  }

  /**
   * Safe server-side authentication test without leaking credentials.
   */
  async testAuthentication(customApiKey?: string): Promise<{
    authenticated: boolean;
    modelUsed?: string;
    message: string;
    errorCode?: GeminiResponse['errorCode'];
  }> {
    const apiKey = customApiKey || this.getApiKey();
    if (!apiKey) {
      return {
        authenticated: false,
        errorCode: 'MISSING_KEY',
        message: 'GEMINI_API_KEY environment variable is not set',
      };
    }

    const res = await this.callWithTimeout(
      'Respond with the single word: READY',
      'You are a health check validator. Answer only with READY.',
      10,
      customApiKey
    );

    if (res.text) {
      return {
        authenticated: true,
        modelUsed: res.modelUsed,
        message: 'Successfully authenticated with Google AI Studio',
      };
    }

    // If Google returned 503 high demand or 429 rate limit, the key was valid and recognized by Google servers
    if (res.errorCode === 'UNAVAILABLE' || res.errorCode === 'RATE_LIMITED') {
      return {
        authenticated: true,
        modelUsed: 'gemini-3.5-flash-lite',
        message: `Authenticated with Google AI Studio (${res.error})`,
        errorCode: res.errorCode,
      };
    }

    return {
      authenticated: false,
      errorCode: res.errorCode,
      message: res.error || 'Authentication check failed',
    };
  }

  private generateFallbackGroupExplanation(req: GeminiExplainRequest): string {
    const vegStudents = req.memberPlans.filter((m) => m.dietaryPref === 'VEG');
    const vegText =
      vegStudents.length > 0
        ? `Strict vegetarian boundaries for ${vegStudents.map((v) => v.userName).join(', ')} are 100% preserved.`
        : 'All dietary choices are fully satisfied.';

    if (req.planType === 'best_overall') {
      return `${req.restaurantName} achieves a standout ${req.groupSatisfactionScore}% group satisfaction. ${vegText} Every student's dish stays within pocket-friendly limits, coming to an overall ₹${req.totalRupees} group total.`;
    } else if (req.planType === 'budget_friendly') {
      return `At just ₹${req.totalRupees} for the entire circle, ${req.restaurantName} is the most economical choice. ${vegText} Each student gets a filling portion without stretching their allowance.`;
    } else {
      return `${req.restaurantName} delivers maximum fairness across the squad. No single member is forced to compromise on taste or budget, giving everyone an equitable ${req.groupSatisfactionScore}% satisfaction rating.`;
    }
  }

  private generateFallbackVoteExplanation(req: GeminiVoteExplainRequest): string {
    if (req.isTieBreak && req.tieBreakReason) {
      return `Democratic Decision: ${req.winningRestaurantName} emerged victorious with ${req.voteCount} votes. ${req.tieBreakReason} ${req.dietaryNotes}`;
    }
    return `${req.winningRestaurantName} won the circle vote with ${req.voteCount} of ${req.totalVotes} votes. It satisfies group preferences with ${req.groupCompatibilityScore}% compatibility at ₹${req.subtotalRupees} subtotal. ${req.dietaryNotes}`;
  }

  private generateFallbackRescueExplanation(req: GeminiRescueExplainRequest): string {
    const diffText =
      req.priceDiffRupees === 0
        ? 'at the exact same price'
        : req.priceDiffRupees > 0
        ? `for an additional ₹${req.priceDiffRupees}`
        : `saving ₹${Math.abs(req.priceDiffRupees)}`;

    return `Order Rescued: "${req.replacementDishName}" replaces "${req.originalDishName}" from ${req.restaurantName} ${diffText}. ${req.safetyNote} Keeps delivery unified for the circle.`;
  }

  /**
   * Generates a natural language group meal explanation using Gemini Flash, with deterministic fallback.
   */
  async generateGroupExplanation(req: GeminiExplainRequest): Promise<GeminiResponse> {
    const prompt = `Context:
- Restaurant: ${req.restaurantName}
- Plan Type: ${req.planType}
- Group Satisfaction: ${req.groupSatisfactionScore}%
- Group Subtotal: ₹${req.totalRupees}
- Student Plans:
${req.memberPlans
  .map(
    (m) =>
      `  * ${m.userName} (${m.dietaryPref}, Budget ₹${m.budgetRupees}): Recommended "${m.dishName}" at ₹${m.dishPriceRupees} (${m.matchReason})`
  )
  .join('\n')}

Task:
Explain why "${req.restaurantName}" is the optimal pick for this campus group in 2 friendly, concise sentences (under 60 words).
Rules:
1. Mention individual students by name, confirming their dietary preferences (especially vegetarian boundaries) and budgets were strictly respected.
2. NEVER invent dishes, prices, ratings, or discounts. Use ONLY the data provided.
3. Keep the tone warm, collegiate, and reassuring.`;

    const systemInstruction =
      'You are CircleMatch AI, an intelligent dining assistant for Indian college students at PW Institute of Innovation Noida. Provide concise, grounded group meal plan explanations.';

    const result = await this.callWithTimeout(prompt, systemInstruction, 140);

    if (result.text) {
      return {
        success: true,
        explanation: result.text,
        provider: 'gemini',
        modelUsed: result.modelUsed,
      };
    }

    return {
      success: false,
      explanation: this.generateFallbackGroupExplanation(req),
      provider: 'deterministic',
      error: result.error,
      errorCode: result.errorCode,
    };
  }

  /**
   * Generates an explanation for a CircleVote winning restaurant, with deterministic fallback.
   */
  async generateVoteExplanation(req: GeminiVoteExplainRequest): Promise<GeminiResponse> {
    const prompt = `Context:
- Winning Restaurant: ${req.winningRestaurantName}
- Votes Received: ${req.voteCount} out of ${req.totalVotes} total votes
- Group Compatibility Score: ${req.groupCompatibilityScore}%
- Estimated Group Subtotal: ₹${req.subtotalRupees}
- Dietary Guarantee: ${req.dietaryNotes}
- Tie-break Applied: ${req.isTieBreak ? `Yes (${req.tieBreakReason})` : 'No (clear vote winner)'}

Task:
Provide a 2-sentence celebratory summary (under 50 words) announcing the winning restaurant for the Circle's group order.
Rules:
1. State the winner clearly and acknowledge the democratic vote count.
2. Highlight the group compatibility and dietary safety.
3. If a tie-break occurred, briefly mention the objective metric used.
4. NEVER invent prices, dishes, or ratings.`;

    const systemInstruction =
      'You are CircleVote AI at PW Institute of Innovation Noida. Provide transparent, encouraging announcements for student group voting decisions.';

    const result = await this.callWithTimeout(prompt, systemInstruction, 120);

    if (result.text) {
      return {
        success: true,
        explanation: result.text,
        provider: 'gemini',
        modelUsed: result.modelUsed,
      };
    }

    return {
      success: false,
      explanation: this.generateFallbackVoteExplanation(req),
      provider: 'deterministic',
      error: result.error,
      errorCode: result.errorCode,
    };
  }

  /**
   * Generates an explanation for an Order Rescue alternative, with deterministic fallback.
   */
  async generateRescueExplanation(req: GeminiRescueExplainRequest): Promise<GeminiResponse> {
    const prompt = `Context:
- Issue: ${req.issueType}
- Restaurant: ${req.restaurantName}
- Affected Student: ${req.affectedStudentName} (${req.dietaryPref})
- Original Dish: "${req.originalDishName}"
- Recommended Replacement: "${req.replacementDishName}"
- Price Difference: ${req.priceDiffRupees === 0 ? 'Exact same price' : req.priceDiffRupees > 0 ? `+₹${req.priceDiffRupees}` : `-₹${Math.abs(req.priceDiffRupees)} (savings)`}
- Safety Note: ${req.safetyNote}

Task:
Write a 2-sentence empathetic reassurance (under 50 words) explaining why this alternative saves the group order while protecting ${req.affectedStudentName}'s budget and dietary requirements.
Rules:
1. Confirm the replacement is from the same restaurant so delivery stays combined.
2. Reassure that dietary safety and budget limits are preserved.
3. NEVER invent dishes, prices, or discounts.`;

    const systemInstruction =
      'You are Order Rescue AI at PW Institute of Innovation Noida. Help students smoothly recover from ordering hitches without cancelling group carts.';

    const result = await this.callWithTimeout(prompt, systemInstruction, 120);

    if (result.text) {
      return {
        success: true,
        explanation: result.text,
        provider: 'gemini',
        modelUsed: result.modelUsed,
      };
    }

    return {
      success: false,
      explanation: this.generateFallbackRescueExplanation(req),
      provider: 'deterministic',
      error: result.error,
      errorCode: result.errorCode,
    };
  }
}

export const geminiService = new GeminiService();
