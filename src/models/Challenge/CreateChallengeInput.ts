import { InputType, Field } from "type-graphql";

@InputType()
export class CreateChallengeInput {
  @Field()
  user: string;

  @Field()
  exercise: string;

  @Field()
  reps: number
}