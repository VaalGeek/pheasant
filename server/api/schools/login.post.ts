// ~/server/api/schools/login.post.ts

import { login } from '~/server/controllers/SchoolController';

export default defineEventHandler(async (event) => {
    try {
        const body = await readBody(event);
        const { username, password } = body;

        if (!username || !password) {
            throw createError({ statusCode: 400, message: 'Username and password are required' });
        }

        const user = await login(username, password);

        return { success: true, user };
    } catch (error) {
        // Let Nuxt handle the thrown errors properly
        throw error;
    }
});
