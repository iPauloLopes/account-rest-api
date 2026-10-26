import 'dotenv/config'
import {number, z} from 'zod'

const envSchema = z.object({
    NODE_ENV:z.enum(['development','test','production']).default('development'),
    DATABASE_URL: z.string(),
    PORT: z.number().default(3333)
})

export const env = envSchema.parse(process.env)