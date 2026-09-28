import test from "node:test";
import assert from "node:assert/strict";

import { csvToJson } from "../src/index.js";

test("parses basic CSV using first row as headers", () => {
  assert.deepEqual(
    csvToJson("name,age\nAlice,30\nBob,25"),
    [
      { name: "Alice", age: "30" },
      { name: "Bob", age: "25" }
    ]
  );
});

test("parses TSV case-insensitively", () => {
  assert.deepEqual(
    csvToJson("name\tage\nAlice\t30", { format: "TSV" }),
    [{ name: "Alice", age: "30" }]
  );
});

test("unknown format falls back to CSV", () => {
  assert.deepEqual(
    csvToJson("a,b\n1,2", { format: "unknown" }),
    [{ a: "1", b: "2" }]
  );
});

test("parses quoted delimiters", () => {
  assert.deepEqual(
    csvToJson('name,city\n"Doe, John","New York, NY"'),
    [{ name: "Doe, John", city: "New York, NY" }]
  );
});

test("parses escaped double quotes", () => {
  assert.deepEqual(
    csvToJson('name,quote\nAlice,"He said ""Hello"""'),
    [{ name: "Alice", quote: 'He said "Hello"' }]
  );
});

test("parses multiline quoted fields", () => {
  assert.deepEqual(
    csvToJson('name,notes\nAlice,"Line 1\nLine 2"'),
    [{ name: "Alice", notes: "Line 1\nLine 2" }]
  );
});

test("preserves carriage returns inside quoted fields", () => {
  assert.deepEqual(
    csvToJson('name,notes\r\nAlice,"Line 1\rLine 2"'),
    [{ name: "Alice", notes: "Line 1\rLine 2" }]
  );
});

test("supports CRLF record endings", () => {
  assert.deepEqual(
    csvToJson("name,age\r\nAlice,30\r\nBob,25\r\n"),
    [
      { name: "Alice", age: "30" },
      { name: "Bob", age: "25" }
    ]
  );
});

test("supports CR-only record endings", () => {
  assert.deepEqual(
    csvToJson("name,age\rAlice,30\rBob,25"),
    [
      { name: "Alice", age: "30" },
      { name: "Bob", age: "25" }
    ]
  );
});

test("skips blank records", () => {
  assert.deepEqual(
    csvToJson("name,age\n\nAlice,30\n\nBob,25\n"),
    [
      { name: "Alice", age: "30" },
      { name: "Bob", age: "25" }
    ]
  );
});

test("uses custom headers without consuming first row", () => {
  assert.deepEqual(
    csvToJson("Alice,30\nBob,25", {
      headers: ["name", "age"]
    }),
    [
      { name: "Alice", age: "30" },
      { name: "Bob", age: "25" }
    ]
  );
});

test("strictColumns is true by default", () => {
  assert.throws(
    () => csvToJson("name,age\nAlice"),
    RangeError
  );
});

test("strictColumns rejects extra columns", () => {
  assert.throws(
    () => csvToJson("name,age\nAlice,30,extra"),
    RangeError
  );
});

test("non-strict mode pads missing cells", () => {
  assert.deepEqual(
    csvToJson("name,age\nAlice", { strictColumns: false }),
    [{ name: "Alice", age: "" }]
  );
});

test("non-strict mode ignores extra cells", () => {
  assert.deepEqual(
    csvToJson("name,age\nAlice,30,extra", {
      strictColumns: false
    }),
    [{ name: "Alice", age: "30" }]
  );
});

test("removes a leading UTF-8 BOM", () => {
  assert.deepEqual(
    csvToJson("\uFEFFname,age\nAlice,30"),
    [{ name: "Alice", age: "30" }]
  );
});

test("returns empty array for empty and whitespace-only input", () => {
  assert.deepEqual(csvToJson(""), []);
  assert.deepEqual(csvToJson("   \n\t"), []);
});

test("preserves empty quoted field as a data value", () => {
  assert.deepEqual(
    csvToJson('name,notes\nAlice,""'),
    [{ name: "Alice", notes: "" }]
  );
});

test("rejects duplicate inferred headers", () => {
  assert.throws(
    () => csvToJson("name,name\nAlice,Bob"),
    RangeError
  );
});

test("rejects duplicate custom headers", () => {
  assert.throws(
    () =>
      csvToJson("Alice,Bob", {
        headers: ["name", "name"]
      }),
    RangeError
  );
});

test("rejects empty headers", () => {
  assert.throws(
    () => csvToJson(",age\nAlice,30"),
    RangeError
  );
});

test("rejects non-string input", () => {
  assert.throws(() => csvToJson(null), TypeError);
  assert.throws(() => csvToJson(42), TypeError);
});

test("rejects invalid options", () => {
  assert.throws(() => csvToJson("a\n1", null), TypeError);
  assert.throws(() => csvToJson("a\n1", []), TypeError);
});

test("rejects invalid custom headers", () => {
  assert.throws(
    () => csvToJson("1", { headers: "a" }),
    TypeError
  );

  assert.throws(
    () => csvToJson("1", { headers: [1] }),
    TypeError
  );
});

test("rejects non-string format", () => {
  assert.throws(
    () => csvToJson("a\n1", { format: 42 }),
    TypeError
  );
});

test("rejects non-boolean strictColumns", () => {
  assert.throws(
    () => csvToJson("a\n1", { strictColumns: "yes" }),
    TypeError
  );
});

test("rejects unterminated quoted fields", () => {
  assert.throws(
    () => csvToJson('name,notes\nAlice,"unterminated'),
    SyntaxError
  );
});

test("rejects quotes appearing mid-way through unquoted fields", () => {
  assert.throws(
    () => csvToJson('name\nAl"ice'),
    SyntaxError
  );
});

test("parses tabs inside quoted TSV fields", () => {
  assert.deepEqual(
    csvToJson('name\tnotes\nAlice\t"one\ttwo"', {
      format: "tsv"
    }),
    [{ name: "Alice", notes: "one\ttwo" }]
  );
});
