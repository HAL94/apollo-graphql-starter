import { Arg, Query, Mutation, Resolver, UseMiddleware, Authorized } from 'type-graphql';
import { LogAccess } from '../../middlewares';
import { Task } from './task.entity';

@Resolver()
export default class TaskResolver {

  @Query(() => [Task])
  @UseMiddleware(LogAccess)
  @Authorized()
  tasks(): Promise<Task[]> {
    return Task.find();
  }

  @Mutation(() => Task)
  @Authorized()
  createTask(@Arg('title', () => String) title: string): Promise<Task> {
    const task = new Task();
    task.title = title;
    task.isComplete = false;
    return task.save();    
  }
}
