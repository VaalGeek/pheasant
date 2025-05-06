import excelToJson from 'convert-excel-to-json'
import type { File } from 'formidable'

export function parseExcel<T = any>(file: File, columnToKey: Record<string,string>): T[] {
  const result = excelToJson({
    sourceFile: file.filepath,
    header: { rows: 2 },
    columnToKey,
  })
  const sheet = Object.keys(result)[0]
  return result[sheet].filter(row => Object.values(row).some(Boolean)) as T[]
}
