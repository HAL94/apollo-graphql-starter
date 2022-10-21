require('dotenv').config();

import 'reflect-metadata';
import { ApolloServer } from 'apollo-server-express';
import {
  ApolloServerPluginDrainHttpServer,
  ApolloServerPluginLandingPageLocalDefault,
} from 'apollo-server-core';

import express from 'express';
import http from 'http';
// import cors from 'cors';
import { buildSchema } from 'type-graphql';

import resolvers from './resolvers';
import dataSource from './db';
import { customAuthChecker } from './middlewares';
import { Context } from './interfaces/Context';
import cookieParser from 'cookie-parser';
import { UserPayload, UserPayloadScalar } from './modules/auth/responses/MeResponse';
const port = process.env.PORT || 5000;

export async function bootstrap() {
  try {
    const app = express();   

    app.use(express.urlencoded({ extended: false }));
    // app.use(cors(corsOptions));
    app.use(cookieParser());

    const httpServer = http.createServer(app);
    const plugins =
      process.env.NODE_ENV === 'development'
        ? [
          ApolloServerPluginDrainHttpServer({ httpServer }),
          ApolloServerPluginLandingPageLocalDefault({ embed: true }),
        ]
        : [];

    const server = new ApolloServer({
      schema: await buildSchema({
        resolvers: resolvers,
        validate: false,
        scalarsMap: [{ type: UserPayload, scalar: UserPayloadScalar }],
        authChecker: customAuthChecker,
      }),
      csrfPrevention: true,
      plugins,
      context: ({ req, res }): Context => {
        return { req, res };
      },
    });

    await dataSource.initialize();

    await server.start();

    server.applyMiddleware({
      app,
      path: '/',
      cors: {
        origin: ['https://localhost:1212', 'http://localhost:1212'],
        credentials: true,
      },
      // cors: corsOptions,
    });

    await new Promise<void>((resolve) =>
      httpServer.listen({ port: port }, resolve),
    );

    if (process.env.NODE_ENV === 'development') {
      console.log('Connection to DB Initialized');
      console.log(
        `🚀 Server ready at http://localhost:${port}${server.graphqlPath}`,
      );
    }
  } catch (error) {
    console.log(error);
  }
}

bootstrap();
