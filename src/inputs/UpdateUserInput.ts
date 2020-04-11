import { InputType, Field } from "type-graphql";

@InputType()
export class UpdateUserInput {
  @Field({ nullable: false })
  email?: string;

  @Field({ nullable: false })
  name?: string;
}