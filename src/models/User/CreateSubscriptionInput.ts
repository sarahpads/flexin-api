import { InputType, Field } from "type-graphql";

@InputType()
export class CreateSubscriptionInput {
  @Field()
  user: string;

  @Field()
  notification: string;
}