import { Field, ObjectType } from 'type-graphql';

@ObjectType()
export class RegisterResponse {
  @Field(() => Boolean)
    success!: boolean;
  
  @Field(() => String)
    message?: string = '';

}
