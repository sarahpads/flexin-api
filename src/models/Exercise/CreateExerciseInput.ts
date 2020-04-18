import { InputType, Field } from "type-graphql";

import { MuscleGroup } from "../MuscleGroup.enum";

@InputType()
export class CreateExerciseInput {
  @Field()
  title: string;

  @Field(type => MuscleGroup)
  muscleGroup: MuscleGroup
}