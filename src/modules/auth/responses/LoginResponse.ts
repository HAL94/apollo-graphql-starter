import { Field, ObjectType } from 'type-graphql';

@ObjectType()
export class LoginResponse {
  @Field(() => String)
    message!: string;

  @Field(() => Boolean)
    success!: boolean;
}
