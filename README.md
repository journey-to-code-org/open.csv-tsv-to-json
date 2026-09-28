# open.csv-tsv-to-json

A small, dependency-free CSV/TSV parser for converting delimited text into
arrays of JSON-style objects.

## Install

```bash
npm install @journey-to-code/csv-tsv-to-json
```

## Basic CSV

```js
import { csvToJson } from "@journey-to-code/csv-tsv-to-json";

const rows = csvToJson(`name,age
Alice,30
Bob,25`);

console.log(rows);
```

```js
[
  { name: "Alice", age: "30" },
  { name: "Bob", age: "25" }
]
```

Values remain strings. The parser does not guess numbers, booleans, dates, or
other application-specific types.

## TSV

```js
const rows = csvToJson(
  "name\tage\nAlice\t30\nBob\t25",
  { format: "tsv" }
);
```

`format` matching is case-insensitive. Unknown strings fall back to CSV.

## Quoted fields

Quoted fields may contain delimiters, quotes, and line breaks:

```js
csvToJson(`name,notes
"Doe, John","Line 1
Line 2"
Alice,"He said ""Hello"""`);
```

produces:

```js
[
  {
    name: "Doe, John",
    notes: "Line 1\nLine 2"
  },
  {
    name: "Alice",
    notes: 'He said "Hello"'
  }
]
```

## Custom headers

Pass `headers` to parse input that has no header row:

```js
csvToJson(
  `Alice,30
Bob,25`,
  {
    headers: ["name", "age"]
  }
);
```

```js
[
  { name: "Alice", age: "30" },
  { name: "Bob", age: "25" }
]
```

When custom headers are supplied, every parsed record is treated as data.

## Column validation

By default, every data row must contain the same number of columns as the
header list.

```js
csvToJson(`name,age
Alice`);
```

throws a `RangeError`.

For tolerant parsing:

```js
csvToJson(
  `name,age
Alice
Bob,25,extra`,
  { strictColumns: false }
);
```

Missing cells become empty strings and extra cells are ignored.

## Empty lines

Blank records between rows and trailing blank lines are ignored.

## UTF-8 BOM

A leading UTF-8 BOM (`\uFEFF`) is removed automatically.

## API

### `csvToJson(input, options?)`

#### `input`

Delimited text as a string. An empty or whitespace-only string returns `[]`.

#### `options.format`

- `"csv"` (default)
- `"tsv"`

#### `options.headers`

Optional array of header names. When omitted, the first record supplies the
headers.

Headers must be non-empty strings and must be unique.

#### `options.strictColumns`

Boolean, default `true`.

When `true`, rows with a different column count throw a `RangeError`.
When `false`, short rows are padded with empty strings and extra cells are
ignored.

## Parsing rules

v1.0.0 intentionally supports the core behavior needed for ordinary CSV/TSV:

- quoted fields,
- doubled quote escaping (`""`),
- delimiters inside quotes,
- CR, LF, and CRLF line endings,
- multiline quoted fields,
- blank-line skipping,
- UTF-8 BOM removal.

Malformed quoted fields throw `SyntaxError` rather than silently returning
ambiguous data.

## Scope

This package deliberately does not:

- read files,
- fetch URLs,
- infer value types,
- stream very large datasets,
- auto-detect delimiters,
- flatten or expand nested structures,
- convert JSON back to CSV/TSV.

For the reverse conversion, use
`@journey-to-code/json-to-csv-tsv`.

## Runtime

- Node.js 18+
- modern browsers / ESM-capable tooling
- zero runtime dependencies

## Development

```bash
npm test
```

## License

MIT
