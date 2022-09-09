// import request from 'supertest';
import request, { gql } from 'graphql-request';
import { Server } from 'http';

import { createTestApolloServer } from '../src';

const ALL_TASKS = gql`
  query Tasks {
    tasks {
      id
      title
    }
  }
`;

describe('app', () => {
  let server: Server, url: string;

  beforeAll(async () => {
    try {
      ({ server, url } = await createTestApolloServer({ port: 0 }));
    } catch (error) {
      console.log('Error Testing Bootstrap');
      throw error;
    }
  });

  afterAll(async () => {
    server?.close();
  });

  it('responds with a list of json of tasks', async () => {
    console.log('url', url);
    const data = await request(url, ALL_TASKS);
    // console.log('response', response);
    expect(data.tasks?.length).toBe(2);
  });
});
