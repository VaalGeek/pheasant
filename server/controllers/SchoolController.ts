// ~/server/controllers/SchoolController.ts
import bcrypt from 'bcrypt'
import School from '~/server/models/School'

interface SchoolInput {
  name: string
  emis: string
  type: string
  userId: string
  email?: string
  phone?: string
}

export async function create(input: SchoolInput) {
  // 1) Validate required fields
  const { name, emis, type, userId } = input
  if (!name || !emis || !type || !userId) {
    throw new Error('Missing required fields: name, emis, type, userId are all required.')
  }

  // 2) Check for uniqueness
  const exists = await School.findOne({
    $or: [{ emis }, { userId }]
  })
  if (exists) {
    throw new Error('A school with that EMIS or username already exists.')
  }

 

  // 4) Create & save
  const school = new School({
    name,
    emis,
    type,
    userId,
    email: input.email,
    phone: input.phone
  })
  await school.save()

  // 5) Return success (you can include the new record if you like)
  return {
    success: true,
    message: 'School registered successfully.',
    school: {
      id: school._id,
      name: school.name,
      emis: school.emis,
      type: school.type,
      userId: school.userId,
      email: school.email,
      phone: school.phone
    }
  }
}

export const login = async (username: string, password: string) => {
  const user = await School.findOne({ username });

  if (!user) {
    throw createError({ statusCode: 401, message: 'Invalid username or password' });
  }

  const isPasswordValid = await bcrypt.compare(password, user.password);

  if (!isPasswordValid) {
    throw createError({ statusCode: 401, message: 'Invalid username or password' });
  }

  // Convert to object and remove unwanted fields
  const userObject = user.toObject();
  delete userObject.password;
  delete userObject.createdAt;
  delete userObject.updatedAt;
  delete userObject.__v;

  return userObject;
};

export async function fetchById(schoolId: string) {
  const school = await School.findById(schoolId).select('-createdAt -password -updatedAt -__v');

  if (!school) {
    throw new Error('School not found');
  }

  return school;
}

export async function fetchByUserId(userId: string) {
  const school = await School.findOne({userId}).select('-createdAt -password -updatedAt -__v');

  if (!school) {
    throw new Error('School not found');
  }

  return school;
}