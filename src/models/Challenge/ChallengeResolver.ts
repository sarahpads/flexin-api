import { Resolver, Query, Mutation, Arg } from "type-graphql";

import { Challenge } from "./Challenge";

@Resolver()
export class ChallengeResolver {
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
}