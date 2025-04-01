import { createNote } from '@/functions/create-note'
import { IntegrationError } from '@/shared/errors/integration-error'
import { getLogger } from '@/shared/logger/get-logger'
import { APIGatewayProxyHandler } from 'aws-lambda'
import { z } from 'zod'

const logger = getLogger()

export const createNoteHandler: APIGatewayProxyHandler = async (event, context) => {
  try {
    logger.info('createNoteHandler invoked', { event, context })

    const body = JSON.parse(event.body || '{}')

    const schema = z.object({
      content: z.string().min(1).max(1000),
      sender: z.string().min(1).max(50),
      tags: z.array(z.string()).default([]),
      shouldExpire: z.boolean().default(false)
    })

    const { content, sender, tags, shouldExpire } = schema.parse(body)

    const note = await createNote({
      content,
      sender,
      tags,
      shouldExpire
    })

    return {
      statusCode: 201,
      body: JSON.stringify(note)
    }
  } catch (error) {
    logger.error('Error in createNoteHandler', { error })

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
