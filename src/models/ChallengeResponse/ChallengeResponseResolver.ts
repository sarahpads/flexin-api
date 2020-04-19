import { Resolver, Query, Mutation, Arg, Subscription, FieldResolver, Root, PubSub, PubSubEngine } from "type-graphql";

import { ChallengeResponse } from "./ChallengeResponse";
import { CreateResponseInput } from "./CreateResponseInput";
import { User } from "../User";
import { Challenge } from "../Challenge/Challenge";
import { getRepository } from "typeorm";

@Resolver(of => ChallengeResponse)
export class ChallengeResponseResolver {
  @Subscription({
    topics: "NEW_RESPONSE"
  })
  newResponse(@Arg("challengeId") challengeId: string, @Root() response: ChallengeResponse): ChallengeResponse {
    console.log(challengeId)
    return response;
  }

  @Query(() => [ChallengeResponse])
  challengeResponses() {
    return ChallengeResponse.find();
  }

  @Query(() => ChallengeResponse)
  async challengeResponse(@Arg("id") id: string) {
    const challengeResponse = await ChallengeResponse.findOne({ where: { id } });

    if (!challengeResponse) {
      throw new Error("ChallengeResponse not found");
    }

    return challengeResponse;
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

  // TODO: make sure they can't create one for an expired challenge
  @Mutation(() => ChallengeResponse)
  async createResponse(@Arg("data") data: CreateResponseInput, @PubSub() pubsub: PubSubEngine) {
    const challengeRepository = getRepository(Challenge);
    const challenge = await challengeRepository.findOne({ where: { id: data.challenge }});

    const userRepository = getRepository(User);
    // TODO: ensure randos can't create for other users?
    const user = await userRepository.findOne({ where: { id: data.user } });

    const response = await ChallengeResponse.insert({
      reps: data.reps,
      challenge,
      user,
      date: new Date().toISOString()
    });


    pubsub.publish("NEW_RESPONSE", response);

    return response;
  }
}