/**
 * Client-side CSV download built from the currently filtered rows.
 * Includes a UTF-8 BOM so Excel opens accented text correctly.
 */
export function downloadCsv(
  filename: string,
  headers: string[],
  rows: (string | number | null | undefined)[][]
): void {
  const escapeCell = (value: string | number | null | undefined): string => {
    const text = value === null || value === undefined ? "" : String(value);
    if (/[",\n\r;]/.test(text)) {
      return `"${text.replace(/"/g, '""')}"`;
    }
    return text;
  };

  const lines = [headers, ...rows].map((row) => row.map(escapeCell).join(","));
  const blob = new Blob([`\uFEFF${lines.join("\r\n")}`], {
    type: "text/csv;charset=utf-8;",
  });

  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = `${filename}.csv`;
  document.body.appendChild(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
}
