import { Service } from "typedi";
import webpush from "web-push";
import { SecretManagerServiceClient } from "@google-cloud/secret-manager";

import { Challenge } from "../models/Challenge";

const {
  VAPID_SECRET_KEY,
  VAPID_PUBLIC_KEY
} = process.env;

@Service()
export class NotificationService {
  constructor() {
    this.init();
  }

  public sendNotification(challenge: Challenge, subscription: string) {
    webpush
      .sendNotification(
        JSON.parse(subscription),
        JSON.stringify({
          title: `${challenge.user.name} has challenged you to ${challenge.exercise.title}s!`,
          body: `You have 5 minutes to respond.`
        })
      )
      .then((response) => console.log(response))
      .catch(err => {
        console.log(err);
      });
  }

  private async init() {
    const { publicKey, secretKey } = await this.getCreds();

    webpush.setVapidDetails(
      "https://flexin.nn.r.appspot.com/",
      publicKey as string,
      secretKey as string
    );
  }

  private async getCreds() {
    if (process.env.NODE_ENV !== "production") {
      return Promise.resolve({
        publicKey: VAPID_PUBLIC_KEY,
        secretKey: VAPID_SECRET_KEY
      })
    }

    const secrets = new SecretManagerServiceClient();

    console.log("env vars", VAPID_SECRET_KEY, VAPID_PUBLIC_KEY)
    const [secretSecret, publicSecret] = await Promise.all([
      secrets.accessSecretVersion({ name: VAPID_SECRET_KEY }),
      secrets.accessSecretVersion({ name: VAPID_PUBLIC_KEY })
    ]);

    // @ts-ignore
    const secretKey = secretSecret[0].payload.data.toString();
    // @ts-ignore
    const publicKey = publicSecret[0].payload.data.toString();

    return { publicKey, secretKey };
  }
}