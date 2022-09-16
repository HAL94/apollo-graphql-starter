import { Field, ObjectType } from 'type-graphql';

@ObjectType()
export class RefreshResponse {
  @Field(() => String)
    message!: string;

  @Field(() => Boolean)
    success!: boolean;
}
