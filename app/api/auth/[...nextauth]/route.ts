import { handlers } from "@/lib/auth-new"

console.log('Route handler loaded for /api/auth/[...nextauth]')

export const { GET, POST } = handlers