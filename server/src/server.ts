import { fastify } from 'fastify'
import { fastifyCors } from '@fastify/cors'
import { getAllPromptsRoute } from './routes/get-all-prompts'
import { createTranscriptionRoute } from './routes/create-transcription'
import { uploadVideoRoute } from './routes/upload-video'
import { generateAiCompletionRoute } from './routes/generate-ai-completion'

const app = fastify()

console.log('Starting server...')

app.register(fastifyCors, {
  origin: '*',
})

console.log('Registering routes...')

app.register(createTranscriptionRoute)
app.register(generateAiCompletionRoute)
app.register(getAllPromptsRoute)
app.register(uploadVideoRoute)

app
  .listen({
    port: 3333,
  })
  .then((andress) => {
    console.log(`Server is running on ${andress}`)
  })
