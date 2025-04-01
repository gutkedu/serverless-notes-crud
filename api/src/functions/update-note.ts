import { NoteDynamo, NoteEntity } from '@/entities/note'
import { dynamo } from '@/shared/aws-clients/dynamo'
import { getLogger } from '@/shared/logger/get-logger'
import { GetCommand, UpdateCommand } from '@aws-sdk/lib-dynamodb'

interface Input {
  id: string
  sender?: string
  content?: string
  tags?: string[]
  shouldExpire?: boolean
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

export async function updateNote({ content, sender, tags, shouldExpire, id }: Input): Promise<Output> {
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
    throw new Error('Note not found')
  }

  const note = NoteEntity.fromDynamoItem(Item as NoteDynamo)

  logger.info('Note found', { note: note.toDynamoItem() })

  note.content = content ?? note.content
  note.sender = sender ?? note.sender
  note.tags = tags ?? note.tags
  note.shouldExpire = shouldExpire ?? note.shouldExpire
  note.ttl = shouldExpire ? Math.floor(Date.now() / 1000) : 0

  const updateNoteCommand = new UpdateCommand({
    Key: note.getDynamoKeys(),
    TableName: process.env.TABLE_NAME,
    UpdateExpression:
      'SET #content = :content, #sender = :sender, #tags = :tags, #shouldExpire = :shouldExpire, #ttl = :ttl',
    ExpressionAttributeNames: {
      '#content': 'content',
      '#sender': 'sender',
      '#tags': 'tags',
      '#shouldExpire': 'shouldExpire',
      '#ttl': 'ttl'
    },
    ExpressionAttributeValues: {
      ':content': note.content,
      ':sender': note.sender,
      ':tags': note.tags,
      ':shouldExpire': note.shouldExpire,
      ':ttl': note.ttl
    }
  })

  await dynamoClient.send(updateNoteCommand)
  logger.info('Note updated successfully', { note: note.toDynamoItem() })

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
