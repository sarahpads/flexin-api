import { InputType, Field } from "type-graphql";

@InputType()
export class UpdateUserExercisesInput {
  @Field()
  user: string;

  @Field(type => [UpdateUserExerciseInput])
  exercises: UpdateUserExerciseInput[]
}

@InputType()
export class UpdateUserExerciseInput {
  @Field()
  exercise: string;

  @Field()
  reps: number;
}