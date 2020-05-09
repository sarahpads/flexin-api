import { Resolver, Query, FieldResolver, Root, Subscription, Arg, Authorized, Mutation, PubSub, PubSubEngine } from "type-graphql";

import { ChallengeResponse } from "./ChallengeResponse";
import { User } from "../User";
import { Challenge } from "../Challenge/Challenge";
import { Role } from "../Role.enum";
import { CreateResponseInput } from "./CreateResponseInput";
import { getRepository } from "typeorm";
import NotFoundError from "../../errors/NotFoundError";

@Resolver(of => ChallengeResponse)
export class ChallengeResponseResolver {
  @Subscription({
    topics: "NEW_RESPONSE"
  })
  newResponse(@Root() response: ChallengeResponse): ChallengeResponse {
    return response;
  }

  @Query(() => [ChallengeResponse])
  challengeResponses() {
    return ChallengeResponse.find();
  }

  @FieldResolver(() => User)
  async user(@Root() challengeResponse: ChallengeResponse) {
    const user = await ChallengeResponse.createQueryBuilder()
      .relation(ChallengeResponse, "user")
      .of(challengeResponse)
      .loadOne();

    return user;
  }

  @FieldResolver(() => Challenge)
  async challenge(@Root() challengeResponse: ChallengeResponse) {
    const challenge = await ChallengeResponse.createQueryBuilder()
      .relation(ChallengeResponse, "challenge")
      .of(challengeResponse)
      .loadOne()

    return challenge;
  }

  @Authorized([Role.USER])
  // @UseMiddleware(CreateResponseValidator)
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

    pubsub.publish("NEW_RESPONSE", response);

    return response;
  }
}