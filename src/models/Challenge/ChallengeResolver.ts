import { Resolver, Query, Mutation, Arg, Authorized, Subscription, Root, PubSub, PubSubEngine, FieldResolver, UseMiddleware } from "type-graphql";
import { InjectManager } from "typeorm-typedi-extensions";

import { Challenge } from "./Challenge";
import { CreateChallengeInput } from "./CreateChallengeInput";
import { getRepository, Not } from "typeorm";
import { Exercise } from "../Exercise";
import { User } from "../User";
import { ChallengeResponse } from "../ChallengeResponse";
import { CreateChallengeValidator } from "./CreateChallengeValidator";
import { Role } from "../Role.enum";
import NotFoundError from "../../errors/NotFoundError";
import { NotificationService } from "../../services/NotificationService";
import { CreateResponseValidator } from "../ChallengeResponse/CreateResponseValidator";
import { CreateResponseInput } from "../ChallengeResponse/CreateResponseInput";
import { RankingService } from "../../services/RankingService";

@Resolver(of => Challenge)
export class ChallengeResolver {
  constructor(
    private NotificationService: NotificationService,
    private RankingService: RankingService
  ) {}

  @Subscription({
    topics: "NEW_CHALLENGE"
  })
  newChallenge(@Root() challenge: Challenge): Challenge {
    return challenge;
  }

  @Subscription({
    topics: "NEW_RESPONSE"
  })
  updatedChallenge(@Root() challenge: Challenge): Challenge {
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

  @Query(() => [Challenge])
  leaderboard() {
    return Challenge.createQueryBuilder("challenge")
      .leftJoinAndSelect("challenge.exercise", "exercise")
      .leftJoinAndSelect("challenge.user", "author")
      .leftJoinAndSelect("challenge.responses", "response")
      .leftJoinAndSelect("response.user", "user")
      .orderBy({
        "challenge.createdAt": "DESC",
        "response.rank": "ASC",
      })
      .getMany();
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
    if (!!challenge.user) {
      return challenge.user;
    }

    const user = await Challenge.createQueryBuilder("challenge")
      .relation(Challenge, "user")
      .of(challenge)
      .loadOne();

    return user;
  }

  @FieldResolver(() => Exercise)
  async exercise(@Root() challenge: Challenge) {
    if (!!challenge.exercise) {
      return challenge.exercise;
    }

    const exercise = await Challenge.createQueryBuilder("challenge")
      .relation(Challenge, "exercise")
      .of(challenge)
      .loadOne();

    return exercise;
  }

  @FieldResolver(() => [ChallengeResponse])
  async responses(@Root() challenge: Challenge) {
    if (!!challenge.responses) {
      return challenge.responses;
    }

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
      rank: 1,
      gains: 0,
      flex: parseFloat((data.reps / userExercise.reps).toFixed(2)),
      createdAt: new Date()
    });

    const duration = process.env.CHALLENGE_DURATION
      ? parseInt(process.env.CHALLENGE_DURATION)
      : 300000;
    const createdAt = new Date();
    const expiresAt = new Date(createdAt.valueOf() + duration) // 300000 5 minutes

    const challenge = Challenge.create({
      exercise,
      user,
      createdAt,
      expiresAt,
      responses: [response]
    });

    await challenge.save();

    pubsub.publish("NEW_CHALLENGE", challenge);

    const users = await User.createQueryBuilder("user")
      .select(["user.subscription"])
      .where({ id: Not(data.user) })
      .andWhere("user.subscription IS NOT NULL")
      .getMany();

    for (let user of users) {
      this.NotificationService.sendNotification(challenge, user.subscription);
    }

    return challenge;
  }

  @Authorized([Role.USER])
  @UseMiddleware(CreateResponseValidator)
  @Mutation(() => ChallengeResponse)
  async createResponse(@Arg("data") data: CreateResponseInput, @PubSub() pubsub: PubSubEngine) {
    const challengeRepository = getRepository(Challenge);
    const challenge = await challengeRepository.findOne({ where: { id: data.challenge }, relations: ["exercise"]});

    if (!challenge) {
      throw new NotFoundError(`Challenge ${data.challenge} not found`);
    }

    const userRepository = getRepository(User);
    const user = await userRepository.findOne({ where: { id: data.user }, relations: ["exercises"] });

    if (!user) {
      throw new NotFoundError(`User ${data.user} not found`);
    }

    const userExercise = user.exercises.find((userExercise) => {
      return userExercise.exerciseId === challenge.exercise.id;
    });

    if (!userExercise) {
      throw new NotFoundError(`UserExercise for challenge ${data.challenge} and user ${data.user} not found`);
    }

    const flex = parseFloat((data.reps / userExercise.reps).toFixed(2));

    const response = ChallengeResponse.create({
      reps: data.reps,
      challenge,
      flex,
      user,
      createdAt: new Date()
    })

    await ChallengeResponse.insert(response);

    challenge.responses = await this.RankingService.rank(response.challengeId);

    pubsub.publish("NEW_RESPONSE", challenge);

    return response;
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
