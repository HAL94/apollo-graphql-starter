import TaskResolver from '../tasks/task.resolver';
import { NonEmptyArray } from 'type-graphql';

const resolvers = [TaskResolver];
export default resolvers as NonEmptyArray<any>;
