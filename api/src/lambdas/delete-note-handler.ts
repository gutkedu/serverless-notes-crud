import { deleteNote } from '@/functions/delete-note'
import { IntegrationError } from '@/shared/errors/integration-error'
import { getLogger } from '@/shared/logger/get-logger'
import { validateKsuid } from '@/shared/utils/validate-ksuid'
import { APIGatewayProxyHandler } from 'aws-lambda'
import { z } from 'zod'

const logger = getLogger()

export const deleteNoteHandler: APIGatewayProxyHandler = async (event, context) => {
  try {
    logger.info('deleteNoteHandler invoked', { event, context })

    const validateIdSchema = z.object({
      id: z.string().refine((id) => validateKsuid(id), {
        message: 'Invalid ID format'
      })
    })

    const { id } = validateIdSchema.parse(event.pathParameters)

    await deleteNote({
      id
    })

    return {
      statusCode: 200,
      body: JSON.stringify({
        message: 'Note deleted successfully'
      })
    }
  } catch (error) {
    logger.error('Error in deleteNoteHandler', { error })

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
