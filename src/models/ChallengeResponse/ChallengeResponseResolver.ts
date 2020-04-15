import { Resolver, Query, Mutation, Arg, Subscription, FieldResolver, Root, PubSub, PubSubEngine } from "type-graphql";

import { ChallengeResponse } from "./ChallengeResponse";
import { CreateResponseInput } from "./CreateResponseInput";
import { User } from "../User";
import { Challenge } from "../Challenge/Challenge";
import { getRepository } from "typeorm";

@Resolver(of => ChallengeResponse)
export class ChallengeResponseResolver {
  @Subscription({
    topics: (({ payload, args }) => {
      console.log(payload)
      console.log(args)
      // return challenge id as topic
      return "NEW_RESPONSE";
    })
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
  async user(@Root() { id }: ChallengeResponse) {
    const response = await ChallengeResponse.createQueryBuilder("challengeResponse")
      .where("challengeResponse.id = :id", { id })
      .leftJoinAndSelect("challengeResponse.user", "user")
      .getOne();

    if (!response) {
      throw new Error("ChallengeResponse not found");
    }

    return response.user;
  }

  @FieldResolver(() => Challenge)
  async challenge(@Root() { id }: ChallengeResponse) {
    const response = await ChallengeResponse.createQueryBuilder("challengeResponse")
      .where("challengeResponse.id = :id", { id })
      .leftJoinAndSelect("challengeResponse.challenge", "challenge")
      .getOne();

    if (!response) {
      throw new Error("ChallengeResponse not found");
    }

    return response.challenge;
  }

  @Mutation(() => ChallengeResponse)
  async createResponse(@Arg("data") data: CreateResponseInput, @PubSub() pubsub: PubSubEngine) {
    const challengeRepository = getRepository(Challenge);
    const challenge = await challengeRepository.findOne({ where: { id: data.challenge }});

    const userRepository = getRepository(User);
    // TODO: ensure randos can't create for other users?
    const user = await userRepository.findOne({ where: { id: data.user } });

    const response = ChallengeResponse.create({
      reps: data.reps,
      challenge,
      user
    });

    await response.save();

    pubsub.publish("NEW_RESPONSE", response);

    return response;
  }
}