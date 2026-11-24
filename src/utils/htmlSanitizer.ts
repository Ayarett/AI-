export function extractHtmlDocument(raw: string): string {
  let cleaned = raw.trim();

  // Strip leading markdown code fence if present
  cleaned = cleaned.replace(/^```(?:html|HTML)?\s*\n?/, '');
  // Strip trailing markdown code fence if present
  cleaned = cleaned.replace(/\n?```\s*$/, '');

  const doctypeIdx = cleaned.search(/<!doctype\s+html/i);
  const htmlIdx = cleaned.search(/<html[\s>]/i);

  if (doctypeIdx !== -1) {
    cleaned = cleaned.slice(doctypeIdx);
  } else if (htmlIdx !== -1) {
    cleaned = cleaned.slice(htmlIdx);
  }

  const endHtmlIdx = cleaned.lastIndexOf('</html>');
  if (endHtmlIdx !== -1) {
    cleaned = cleaned.slice(0, endHtmlIdx + '</html>'.length);
  }

  return cleaned.trim();
}

export function isCompleteHtmlDocument(html: string): boolean {
  const lower = html.toLowerCase();
  return lower.includes('<html') && lower.includes('</html>');
}

export function slugifyFilename(title: string): string {
  const ascii = title
    .toLowerCase()
    .replace(/[^a-z0-9а-яё]+/gi, '-')
    .replace(/^-+|-+$/g, '');
  return ascii ? `${ascii}.html` : 'website.html';
}

export function downloadHtmlFile(filename: string, html: string): void {
  const blob = new Blob([html], { type: 'text/html;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

export function formatTime(isoString: string): string {
  try {
    const date = new Date(isoString);
    return date.toLocaleTimeString('ru-RU', {
      hour: '2-digit',
      minute: '2-digit',
    });
  } catch {
    return '';
  }
}

export function countLines(text: string): number {
  if (!text) return 0;
  return text.split('\n').length;
}
