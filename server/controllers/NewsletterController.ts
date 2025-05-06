import Newsletter from '~/server/models/Newsletter'

export async function create(data: any) {
  try {
    // Validate description length
    if (data.description && data.description.length > 200) {
      throw new Error('Description must not exceed 200 characters.')
    }

    const newsletter = new Newsletter({
      title: data.title,
      description: data.description,
      fileUrl: data.fileUrl,
      target:data.target,
      schoolId:data.schoolId
    })

    await newsletter.save()

    return {
      success: true,
      message: 'Newsletter created successfully.',
      newsletter,
    }
  } catch (error: any) {
    console.error('[Newsletter Creation] Error:', error)
    return {
      success: false,
      message: 'Failed to create newsletter.',
      error: error.message,
    }
  }
}

export async function fetchAll(schoolId:string) {
    try {
      const newsletters = await Newsletter.find({schoolId}).sort({ createdAt: -1 });
   
      return newsletters
    } catch (error) {
      throw createError({
        statusCode: 500,
        statusMessage: 'Failed to fetch newsletters',
      })
    }
  }
