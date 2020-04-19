import { MiddlewareFn } from "type-graphql";
import { getConnection } from "typeorm";
import { Challenge } from "./Challenge";

export const CreateChallengeValidator: MiddlewareFn = async ({ args }, next) => {
  const now = new Date();
  const challenge = await getConnection().getRepository(Challenge)
    .createQueryBuilder("challenge")
    .where("challenge.expiresAt > :now", { now })
    .getOne();

  if (challenge) {
    throw Error("Active challenge is underway");
  }

  return next()
};