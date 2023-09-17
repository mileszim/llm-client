import chalk from 'chalk';

import { sendTrace } from '../tracing/index';
import { AITextTraceStep } from '../tracing/types';
import Config from '../util/config';

export class RemoteLogger {
  private apiKey?: string;
  private traceEndpoint: string;

  constructor() {
    this.apiKey = Config.llmcApiKey;
    this.traceEndpoint = Config.traceEndpoint;
  }

  setAPIKey(apiKey: string): void {
    if (apiKey.length === 0) {
      throw new Error('Invalid LLM Client API key');
    }
    this.apiKey = apiKey;
  }

  printDebugInfo() {
    if (!this.apiKey || this.apiKey.length === 0) {
      return;
    }
    const msg = `🦙 Remote logging traces to ${this.traceEndpoint}`;
    console.log(chalk.yellowBright(msg));
  }

  async log(trace: Readonly<AITextTraceStep>) {
    if (!this.apiKey || this.apiKey.length === 0) {
      return;
    }
    await sendTrace(trace, this.apiKey, this.traceEndpoint);
  }
}
