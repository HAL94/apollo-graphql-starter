import TaskResolver from '../modules/tasks/task.resolver';
import AuthResolver from '../modules/auth/auth.resolver';
import { NonEmptyArray } from 'type-graphql';

const resolvers = [TaskResolver, AuthResolver];
export default resolvers as NonEmptyArray<any>;
