import { Resolver, Query, Mutation, Arg, Authorized, Subscription, Root, PubSub, PubSubEngine, FieldResolver, UseMiddleware } from "type-graphql";

import { Challenge } from "./Challenge";
import { CreateChallengeInput } from "./CreateChallengeInput";
import { getRepository } from "typeorm";
import { Exercise } from "../Exercise";
import { User } from "../User";
import { ChallengeResponse } from "../ChallengeResponse";
import { CreateChallengeValidator } from "./CreateChallengeValidator";
import { NotificationSubscription } from "../NotificationSubscription";
import { Role } from "../Role.enum";
import NotFoundError from "../../errors/NotFoundError";
import { sendNotification } from "../../services/push-notifications";

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
  async latestChallenge() {
    const challenge = await Challenge.findOne({ order: { id: "DESC" }});

    if (!challenge) {
      throw new NotFoundError(`No challenge available`);
    }

    return challenge;
  }

  @Query(() => Challenge)
  async activeChallenge() {
    const now = new Date();
    const challenge = await Challenge.createQueryBuilder("challenge")
      .where("challenge.expiresAt > :now", { now })
      .getOne();

    if (!challenge) {
      throw new NotFoundError("No active challenge");
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
      throw new NotFoundError(`Challenge ${id} not found`);
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

  @Authorized([Role.USER])
  @UseMiddleware(CreateChallengeValidator)
  @Mutation(() => Challenge)
  async createChallenge(@Arg("data") data: CreateChallengeInput, @PubSub() pubsub: PubSubEngine) {
    const exerciseRepository = getRepository(Exercise)
    const exercise = await exerciseRepository.findOne({ where: { id: data.exercise } });

    if (!exercise) {
      throw new NotFoundError(`Exercise ${data.exercise} not found`);
    }

    const userRepository = getRepository(User);
    const user = await userRepository.findOne({ where: { id: data.user }, relations: ["exercises"] });

    if (!user) {
      throw new NotFoundError(`User ${data.user} not found`);
    }

    const userExercise = user.exercises.find((userExercise) => {
      return userExercise.exerciseId === exercise.id;
    });

    if (!userExercise) {
      throw new NotFoundError(`UserExercise for exercise ${data.exercise} and user ${data.user} not found`);
    }

    const response = ChallengeResponse.create({
      user,
      reps: data.reps,
      flex: parseFloat((data.reps / userExercise.reps).toFixed(2)),
      createdAt: new Date()
    });

    const createdAt = new Date();
    const expiresAt = new Date(createdAt.valueOf() + 300000) // 300000 5 minutes

    const challenge = Challenge.create({
      exercise,
      user,
      createdAt,
      expiresAt,
      responses: [response]
    });

    await challenge.save();

    pubsub.publish("NEW_CHALLENGE", challenge);

    const subscriptionRepository = getRepository(NotificationSubscription);

    const subscriptions = await subscriptionRepository.find({ relations: ["user"] });
    console.log(subscriptions)

    for (let subscription of subscriptions) {
      sendNotification(challenge, subscription);
    }

    return challenge;
  }

  // TODO: in order for this to work, we need to delete all responses first
  @Authorized([Role.ADMIN])
  @Mutation(() => Boolean)
  async cancelChallenge() {
    const now = new Date();
    const challenge = await Challenge.createQueryBuilder("challenge")
      .where("challenge.expiresAt > :now", { now })
      .getOne();

    if (!challenge) {
      throw new NotFoundError("No active challenge");
    }

    await challenge.remove();

    return true;
  }
}