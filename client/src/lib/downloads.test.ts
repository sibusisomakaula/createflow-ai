import { beforeEach, describe, expect, it, vi } from "vitest";
import { createTextPdf, downloadImage, getPdfFilename } from "./downloads";

function installAnchorDom() {
  const clicked: Array<{ href: string; download: string; target?: string }> = [];
  const createElement = vi.fn(() => {
    const anchor = {
      href: "",
      download: "",
      target: "",
      click: vi.fn(() => clicked.push({ href: anchor.href, download: anchor.download, target: anchor.target })),
      remove: vi.fn(),
    };
    return anchor;
  });
  vi.stubGlobal("document", { createElement, body: { appendChild: vi.fn() } });
  vi.stubGlobal("URL", { createObjectURL: vi.fn(() => "blob:download"), revokeObjectURL: vi.fn() });
  vi.stubGlobal("window", { setTimeout: (callback: () => void) => callback() });
  return { clicked };
}

describe("downloads", () => {
  beforeEach(() => vi.restoreAllMocks());

  it("creates a PDF blob and safe filename for generated content", async () => {
    const blob = createTextPdf("Email draft", "Hello (team)\nThanks for reviewing this draft.");
    expect(blob.type).toBe("application/pdf");
    expect(blob.size).toBeGreaterThan(100);
    expect(await blob.text()).toContain("%PDF");
    expect(getPdfFilename("Product launch / Q4")).toBe("product-launch-q4.pdf");
  });

  it("downloads an image blob when the image request succeeds", async () => {
    const { clicked } = installAnchorDom();
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue(new Response(new Blob(["image"]), { status: 200 })));
    await downloadImage("https://example.com/image.png", "generated.png");
    expect(clicked[0]?.download).toBe("generated.png");
  });

  it("falls back to a direct image link when fetching fails", async () => {
    const { clicked } = installAnchorDom();
    vi.stubGlobal("fetch", vi.fn().mockRejectedValue(new Error("network")));
    await downloadImage("https://example.com/image.png", "fallback.png");
    expect(clicked[0]).toMatchObject({ href: "https://example.com/image.png", download: "fallback.png", target: "_blank" });
  });
});
