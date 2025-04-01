import { fetchNotes } from '@/functions/fetch-notes'
import { IntegrationError } from '@/shared/errors/integration-error'
import { getLogger } from '@/shared/logger/get-logger'
import { APIGatewayProxyHandler } from 'aws-lambda'
import { z } from 'zod'

const logger = getLogger()

export const fetchNotesHandler: APIGatewayProxyHandler = async (event, context) => {
  try {
    logger.info('fetchNotesHandler invoked', { event, context })

    const queryParams = event.queryStringParameters || {}

    const schema = z.object({
      nextToken: z.string().base64().optional(),
      limit: z.coerce.number().min(1).max(100).default(10)
    })

    const { limit, nextToken } = schema.parse(queryParams)

    const { notes, token } = await fetchNotes({
      limit,
      nextToken: nextToken ?? undefined
    })

    return {
      statusCode: 200,
      body: JSON.stringify({
        notes,
        token
      })
    }
  } catch (error) {
    logger.error('Error in fetchNotesHandler', { error })

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
