const DIGIT = /[0-9]/;

/**
 * Why a state machine instead of a regex split?
 *
 * A regex like /(\d+)|(\D+)/g looks tempting, but it cannot express the
 * "leading zeros break ties" rule without a second pass that re-parses the
 * original string. A single left-to-right scan lets us capture the numeric
 * value and the raw digit text at the same time, which is what the tie-break
 * needs. It also keeps the comparison allocation-light: we only build a
 * string when a chunk actually contains a run of digits.
 */
export function naturalCompare(a, b) {
  if (typeof a !== 'string' || typeof b !== 'string') {
    throw new TypeError('naturalCompare expects two strings');
  }

  let i = 0;
  let j = 0;
  const lenA = a.length;
  const lenB = b.length;

  while (i < lenA && j < lenB) {
    const charA = a[i];
    const charB = b[j];
    const digitA = DIGIT.test(charA);
    const digitB = DIGIT.test(charB);

    if (digitA && digitB) {
      let startA = i;
      let startB = j;

      while (i < lenA && DIGIT.test(a[i])) i++;
      while (j < lenB && DIGIT.test(b[j])) j++;

      const numA = a.slice(startA, i);
      const numB = b.slice(startB, j);

      const trimmedA = stripLeadingZeros(numA);
      const trimmedB = stripLeadingZeros(numB);

      // Longer digit string (after trimming zeros) means a larger number.
      if (trimmedA.length !== trimmedB.length) {
        return trimmedA.length - trimmedB.length;
      }

      // Same magnitude: lexicographic comparison of the significant digits.
      if (trimmedA !== trimmedB) {
        return trimmedA < trimmedB ? -1 : 1;
      }

      // Numeric values are equal; fall back to the raw text so that
      // "file01" sorts before "file1" (shorter run of zeros first).
      if (numA.length !== numB.length) {
        return numB.length - numA.length;
      }
    } else {
      // One side is a digit, the other is not. Digits sort before letters.
      if (digitA !== digitB) {
        return digitA ? -1 : 1;
      }

      // Plain character comparison (case-sensitive).
      if (charA !== charB) {
        return charA < charB ? -1 : 1;
      }

      i++;
      j++;
    }
  }

  // One string is a prefix of the other; the shorter one comes first.
  return lenA - lenB;
}

function stripLeadingZeros(str) {
  let start = 0;
  while (start < str.length - 1 && str[start] === '0') {
    start++;
  }
  return str.slice(start);
}
