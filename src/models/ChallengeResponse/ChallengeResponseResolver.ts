import { Resolver, Query, Mutation, Arg, Subscription } from "type-graphql";

import { ChallengeResponse } from "./ChallengeResponse";
import { CreateResponseInput } from "./CreateResponseInput";

@Resolver()
export class ChallengeResponseResolver {
  /*@Subscription({
    topics: ({ payload, args } => {
      // return challenge id as topic
    })
  })
  newResponse(): ChallengeResponse {

  }*/

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

  @Mutation(() => ChallengeResponse)
  async createResponse(@Arg("data") data: CreateResponseInput) {
    const response = ChallengeResponse.create(data);
    await response.save();

    return response;
  }
}