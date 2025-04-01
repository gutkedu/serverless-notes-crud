import { NoteDynamo, NoteEntity } from '@/entities/note'
import { dynamo } from '@/shared/aws-clients/dynamo'
import { getLogger } from '@/shared/logger/get-logger'
import { QueryCommand } from '@aws-sdk/lib-dynamodb'

interface Input {
  nextToken?: string
  limit: number
}

interface Output {
  notes: Array<{
    id: string
    sender: string
    content: string
    tags: string[]
    createdAt: string
    updatedAt: string
    shouldExpire: boolean
    ttl: number
  }>
  token: string | null
}

const logger = getLogger()
const dynamoClient = dynamo()

export async function fetchNotes({ limit, nextToken }: Input): Promise<Output> {
  const queryNotes = new QueryCommand({
    TableName: process.env.TABLE_NAME,
    KeyConditionExpression: 'pk = :pk',
    ExpressionAttributeValues: {
      ':pk': 'NOTE'
    },
    Limit: limit,
    ExclusiveStartKey: nextToken ? JSON.parse(Buffer.from(nextToken, 'base64').toString()) : undefined
  })

  const { Items, LastEvaluatedKey } = await dynamoClient.send(queryNotes)

  if (!Items) {
    logger.warn('No notes found')
    return { notes: [], token: null }
  }

  const notes = Items.map((item) => NoteEntity.fromDynamoItem(item as NoteDynamo))

  logger.info('Fetched notes successfully', { length: notes.length })

  return {
    notes: notes.map((note) => ({
      id: note.id,
      sender: note.sender,
      content: note.content,
      tags: note.tags,
      createdAt: note.createdAt,
      updatedAt: note.updatedAt,
      shouldExpire: note.shouldExpire,
      ttl: note.ttl
    })),
    token: LastEvaluatedKey ? Buffer.from(JSON.stringify(LastEvaluatedKey)).toString('base64') : null
  }
}
