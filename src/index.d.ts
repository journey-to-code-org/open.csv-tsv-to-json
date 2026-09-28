export interface CsvToJsonOptions {
  /**
   * Input format. "csv" is the default. "tsv" uses tab delimiters.
   * Matching is case-insensitive. Unknown strings fall back to CSV.
   */
  format?: "csv" | "tsv" | string;

  /**
   * Explicit header list. When provided, every parsed record is treated as
   * data. Otherwise the first parsed record supplies the headers.
   */
  headers?: string[];

  /**
   * Require every data record to have exactly the same number of cells as
   * the header list. Defaults to true.
   */
  strictColumns?: boolean;
}

export type JsonRow = Record<string, string>;

export function csvToJson(
  input: string,
  options?: CsvToJsonOptions
): JsonRow[];
