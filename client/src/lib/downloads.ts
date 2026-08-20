import { jsPDF } from "jspdf";

export function getPdfFilename(title: string) {
  return `${title.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "") || "createflow-result"}.pdf`;
}

export function createTextPdf(title: string, content: string) {
  const document = new jsPDF({ unit: "pt", format: "a4" });
  const margin = 48;
  const pageWidth = document.internal.pageSize.getWidth();
  const pageHeight = document.internal.pageSize.getHeight();
  const lineHeight = 16;
  const lines = document.splitTextToSize(`${title}\n\n${content}`, pageWidth - margin * 2);
  let y = margin;

  document.setFont("helvetica", "bold");
  document.setFontSize(16);
  document.text(title, margin, y);
  y += 28;
  document.setFont("helvetica", "normal");
  document.setFontSize(11);

  for (const line of document.splitTextToSize(content, pageWidth - margin * 2)) {
    if (y > pageHeight - margin) {
      document.addPage();
      y = margin;
    }
    document.text(line, margin, y);
    y += lineHeight;
  }

  if (lines.length === 0) document.text("", margin, y);
  return document.output("blob");
}

export function downloadBlob(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = filename;
  document.body.appendChild(anchor);
  anchor.click();
  anchor.remove();
  window.setTimeout(() => URL.revokeObjectURL(url), 1000);
}

export function downloadTextPdf(title: string, content: string) {
  downloadBlob(createTextPdf(title, content), getPdfFilename(title));
}

export async function downloadImage(url: string, filename = "createflow-image.png") {
  try {
    const response = await fetch(url);
    if (!response.ok) throw new Error("Image download failed");
    downloadBlob(await response.blob(), filename);
  } catch {
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = filename;
    anchor.target = "_blank";
    document.body.appendChild(anchor);
    anchor.click();
    anchor.remove();
  }
}
