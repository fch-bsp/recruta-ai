import { NextRequest, NextResponse } from "next/server";
import mammoth from "mammoth";

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const cvFile = formData.get("cvFile") as File | null;
    const jdFile = formData.get("jdFile") as File | null;
    const cvText = formData.get("cvText") as string | null;
    const jdText = formData.get("jdText") as string | null;

    let finalCvText = cvText || "";
    let finalJdText = jdText || "";

    if (cvFile) {
      try { finalCvText = await extractTextFromFile(cvFile); }
      catch (e) { return NextResponse.json({ error: e instanceof Error ? e.message : "Erro ao ler CV.", details: e instanceof Error ? e.message : "" }, { status: 422 }); }
    }
    if (jdFile) {
      try { finalJdText = await extractTextFromFile(jdFile); }
      catch (e) { return NextResponse.json({ error: e instanceof Error ? e.message : "Erro ao ler vaga.", details: e instanceof Error ? e.message : "" }, { status: 422 }); }
    }

    if (!finalCvText && !finalJdText) {
      return NextResponse.json({ error: "Envie pelo menos um arquivo ou texto." }, { status: 400 });
    }
    return NextResponse.json({ cvText: finalCvText || null, jdText: finalJdText || null });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Erro desconhecido";
    console.error("Erro ao extrair texto:", message);
    return NextResponse.json({ error: "Erro interno ao processar os arquivos.", details: message }, { status: 500 });
  }
}

async function parsePdfPrimary(buffer: Buffer): Promise<string> {
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const pdfParse = require("pdf-parse/lib/pdf-parse.js");
  const data = await pdfParse(buffer);
  return data.text || "";
}

async function parsePdfFallback(buffer: Buffer): Promise<string> {
  const pdfjsLib = await import("pdfjs-dist/legacy/build/pdf.mjs");
  const doc = await pdfjsLib.getDocument({
    data: new Uint8Array(buffer),
    useSystemFonts: true,
    disableFontFace: true,
    standardFontDataUrl: undefined,
  }).promise;
  const pages: string[] = [];
  for (let i = 1; i <= doc.numPages; i++) {
    const page = await doc.getPage(i);
    const content = await page.getTextContent({ includeMarkedContent: false });
    const text = content.items
      .filter((item: any) => "str" in item)
      .map((item: any) => item.str)
      .join(" ");
    if (text.trim()) pages.push(text);
  }
  return pages.join("\n");
}

async function parsePdf(buffer: Buffer): Promise<string> {
  // Try primary parser first
  try {
    const text = await parsePdfPrimary(buffer);
    if (text.trim().length > 10) return text;
  } catch (e) {
    console.warn("pdf-parse falhou:", e instanceof Error ? e.message : e);
  }

  // Fallback to pdfjs-dist
  try {
    const text = await parsePdfFallback(buffer);
    if (text.trim().length > 10) return text;
  } catch (e) {
    console.warn("pdfjs-dist falhou:", e instanceof Error ? e.message : e);
  }

  throw new Error("Não foi possível extrair texto deste PDF. Tente colar o texto manualmente.");
}

async function extractTextFromFile(file: File): Promise<string> {
  const arrayBuffer = await file.arrayBuffer();
  const buffer = Buffer.from(arrayBuffer);
  const contentType = file.type || "";
  const name = file.name.toLowerCase();

  if (contentType.includes("application/pdf") || name.endsWith(".pdf")) {
    return parsePdf(buffer);
  }
  if (contentType.includes("wordprocessingml.document") || name.endsWith(".docx")) {
    const result = await mammoth.extractRawText({ buffer });
    return result.value;
  }
  if (contentType.includes("text/plain") || name.endsWith(".txt")) {
    return buffer.toString("utf-8");
  }
  throw new Error(`Tipo de arquivo não suportado: ${contentType}`);
}
