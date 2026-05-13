// Wagmi-specific entry point.
export {
  forWagmi,
  getWagmiErrorMessage,
  type ForWagmiOptions,
} from './integrations/wagmi.js';
export { ErrorDecoder, type ErrorDecoderOptions } from './core/decoder.js';
export { AbiRegistry, createAbiEntry } from './core/abiRegistry.js';
export { commonAbiEntries } from './presets/commonAbis.js';
export type {
  AbiEntry,
  DecodedError,
  UnknownError,
  ParseResult,
  RevertData,
  Selector,
  HexString,
} from './types.js';
