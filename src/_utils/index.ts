// options = { port: 5000 }
import express from 'express';
import http from 'http';
import { ApolloServer } from 'apollo-server-express';
import { buildSchema } from 'type-graphql';
import resolvers from '../resolvers';
import dataSource from '../db';

export const createTestApolloServer = async (options = { port: 5000 }) => {
  const app = express();
  const httpServer = http.createServer(app);
  const server = new ApolloServer({
    schema: await buildSchema({
      resolvers: resolvers,
      validate: false,
    }),
    csrfPrevention: true,
  });
  await dataSource.initialize();
  await server.start();
  server.applyMiddleware({
    app,
    path: '/',
  });
  await new Promise<void>((resolve) =>
    httpServer.listen({ port: options.port }, resolve),
  );
  return {
    url: `http://localhost:${options.port}`,
    server,
  };
};
