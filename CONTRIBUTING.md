# Contributing

`open.csv-tsv-to-json` is intentionally small.

## Development

```bash
npm test
```

## Pull requests

Changes should:

- preserve the public `csvToJson()` contract,
- include tests for every parser behavior change,
- keep CSV and TSV behavior aligned,
- preserve zero runtime dependencies,
- avoid guessing application-specific value types,
- document any change to malformed-input behavior.

## Design boundary

This library parses complete in-memory CSV/TSV strings into object rows.
File I/O, streaming, delimiter auto-detection, schema validation, and type
coercion belong in higher-level tools.
