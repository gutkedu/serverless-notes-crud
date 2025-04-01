import { updateNote } from '@/functions/update-note'
import { IntegrationError } from '@/shared/errors/integration-error'
import { getLogger } from '@/shared/logger/get-logger'
import { APIGatewayProxyHandler } from 'aws-lambda'
import { z } from 'zod'

const logger = getLogger()

export const updateNoteHandler: APIGatewayProxyHandler = async (event, context) => {
  try {
    logger.info('updateNoteHandler invoked', { event, context })

    const validateIdSchema = z.object({
      id: z.string().nonempty()
    })

    const { id } = validateIdSchema.parse(event.pathParameters)

    const schema = z.object({
      content: z.string().min(1).max(1000).optional(),
      sender: z.string().min(1).max(50).optional(),
      tags: z.array(z.string()).optional(),
      shouldExpire: z.boolean().optional()
    })

    const body = JSON.parse(event.body || '{}')

    const { content, sender, tags, shouldExpire } = schema.parse(body)

    const note = await updateNote({
      id,
      content,
      sender,
      tags,
      shouldExpire
    })

    return {
      statusCode: 200,
      body: JSON.stringify(note)
    }
  } catch (error) {
    logger.error('Error in updateNoteHandler', { error })

    if (error instanceof z.ZodError) {
      return {
        statusCode: 400,
        body: JSON.stringify({ message: 'Validation error', errors: error.errors })
      }
    }

    if (error instanceof IntegrationError) {
      return {
        statusCode: 400,
        body: JSON.stringify({ message: 'Integration error', error: error.message })
      }
    }

    return {
      statusCode: 500,
      body: JSON.stringify({ message: 'Internal server error' })
    }
  }
}
