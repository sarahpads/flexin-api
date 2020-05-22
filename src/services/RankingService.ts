import { Service } from "typedi";
import { default as PQueue } from "p-queue";

import { ChallengeResponse } from "../models/ChallengeResponse";

@Service()
export class RankingService {
  private queue: PQueue;

  constructor() {
    this.queue = new PQueue({ concurrency: 1 });
  }

  rank(challengeId: string) {
    const task = this.process.bind(this, challengeId);
    return this.queue.add(task);
  }

  private async process(challengeId: string) {

    const responses = await ChallengeResponse.find({ where: { challengeId }});

    const flexes = new Set<number>();

    for (let response of responses) {
      flexes.add(response.flex)
    }

    const ranks = Array.from(flexes).sort((a, b) => a < b ? 1 : -1);
    const length = ranks.length;

    for (let response of responses) {
      const rank = ranks.indexOf(response.flex) + 1;
      const gains = (length - rank) * .25;

      response.rank = rank;
      response.gains = gains;
    }

    return ChallengeResponse.save(responses);
  }
}