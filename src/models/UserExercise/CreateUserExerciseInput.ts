import { InputType, Field } from "type-graphql";

@InputType()
export class CreateUserExerciseInput {
  @Field()
  exercise: string;

  @Field()
  reps: number;
}