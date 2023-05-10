import { config } from 'dotenv'
import { z } from 'zod'

if (process.env.NODE_ENV === 'test') {
  config({ path: '.env.test' })
} else {
  config()
}

// envSchema possui um "objeto"  de variáveis ambiente
const envSchema = z.object({
  NODE_ENV: z.enum(['development', 'test', 'production']).default('production'),
  DATABASE_URL: z.string(),
  PORT: z.number().default(3333),
  // como tem o ".default()" nao precisa estar no arquivo .env
})

const _env = envSchema.safeParse(process.env)

if (_env.success === false) {
  console.error('⚠️ invalid environment variables', _env.error.format())
  // formatacao de erros

  throw new Error('Invalid environment variables')
}

export const env = _env.data

// metodo parse => pegar o schema , passar os dados de process.env , zod valida a tipagem. se der errado - dispara um erro
