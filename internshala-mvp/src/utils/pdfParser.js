import * as pdfjsLib from 'pdfjs-dist';

const workerSrc = new URL('pdfjs-dist/build/pdf.worker.min.mjs', import.meta.url).href;
pdfjsLib.GlobalWorkerOptions.workerSrc = workerSrc;

export async function extractTextFromPdf(base64Data) {
  try {
    const data = base64Data.replace(/^data:application\/pdf;base64,/, '');
    const bytes = atob(data);
    const length = bytes.length;
    const buffer = new ArrayBuffer(length);
    const view = new Uint8Array(buffer);
    for (let i = 0; i < length; i++) {
      view[i] = bytes.charCodeAt(i);
    }

    const pdf = await pdfjsLib.getDocument({ data: buffer }).promise;
    let fullText = '';

    for (let i = 1; i <= pdf.numPages; i++) {
      const page = await pdf.getPage(i);
      const content = await page.getTextContent();
      const pageText = content.items.map(item => item.str).join(' ');
      fullText += pageText + '\n';
    }

    return fullText.trim();
  } catch (err) {
    console.error('PDF parse error:', err);
    return '';
  }
}
