import { Service } from "typedi";
import webpush from "web-push";
import { SecretManagerServiceClient } from "@google-cloud/secret-manager";

import { NotificationSubscription } from "../models/NotificationSubscription";
import { Challenge } from "../models/Challenge";

const {
  VAPID_PRIVATE_KEY,
  VAPID_PUBLIC_KEY
} = process.env;

@Service()
export class NotificationService {
  constructor() {
    this.init();
  }

  public sendNotification(challenge: Challenge, subscription: NotificationSubscription) {
    // we don't want to send a notification to the person who
    // created the challenge
    if (subscription.user.id === challenge.user.id) {
      return;
    }

    webpush
      .sendNotification(
        JSON.parse(subscription.notification),
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
    const { publicKey, privateKey } = await this.getCreds();

    webpush.setVapidDetails(
      "mailto:example@yourdomain.org",
      publicKey as string,
      privateKey as string
    );
  }

  private async getCreds() {
    if (process.env.NODE_ENV !== "production") {
      return Promise.resolve({
        publicKey: VAPID_PUBLIC_KEY,
        privateKey: VAPID_PRIVATE_KEY
      })
    }

    const secrets = new SecretManagerServiceClient();

    const [privateSecret, publicSecret] = await Promise.all([
      secrets.accessSecretVersion({ name: VAPID_PRIVATE_KEY }),
      secrets.accessSecretVersion({ name: VAPID_PUBLIC_KEY })
    ]);

    // @ts-ignore
    const privateKey = privateSecret[0].payload.data.toString();
    // @ts-ignore
    const publicKey = publicSecret[0].payload.data.toString();

    return { publicKey, privateKey };
  }
}