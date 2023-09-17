import 'dotenv/config';

/**
 * Take a variable name and a default value and
 * fetch the value from env vars or return the default
 *
 * it checks the following env name spaces in order:
 *   1. LLM_CLIENT_
 *   2. LLMCLIENT_
 *   3. LLMC_
 */
const getEnv = ({
  varName,
  defaultValue
}: Readonly<{
  varName: string;
  defaultValue: string | boolean;
}>): string | boolean => {
  varName = varName.toUpperCase();
  const val = (
       process.env[`LLM_CLIENT_${varName}`]
    ?? process.env[`LLMCLIENT_${varName}`]
    ?? process.env[`LLMC_${varName}`]
    ?? defaultValue
  );
  if (val === 'true' || val === 't' || val === '1') return true;
  if (val === 'false' || val === 'f' || val === '0') return false;
  return val;
};

/**
 * Configuration Helper
 */
export default class Config {
  static traceEndpoint: string = getEnv({
    varName: 'TRACE_ENDPOINT',
    defaultValue: 'http://localhost:3000/api/t/traces'
  }) as string;

  static proxyEndpoint: string = getEnv({
    varName: 'PROXY_ENDPOINT',
    defaultValue: 'http://127.0.0.1'
  }) as string;

  static useProxy: boolean = getEnv({
    varName: 'USE_PROXY',
    defaultValue: false
  }) as boolean;

  static llmcApiKey: string = getEnv({
    varName: 'API_KEY',
    defaultValue: ''
  }) as string;

  static debug: boolean = getEnv({
    varName: 'DEBUG',
    defaultValue: false
  }) as boolean;
}
