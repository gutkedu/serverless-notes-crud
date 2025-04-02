import { NoteDynamo, NoteEntity } from '@/entities/note'
import { dynamo } from '@/shared/aws-clients/dynamo'
import { IntegrationError } from '@/shared/errors/integration-error'
import { getLogger } from '@/shared/logger/get-logger'
import { DeleteCommand, GetCommand } from '@aws-sdk/lib-dynamodb'

interface Input {
  id: string
}

const logger = getLogger()
const dynamoClient = dynamo()

export async function deleteNote({ id }: Input): Promise<void> {
  try {
    const getNote = new GetCommand({
      Key: {
        pk: 'NOTE',
        sk: `ID#${id}`
      },
      TableName: process.env.TABLE_NAME
    })

    const { Item } = await dynamoClient.send(getNote)

    if (!Item) {
      logger.error('Note not found', { id })
      throw new IntegrationError('Note not found')
    }

    const note = NoteEntity.fromDynamoItem(Item as NoteDynamo)

    logger.info('Note found', { note: note.toDynamoItem() })

    const deleteCommand = new DeleteCommand({
      TableName: process.env.TABLE_NAME,
      Key: note.getDynamoKeys(),
      ConditionExpression: 'attribute_exists(pk) AND attribute_exists(sk)'
    })

    await dynamoClient.send(deleteCommand)

    logger.info('Note deleted', { id })
  } catch (error) {
    logger.error('Error deleting note', { error })
    throw new IntegrationError('Error deleting note')
  }
}
