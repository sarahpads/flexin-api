import { Resolver, Query, FieldResolver, Root } from "type-graphql";

import { ChallengeResponse } from "./ChallengeResponse";
import { User } from "../User";
import { Challenge } from "../Challenge/Challenge";

@Resolver(of => ChallengeResponse)
export class ChallengeResponseResolver {
  @Query(() => [ChallengeResponse])
  challengeResponses() {
    return ChallengeResponse.find();
  }

  @FieldResolver(() => User)
  async user(@Root() challengeResponse: ChallengeResponse) {
    if (!!challengeResponse.user) {
      return challengeResponse.user;
    }

    const user = await ChallengeResponse.createQueryBuilder()
      .relation(ChallengeResponse, "user")
      .of(challengeResponse)
      .loadOne();

    return user;
  }

  @FieldResolver(() => Challenge)
  async challenge(@Root() challengeResponse: ChallengeResponse) {
    if (!!challengeResponse.challenge) {
      return challengeResponse.challenge;
    }

    const challenge = await ChallengeResponse.createQueryBuilder()
      .relation(ChallengeResponse, "challenge")
      .of(challengeResponse)
      .loadOne()

    return challenge;
  }

}