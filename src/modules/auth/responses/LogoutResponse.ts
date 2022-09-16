import { Field, ObjectType } from 'type-graphql';

@ObjectType()
export class LogoutResponse {
  @Field(() => String)
    message?: string;

  @Field(() => Boolean)
    success?: boolean;
}
