import { Item } from "./item";
import KSUID from "ksuid";

export interface NoteProps {
  id?: string;
  sender: string;
  content: string;
  tags: string[];
  shouldExpire?: boolean;
  ttl?: number;
  createdAt?: string;
  updatedAt?: string;
}

interface NoteDynamoKeys {
  pk: `NOTE`;
  sk: `ID#${string}`;
}

export interface NoteDynamo extends NoteProps, NoteDynamoKeys {}

export class NoteEntity extends Item<NoteProps> {
  get pk(): NoteDynamoKeys["pk"] {
    return `NOTE`;
  }

  get sk(): NoteDynamoKeys["sk"] {
    return `ID#${this.props.id}`;
  }

  get id(): string {
    return this.props.id as string;
  }

  get sender(): string {
    return this.props.sender;
  }

  get createdAt(): string {
    return this.props.createdAt as string;
  }

  getDynamoKeys(): NoteDynamoKeys {
    return {
      pk: this.pk,
      sk: this.sk,
    };
  }

  toDynamoItem(): NoteDynamo {
    return {
      ...this.getDynamoKeys(),
      ...this.props,
    };
  }

  static fromDynamoItem(item: NoteDynamo): NoteEntity {
    return new NoteEntity(item);
  }

  static create(props: NoteProps): NoteEntity {
    return new NoteEntity({
      ...props,
      shouldExpire: props.shouldExpire ?? false,
      ttl: props.ttl ?? 0,
      id: props.id ?? KSUID.randomSync().string,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    });
  }
}
