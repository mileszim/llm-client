import {
  TextRequestBuilder,
  TextResponseBuilder,
} from '../../tracing/index.js';
import { BaseAIMiddleware, PromptUpdater } from '../middleware.js';
import { AIMiddleware, TextModelConfig } from '../types.js';
import { findItemByNameOrAlias } from '../util.js';

import { Together } from './api.js';
import { modelInfoTogether } from './info.js';
import {
  TogetherCompletionRequest,
  TogetherCompletionResponse,
} from './types.js';

export class TogetherCompletionMiddleware
  extends BaseAIMiddleware<
    TogetherCompletionRequest,
    TogetherCompletionResponse
  >
  implements AIMiddleware
{
  addRequest = async (request: string, fn?: PromptUpdater) => {
    super.addRequest(request);

    if (!this.req) {
      throw new Error('Invalid request');
    }

    if (fn) {
      const memory = await fn({ prompt: this.req.prompt });
      this.req.prompt += memory.map(({ text }) => text).join('\n');
      this.reqUpdated = true;
    }

    const {
      model,
      prompt,
      max_tokens: max_tokens,
      temperature,
      top_p,
      repetition_penalty: presence_penalty,
    } = this.req;

    // Fetching model info
    const mi = findItemByNameOrAlias(modelInfoTogether, model.toString());
    const modelInfo = {
      ...mi,
      name: model.toString(),
      provider: 'together',
    };

    // Configure TextModel based on TogetherCompletionRequest
    const modelConfig: TextModelConfig = {
      maxTokens: max_tokens ?? 0,
      temperature: temperature,
      topP: top_p,
      presencePenalty: presence_penalty,
    };

    this.sb.setRequest(
      new TextRequestBuilder().setStep(prompt, modelConfig, modelInfo)
    );
  };

  addResponse = (response: string) => {
    super.addResponse(response);

    if (!this.resp) {
      throw new Error('Invalid response');
    }

    const results = this.resp.output.choices.map((choice) => ({
      text: choice.text,
    }));

    this.sb.setResponse(new TextResponseBuilder().setResults(results));
  };

  embed = async (text: string): Promise<readonly number[]> => {
    const ai = new Together(this.apiKey);
    const res = await ai.embed(text);
    return res.embedding;
  };
}
