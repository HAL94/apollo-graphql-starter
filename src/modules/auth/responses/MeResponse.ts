import { GraphQLScalarType } from 'graphql';
import { Field, ObjectType } from 'type-graphql';

export class UserPayload {
  userId: string;

  expires: string;

  iat: number;

  exp: number;

  constructor(userId: string, expires: string, iat: number, exp: number) {
    this.userId = userId;
    this.expires = expires;
    this.iat = iat;
    this.exp = exp;
  }
}

export const UserPayloadScalar = new GraphQLScalarType({
  name: 'UserPayload',
  description: 'User Session',
  serialize(value: unknown): UserPayload {
    // check the type of received value
    if (!(value instanceof UserPayload)) {
      throw new Error('UserPayload can only serialize UserPayload values');
    }
    return value; // value sent to the client
  },
});

@ObjectType()
export class MeResponse {
  @Field(() => Boolean)
    success!: boolean;

  @Field(() => UserPayloadScalar)
    user!: UserPayload;
}
