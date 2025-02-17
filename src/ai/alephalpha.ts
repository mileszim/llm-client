import { AIPromptConfig, AIServiceOptions } from '../text/types.js';
import { apiCall } from '../util/apicall.js';

import { BaseAI } from './base.js';
import { EmbedResponse, TextModelInfo, TextResponse } from './types.js';

const apiURL = 'https://api.aleph-alpha.com/';

const enum apiTypes {
  Completion = 'complete',
  Embed = 'semantic_embed',
}

/**
 * AlephAlpha: Models for text generation
 * @export
 */
export enum AlephAlphaModel {
  LuminousSupremeControl = 'luminous-supreme-control',
  LuminousSupreme = 'luminous-supreme',
  LuminousExtended = 'luminous-extended',
  LuminousBase = 'luminous-base',
}

/**
 * AlephAlpha: Models for use in embeddings
 * @export
 */
export enum AlephAlphaEmbedModel {
  LuminousExplore = 'luminous-explore',
}

export enum AlephAlphaEmbedRepresentation {
  Symmetric = 'symmetric',
  Document = 'document',
  Query = 'query',
}

export enum AlephaAlphaHosting {
  MaxPrivacy = 'aleph-alpha',
}

const modelInfo: TextModelInfo[] = [
  {
    name: AlephAlphaModel.LuminousSupremeControl,
    currency: 'eur',
    promptTokenCostPer1K: 0.04375,
    completionTokenCostPer1K: 0.04375,
    maxTokens: 2048,
  },
  {
    name: AlephAlphaModel.LuminousSupreme,
    currency: 'eur',
    promptTokenCostPer1K: 0.035,
    completionTokenCostPer1K: 0.035,
    maxTokens: 2048,
  },
  {
    name: AlephAlphaModel.LuminousExtended,
    currency: 'eur',
    promptTokenCostPer1K: 0.009,
    completionTokenCostPer1K: 0.009,
    maxTokens: 2048,
  },
  {
    name: AlephAlphaModel.LuminousBase,
    currency: 'eur',
    promptTokenCostPer1K: 0.006,
    completionTokenCostPer1K: 0.006,
    maxTokens: 2048,
  },
  {
    name: AlephAlphaEmbedModel.LuminousExplore,
    currency: 'eur',
    promptTokenCostPer1K: 0.015,
    completionTokenCostPer1K: 0.015,
    maxTokens: 2048,
  },
];

/**
 * AlephAlpha: Model options for text generation
 * @export
 */
export type AlephAlphaOptions = {
  model: AlephAlphaModel;
  embedModel: AlephAlphaEmbedModel;
  hosting?: AlephaAlphaHosting;
  maxTokens: number;
  minTokens?: number;
  echo?: boolean;
  temperature: number;
  topK: number;
  topP: number;
  presencePenalty?: number;
  frequencyPenalty?: number;
  sequencePenalty?: number;
  sequencePenaltyMinLength?: number;
  repetitionPenaltiesIncludeCompletion?: number;
  useMultiplicativePresencePenalty?: boolean;
  useMultiplicativeFrequencyPenalty?: boolean;
  useMultiplicativeSequencePenalty?: boolean;
  penaltyBias?: string;
  penaltyExceptions?: string[];
  penaltyExceptionsIncludeStopSequences?: boolean;
  bestOf?: number;
  n?: number;
  logitBias?: Map<string, number>;
  logProbs?: number;
  tokens?: boolean;
  rawCompletion?: boolean;
  disableOptimizations?: boolean;
  completionBiasInclusion?: string[];
  completionBiasInclusionFirstTokenOnly?: boolean;
  completionBiasExclusion?: boolean;
  completionBiasExclusionFirstTokenOnly?: boolean;
  contextualControlThreshold?: number;
  controlLogAdditive?: boolean;
  representation: AlephAlphaEmbedRepresentation;
  compressToSize?: number;
  normalize?: boolean;
};

/**
 * AlephAlpha: Default Model options for text generation
 * @export
 */
export const AlephAlphaDefaultOptions = (): AlephAlphaOptions => ({
  model: AlephAlphaModel.LuminousSupreme,
  embedModel: AlephAlphaEmbedModel.LuminousExplore,
  representation: AlephAlphaEmbedRepresentation.Document,
  disableOptimizations: true,
  maxTokens: 300,
  temperature: 0.45,
  topK: 0,
  topP: 1,
  // frequencyPenalty: 0.40
  // presencePenalty: 0.40
});

/**
 * AlephAlpha: Default model options for more creative text generation
 * @export
 */
export const AlephAlphaCreativeOptions = (): AlephAlphaOptions => ({
  ...AlephAlphaDefaultOptions(),
  model: AlephAlphaModel.LuminousSupreme,
  temperature: 0.9,
});

type AlephAlphaRequest = {
  model: AlephAlphaModel | string;
  hosting?: AlephaAlphaHosting;
  prompt: string;
  maximum_tokens: number;
  minimum_tokens?: number;
  echo?: boolean;
  temperature: number;
  top_k: number;
  top_p: number;
  presence_penalty?: number;
  frequency_penalty?: number;
  sequence_penalty?: number;
  sequence_penalty_min_length?: number;
  repetition_penalties_include_completion?: number;
  use_multiplicative_presence_penalty?: boolean;
  useMultiplicativeFrequencyPenalty?: boolean;
  useMultiplicativeSequencePenalty?: boolean;
  penalty_bias?: string;
  penalty_exceptions?: string[];
  penalty_exceptions_include_stop_sequences?: boolean;
  best_of?: number;
  n?: number;
  logit_bias?: Map<string, number>;
  log_probs?: number;
  stop_sequences?: readonly string[];
  tokens?: boolean;
  raw_completion?: boolean;
  disable_optimizations?: boolean;
  completion_bias_inclusion?: string[];
  completion_bias_inclusion_first_token_only?: boolean;
  completion_bias_exclusion?: boolean;
  completion_bias_exclusion_first_token_only?: boolean;
  contextual_control_threshold?: number;
  control_log_additive?: boolean;
};

type AlephAlphaAITextResponse = {
  model_version: string;
  completions: [
    {
      log_probs: Map<string, number>;
      completion: string;
      raw_completion: string;
      completion_tokens: string[];
      finish_reason: string;
    }
  ];
  optimized_prompt: [{ type: string; data: string }];
};

type AlephAlphaEmbedRequest = {
  model: AlephAlphaModel | string;
  hosting?: AlephaAlphaHosting;
  prompt: string;
  representation: AlephAlphaEmbedRepresentation;
  compress_to_size?: number;
  normalize?: boolean;
  contextual_control_threshold?: number;
  control_log_additive?: boolean;
};

type AlephAlphaEmbedResponse = {
  model_version: string;
  embedding: number[];
};

const generateReq = (
  prompt: string,
  opt: Readonly<AlephAlphaOptions>,
  stopSequences: readonly string[]
): AlephAlphaRequest => ({
  model: opt.model,
  hosting: opt.hosting,
  prompt,
  maximum_tokens: opt.maxTokens,
  minimum_tokens: opt.minTokens,
  echo: opt.echo,
  temperature: opt.temperature,
  top_k: opt.topK,
  top_p: opt.topP,
  presence_penalty: opt.presencePenalty,
  frequency_penalty: opt.frequencyPenalty,
  sequence_penalty: opt.sequencePenalty,
  sequence_penalty_min_length: opt.sequencePenaltyMinLength,
  repetition_penalties_include_completion:
    opt.repetitionPenaltiesIncludeCompletion,
  use_multiplicative_presence_penalty: opt.useMultiplicativePresencePenalty,
  useMultiplicativeFrequencyPenalty: opt.useMultiplicativeFrequencyPenalty,
  useMultiplicativeSequencePenalty: opt.useMultiplicativeSequencePenalty,
  penalty_bias: opt.penaltyBias,
  penalty_exceptions: opt.penaltyExceptions,
  penalty_exceptions_include_stop_sequences:
    opt.penaltyExceptionsIncludeStopSequences,
  best_of: opt.bestOf,
  n: opt.n,
  logit_bias: opt.logitBias,
  log_probs: opt.logProbs,
  stop_sequences: stopSequences,
  tokens: opt.tokens,
  raw_completion: opt.rawCompletion,
  disable_optimizations: opt.disableOptimizations,
  completion_bias_inclusion: opt.completionBiasInclusion,
  completion_bias_inclusion_first_token_only:
    opt.completionBiasInclusionFirstTokenOnly,
  completion_bias_exclusion: opt.completionBiasExclusion,
  completion_bias_exclusion_first_token_only:
    opt.completionBiasExclusionFirstTokenOnly,
  contextual_control_threshold: opt.contextualControlThreshold,
  control_log_additive: opt.controlLogAdditive,
});

const embedReq = (
  prompt: string,
  opt: Readonly<AlephAlphaOptions>
): AlephAlphaEmbedRequest => ({
  model: opt.embedModel,
  hosting: opt.hosting,
  prompt,
  representation: opt.representation,
  compress_to_size: opt.compressToSize,
  normalize: opt.normalize,
  contextual_control_threshold: opt.contextualControlThreshold,
  control_log_additive: opt.controlLogAdditive,
});

/**
 * AlephAlpha: AI Service
 * @export
 */
export class AlephAlpha extends BaseAI {
  private apiKey: string;
  private options: AlephAlphaOptions;

  constructor(
    apiKey: string,
    options: Readonly<AlephAlphaOptions> = AlephAlphaDefaultOptions(),
    otherOptions?: Readonly<AIServiceOptions>
  ) {
    super(
      'AlephAlpha',
      modelInfo,
      {
        model: options.model,
        embedModel: options.embedModel,
      },
      otherOptions
    );

    if (apiKey === '') {
      throw new Error('AlephAlpha API key not set');
    }
    this.apiKey = apiKey;
    this.options = options;
  }

  async _generate(
    prompt: string,
    options?: Readonly<AIPromptConfig>
  ): Promise<TextResponse> {
    const res = await apiCall<AlephAlphaRequest, AlephAlphaAITextResponse>(
      {
        key: this.apiKey,
        name: apiTypes.Completion,
        url: apiURL,
      },
      generateReq(prompt, this.options, options?.stopSequences ?? [])
    );

    const { completions } = res;
    return {
      results: completions.map((v) => ({
        text: v.completion,
        finishReason: v.finish_reason,
      })),
    };
  }

  async _embed(
    textToEmbed: readonly string[] | string
  ): Promise<EmbedResponse> {
    const texts = typeof textToEmbed === 'string' ? [textToEmbed] : textToEmbed;

    if (texts.length > 1) {
      throw new Error('AlephAlpha limits embeddings input to 1 string');
    }

    const overLimit = texts.filter((v) => v.length > 512);
    if (overLimit.length !== 0) {
      throw new Error('AlephAlpha limits embeddings input to 512 characters');
    }

    const res = await apiCall<AlephAlphaEmbedRequest, AlephAlphaEmbedResponse>(
      {
        key: this.apiKey,
        name: apiTypes.Embed,
        url: apiURL,
      },
      embedReq(texts[0], this.options)
    );

    const { embedding } = res;
    return {
      texts,
      embedding: embedding,
    };
  }
}
