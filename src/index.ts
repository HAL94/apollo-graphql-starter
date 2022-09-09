require('dotenv').config();

import 'reflect-metadata';
import { ApolloServerPluginLandingPageLocalDefault } from 'apollo-server-core';
import { ApolloServer, ServerInfo } from 'apollo-server';
import { buildSchema } from 'type-graphql';

import resolvers from './resolvers';
import dataSource from './db';

const port = process.env.PORT || 5000;

export const createTestApolloServer = async (options = { port: 5000 }) => {
  const server = new ApolloServer({
    schema: await buildSchema({
      resolvers: resolvers,
      validate: false,
    }),
  });

  await dataSource.initialize();
  const serverInfo = await server.listen(options);
  // serverInfo is an object containing the server instance and the url the server is listening on
  return serverInfo;
};

export async function bootstrap(): Promise<ServerInfo | undefined> {
  try {
    const apolloServer = new ApolloServer({
      schema: await buildSchema({
        resolvers: resolvers,
        validate: false,
      }),
      csrfPrevention: true,
      plugins:
        process.env.NODE_ENV === 'development'
          ? [ApolloServerPluginLandingPageLocalDefault({ embed: true })]
          : [],
    });

    await dataSource.initialize();

    if (process.env.NODE_ENV === 'development') {
      console.log('Connection to DB Initialized');
    }

    const serverInfo = await apolloServer.listen({ port });
    
    if (process.env.NODE_ENV === 'development') {
      console.log(`🚀  Server ready at ${serverInfo?.url}`);
    }

    return serverInfo;
  } catch (error) {
    console.log(error);
  }
}

bootstrap();
