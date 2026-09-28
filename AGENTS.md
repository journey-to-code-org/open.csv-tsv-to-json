# AI agent guidance

AI-assisted contributions are welcome, but contributors remain responsible for
correctness and understanding parser behavior.

Before editing:

1. Read `README.md` and all parser tests.
2. Restate the exact grammar/edge case being changed.
3. Preserve backward compatibility unless the task explicitly requires a
   breaking change.

During implementation:

- Keep zero runtime dependencies.
- Keep CSV and TSV behavior aligned.
- Do not introduce file I/O, streaming, type coercion, or delimiter detection.
- Treat quote handling and line ending behavior as compatibility-sensitive.
- Add tests for malformed as well as valid input.
- Avoid unrelated rewrites.

Completion reports should include changed behavior, tests run, and compatibility
implications.
