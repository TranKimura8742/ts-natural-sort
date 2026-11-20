# ts-natural-sort

Orders strings the way a person would: `file2` comes before `file10` instead of after it. The library exports one function, `naturalCompare`, which returns a negative number, zero, or a positive number, matching the contract of `Array.prototype.sort`'s comparator.

```js
import { naturalCompare } from './src/index.js';

const files = ['file10', 'file2', 'file1'];
files.sort(naturalCompare);
// => ['file1', 'file2', 'file10']
```

## Why this exists

Lexicographic string comparison puts `file10` before `file2` because `'1' < '2'`. The usual fix is to split on digit runs, parse each run as an integer, and compare the numbers. That works until the numbers are larger than `Number.MAX_SAFE_INTEGER`, at which point `parseInt` silently loses precision and the order becomes wrong.

This implementation never converts a digit run to a JavaScript number. It compares the significant digits (after stripping leading zeros) by length and then lexicographically. That is exact for any length of digit string, at the cost of a few extra character comparisons. The trade-off is deliberate: correctness on arbitrarily large identifiers such as timestamps or hashes matters more than the small constant-factor win from integer parsing.

## Edge cases

Leading zeros are treated as a tie-break, not as significant value. `file01` sorts before `file1`, and `file001` before `file01`. Numeric chunks that differ only in the number of leading zeros are considered equal in magnitude, so the shorter raw digit run wins. If you need `file01` and `file1` to compare equal, this is not the library for you; the choice here is to keep them distinct and stable in a predictable order.

Comparison is case-sensitive and uses the raw character codes, so `'A'` sorts before `'a'`. A digit always sorts before a non-digit, which means `a1` precedes `aA`. These are the same rules a plain `<` comparison would apply once the numeric chunks are resolved.

## API

### `naturalCompare(a, b)`

- `a`, `b`: strings to compare.
- Returns a negative number if `a` should sort before `b`, zero if they are equivalent under these rules, and a positive number otherwise.
- Throws a `TypeError` if either argument is not a string. Coercing numbers or `null` would hide bugs at the call site, so the function refuses them outright.
