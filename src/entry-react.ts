// React entry point. Imports React, so the consumer must have it installed
// (declared as an optional peerDependency in package.json).
export {
  useErrorParser,
  type UseErrorParserOptions,
  type UseErrorParserResult,
} from './integrations/react.js';

// Re-export the most commonly needed types so consumers using the React entry
// don't have to import from a second subpath.
export type {
  AbiEntry,
  DecodedError,
  UnknownError,
  ParseResult,
  Selector,
  HexString,
} from './types.js';
export { createAbiEntry } from './core/abiRegistry.js';
