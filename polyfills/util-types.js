// Polyfill for node:util/types in web environment
module.exports = {
  isUint8Array: function(value) {
    return value instanceof Uint8Array;
  },
  isArrayBuffer: function(value) {
    return value instanceof ArrayBuffer;
  },
  isDate: function(value) {
    return value instanceof Date;
  },
  isRegExp: function(value) {
    return value instanceof RegExp;
  },
  isTypedArray: function(value) {
    return ArrayBuffer.isView(value) && !(value instanceof DataView);
  }
};
