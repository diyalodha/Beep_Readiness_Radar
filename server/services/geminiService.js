/**
 * Official Google Gemini GenAI Service for Beep Readiness Radar
 *
 * Utilizes @google/genai SDK with bounded retries, timeout management,
 * prompt injection defense, and structured error handling.
 *
 * Security Note:
 * - GEMINI_API_KEY is read strictly from environment variables on the backend.
 * - API keys are NEVER exposed to the frontend, logs, or responses.
 */

import { GoogleGenAI } from '@google/genai';

const DEFAULT_MODEL = 'gemini-2.5-flash';
const REQUEST_TIMEOUT_MS = 25000;
const MAX_RETRIES = 2;
const INITIAL_BACKOFF_MS = 1000;

/**
 * Returns safe metadata regarding Gemini configuration without leaking secrets.
 */
export function getGeminiConfig() {
  const apiKey = process.env.GEMINI_API_KEY?.trim() || '';
  const model = process.env.GEMINI_MODEL?.trim() || DEFAULT_MODEL;
  const isConfigured = Boolean(apiKey && apiKey.length > 5);

  return {
    isConfigured,
    model,
    provider: 'Google Gemini GenAI SDK (@google/genai)',
  };
}

/**
 * Checks if a valid-looking API key is present.
 */
export function isGeminiConfigured() {
  return getGeminiConfig().isConfigured;
}

/**
 * Categorizes errors encountered during Gemini API calls.
 */
export function categorizeGeminiError(error) {
  const message = (error?.message || '').toLowerCase();
  const status = error?.status || error?.statusCode || error?.response?.status;

  if (!isGeminiConfigured()) {
    return {
      code: 'MISSING_API_KEY',
      userMessage: 'Gemini API key is not configured in server environment (GEMINI_API_KEY).',
      retryable: false,
    };
  }

  if (status === 401 || message.includes('api key not valid') || message.includes('invalid api key')) {
    return {
      code: 'INVALID_API_KEY',
      userMessage: 'Supplied GEMINI_API_KEY was rejected by Google Gemini as invalid.',
      retryable: false,
    };
  }

  if (status === 429 || message.includes('quota') || message.includes('rate limit') || message.includes('resource exhausted')) {
    return {
      code: 'RATE_LIMIT_EXCEEDED',
      userMessage: 'Gemini API rate limit or quota exceeded. Please wait a moment.',
      retryable: true,
    };
  }

  if (error?.name === 'TimeoutError' || error?.name === 'AbortError' || message.includes('timed out') || message.includes('deadline exceeded')) {
    return {
      code: 'TIMEOUT',
      userMessage: `Gemini API request timed out after ${REQUEST_TIMEOUT_MS / 1000} seconds.`,
      retryable: true,
    };
  }

  if (status === 404 || message.includes('model not found') || message.includes('not supported')) {
    return {
      code: 'MODEL_UNAVAILABLE',
      userMessage: `Specified model (${getGeminiConfig().model}) is not available on this API key.`,
      retryable: false,
    };
  }

  if (status >= 500 || message.includes('internal') || message.includes('unavailable')) {
    return {
      code: 'PROVIDER_ERROR',
      userMessage: 'Google Gemini service encountered an internal error. Please try again.',
      retryable: true,
    };
  }

  return {
    code: 'UNKNOWN_ERROR',
    userMessage: 'An unexpected error occurred while communicating with Gemini.',
    retryable: false,
  };
}

/**
 * Calls Gemini with structured output configuration, timeout, and backoff retries.
 *
 * @param {string} prompt - Fully constructed prompt with user data enclosed in delimiters.
 * @param {object} options - Options override (temperature, responseSchema, etc.)
 * @returns {Promise<{ rawText: string, parsedJson: any, model: string }>}
 */
export async function callGeminiStructured(prompt, options = {}) {
  const { isConfigured, model } = getGeminiConfig();

  if (!isConfigured) {
    const err = new Error('Gemini API key is not configured in server environment (GEMINI_API_KEY).');
    err.code = 'MISSING_API_KEY';
    throw err;
  }

  const apiKey = process.env.GEMINI_API_KEY.trim();
  const ai = new GoogleGenAI({ apiKey });

  let attempt = 0;
  let lastError = null;

  while (attempt <= MAX_RETRIES) {
    try {
      // Abort signal for 25s timeout
      const signal = AbortSignal.timeout(options.timeoutMs || REQUEST_TIMEOUT_MS);

      const response = await ai.models.generateContent({
        model,
        contents: prompt,
        config: {
          temperature: options.temperature ?? 0.15,
          responseMimeType: 'application/json',
          ...(options.responseSchema ? { responseSchema: options.responseSchema } : {}),
        },
      }, { signal });

      const rawText = response.text;
      if (!rawText || !rawText.trim()) {
        throw new Error('Gemini returned an empty response.');
      }

      // Clean any accidental markdown code fences
      const cleaned = rawText
        .replace(/^```json\s*/i, '')
        .replace(/^```\s*/i, '')
        .replace(/\s*```$/i, '')
        .trim();

      const parsedJson = JSON.parse(cleaned);

      return {
        rawText,
        parsedJson,
        model,
        timestamp: new Date().toISOString(),
      };
    } catch (err) {
      lastError = err;
      const categorized = categorizeGeminiError(err);

      // If not retryable or max attempts reached, abort immediately
      if (!categorized.retryable || attempt === MAX_RETRIES) {
        err.categorized = categorized;
        throw err;
      }

      attempt++;
      const backoffMs = INITIAL_BACKOFF_MS * Math.pow(2, attempt - 1);
      console.warn(`[Gemini SDK] Attempt ${attempt} failed with ${categorized.code}. Retrying in ${backoffMs}ms...`);
      await new Promise((resolve) => setTimeout(resolve, backoffMs));
    }
  }

  throw lastError;
}

/**
 * Sanitizes user input and encapsulates inside strict data delimiters to prevent prompt injection.
 * Any instruction inside these tags must be ignored by the LLM.
 */
export function wrapUntrustedDocument(tag, content, maxChars = 50000) {
  const safeContent = (typeof content === 'string' ? content : String(content || ''))
    .slice(0, maxChars)
    // Disarm attempts to close the wrapping tag early
    .replace(new RegExp(`</${tag}>`, 'gi'), `[ESCAPED_END_${tag.toUpperCase()}]`);

  return `<${tag}>\n${safeContent}\n</${tag}>`;
}
