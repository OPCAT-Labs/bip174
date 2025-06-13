import { KeyValue, OpcatUtxo } from '../../interfaces';
export declare function decode(keyVal: KeyValue): OpcatUtxo;
export declare function encode(data: OpcatUtxo): KeyValue;
export declare const expected = "{ script: Uint8Array; data: Uint8Array; value: bigint; }";
export declare function check(data: any): data is OpcatUtxo;
export declare function canAdd(currentData: any, newData: any): boolean;
