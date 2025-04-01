import { Item } from './item'
import KSUID from 'ksuid'

export interface NoteProps {
  id?: string
  sender: string
  content: string
  tags: string[]
  shouldExpire?: boolean
  ttl?: number
  createdAt?: string
  updatedAt?: string
}

interface NoteDynamoKeys {
  pk: `NOTE`
  sk: `ID#${string}`
}

export interface NoteDynamo extends NoteProps, NoteDynamoKeys {}

export class NoteEntity extends Item<NoteProps> {
  get pk(): NoteDynamoKeys['pk'] {
    return `NOTE`
  }

  get sk(): NoteDynamoKeys['sk'] {
    return `ID#${this.props.id}`
  }

  get id(): string {
    return this.props.id as string
  }

  get sender(): string {
    return this.props.sender
  }

  set sender(value: string) {
    this.props.sender = value
    this.touch()
  }

  get createdAt(): string {
    return this.props.createdAt as string
  }

  get updatedAt(): string {
    return this.props.updatedAt as string
  }

  get content(): string {
    return this.props.content
  }

  set content(value: string) {
    this.props.content = value
    this.touch()
  }

  get tags(): string[] {
    return this.props.tags
  }

  set tags(value: string[]) {
    this.props.tags = value
    this.touch()
  }

  get shouldExpire(): boolean {
    return this.props.shouldExpire ?? false
  }

  set shouldExpire(value: boolean) {
    this.props.shouldExpire = value
    this.touch()
  }

  get ttl(): number {
    return this.props.ttl ?? 0
  }

  set ttl(value: number) {
    this.props.ttl = value
    this.touch()
  }

  touch() {
    this.props.updatedAt = new Date().toISOString()
  }

  getDynamoKeys(): NoteDynamoKeys {
    return {
      pk: this.pk,
      sk: this.sk
    }
  }

  toDynamoItem(): NoteDynamo {
    return {
      ...this.getDynamoKeys(),
      ...this.props
    }
  }

  static fromDynamoItem(item: NoteDynamo): NoteEntity {
    return new NoteEntity(item)
  }

  static create(props: NoteProps): NoteEntity {
    return new NoteEntity({
      ...props,
      shouldExpire: props.shouldExpire ?? false,
      ttl: props.ttl ?? 0,
      id: props.id ?? KSUID.randomSync().string,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    })
  }
}
