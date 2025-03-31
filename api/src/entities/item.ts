export abstract class Item<Props> {
  protected props: Props;

  protected constructor(props: Props) {
    this.props = props;
  }

  abstract get pk(): string;
  abstract get sk(): string;
}
