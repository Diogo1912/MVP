import mammoth from 'mammoth'
import pdfParse from 'pdf-parse'
import { Document, Packer, Paragraph, TextRun } from 'docx'
import jsPDF from 'jspdf'

export async function extractTextFromDocx(buffer: Buffer): Promise<string> {
  const result = await mammoth.extractRawText({ buffer })
  return result.value
}

export async function extractTextFromPdf(buffer: Buffer): Promise<string> {
  const data = await pdfParse(buffer)
  return data.text
}

export async function createDocx(content: string, filename: string): Promise<Buffer> {
  const doc = new Document({
    sections: [
      {
        properties: {},
        children: content.split('\n').map(
          (line) =>
            new Paragraph({
              children: [
                new TextRun({
                  text: line,
                  font: 'Arial',
                  size: 24,
                }),
              ],
            })
        ),
      },
    ],
  })

  return await Packer.toBuffer(doc)
}

export function createPdf(content: string, filename: string): Buffer {
  const doc = new jsPDF()
  const lines = doc.splitTextToSize(content, 180)
  doc.text(lines, 10, 10)
  const arrayBuffer = doc.output('arraybuffer')
  return Buffer.from(arrayBuffer)
}

