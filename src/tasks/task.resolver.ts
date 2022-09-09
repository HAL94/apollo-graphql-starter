import { Arg, Query, Mutation, Resolver } from 'type-graphql';
import { Task } from './task.entity';

@Resolver()
export default class TaskResolver {
  @Query(() => [Task])
  tasks(): Promise<Task[]> {
    return Task.find();
  }

  @Mutation(() => Task)
  createTask(@Arg('title', () => String) title: string): Promise<Task> {
    const task = new Task();
    task.title = title;
    task.isComplete = false;
    return task.save();    
  }
}
