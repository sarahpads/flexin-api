import "reflect-metadata";
import { createConnection } from "typeorm";
import { ApolloServer } from "apollo-server";
import { buildSchema } from "type-graphql";
import jwtDecode from "jwt-decode";

import { User, UserResolver } from "./models/User";
import { Challenge, ChallengeResolver } from "./models/Challenge";
import { ChallengeResponse, ChallengeResponseResolver } from "./models/ChallengeResponse";
import { Exercise, ExerciseResolver } from "./models/Exercise";
import { UserExercise, UserExerciseResolver } from "./models/UserExercise";
import { customAuthChecker } from "./auth-checker";

async function main() {
  const connection = await createConnection({
    type: "postgres",
    host: "localhost",
    port: 6543,
    database: "flexin",
    username: "postgres",
    entities: [
      Challenge,
      ChallengeResponse,
      Exercise,
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
      UserResolver,
      UserExerciseResolver
    ],
    authChecker: customAuthChecker
  })

  const server = new ApolloServer({
    schema,
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

      // Make sure token isn't expired
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

  await server.listen(4000)

  console.log("Server has started!")
}

function onConnect(params: any) {
  console.log('connect', params)
}

main();
