const MAX_BYTES = 8 * 1024 * 1024;
const MAX_CONTENT_LENGTH = 500_000;

const SUPPORTED_EXTENSIONS = new Set(["txt", "pdf", "doc", "docx", "epub"]);

function truncateContent(content: string): string {
  if (content.length <= MAX_CONTENT_LENGTH) return content;
  return `${content.slice(0, MAX_CONTENT_LENGTH)}\n\n[Content truncated for length.]`;
}

function stripExtension(filename: string): string {
  return filename.replace(/\.[^.]+$/, "");
}

export async function parseUploadedFile(
  file: File,
): Promise<{ title: string; content: string }> {
  if (file.size > MAX_BYTES) {
    throw new Error("File must be 8 MB or smaller.");
  }

  const extension = file.name.split(".").pop()?.toLowerCase() ?? "";
  if (!SUPPORTED_EXTENSIONS.has(extension)) {
    throw new Error("Upload a .txt, .pdf, .docx, or .epub file.");
  }

  const buffer = Buffer.from(await file.arrayBuffer());

  let content: string;

  switch (extension) {
    case "txt": {
      content = buffer.toString("utf-8").trim();
      break;
    }
    case "docx": {
      const mammoth = await import("mammoth");
      const result = await mammoth.extractRawText({ buffer });
      content = result.value.trim();
      break;
    }
    case "pdf": {
      const { PDFParse } = await import("pdf-parse");
      const parser = new PDFParse({ data: buffer });
      try {
        const pdf = await parser.getText();
        content = pdf.text.trim();
      } finally {
        await parser.destroy();
      }
      break;
    }
    case "doc": {
      throw new Error(
        "Legacy .doc files are not supported. Save as .docx and upload again.",
      );
    }
    case "epub": {
      throw new Error(
        "EPUB import is not supported yet. Export plain text (.txt) and upload that file.",
      );
    }
    default: {
      throw new Error("Unsupported file type.");
    }
  }

  if (!content) {
    throw new Error("No text could be extracted from that file.");
  }

  return {
    title: stripExtension(file.name).slice(0, 200) || "Uploaded document",
    content: truncateContent(content),
  };
}

export const UPLOAD_ACCEPT =
  ".txt,.pdf,.doc,.docx,.epub,text/plain,application/pdf";
