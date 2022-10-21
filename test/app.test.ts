import request, { gql } from 'graphql-request';
import { ApolloServer, ExpressContext } from 'apollo-server-express';


import { createTestApolloServer } from '../src/_utils';

const ALL_TASKS = gql`
  query Tasks {
    tasks {
      id
      title
    }
  }
`;

describe('app', () => {
  let server: ApolloServer<ExpressContext>, url: string;

  beforeAll(async () => {
    try {
      ({ server, url } = await createTestApolloServer({ port: 8808 }));
    } catch (error) {
      console.log('Error Testing Bootstrap');
      throw error;
    }
  });

  afterAll(async () => {
    server?.stop();
  });

  it('responds with a list of json of tasks', async () => {    
    const data = await request(url, ALL_TASKS);    
    expect(data.tasks?.length).toBe(2);
  });
});
