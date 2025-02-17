import { ExtendedIncomingMessage } from '../proxy/types';
import { AITextTraceStep } from '../tracing/types';

import { PromptUpdater } from './middleware';

export type TextModelInfo = {
  name: string;
  currency?: string;
  characterIsToken?: boolean;
  promptTokenCostPer1K?: number;
  completionTokenCostPer1K?: number;
  maxTokens?: number;
  aliases?: string[];
};

export type TokenUsage = {
  promptTokens: number;
  completionTokens: number;
  totalTokens: number;
};

export type TextModelConfig = {
  maxTokens: number;
  temperature: number;
  topP?: number;
  topK?: number;
  n?: number;
  stream?: boolean;
  logprobs?: number;
  echo?: boolean;
  presencePenalty?: number;
  frequencyPenalty?: number;
  bestOf?: number;
  logitBias?: Map<string, number>;
  suffix?: string | null;
  stop?: readonly string[];
};

export type TextResponse = {
  sessionId?: string;
  remoteId?: string;
  results: readonly {
    text: string;
    role?: string;
    id?: string;
    finishReason?: string;
  }[];
  modelUsage?: TokenUsage;
  embedModelUsage?: TokenUsage;
};

export type EmbedResponse = {
  remoteId?: string;
  sessionId?: string;
  texts: readonly string[];
  embedding: readonly number[];
  modelUsage?: TokenUsage;
};

export type TranscriptResponse = {
  sessionId?: string;
  duration: number;
  segments: {
    id: number;
    start: number;
    end: number;
    text: string;
  }[];
};

export type RateLimiterFunction = <T>(func: unknown) => T;

/**
 * Middleware
 * @export
 */
export interface AIMiddleware {
  addRequest(request: string, fn?: PromptUpdater): void;
  addResponse(response: string): void;
  getTrace(req: Readonly<ExtendedIncomingMessage>): AITextTraceStep;
  embed(text: string): Promise<readonly number[]>;
  isRequestUpdated(): boolean;
  renderRequest(): string;
}
