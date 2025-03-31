import { getLogger } from '@/shared/logger/get-logger'
import { APIGatewayProxyHandler } from 'aws-lambda'

const logger = getLogger()

export const createNoteHandler: APIGatewayProxyHandler = async (event, context) => {
  logger.info('createNoteHandler invoked', { event, context })

  const { body } = event

  // Simulate creating a note
  const note = {
    id: '12345',
    content: body,
    createdAt: new Date().toISOString()
  }

  return {
    statusCode: 201,
    body: JSON.stringify(note)
  }
}
