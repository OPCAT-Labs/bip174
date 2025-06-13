import { InputTypes } from '../../typeFields.js';
import * as tools from 'uint8array-tools';
import * as varuint from 'varuint-bitcoin';
export function decode(keyVal) {
  if (keyVal.key[0] !== InputTypes.OPCAT_UTXO) {
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
export function encode(data) {
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
    key: Uint8Array.from([InputTypes.OPCAT_UTXO]),
    value: result,
  };
}
export const expected =
  '{ script: Uint8Array; data: Uint8Array; value: bigint; }';
export function check(data) {
  return (
    data.script instanceof Uint8Array &&
    data.data instanceof Uint8Array &&
    typeof data.value === 'bigint'
  );
}
export function canAdd(currentData, newData) {
  return !!currentData && !!newData && currentData.opcatUtxo === undefined;
}
