import { InputType, Field } from "type-graphql";

import { CreateUserInput } from "./CreateUserInput";
import { CreateUserExerciseInput } from "../UserExercise/CreateUserExerciseInput";

@InputType()
export class CreateProfileInput {
  @Field()
  user: CreateUserInput;

  @Field(type => [CreateUserExerciseInput])
  exercises: CreateUserExerciseInput[]
}