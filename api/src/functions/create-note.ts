import { NoteEntity } from '@/entities/note'
import { dynamo } from '@/shared/aws-clients/dynamo'
import { getLogger } from '@/shared/logger/get-logger'
import { PutCommand } from '@aws-sdk/lib-dynamodb'

interface Input {
  sender: string
  content: string
  tags: string[]
  shouldExpire: boolean
}

interface Output {
  id: string
  sender: string
  content: string
  tags: string[]
  shouldExpire?: boolean
  ttl?: number
  createdAt: string
  updatedAt: string
}

const logger = getLogger()
const dynamoClient = dynamo()

export async function createNote({ content, sender, tags, shouldExpire }: Input): Promise<Output> {
  const DEFAULT_EXPIRATION_TIME = 60 * 60 * 24 // 1 day

  const note = NoteEntity.create({
    content,
    sender,
    tags,
    shouldExpire,
    ttl: shouldExpire ? Math.floor(Date.now() / 1000) + DEFAULT_EXPIRATION_TIME : 0
  })

  const createNoteCommand = new PutCommand({
    Item: note.toDynamoItem(),
    TableName: process.env.TABLE_NAME,
    ConditionExpression: 'attribute_not_exists(#pk) AND attribute_not_exists(#sk)',
    ExpressionAttributeNames: {
      '#pk': 'pk',
      '#sk': 'sk'
    }
  })

  try {
    await dynamoClient.send(createNoteCommand)
  } catch (error) {
    logger.error('Error creating note', { error })
    throw new Error('Failed to create note')
  }

  logger.info('Note created successfully', { note: note.toDynamoItem() })

  return {
    id: note.id,
    sender: note.sender,
    content: note.content,
    tags: note.tags,
    shouldExpire: note.shouldExpire,
    ttl: note.ttl,
    createdAt: note.createdAt,
    updatedAt: new Date().toISOString()
  }
}
