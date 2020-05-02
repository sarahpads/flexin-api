import { Resolver, Query, Mutation, Arg, Authorized, Subscription, Root, PubSub, PubSubEngine, FieldResolver, UseMiddleware } from "type-graphql";

import { Challenge } from "./Challenge";
import { CreateChallengeInput } from "./CreateChallengeInput";
import { getRepository } from "typeorm";
import { Exercise } from "../Exercise";
import { User } from "../User";
import { ChallengeResponse } from "../ChallengeResponse";
import { ROLES } from "../../auth-checker";
import { CreateChallengeValidator } from "./CreateChallengeValidator";

@Resolver(of => Challenge)
export class ChallengeResolver {
  @Subscription({
    topics: "NEW_CHALLENGE"
  })
  newChallenge(@Root() challenge: Challenge): Challenge {
    return challenge;
  }

  @Query(() => [Challenge])
  challenges() {
    return Challenge.find();
  }

  @Query(() => Challenge)
  async activeChallenge() {
    const now = new Date();
    const challenge = await Challenge.createQueryBuilder("challenge")
      .where("challenge.expiresAt > :now", { now })
      .getOne();

    if (!challenge) {
      throw new Error("Challenge not found");
    }

    return challenge;
  }

  @Query(() => [ChallengeResponse])
  async challengeResponses(@Arg("challengeId") id: string) {
    const responses = await Challenge.createQueryBuilder("challenge")
      .relation(Challenge, "responses")
      .of({ id })
      .loadMany();

    return responses;
  }

  @Query(() => Challenge)
  async challenge(@Arg("id") id: string) {
    const challenge = await Challenge.findOne({ where: { id } });

    if (!challenge) {
      throw new Error("Challenge not found");
    }

    return challenge;
  }

  @FieldResolver(() => User)
  async user(@Root() challenge: Challenge) {
    const user = await Challenge.createQueryBuilder("challenge")
      .relation(Challenge, "user")
      .of(challenge)
      .loadOne();

    return user;
  }

  @FieldResolver(() => Exercise)
  async exercise(@Root() challenge: Challenge) {
    const exercise = await Challenge.createQueryBuilder("challenge")
      .relation(Challenge, "exercise")
      .of(challenge)
      .loadOne();

    return exercise;
  }

  @FieldResolver(() => [ChallengeResponse])
  async responses(@Root() challenge: Challenge) {
    const responses = await Challenge.createQueryBuilder("challenge")
      .relation(Challenge, "responses")
      .of(challenge)
      .loadMany();

    return responses;
  }

  @Authorized([ROLES.SAME_USER])
  @UseMiddleware(CreateChallengeValidator)
  @Mutation(() => Challenge)
  async createChallenge(@Arg("data") data: CreateChallengeInput, @PubSub() pubsub: PubSubEngine) {
    const exerciseRepository = getRepository(Exercise)
    const exercise = await exerciseRepository.findOne({ where: { id: data.exercise } });

    const userRepository = getRepository(User);
    const user = await userRepository.findOne({ where: { id: data.user } });

    const date = new Date();
    const expiresAt = new Date(date.valueOf() + 300000) // 300000 5 minutes

    const challenge = Challenge.create({
      reps: data.reps,
      exercise,
      user,
      date: date,
      expiresAt: expiresAt
    });

    await challenge.save();

    pubsub.publish("NEW_CHALLENGE", challenge);

    return challenge;
  }

  @Authorized([ROLES.ADMIN])
  @Mutation(() => Boolean)
  async cancelChallenge() {
    const now = new Date();
    const challenge = await Challenge.createQueryBuilder("challenge")
      .where("challenge.expiresAt > :now", { now })
      .getOne();

    if (!challenge) {
      throw new Error("Challenge not found");
    }

    await challenge.remove();

    return true;
  }
}