// Import all decoder functions from individual files
import { decodeUrl } from './decoder/decodeUrl.js';
import { decodeXml } from './decoder/decodeXml.js';
import { decodeBase64 } from './decoder/decodeBase64.js';
import { decodeBase64Url } from './decoder/decodeBase64Url.js';
import { decodeAsciiHex } from './decoder/decodeAsciiHex.js';
import { decodeHex } from './decoder/decodeHex.js';
import { decodeOctal } from './decoder/decodeOctal.js';
import { decodeBinary } from './decoder/decodeBinary.js';
import { decodeDoubleUrl } from './decoder/decodeDoubleUrl.js';
import { decodeTripleUrl } from './decoder/decodeTripleUrl.js';
import { decodeUnicodeEscape } from './decoder/decodeUnicodeEscape.js';
import { decodeBase32 } from './decoder/decodeBase32.js';
import { decodeBase36 } from './decoder/decodeBase36.js';
import { decodeBase58 } from './decoder/decodeBase58.js';
import { decodeBase62 } from './decoder/decodeBase62.js';
import { decodeBase91 } from './decoder/decodeBase91.js';
import { decodeBase16 } from './decoder/decodeBase16.js';
import { decodeBase32Hex } from './decoder/decodeBase32Hex.js';
import { decodeBase32Z } from './decoder/decodeBase32Z.js';
import { decodeBase64Safe } from './decoder/decodeBase64Safe.js';
import { decodeBase64NoPadding } from './decoder/decodeBase64NoPadding.js';
import { decodeBaseX } from './decoder/decodeBaseX.js';
import { decodeBinarySpaced } from './decoder/decodeBinarySpaced.js';
import { decodeBinaryPacked } from './decoder/decodeBinaryPacked.js';
import { decodeDecimal } from './decoder/decodeDecimal.js';
import { decodeDecimalPacked } from './decoder/decodeDecimalPacked.js';
import { decodeAscii85 } from './decoder/decodeAscii85.js';
import { uudecode } from './decoder/uudecode.js';
import { yDecodeText } from './decoder/yDecodeText.js';
import { decodeAsn1Der } from './decoder/decodeAsn1Der.js';
import { decodeBencode } from './decoder/decodeBencode.js';
import { decodeMessagePack } from './decoder/decodeMessagePack.js';
import { decodeCbor } from './decoder/decodeCbor.js';
import { decodePlist } from './decoder/decodePlist.js';
import { decodeBson } from './decoder/decodeBson.js';
import { decodeAmf0 } from './decoder/decodeAmf0.js';
import { decodeAmf3 } from './decoder/decodeAmf3.js';
import { decodeAvro } from './decoder/decodeAvro.js';
import { xorCipherMultiKeyDecode } from './cipher/xorCipherMultiKeyDecode.js';
import { playfairDecode } from './cipher/playfairDecode.js';
import { bifidDecode } from './cipher/bifidDecode.js';
import { fourSquareDecode } from './cipher/fourSquareDecode.js';
import { decodeZalgo } from './decoder/decodeZalgo.js';
import { decodeHomograph } from './decoder/decodeHomograph.js';
import { decodeCaseVariations } from './decoder/decodeCaseVariations.js';
import { decodeInvisibleUnicode } from './decoder/decodeInvisibleUnicode.js';
import { decodeNullByte } from './decoder/decodeNullByte.js';
import { decodeHtmlEntities } from './decoder/decodeHtmlEntities.js';
import { decodeJsString } from './decoder/decodeJsString.js';
import { decodeSqlString } from './decoder/decodeSqlString.js';
import { decodePhpString } from './decoder/decodePhpString.js';
import { decodePowershellString } from './decoder/decodePowershellString.js';
import { decodeCrlf } from './decoder/decodeCrlf.js';
import { decodePathTraversal } from './decoder/decodePathTraversal.js';

export const decoders = {
  base: {
    decodeUrl,
    decodeXml,
    decodeBase64,
    decodeBase64Url,
    decodeAsciiHex,
    decodeHex,
    decodeOctal,
    decodeBinary,
    decodeBase32
  },
  url: {
    decodeDoubleUrl,
    decodeTripleUrl
  },
  unicode: {
    decodeUnicodeEscape,
    decodeZalgo,
    decodeHomograph,
    decodeInvisibleUnicode
  },
  html: {
    decodeHtmlEntities
  },
  javascript: {
    decodeJsString
  },
  sql: {
    decodeSqlString
  },
  php: {
    decodePhpString
  },
  powershell: {
    decodePowershellString
  },
  base_extended: {
    decodeBase16,
    decodeBase32,
    decodeBase32Hex,
    decodeBase32Z,
    decodeBase36,
    decodeBase58,
    decodeBase62,
    decodeBase64Safe,
    decodeBase64NoPadding,
    decodeBase91,
    decodeBaseX
  },
  binary: {
    decodeBinarySpaced,
    decodeBinaryPacked
  },
  decimal: {
    decodeDecimal,
    decodeDecimalPacked
  },
  serialization: {
    decodeAscii85,
    uudecode,
    yDecodeText,
    decodeAsn1Der,
    decodeBencode,
    decodeMessagePack,
    decodeCbor,
    decodePlist,
    decodeBson,
    decodeAmf0,
    decodeAmf3,
    decodeAvro
  },
  ciphers: {
    xorCipherMultiKeyDecode,
    playfairDecode,
    bifidDecode,
    fourSquareDecode
  },
  advanced: {
    decodeNullByte,
    decodeCrlf,
    decodePathTraversal,
    decodeCaseVariations
  }
};