// Import all encoder functions from individual files
import { a1z26Decode } from './cipher/a1z26Decode.js';
import { a1z26Encode } from './cipher/a1z26Encode.js';
import { affineCipherDecode } from './cipher/affineCipherDecode.js';
import { affineCipherEncode } from './cipher/affineCipherEncode.js';
import { atbashCipher } from './cipher/atbashCipher.js';
import { baconDecode } from './cipher/baconDecode.js';
import { baconEncode } from './cipher/baconEncode.js';
import { beaufortCipher } from './cipher/beaufortCipher.js';
import { bifidEncode } from './cipher/bifidEncode.js';
import { caesar } from './cipher/caesar.js';
import { caseAlternatingEncode } from './encoder/caseAlternatingEncode.js';
import { caseRandomEncode } from './encoder/caseRandomEncode.js';
import { crlfInjectionEncode } from './encoder/crlfInjectionEncode.js';
import { doubleUrlencode } from './encoder/doubleUrlencode.js';
import { encodeAmf0 } from './encoder/encodeAmf0.js';
import { encodeAmf3 } from './encoder/encodeAmf3.js';
import { encodeAscii85 } from './encoder/encodeAscii85.js';
import { encodeAsciiHex } from './encoder/encodeAsciiHex.js';
import { encodeAsn1Der } from './encoder/encodeAsn1Der.js';
import { encodeAvro } from './encoder/encodeAvro.js';
import { encodeBase16 } from './encoder/encodeBase16.js';
import { encodeBase32 } from './encoder/encodeBase32.js';
import { encodeBase32Hex } from './encoder/encodeBase32Hex.js';
import { encodeBase32Z } from './encoder/encodeBase32Z.js';
import { encodeBase36 } from './encoder/encodeBase36.js';
import { encodeBase58 } from './encoder/encodeBase58.js';
import { encodeBase62 } from './encoder/encodeBase62.js';
import { encodeBase64 } from './encoder/encodeBase64.js';
import { encodeBase64NoPadding } from './encoder/encodeBase64NoPadding.js';
import { encodeBase64Safe } from './encoder/encodeBase64Safe.js';
import { encodeBase64Url } from './encoder/encodeBase64Url.js';
import { encodeBase91 } from './encoder/encodeBase91.js';
import { encodeBaseX } from './encoder/encodeBaseX.js';
import { encodeBencode } from './encoder/encodeBencode.js';
import { encodeBinary } from './encoder/encodeBinary.js';
import { encodeBinaryPacked } from './encoder/encodeBinaryPacked.js';
import { encodeBinarySpaced } from './encoder/encodeBinarySpaced.js';
import { encodeBson } from './encoder/encodeBson.js';
import { encodeCbor } from './encoder/encodeCbor.js';
import { encodeDecimal } from './encoder/encodeDecimal.js';
import { encodeDecimalPacked } from './encoder/encodeDecimalPacked.js';
import { encodeHex } from './encoder/encodeHex.js';
import { encodeMessagePack } from './encoder/encodeMessagePack.js';
import { encodeOctal } from './encoder/encodeOctal.js';
import { encodePlist } from './encoder/encodePlist.js';
import { formatStringEncode } from './encoder/formatStringEncode.js';
import { fourSquareEncode } from './cipher/fourSquareEncode.js';

import { htmlDecimalEntities } from './encoder/htmlDecimalEntities.js';
import { htmlHexEntities } from './encoder/htmlHexEntities.js';
import { htmlHexEntitiesLeadingZeros } from './encoder/htmlHexEntitiesLeadingZeros.js';
import { htmlNamedEntities } from './encoder/htmlNamedEntities.js';
import { invisibleUnicodeEncode } from './encoder/invisibleUnicodeEncode.js';
import { jsEvalFromcharcode } from './encoder/jsEvalFromcharcode.js';
import { jsHexEscape } from './encoder/jsHexEscape.js';
import { jsStringFromcharcodeSplit } from './encoder/jsStringFromcharcodeSplit.js';
import { jsUnicodeEscape } from './encoder/jsUnicodeEscape.js';
import { mixedCase } from './encoder/mixedCase.js';
import { nullBytePrefix } from './encoder/nullBytePrefix.js';
import { nullByteScatter } from './encoder/nullByteScatter.js';
import { nullByteTerminate } from './encoder/nullByteTerminate.js';
import { pathTraversalEncode } from './encoder/pathTraversalEncode.js';
import { phpChrHexMixed } from './encoder/phpChrHexMixed.js';
import { phpPackEncode } from './encoder/phpPackEncode.js';
import { playfairEncode } from './cipher/playfairEncode.js';
import { powershellCharArray } from './encoder/powershellCharArray.js';
import { powershellFormatOperator } from './encoder/powershellFormatOperator.js';
import { printfFormatEncode } from './encoder/printfFormatEncode.js';
import { punycodeEncode } from './encoder/punycodeEncode.js';
import { railFenceDecode } from './cipher/railFenceDecode.js';
import { railFenceEncode } from './cipher/railFenceEncode.js';
import { rot13 } from './cipher/rot13.js';
import { rot47 } from './cipher/rot47.js';
import { sqlCharHexMixed } from './encoder/sqlCharHexMixed.js';
import { sqlHexLiteral } from './encoder/sqlHexLiteral.js';
import { sqlUnhexEncode } from './encoder/sqlUnhexEncode.js';
import { tripleUrlencode } from './encoder/tripleUrlencode.js';
import { unicodeEscape } from './encoder/unicodeEscape.js';
import { unicodeEscapeMixed } from './encoder/unicodeEscapeMixed.js';
import { unicodeHomographEncode } from './encoder/unicodeHomographEncode.js';
import { unicodeOverlongUtf8 } from './encoder/unicodeOverlongUtf8.js';
import { unicodeZalgoEncode } from './encoder/unicodeZalgoEncode.js';
import { urlencodeAllChars } from './encoder/urlencodeAllChars.js';
import { urlencodeAscii } from './encoder/urlencodeAscii.js';
import { uuencode } from './encoder/uuencode.js';
import { vigenereDecode } from './cipher/vigenereDecode.js';
import { vigenereEncode } from './cipher/vigenereEncode.js';
import { xmlEncode } from './encoder/xmlEncode.js';
import { xorCipher } from './cipher/xorCipher.js';
import { xorCipherMultiKey } from './cipher/xorCipherMultiKey.js';
import { yEncodeText } from './encoder/yEncodeText.js';


export const encoders = {
  // Most popular encoders - commonly used functions
  popular: {
    encodeBase64,
    encodeBase64Url,
    encodeHex,
    urlencodeAscii,
    encodeBinary,
    encodeOctal,
    rot13,
    caesar,
    xorCipher,
    xmlEncode
  },
  base: {
    urlencodeAscii,
    xmlEncode,
    encodeBase64,
    encodeBase64Url,
    encodeAsciiHex,
    encodeHex,
    encodeOctal,
    encodeBinary,
    rot13,
    caesar,
    xorCipher
  },
  ciphers: {
    xorCipher,
    xorCipherMultiKey,
    vigenereEncode,
    vigenereDecode,
    atbashCipher,
    affineCipherEncode,
    affineCipherDecode,
    playfairEncode,
    railFenceEncode,
    railFenceDecode,
    beaufortCipher,
    fourSquareEncode,
    baconEncode,
    baconDecode,
    a1z26Encode,
    a1z26Decode,
    bifidEncode,
    rot47
  },
  url: {
    doubleUrlencode,
    tripleUrlencode,
    urlencodeAllChars
  },
  unicode: {
    unicodeEscape,
    unicodeEscapeMixed,
    unicodeOverlongUtf8,
    unicodeZalgoEncode,
    unicodeHomographEncode
  },
  html: {
    htmlNamedEntities,
    htmlHexEntities,
    htmlDecimalEntities,
    htmlHexEntitiesLeadingZeros
  },
  javascript: {
    jsStringFromcharcodeSplit,
    jsEvalFromcharcode,
    jsUnicodeEscape,
    jsHexEscape
  },
  sql: {
    sqlCharHexMixed,
    sqlUnhexEncode,
    sqlHexLiteral
  },
  php: {
    phpChrHexMixed,
    phpPackEncode
  },
  powershell: {
    powershellCharArray,
    powershellFormatOperator
  },
  advanced: {
    invisibleUnicodeEncode,
    formatStringEncode,
    printfFormatEncode,
    nullByteTerminate,
    nullBytePrefix,
    nullByteScatter,
    pathTraversalEncode,
    crlfInjectionEncode,
    punycodeEncode
  },
  case: {
    mixedCase,
    caseAlternatingEncode,
    caseRandomEncode
  },
  base_extended: {
    encodeBase16,
    encodeBase32,
    encodeBase32Hex,
    encodeBase32Z,
    encodeBase36,
    encodeBase58,
    encodeBase62,
    encodeBase64Safe,
    encodeBase64NoPadding,
    encodeBase91,
    encodeBaseX
  },
  binary: {
    encodeBinarySpaced,
    encodeBinaryPacked
  },
  decimal: {
    encodeDecimal,
    encodeDecimalPacked
  },
  serialization: {
    encodeAscii85,
    uuencode,
    yEncodeText,
    encodeAsn1Der,
    encodeBencode,
    encodeMessagePack,
    encodeCbor,
    encodePlist,
    encodeBson,
    encodeAmf0,
    encodeAmf3,
    encodeAvro
  },
};