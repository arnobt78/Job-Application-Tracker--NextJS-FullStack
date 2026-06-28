/**
 * Server-side PDF text extraction.
 *
 * Runs in Node.js (server action context) — no browser worker needed.
 * Dynamically imports pdfjs-dist legacy build at runtime to avoid
 * bundler issues with the worker shim.
 *
 * Returns joined plain text from all pages, or throws on parse failure.
 */

export async function extractPdfText(buffer: ArrayBuffer): Promise<string> {
  const pdfjsLib = await import('pdfjs-dist/legacy/build/pdf.mjs');

  // Disable the web worker — we run in Node.js on the server
  pdfjsLib.GlobalWorkerOptions.workerSrc = '';

  const pdf = await pdfjsLib.getDocument({
    data: new Uint8Array(buffer),
    disableStream: true,
    disableAutoFetch: true,
  }).promise;

  const pages: string[] = [];

  for (let i = 1; i <= pdf.numPages; i++) {
    const page = await pdf.getPage(i);
    const content = await page.getTextContent();
    const pageText = content.items
      .map((item) => ('str' in item ? (item.str as string) : ''))
      .join(' ')
      .replace(/\s+/g, ' ')
      .trim();
    if (pageText) pages.push(pageText);
  }

  return pages.join('\n\n');
}
