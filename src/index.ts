import "reflect-metadata";
import { createConnection } from "typeorm";
import { ApolloServer } from "apollo-server";
import { buildSchema } from "type-graphql";
import jwtDecode from "jwt-decode";
import { SecretManagerServiceClient } from "@google-cloud/secret-manager";

import { User, UserResolver } from "./models/User";
import { Challenge, ChallengeResolver } from "./models/Challenge";
import { ChallengeResponse, ChallengeResponseResolver } from "./models/ChallengeResponse";
import { Exercise, ExerciseResolver } from "./models/Exercise";
import { UserExercise, UserExerciseResolver } from "./models/UserExercise";
import { NotificationSubscription, NotificationSubscriptionResolver } from "./models/NotificationSubscription";
import { customAuthChecker } from "./auth-checker";

const {
  PSQL_USERNAME,
  PSQL_PASSWORD,
  PSQL_DATABASE,
  PSQL_HOST,
  PSQL_PORT,
  PORT
} = process.env;

async function main() {
  const secrets = new SecretManagerServiceClient();

  const [usernameSecret, passwordSecret] = await Promise.all([
    secrets.accessSecretVersion({ name: PSQL_USERNAME }),
    secrets.accessSecretVersion({ name: PSQL_PASSWORD })
  ]);

  // @ts-ignore
  const username = usernameSecret[0].payload.data.toString();
  // @ts-ignore
  const password = passwordSecret[0].payload.data.toString();

  const connection = await createConnection({
    type: "postgres",
    database: PSQL_DATABASE,
    username,
    password,
    host: PSQL_HOST,
    port: parseInt(PSQL_PORT as string),
    extra: {
      socketPath: "/cloudsql/flexin:northamerica-northeast1:flexin-postgres"
    },
    entities: [
      Challenge,
      ChallengeResponse,
      Exercise,
      NotificationSubscription,
      User,
      UserExercise
    ],
    synchronize: true,
    logging: true
  })

  const schema = await buildSchema({
    resolvers: [
      ChallengeResolver,
      ChallengeResponseResolver,
      ExerciseResolver,
      NotificationSubscriptionResolver,
      UserResolver,
      UserExerciseResolver
    ],
    authChecker: customAuthChecker
  })

  const server = new ApolloServer({
    schema,
    formatError: (error) => {
      // TODO: format this for obvious 404s, etc
      // https://javascript.info/custom-errors
      console.log(error)
      return error;
    },
    subscriptions: {
      path: "/subscriptions",
      onConnect
    },
    context: async ({ req, connection }) => {
      if (connection) {
        return;
      }

      const auth = req.headers.authorization;

      if (!auth) {
        return;
      }

      const [_, token] = auth.split(' ');
      const user: any = jwtDecode(token);

      // return if token is expired
      if (Date.now() >= user.exp * 1000) {
        return;
      }

      // If not, add user.sub as uid
      // https://developers.google.com/identity/protocols/oauth2/openid-connect#an-id-tokens-payload
      return {
        uid: user.sub
      }
    }
  });

  await server.listen(PORT)

  console.log("Server has started!")
}

function onConnect(params: any) {
  console.log('connect', params)
}

main();
