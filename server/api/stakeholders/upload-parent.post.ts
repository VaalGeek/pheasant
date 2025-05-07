import { readFiles } from 'h3-formidable'
import type { File } from 'formidable'
import { parseExcel } from '~/server/utils/excelParser'
import { uploadStakeholders } from '~/server/controllers/StakeholderController'
import { Stakeholder } from '~/server/models/Stakeholder'


export default defineEventHandler(async (event) => {
  const { files, fields } = await readFiles(event, { maxFileSize: 10e6, keepExtensions: true })

  const file = (Array.isArray(files?.stakeholders)
    ? files.stakeholders.find(f => f.originalFilename?.match(/\.xls(x)?$/i))
    : files?.stakeholders) as File

  if (!file) {
    return { success: false, message: 'No valid .xls/.xlsx uploaded under "stakeholders"' }
  }

  const schoolId = Array.isArray(fields.schoolId) ? fields.schoolId[0] : fields.schoolId

  if (!schoolId) {
    return { success: false, message: 'Missing schoolId in the request' }
  }

  await Stakeholder.deleteMany({ role: { $in: ['Parent', 'Learner'] }, schoolId })

  // Map columns for learners & parents
  const raw = parseExcel(file, {
    B: 'surname',
    C: 'firstName',
    E: 'grade',
    F: 'class',
    G: 'learnerCell',
    H: 'learnerEmail',
    J: 'fatherName',
    K: 'fatherSurname',
    L: 'fatherEmail',
    M: 'fatherCell',
    N: 'motherName',
    O: 'motherSurname',
    P: 'motherEmail',
    Q: 'motherCell',
  })

  // Transform into your controller’s expected shape...
  const formatted = raw
    .filter(r => r.firstName && r.surname)
    .map(r => ({
      learner: {
        firstName: r.firstName,
        surname: r.surname,
        grade: r.grade?.replace(/\D/g, '').padStart(2, '0'),
        class: extractClass(r.class),

        email: r.learnerEmail?.toLowerCase(),
        cell: r.learnerCell,
      },
      father: {
        name: r.fatherName,
        surname: r.fatherSurname,
        email: r.fatherEmail?.toLowerCase(),
        cell: r.fatherCell,
        grade: r.grade?.replace(/\D/g, '').padStart(2, '0'),
        class: extractClass(r.class),

      },
      mother: {
        name: r.motherName,
        surname: r.motherSurname,
        email: r.motherEmail?.toLowerCase(),
        cell: r.motherCell,
        grade: r.grade?.replace(/\D/g, '').padStart(2, '0'),
        class: extractClass(r.class),
      
      },
    }))
    .slice(0, 2)
  const results = await uploadStakeholders(formatted, schoolId)
  return { success: true, count: results.length }
})

const extractClass = (cls:string) => {
  cls = cls?.toUpperCase().trim() || ''

  // Case: two numbers like '12 13' → take second number
  const twoNumbersMatch = cls.match(/\b\d+\b\s+\b(\d+)\b/)
  if (twoNumbersMatch) return twoNumbersMatch[1]

  // Case: decimal like '8.6' → take number after dot
  const decimalMatch = cls.match(/\d+\.(\d+)/)
  if (decimalMatch) return decimalMatch[1]

  // Case: number + letter like '12A' → take letter
  const numLetterMatch = cls.match(/\d+([A-Z])/)
  if (numLetterMatch) return numLetterMatch[1]

  // Case: ending letter like 'GRADE 6D (O81)' → take last letter before optional (...)
  const letterMatch = cls.match(/([A-Z])(\(\d+\))?$/)
  if (letterMatch) return letterMatch[1]

  // Fallback
  return ''
}

