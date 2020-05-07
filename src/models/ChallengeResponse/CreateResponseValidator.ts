import { MiddlewareFn } from "type-graphql";
import { getConnection } from "typeorm";

import { Challenge } from "../Challenge/Challenge";

// TODO: is not author/has not responded already
export const CreateResponseValidator: MiddlewareFn = async ({ args }, next) => {
  const challenge = await getConnection().getRepository(Challenge)
    .findOne({ id: args.data.challenge})

  if (!challenge) {
    throw Error("Challenge not found");
  }

  if (challenge.expiresAt.valueOf() < Date.now()) {
    throw Error("Challenge has expired");
  }

  return next()
};