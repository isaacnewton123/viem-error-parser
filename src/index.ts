// Atoms
export type {
  HexString,
  Selector,
  ErrorSignature,
  RevertData,
  AbiEntry,
  DecodedArgs,
  DecodedError,
  UnknownError,
  ParseResult,
} from './types.js';
export { isHex, assertHex, hexLength, sliceHex, toLowerHex } from './utils/hex.js';
export {
  isSelectorShape,
  extractSelector,
  extractArgs,
  SELECTOR_LENGTH,
} from './utils/errorSignature.js';

// Molecules
export { extractRevertData } from './core/extractRevertData.js';
export {
  traverseErrorCause,
  MAX_CAUSE_DEPTH,
  type CauseVisitor,
} from './core/traverseErrorCause.js';
export { findMatchingAbi, type AbiMatch } from './core/findMatchingAbi.js';

// Organisms
export {
  AbiRegistry,
  buildSelectorMap,
  createAbiEntry,
  type AbiRegistryMatch,
} from './core/abiRegistry.js';
export {
  classifyError,
  type ErrorKind,
  type Classification,
} from './core/errorClassifier.js';
export { ErrorDecoder, type ErrorDecoderOptions } from './core/decoder.js';

// Templates
export { commonAbiEntries } from './presets/commonAbis.js';
export { forViem, type ForViemOptions } from './integrations/viem.js';
export { forWagmi, getWagmiErrorMessage, type ForWagmiOptions } from './integrations/wagmi.js';
