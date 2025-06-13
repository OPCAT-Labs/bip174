'use strict';
var __importStar =
  (this && this.__importStar) ||
  function(mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null)
      for (var k in mod)
        if (Object.hasOwnProperty.call(mod, k)) result[k] = mod[k];
    result['default'] = mod;
    return result;
  };
Object.defineProperty(exports, '__esModule', { value: true });
const typeFields_js_1 = require('../../typeFields.cjs');
const tools = __importStar(require('uint8array-tools'));
const varuint = __importStar(require('varuint-bitcoin'));
function decode(keyVal) {
  if (keyVal.key[0] !== typeFields_js_1.InputTypes.OPCAT_UTXO) {
    throw new Error(
      'Decode Error: could not decode opcatUtxo with key 0x' +
        tools.toHex(keyVal.key),
    );
  }
  let offset = 0;
  const value = tools.readInt64(keyVal.value, offset, 'LE');
  offset += 8;
  const { numberValue: scriptLen, bytes: scriptLenBytes } = varuint.decode(
    keyVal.value,
    offset,
  );
  if (scriptLen == null) throw new Error('Decode Error: scriptLen is null');
  offset += scriptLenBytes;
  const script = keyVal.value.slice(offset, offset + scriptLen);
  offset += scriptLen;
  const { numberValue: dataLen, bytes: dataLenBytes } = varuint.decode(
    keyVal.value,
    offset,
  );
  if (dataLen == null) throw new Error('Decode Error: dataLen is null');
  offset += dataLenBytes;
  const data = keyVal.value.slice(offset, offset + dataLen);
  offset += dataLen;
  return {
    script,
    data,
    value,
  };
}
exports.decode = decode;
function encode(data) {
  const { script, data: opcatData, value } = data;
  const scriptLen = script.length;
  const dataLen = opcatData.length;
  const scriptLenVar = varuint.encodingLength(scriptLen);
  const dataLenVar = varuint.encodingLength(dataLen);
  const totalLen = 8 + scriptLenVar + scriptLen + dataLenVar + dataLen;
  const result = new Uint8Array(totalLen);
  let offset = 0;
  tools.writeInt64(result, offset, BigInt(value), 'LE');
  offset += 8;
  varuint.encode(scriptLen, result, offset);
  offset += scriptLenVar;
  result.set(script, offset);
  offset += scriptLen;
  varuint.encode(dataLen, result, offset);
  offset += dataLenVar;
  result.set(opcatData, offset);
  return {
    key: Uint8Array.from([typeFields_js_1.InputTypes.OPCAT_UTXO]),
    value: result,
  };
}
exports.encode = encode;
exports.expected = '{ script: Uint8Array; data: Uint8Array; value: bigint; }';
function check(data) {
  return (
    data.script instanceof Uint8Array &&
    data.data instanceof Uint8Array &&
    typeof data.value === 'bigint'
  );
}
exports.check = check;
function canAdd(currentData, newData) {
  return !!currentData && !!newData && currentData.opcatUtxo === undefined;
}
exports.canAdd = canAdd;
