// Polyfill for node:assert in web environment
function assert(value, message) {
  if (!value) {
    throw new Error(message || 'Assertion failed');
  }
}

assert.equal = function(actual, expected, message) {
  if (actual !== expected) {
    throw new Error(message || `Expected ${expected}, got ${actual}`);
  }
};

assert.strictEqual = assert.equal;

assert.ok = assert;

module.exports = assert;
