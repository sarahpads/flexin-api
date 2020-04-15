import { Resolver, Query, Mutation, Arg, Authorized, Subscription, Root, PubSub, PubSubEngine, FieldResolver } from "type-graphql";

import { Challenge } from "./Challenge";
import { CreateChallengeInput } from "./CreateChallengeInput";
import { getRepository } from "typeorm";
import { Exercise } from "../Exercise";
import { User } from "../User";

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
  async challenge(@Arg("id") id: string) {
    const challenge = await Challenge.findOne({ where: { id } });

    if (!challenge) {
      throw new Error("Challenge not found");
    }

    return challenge;
  }

  @FieldResolver(() => User)
  async user(@Root() { id }: Challenge) {
    const challenge = await Challenge.createQueryBuilder("challenge")
      .where("challenge.id = :id", { id })
      .leftJoinAndSelect("challenge.user", "user")
      .getOne();

    if (!challenge) {
      throw new Error("Challenge not found");
    }

    return challenge.user;
  }

  @FieldResolver(() => Exercise)
  async exercise(@Root() { id }: Challenge) {
    const challenge = await Challenge.createQueryBuilder("challenge")
      .where("challenge.id = :id", { id })
      .leftJoinAndSelect("challenge.exercise", "exercise")
      .getOne()

    if (!challenge) {
      throw new Error("Challenge not found");
    }

    return challenge.exercise;
  }

  @Mutation(() => Challenge)
  async createChallenge(@Arg("data") data: CreateChallengeInput, @PubSub() pubsub: PubSubEngine) {
    const exerciseRepository = getRepository(Exercise)
    const exercise = await exerciseRepository.findOne({ where: { id: data.exercise } });

    const userRepository = getRepository(User);
    // TODO: ensure randos can't create for other users?
    const user = await userRepository.findOne({ where: { id: data.user } });
    console.log(data)

    const challenge = Challenge.create({
      reps: data.reps,
      exercise,
      user,
      date: new Date()
    });

    await challenge.save();

    pubsub.publish("NEW_CHALLENGE", challenge);

    return challenge;
  }
}