export type GrokMessage = { role: 'system' | 'user' | 'assistant'; content: string };

export class GrokRequestError extends Error {
  constructor(message: string, public readonly status?: number) {
    super(message);
    this.name = 'GrokRequestError';
  }
}

function messageForStatus(status: number) {
  if (status === 401 || status === 403) return 'Grok rejected this API key. Check the key and its project permissions.';
  if (status === 429) return 'Grok rate limit reached. Wait a moment and try again.';
  if (status >= 500) return 'Grok is temporarily unavailable. Try again shortly.';
  return `Grok request failed (${status}).`;
}

/**
 * Browser-only, session-scoped Grok client. The caller owns the key in React
 * state; this module never persists or logs it. For shared deployments, route
 * requests through an authenticated server-side broker instead.
 */
export async function requestGrok(
  key: string,
  model: string,
  messages: GrokMessage[],
  signal?: AbortSignal,
): Promise<string> {
  if (!key.trim()) throw new GrokRequestError('Add a Grok API key to start a conversation.');

  const controller = new AbortController();
  const timeout = window.setTimeout(() => controller.abort(), 60_000);
  const abort = () => controller.abort();
  signal?.addEventListener('abort', abort, { once: true });

  try {
    const response = await fetch('https://api.x.ai/v1/responses', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${key.trim()}` },
      signal: controller.signal,
      body: JSON.stringify({ model, input: messages, store: false, temperature: 0.3 }),
    });
    if (!response.ok) throw new GrokRequestError(messageForStatus(response.status), response.status);
    const data = await response.json();
    const text = data.output_text ?? data.output
      ?.filter((item: any) => item.type === 'message')
      .flatMap((item: any) => item.content ?? [])
      .filter((part: any) => part.type === 'output_text')
      .map((part: any) => part.text)
      .join('');
    if (!text) throw new GrokRequestError('Grok returned no text for this request.');
    return text;
  } catch (error) {
    if (error instanceof GrokRequestError) throw error;
    if ((error as Error).name === 'AbortError') throw new GrokRequestError('The Grok request timed out. Try a smaller context or try again.');
    throw new GrokRequestError('Could not reach Grok. Check your network, browser CORS policy, and API key.');
  } finally {
    window.clearTimeout(timeout);
    signal?.removeEventListener('abort', abort);
  }
}

export async function testGrokConnection(key: string, model: string) {
  await requestGrok(key, model, [{ role: 'user', content: 'Reply with exactly: connected' }]);
}
