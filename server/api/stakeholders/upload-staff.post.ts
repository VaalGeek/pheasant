import { readFiles } from 'h3-formidable'
import type { File } from 'formidable'
import { parseExcel } from '~/server/utils/excelParser'
import { uploadStakeholders } from '~/server/controllers/StakeholderController'
import { Stakeholder } from '~/server/models/Stakeholder'



export default defineEventHandler(async (event) => {
  const { files, fields } = await readFiles(event, {
    maxFileSize: 10e6,
    keepExtensions: true,
  })

  const role = fields?.role?.toString() || 'Staff'

  const file = (Array.isArray(files?.stakeholders)
    ? files.stakeholders.find(f => f.originalFilename?.match(/\.xls(x)?$/i))
    : files?.stakeholders) as File

  if (!file) {
    return {
      success: false,
      message: 'No valid .xls/.xlsx uploaded for staff',
    }
  }

  const schoolId = Array.isArray(fields.schoolId) ? fields.schoolId[0] : fields.schoolId

  if (!schoolId) {
    return { success: false, message: 'Missing schoolId in the request' }
  }

  
  await Stakeholder.deleteMany({ role: 'Staff', schoolId })

  // ✅ Correct column mapping
  const raw = parseExcel(file, {
    B: 'type',        // Educator or Staff
    C: 'surname',
    D: 'firstName',
    E: 'gender',
    F: 'cell',
  })

  const formatted = raw.map(r => {
    const group = r.type === 'Educator' ? 'Educators' : 'PS Staff'

    return {
      role,
      groups: [group],
      name: r.firstName,
      surname: r.surname,
      email: r.email?.toLowerCase(),
      cell: r.cell ? [r.cell] : [],
    }
  })//.slice(0,2)

  const results = await uploadStakeholders(formatted, schoolId)

  return {
    success: true,
    count: results.length,
  }
})
