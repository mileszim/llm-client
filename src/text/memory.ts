import { AIMemory } from './types.js';

/**
 * A memory class to store ai interactions
 * @group Memory
 * @export
 */
export class Memory implements AIMemory {
  private data: string[] = [];
  private sdata = new Map<string, string[]>();
  private limit: number;

  constructor(limit = 50) {
    if (limit <= 0) {
      throw Error("argument 'last' must be greater than 0");
    }
    this.limit = limit;
  }

  async add(text: string, sessionId?: string): Promise<void> {
    const d = this.get(sessionId);

    d.push(text) > this.limit ? d.shift() : null;
  }

  async history(sessionId?: string): Promise<string> {
    return this.get(sessionId).reduce((a, v) => a + v, '');
  }

  async peek(sessionId?: string): Promise<Readonly<string[]>> {
    return this.get(sessionId);
  }

  async reset(sessionId?: string) {
    if (!sessionId) {
      this.data = [];
    } else {
      this.sdata.set(sessionId, []);
    }
  }

  private get(sessionId?: string): string[] {
    if (!sessionId) {
      return this.data;
    }

    if (!this.sdata.has(sessionId)) {
      this.sdata.set(sessionId, []);
    }

    return this.sdata.get(sessionId) || [];
  }
}
