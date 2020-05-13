import { Resolver, Query, Arg, Mutation, Authorized } from "type-graphql";
import { NotificationSubscription } from "./NotificationSubscription";
import NotFoundError from "../../errors/NotFoundError";
import { CreateSubscriptionInput } from "./CreateSubscriptionInput";
import { Role } from "../Role.enum";
import { getRepository } from "typeorm";
import { User } from "../User";

@Resolver(of => NotificationSubscription)
export class NotificationSubscriptionResolver {
  @Authorized([Role.USER])
  @Query(() => NotificationSubscription)
  async subscription(@Arg("id") id: string) {
    const subscription = await NotificationSubscription.findOne({ where: { id } });

    if (!subscription) {
      throw new NotFoundError(`Subscription ${id} not found`);
    }

    return subscription;
  }

  @Authorized([Role.USER])
  @Mutation(() => Boolean)
  async createSubscription(@Arg("data") data: CreateSubscriptionInput) {
    const userRepository = getRepository(User);
    const user = await userRepository.findOne({ where: { id: data.user }, relations: ["subscription"]});

    if (!user) {
      throw new NotFoundError(`User ${data.user} not found`);
    }

    if (user.subscription) {
      user.subscription.notification = data.notification;

      await user.subscription.save();
    } else {
      const subscription = NotificationSubscription.create({
        notification: data.notification,
        user
      });

      await subscription.save();
    }

    return true;
  }
}