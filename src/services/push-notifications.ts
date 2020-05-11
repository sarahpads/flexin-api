
import webpush from "web-push";

import { NotificationSubscription } from "../models/NotificationSubscription";
import { Challenge } from "../models/Challenge";

// webpush.generateVAPIDKeys
const vapidKeys = {
  privateKey: "",
  publicKey: ""
};

webpush.setVapidDetails("mailto:example@yourdomain.org", vapidKeys.publicKey, vapidKeys.privateKey);

export function sendNotification(challenge: Challenge, subscription: NotificationSubscription) {
  // we don't want to send a notification to the person who
  // created the challenge
  console.log("sub user", subscription.user, "challenge user", challenge.user)
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