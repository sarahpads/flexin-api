import { InputType, Field } from "type-graphql";

@InputType()
export class CreateResponseInput {
  @Field()
  challenge: string;

  @Field()
  user: string;

  @Field()
  reps: number;
}