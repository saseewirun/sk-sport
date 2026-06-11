/**
 * แปลงระหว่าง lexical rich-text (รูปแบบที่หน้าเว็บใช้แสดงผล) กับกล่องข้อความ
 * ธรรมดาหลายย่อหน้า — ลูกค้าพิมพ์ข้อความเว้นบรรทัดว่างระหว่างย่อหน้า ระบบ
 * แปลงเป็น lexical ให้อัตโนมัติ (spec: นโยบาย & ข้อกำหนด)
 */

type LexicalText = { type: 'text'; text: string } & Record<string, unknown>
type LexicalBlock = { type: string; children?: LexicalNode[] } & Record<string, unknown>
type LexicalNode = LexicalText | LexicalBlock

export type LexicalContent = {
  root: { type: 'root'; children: LexicalNode[] } & Record<string, unknown>
}

function nodeText(node: LexicalNode): string {
  if (node.type === 'text') return (node as LexicalText).text ?? ''
  if (node.type === 'linebreak') return '\n'
  const children = (node as LexicalBlock).children
  if (!Array.isArray(children)) return ''
  return children.map(nodeText).join('')
}

/** lexical → ข้อความธรรมดา: 1 บล็อก (ย่อหน้า/หัวข้อ) = 1 ย่อหน้า คั่นด้วยบรรทัดว่าง */
export function lexicalToPlainText(content: LexicalContent | null | undefined): string {
  if (!content?.root?.children) return ''
  return content.root.children
    .map(nodeText)
    .map((t) => t.trim())
    .filter((t) => t !== '')
    .join('\n\n')
}

/** ข้อความธรรมดา → lexical: ทุกย่อหน้า (คั่นด้วยบรรทัดว่าง) กลายเป็น paragraph */
export function plainTextToLexical(text: string): LexicalContent {
  const paragraphs = text
    .split(/\n\s*\n/)
    .map((p) => p.trim())
    .filter((p) => p !== '')

  return {
    root: {
      type: 'root',
      format: '',
      indent: 0,
      version: 1,
      direction: null,
      children: paragraphs.map((p) => ({
        type: 'paragraph',
        format: '',
        indent: 0,
        version: 1,
        direction: null,
        children: p.split('\n').flatMap((line, i): LexicalNode[] => {
          const textNode: LexicalNode = {
            mode: 'normal',
            text: line,
            type: 'text',
            style: '',
            detail: 0,
            format: 0,
            version: 1,
          }
          return i === 0 ? [textNode] : [{ type: 'linebreak', version: 1 }, textNode]
        }),
      })),
    },
  }
}
