import { InputType, Field } from 'type-graphql';
import { MaxLength } from 'class-validator';

@InputType()
export class CredentialsInput {
  @Field(() => String, { nullable: false })
    username!: string;

  @Field(() => String, { nullable: false })
  @MaxLength(10)
    password!: string;
}
