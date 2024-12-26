// server/utils/bigIntReplacer.js

function bigIntReplacer(key, value) {
  if (typeof value === 'bigint') {
    return value.toString();
  } else if (value instanceof Date) {
    return value.toISOString(); // Convert Date objects to ISO strings
  } else if (Array.isArray(value)) {
    return value.map((item) => bigIntReplacer(key, item));
  } else if (typeof value === 'object' && value !== null) {
    const replacedObject = {};
    for (const k in value) {
      replacedObject[k] = bigIntReplacer(k, value[k]);
    }
    return replacedObject;
  }
  return value;
}

module.exports = bigIntReplacer;
