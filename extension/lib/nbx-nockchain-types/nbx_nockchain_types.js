let wasm;

let cachedUint8ArrayMemory0 = null;

function getUint8ArrayMemory0() {
    if (cachedUint8ArrayMemory0 === null || cachedUint8ArrayMemory0.byteLength === 0) {
        cachedUint8ArrayMemory0 = new Uint8Array(wasm.memory.buffer);
    }
    return cachedUint8ArrayMemory0;
}

function getArrayU8FromWasm0(ptr, len) {
    ptr = ptr >>> 0;
    return getUint8ArrayMemory0().subarray(ptr / 1, ptr / 1 + len);
}

let cachedTextDecoder = new TextDecoder('utf-8', { ignoreBOM: true, fatal: true });

cachedTextDecoder.decode();

const MAX_SAFARI_DECODE_BYTES = 2146435072;
let numBytesDecoded = 0;
function decodeText(ptr, len) {
    numBytesDecoded += len;
    if (numBytesDecoded >= MAX_SAFARI_DECODE_BYTES) {
        cachedTextDecoder = new TextDecoder('utf-8', { ignoreBOM: true, fatal: true });
        cachedTextDecoder.decode();
        numBytesDecoded = len;
    }
    return cachedTextDecoder.decode(getUint8ArrayMemory0().subarray(ptr, ptr + len));
}

function getStringFromWasm0(ptr, len) {
    ptr = ptr >>> 0;
    return decodeText(ptr, len);
}

let WASM_VECTOR_LEN = 0;

function passArray8ToWasm0(arg, malloc) {
    const ptr = malloc(arg.length * 1, 1) >>> 0;
    getUint8ArrayMemory0().set(arg, ptr / 1);
    WASM_VECTOR_LEN = arg.length;
    return ptr;
}

function takeFromExternrefTable0(idx) {
    const value = wasm.__wbindgen_export_0.get(idx);
    wasm.__externref_table_dealloc(idx);
    return value;
}

function isLikeNone(x) {
    return x === undefined || x === null;
}

let cachedDataViewMemory0 = null;

function getDataViewMemory0() {
    if (cachedDataViewMemory0 === null || cachedDataViewMemory0.buffer.detached === true || (cachedDataViewMemory0.buffer.detached === undefined && cachedDataViewMemory0.buffer !== wasm.memory.buffer)) {
        cachedDataViewMemory0 = new DataView(wasm.memory.buffer);
    }
    return cachedDataViewMemory0;
}

function addToExternrefTable0(obj) {
    const idx = wasm.__externref_table_alloc();
    wasm.__wbindgen_export_0.set(idx, obj);
    return idx;
}

function passArrayJsValueToWasm0(array, malloc) {
    const ptr = malloc(array.length * 4, 4) >>> 0;
    for (let i = 0; i < array.length; i++) {
        const add = addToExternrefTable0(array[i]);
        getDataViewMemory0().setUint32(ptr + 4 * i, add, true);
    }
    WASM_VECTOR_LEN = array.length;
    return ptr;
}

const cachedTextEncoder = new TextEncoder();

if (!('encodeInto' in cachedTextEncoder)) {
    cachedTextEncoder.encodeInto = function (arg, view) {
        const buf = cachedTextEncoder.encode(arg);
        view.set(buf);
        return {
            read: arg.length,
            written: buf.length
        };
    }
}

function passStringToWasm0(arg, malloc, realloc) {

    if (realloc === undefined) {
        const buf = cachedTextEncoder.encode(arg);
        const ptr = malloc(buf.length, 1) >>> 0;
        getUint8ArrayMemory0().subarray(ptr, ptr + buf.length).set(buf);
        WASM_VECTOR_LEN = buf.length;
        return ptr;
    }

    let len = arg.length;
    let ptr = malloc(len, 1) >>> 0;

    const mem = getUint8ArrayMemory0();

    let offset = 0;

    for (; offset < len; offset++) {
        const code = arg.charCodeAt(offset);
        if (code > 0x7F) break;
        mem[ptr + offset] = code;
    }

    if (offset !== len) {
        if (offset !== 0) {
            arg = arg.slice(offset);
        }
        ptr = realloc(ptr, len, len = offset + arg.length * 3, 1) >>> 0;
        const view = getUint8ArrayMemory0().subarray(ptr + offset, ptr + len);
        const ret = cachedTextEncoder.encodeInto(arg, view);

        offset += ret.written;
        ptr = realloc(ptr, len, offset, 1) >>> 0;
    }

    WASM_VECTOR_LEN = offset;
    return ptr;
}

function _assertClass(instance, klass) {
    if (!(instance instanceof klass)) {
        throw new Error(`expected instance of ${klass.name}`);
    }
}

const WasmInputFinalization = (typeof FinalizationRegistry === 'undefined')
    ? { register: () => {}, unregister: () => {} }
    : new FinalizationRegistry(ptr => wasm.__wbg_wasminput_free(ptr >>> 0, 1));
/**
 * WASM-compatible Input wrapper (links a Note to a Spend)
 */
export class WasmInput {

    static __unwrap(jsValue) {
        if (!(jsValue instanceof WasmInput)) {
            return 0;
        }
        return jsValue.__destroy_into_raw();
    }

    __destroy_into_raw() {
        const ptr = this.__wbg_ptr;
        this.__wbg_ptr = 0;
        WasmInputFinalization.unregister(this);
        return ptr;
    }

    free() {
        const ptr = this.__destroy_into_raw();
        wasm.__wbg_wasminput_free(ptr, 0);
    }
    /**
     * Create an input by linking a note (UTXO) to a spend
     * @param {WasmNote} note
     * @param {WasmSpend} spend
     */
    constructor(note, spend) {
        _assertClass(note, WasmNote);
        var ptr0 = note.__destroy_into_raw();
        _assertClass(spend, WasmSpend);
        var ptr1 = spend.__destroy_into_raw();
        const ret = wasm.wasminput_new(ptr0, ptr1);
        this.__wbg_ptr = ret >>> 0;
        WasmInputFinalization.register(this, this.__wbg_ptr, this);
        return this;
    }
    /**
     * Get the input's value (amount from the note)
     * @returns {number}
     */
    get value() {
        const ret = wasm.wasminput_value(this.__wbg_ptr);
        return ret >>> 0;
    }
    /**
     * Get the fee from the spend
     * @returns {number}
     */
    get fee() {
        const ret = wasm.wasminput_fee(this.__wbg_ptr);
        return ret >>> 0;
    }
}
if (Symbol.dispose) WasmInput.prototype[Symbol.dispose] = WasmInput.prototype.free;

const WasmNoteFinalization = (typeof FinalizationRegistry === 'undefined')
    ? { register: () => {}, unregister: () => {} }
    : new FinalizationRegistry(ptr => wasm.__wbg_wasmnote_free(ptr >>> 0, 1));
/**
 * WASM-compatible Note wrapper (represents a UTXO)
 */
export class WasmNote {

    __destroy_into_raw() {
        const ptr = this.__wbg_ptr;
        this.__wbg_ptr = 0;
        WasmNoteFinalization.unregister(this);
        return ptr;
    }

    free() {
        const ptr = this.__destroy_into_raw();
        wasm.__wbg_wasmnote_free(ptr, 0);
    }
    /**
     * Create a note from its constituent parts
     *
     * This is typically constructed from data received via RPC query.
     *
     * Arguments:
     * - version: 0, 1, or 2
     * - origin_page: block height where note was created (u64)
     * - timelock_min: minimum timelock block height (or null for none)
     * - timelock_max: maximum timelock block height (or null for none)
     * - name_first: 40 bytes (first digest of name)
     * - name_last: 40 bytes (last digest of name)
     * - lock_pubkeys: JavaScript Array of Uint8Arrays (each 97 bytes)
     * - lock_keys_required: how many signatures needed (for multisig)
     * - source_hash: 40 bytes (hash of source transaction)
     * - source_is_coinbase: boolean
     * - assets: amount in nicks
     * @param {number} version
     * @param {bigint} origin_page
     * @param {bigint | null | undefined} timelock_min
     * @param {bigint | null | undefined} timelock_max
     * @param {Uint8Array} name_first
     * @param {Uint8Array} name_last
     * @param {any[]} lock_pubkeys
     * @param {bigint} lock_keys_required
     * @param {Uint8Array} source_hash
     * @param {boolean} source_is_coinbase
     * @param {number} assets
     */
    constructor(version, origin_page, timelock_min, timelock_max, name_first, name_last, lock_pubkeys, lock_keys_required, source_hash, source_is_coinbase, assets) {
        const ptr0 = passArray8ToWasm0(name_first, wasm.__wbindgen_malloc);
        const len0 = WASM_VECTOR_LEN;
        const ptr1 = passArray8ToWasm0(name_last, wasm.__wbindgen_malloc);
        const len1 = WASM_VECTOR_LEN;
        const ptr2 = passArrayJsValueToWasm0(lock_pubkeys, wasm.__wbindgen_malloc);
        const len2 = WASM_VECTOR_LEN;
        const ptr3 = passArray8ToWasm0(source_hash, wasm.__wbindgen_malloc);
        const len3 = WASM_VECTOR_LEN;
        const ret = wasm.wasmnote_new(version, origin_page, !isLikeNone(timelock_min), isLikeNone(timelock_min) ? BigInt(0) : timelock_min, !isLikeNone(timelock_max), isLikeNone(timelock_max) ? BigInt(0) : timelock_max, ptr0, len0, ptr1, len1, ptr2, len2, lock_keys_required, ptr3, len3, source_is_coinbase, assets);
        if (ret[2]) {
            throw takeFromExternrefTable0(ret[1]);
        }
        this.__wbg_ptr = ret[0] >>> 0;
        WasmNoteFinalization.register(this, this.__wbg_ptr, this);
        return this;
    }
    /**
     * Get the note's amount
     * @returns {number}
     */
    get assets() {
        const ret = wasm.wasminput_value(this.__wbg_ptr);
        return ret >>> 0;
    }
    /**
     * Get the note's name (first part) as 40 bytes
     * @returns {Uint8Array}
     */
    getNameFirst() {
        const ret = wasm.wasmnote_getNameFirst(this.__wbg_ptr);
        var v1 = getArrayU8FromWasm0(ret[0], ret[1]).slice();
        wasm.__wbindgen_free(ret[0], ret[1] * 1, 1);
        return v1;
    }
    /**
     * Get the note's name (last part) as 40 bytes
     * @returns {Uint8Array}
     */
    getNameLast() {
        const ret = wasm.wasmnote_getNameLast(this.__wbg_ptr);
        var v1 = getArrayU8FromWasm0(ret[0], ret[1]).slice();
        wasm.__wbindgen_free(ret[0], ret[1] * 1, 1);
        return v1;
    }
}
if (Symbol.dispose) WasmNote.prototype[Symbol.dispose] = WasmNote.prototype.free;

const WasmRawTxFinalization = (typeof FinalizationRegistry === 'undefined')
    ? { register: () => {}, unregister: () => {} }
    : new FinalizationRegistry(ptr => wasm.__wbg_wasmrawtx_free(ptr >>> 0, 1));
/**
 * WASM-compatible RawTx wrapper (complete transaction)
 */
export class WasmRawTx {

    __destroy_into_raw() {
        const ptr = this.__wbg_ptr;
        this.__wbg_ptr = 0;
        WasmRawTxFinalization.unregister(this);
        return ptr;
    }

    free() {
        const ptr = this.__destroy_into_raw();
        wasm.__wbg_wasmrawtx_free(ptr, 0);
    }
    /**
     * Create a complete transaction from inputs
     *
     * This calculates the transaction ID and aggregates fees/timelocks
     * @param {WasmInput[]} inputs
     */
    constructor(inputs) {
        const ptr0 = passArrayJsValueToWasm0(inputs, wasm.__wbindgen_malloc);
        const len0 = WASM_VECTOR_LEN;
        const ret = wasm.wasmrawtx_new(ptr0, len0);
        if (ret[2]) {
            throw takeFromExternrefTable0(ret[1]);
        }
        this.__wbg_ptr = ret[0] >>> 0;
        WasmRawTxFinalization.register(this, this.__wbg_ptr, this);
        return this;
    }
    /**
     * Get the transaction ID (40 bytes)
     * @returns {Uint8Array}
     */
    getTxId() {
        const ret = wasm.wasmrawtx_getTxId(this.__wbg_ptr);
        var v1 = getArrayU8FromWasm0(ret[0], ret[1]).slice();
        wasm.__wbindgen_free(ret[0], ret[1] * 1, 1);
        return v1;
    }
    /**
     * Get total fees for this transaction
     * @returns {number}
     */
    getTotalFees() {
        const ret = wasm.wasmrawtx_getTotalFees(this.__wbg_ptr);
        return ret >>> 0;
    }
    /**
     * Get number of inputs
     * @returns {number}
     */
    getInputCount() {
        const ret = wasm.wasmrawtx_getInputCount(this.__wbg_ptr);
        return ret >>> 0;
    }
    /**
     * Serialize transaction to bytes for network broadcast
     *
     * Returns the transaction serialized in the network wire format
     * TODO: Implement proper network serialization format
     * @returns {Uint8Array}
     */
    serialize() {
        const ret = wasm.wasmrawtx_serialize(this.__wbg_ptr);
        if (ret[3]) {
            throw takeFromExternrefTable0(ret[2]);
        }
        var v1 = getArrayU8FromWasm0(ret[0], ret[1]).slice();
        wasm.__wbindgen_free(ret[0], ret[1] * 1, 1);
        return v1;
    }
}
if (Symbol.dispose) WasmRawTx.prototype[Symbol.dispose] = WasmRawTx.prototype.free;

const WasmSeedFinalization = (typeof FinalizationRegistry === 'undefined')
    ? { register: () => {}, unregister: () => {} }
    : new FinalizationRegistry(ptr => wasm.__wbg_wasmseed_free(ptr >>> 0, 1));
/**
 * WASM-compatible Seed wrapper
 */
export class WasmSeed {

    static __wrap(ptr) {
        ptr = ptr >>> 0;
        const obj = Object.create(WasmSeed.prototype);
        obj.__wbg_ptr = ptr;
        WasmSeedFinalization.register(obj, obj.__wbg_ptr, obj);
        return obj;
    }

    static __unwrap(jsValue) {
        if (!(jsValue instanceof WasmSeed)) {
            return 0;
        }
        return jsValue.__destroy_into_raw();
    }

    __destroy_into_raw() {
        const ptr = this.__wbg_ptr;
        this.__wbg_ptr = 0;
        WasmSeedFinalization.unregister(this);
        return ptr;
    }

    free() {
        const ptr = this.__destroy_into_raw();
        wasm.__wbg_wasmseed_free(ptr, 0);
    }
    /**
     * Create a simple seed (payment to a single pubkey)
     *
     * Arguments:
     * - recipient_pubkey: 97 bytes
     * - amount: amount in nicks (smallest unit)
     * - parent_hash: 40 bytes (5 belts × 8 bytes)
     * @param {Uint8Array} recipient_pubkey
     * @param {number} amount
     * @param {Uint8Array} parent_hash
     */
    constructor(recipient_pubkey, amount, parent_hash) {
        const ptr0 = passArray8ToWasm0(recipient_pubkey, wasm.__wbindgen_malloc);
        const len0 = WASM_VECTOR_LEN;
        const ptr1 = passArray8ToWasm0(parent_hash, wasm.__wbindgen_malloc);
        const len1 = WASM_VECTOR_LEN;
        const ret = wasm.wasmseed_new(ptr0, len0, amount, ptr1, len1);
        if (ret[2]) {
            throw takeFromExternrefTable0(ret[1]);
        }
        this.__wbg_ptr = ret[0] >>> 0;
        WasmSeedFinalization.register(this, this.__wbg_ptr, this);
        return this;
    }
    /**
     * Create a seed with timelock
     * @param {Uint8Array} recipient_pubkey
     * @param {number} amount
     * @param {Uint8Array} parent_hash
     * @param {bigint | null} [relative_min]
     * @param {bigint | null} [relative_max]
     * @returns {WasmSeed}
     */
    static newWithTimelock(recipient_pubkey, amount, parent_hash, relative_min, relative_max) {
        const ptr0 = passArray8ToWasm0(recipient_pubkey, wasm.__wbindgen_malloc);
        const len0 = WASM_VECTOR_LEN;
        const ptr1 = passArray8ToWasm0(parent_hash, wasm.__wbindgen_malloc);
        const len1 = WASM_VECTOR_LEN;
        const ret = wasm.wasmseed_newWithTimelock(ptr0, len0, amount, ptr1, len1, !isLikeNone(relative_min), isLikeNone(relative_min) ? BigInt(0) : relative_min, !isLikeNone(relative_max), isLikeNone(relative_max) ? BigInt(0) : relative_max);
        if (ret[2]) {
            throw takeFromExternrefTable0(ret[1]);
        }
        return WasmSeed.__wrap(ret[0]);
    }
    /**
     * Get the amount
     * @returns {number}
     */
    get amount() {
        const ret = wasm.wasmseed_amount(this.__wbg_ptr);
        return ret >>> 0;
    }
    /**
     * Get the hash of this seed (for debugging)
     * @returns {Uint8Array}
     */
    getHash() {
        const ret = wasm.wasmseed_getHash(this.__wbg_ptr);
        var v1 = getArrayU8FromWasm0(ret[0], ret[1]).slice();
        wasm.__wbindgen_free(ret[0], ret[1] * 1, 1);
        return v1;
    }
}
if (Symbol.dispose) WasmSeed.prototype[Symbol.dispose] = WasmSeed.prototype.free;

const WasmSpendFinalization = (typeof FinalizationRegistry === 'undefined')
    ? { register: () => {}, unregister: () => {} }
    : new FinalizationRegistry(ptr => wasm.__wbg_wasmspend_free(ptr >>> 0, 1));
/**
 * WASM-compatible Spend wrapper
 */
export class WasmSpend {

    __destroy_into_raw() {
        const ptr = this.__wbg_ptr;
        this.__wbg_ptr = 0;
        WasmSpendFinalization.unregister(this);
        return ptr;
    }

    free() {
        const ptr = this.__destroy_into_raw();
        wasm.__wbg_wasmspend_free(ptr, 0);
    }
    /**
     * Create a new spend (unsigned)
     *
     * Takes an array of WasmSeed objects and a fee amount
     * @param {WasmSeed[]} seeds
     * @param {number} fee
     */
    constructor(seeds, fee) {
        const ptr0 = passArrayJsValueToWasm0(seeds, wasm.__wbindgen_malloc);
        const len0 = WASM_VECTOR_LEN;
        const ret = wasm.wasmspend_new(ptr0, len0, fee);
        this.__wbg_ptr = ret >>> 0;
        WasmSpendFinalization.register(this, this.__wbg_ptr, this);
        return this;
    }
    /**
     * Get the signing digest for this spend
     *
     * Returns 40 bytes (5 belts) that should be signed with the private key
     * @returns {Uint8Array}
     */
    getSigningDigest() {
        const ret = wasm.wasmspend_getSigningDigest(this.__wbg_ptr);
        var v1 = getArrayU8FromWasm0(ret[0], ret[1]).slice();
        wasm.__wbindgen_free(ret[0], ret[1] * 1, 1);
        return v1;
    }
    /**
     * Add a signature to this spend
     *
     * Arguments:
     * - public_key: 97 bytes
     * - signature_json: JSON string with format {"chal": "...", "sig": "..."}
     * @param {Uint8Array} public_key
     * @param {string} signature_json
     */
    addSignature(public_key, signature_json) {
        const ptr0 = passArray8ToWasm0(public_key, wasm.__wbindgen_malloc);
        const len0 = WASM_VECTOR_LEN;
        const ptr1 = passStringToWasm0(signature_json, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
        const len1 = WASM_VECTOR_LEN;
        const ret = wasm.wasmspend_addSignature(this.__wbg_ptr, ptr0, len0, ptr1, len1);
        if (ret[1]) {
            throw takeFromExternrefTable0(ret[0]);
        }
    }
    /**
     * Sign this spend with a private key (convenience method)
     *
     * This is equivalent to calling getSigningDigest, signing externally,
     * and then calling addSignature.
     * @param {Uint8Array} private_key_bytes
     */
    sign(private_key_bytes) {
        const ptr0 = passArray8ToWasm0(private_key_bytes, wasm.__wbindgen_malloc);
        const len0 = WASM_VECTOR_LEN;
        const ret = wasm.wasmspend_sign(this.__wbg_ptr, ptr0, len0);
        if (ret[1]) {
            throw takeFromExternrefTable0(ret[0]);
        }
    }
    /**
     * Get number of signatures
     * @returns {number}
     */
    signatureCount() {
        const ret = wasm.wasmspend_signatureCount(this.__wbg_ptr);
        return ret >>> 0;
    }
    /**
     * Get the fee amount
     * @returns {number}
     */
    get fee() {
        const ret = wasm.wasmspend_fee(this.__wbg_ptr);
        return ret >>> 0;
    }
}
if (Symbol.dispose) WasmSpend.prototype[Symbol.dispose] = WasmSpend.prototype.free;

const EXPECTED_RESPONSE_TYPES = new Set(['basic', 'cors', 'default']);

async function __wbg_load(module, imports) {
    if (typeof Response === 'function' && module instanceof Response) {
        if (typeof WebAssembly.instantiateStreaming === 'function') {
            try {
                return await WebAssembly.instantiateStreaming(module, imports);

            } catch (e) {
                const validResponse = module.ok && EXPECTED_RESPONSE_TYPES.has(module.type);

                if (validResponse && module.headers.get('Content-Type') !== 'application/wasm') {
                    console.warn("`WebAssembly.instantiateStreaming` failed because your server does not serve Wasm with `application/wasm` MIME type. Falling back to `WebAssembly.instantiate` which is slower. Original error:\n", e);

                } else {
                    throw e;
                }
            }
        }

        const bytes = await module.arrayBuffer();
        return await WebAssembly.instantiate(bytes, imports);

    } else {
        const instance = await WebAssembly.instantiate(module, imports);

        if (instance instanceof WebAssembly.Instance) {
            return { instance, module };

        } else {
            return instance;
        }
    }
}

function __wbg_get_imports() {
    const imports = {};
    imports.wbg = {};
    imports.wbg.__wbg_length_6bb7e81f9d7713e4 = function(arg0) {
        const ret = arg0.length;
        return ret;
    };
    imports.wbg.__wbg_prototypesetcall_3d4a26c1ed734349 = function(arg0, arg1, arg2) {
        Uint8Array.prototype.set.call(getArrayU8FromWasm0(arg0, arg1), arg2);
    };
    imports.wbg.__wbg_wasminput_unwrap = function(arg0) {
        const ret = WasmInput.__unwrap(arg0);
        return ret;
    };
    imports.wbg.__wbg_wasmseed_unwrap = function(arg0) {
        const ret = WasmSeed.__unwrap(arg0);
        return ret;
    };
    imports.wbg.__wbg_wbindgenthrow_451ec1a8469d7eb6 = function(arg0, arg1) {
        throw new Error(getStringFromWasm0(arg0, arg1));
    };
    imports.wbg.__wbindgen_cast_2241b6af4c4b2941 = function(arg0, arg1) {
        // Cast intrinsic for `Ref(String) -> Externref`.
        const ret = getStringFromWasm0(arg0, arg1);
        return ret;
    };
    imports.wbg.__wbindgen_init_externref_table = function() {
        const table = wasm.__wbindgen_export_0;
        const offset = table.grow(4);
        table.set(0, undefined);
        table.set(offset + 0, undefined);
        table.set(offset + 1, null);
        table.set(offset + 2, true);
        table.set(offset + 3, false);
        ;
    };

    return imports;
}

function __wbg_init_memory(imports, memory) {

}

function __wbg_finalize_init(instance, module) {
    wasm = instance.exports;
    __wbg_init.__wbindgen_wasm_module = module;
    cachedDataViewMemory0 = null;
    cachedUint8ArrayMemory0 = null;


    wasm.__wbindgen_start();
    return wasm;
}

function initSync(module) {
    if (wasm !== undefined) return wasm;


    if (typeof module !== 'undefined') {
        if (Object.getPrototypeOf(module) === Object.prototype) {
            ({module} = module)
        } else {
            console.warn('using deprecated parameters for `initSync()`; pass a single object instead')
        }
    }

    const imports = __wbg_get_imports();

    __wbg_init_memory(imports);

    if (!(module instanceof WebAssembly.Module)) {
        module = new WebAssembly.Module(module);
    }

    const instance = new WebAssembly.Instance(module, imports);

    return __wbg_finalize_init(instance, module);
}

async function __wbg_init(module_or_path) {
    if (wasm !== undefined) return wasm;


    if (typeof module_or_path !== 'undefined') {
        if (Object.getPrototypeOf(module_or_path) === Object.prototype) {
            ({module_or_path} = module_or_path)
        } else {
            console.warn('using deprecated parameters for the initialization function; pass a single object instead')
        }
    }

    if (typeof module_or_path === 'undefined') {
        module_or_path = new URL('nbx_nockchain_types_bg.wasm', import.meta.url);
    }
    const imports = __wbg_get_imports();

    if (typeof module_or_path === 'string' || (typeof Request === 'function' && module_or_path instanceof Request) || (typeof URL === 'function' && module_or_path instanceof URL)) {
        module_or_path = fetch(module_or_path);
    }

    __wbg_init_memory(imports);

    const { instance, module } = await __wbg_load(await module_or_path, imports);

    return __wbg_finalize_init(instance, module);
}

export { initSync };
export default __wbg_init;
