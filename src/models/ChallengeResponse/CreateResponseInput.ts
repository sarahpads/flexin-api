import { InputType, Field } from "type-graphql";

@InputType()
export class CreateResponseInput {
  @Field()
  reps: number;
}