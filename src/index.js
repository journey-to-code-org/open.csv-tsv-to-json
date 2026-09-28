/**
 * Parse CSV or TSV text into an array of JSON-style objects.
 *
 * @param {string} input
 * @param {{
 *   format?: 'csv' | 'tsv' | string,
 *   headers?: string[],
 *   strictColumns?: boolean
 * }} [options]
 * @returns {Array<Record<string, string>>}
 */
export function csvToJson(input, options = {}) {
  if (typeof input !== "string") {
    throw new TypeError("Expected input to be a string");
  }

  if (options === null || typeof options !== "object" || Array.isArray(options)) {
    throw new TypeError("Expected options to be an object");
  }

  const {
    format = "csv",
    headers: customHeaders,
    strictColumns = true
  } = options;

  if (typeof format !== "string") {
    throw new TypeError("Expected format to be a string");
  }

  if (typeof strictColumns !== "boolean") {
    throw new TypeError("Expected strictColumns to be a boolean");
  }

  validateHeaders(customHeaders);

  const source = stripBom(input);

  if (source.trim() === "") {
    return [];
  }

  const delimiter = format.toLowerCase() === "tsv" ? "\t" : ",";
  const records = parseDelimited(source, delimiter);

  if (records.length === 0) {
    return [];
  }

  const headers = customHeaders ? [...customHeaders] : records.shift();

  validateResolvedHeaders(headers);

  if (headers.length === 0) {
    return [];
  }

  return records.map((record, index) =>
    mapRecordToObject(record, headers, {
      strictColumns,
      recordNumber: customHeaders ? index + 1 : index + 2
    })
  );
}

function stripBom(value) {
  return value.charCodeAt(0) === 0xfeff ? value.slice(1) : value;
}

function validateHeaders(headers) {
  if (headers === undefined) {
    return;
  }

  if (!Array.isArray(headers)) {
    throw new TypeError("Expected headers to be an array of strings");
  }

  validateResolvedHeaders(headers);
}

function validateResolvedHeaders(headers) {
  headers.forEach((header, index) => {
    if (typeof header !== "string") {
      throw new TypeError(`Expected header at index ${index} to be a string`);
    }

    if (header.length === 0) {
      throw new RangeError(`Expected header at index ${index} to be non-empty`);
    }
  });

  const duplicates = findDuplicates(headers);

  if (duplicates.length > 0) {
    throw new RangeError(
      `Duplicate header${duplicates.length === 1 ? "" : "s"}: ${duplicates.join(", ")}`
    );
  }
}

function findDuplicates(values) {
  const seen = new Set();
  const duplicates = new Set();

  for (const value of values) {
    if (seen.has(value)) {
      duplicates.add(value);
    } else {
      seen.add(value);
    }
  }

  return [...duplicates];
}

function mapRecordToObject(record, headers, { strictColumns, recordNumber }) {
  if (strictColumns && record.length !== headers.length) {
    throw new RangeError(
      `Record ${recordNumber} has ${record.length} column(s); expected ${headers.length}`
    );
  }

  const result = {};

  headers.forEach((header, index) => {
    result[header] = record[index] ?? "";
  });

  return result;
}

function parseDelimited(input, delimiter) {
  const records = [];
  let record = [];
  let field = "";
  let inQuotes = false;
  let fieldStarted = false;
  let recordHasContent = false;

  const pushField = () => {
    record.push(field);
    field = "";
    fieldStarted = false;
  };

  const pushRecord = () => {
    pushField();

    if (recordHasContent || record.length > 1 || record[0] !== "") {
      records.push(record);
    }

    record = [];
    recordHasContent = false;
  };

  for (let index = 0; index < input.length; index += 1) {
    const char = input[index];

    if (inQuotes) {
      if (char === '"') {
        if (input[index + 1] === '"') {
          field += '"';
          index += 1;
        } else {
          inQuotes = false;
        }
      } else {
        field += char;
      }

      continue;
    }

    if (char === '"' && !fieldStarted) {
      inQuotes = true;
      fieldStarted = true;
      recordHasContent = true;
      continue;
    }

    if (char === '"' && fieldStarted) {
      throw new SyntaxError(
        `Unexpected quote in unquoted field at character ${index}`
      );
    }

    if (char === delimiter) {
      pushField();
      recordHasContent = true;
      continue;
    }

    if (char === "\r" || char === "\n") {
      if (char === "\r" && input[index + 1] === "\n") {
        index += 1;
      }

      pushRecord();
      continue;
    }

    field += char;
    fieldStarted = true;
    recordHasContent = true;
  }

  if (inQuotes) {
    throw new SyntaxError("Unterminated quoted field");
  }

  if (recordHasContent || record.length > 0 || field.length > 0) {
    pushRecord();
  }

  return records;
}
