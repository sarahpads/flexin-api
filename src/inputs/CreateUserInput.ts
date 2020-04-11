import { InputType, Field } from "type-graphql";

@InputType()
export class CreateUserInput {
  @Field()
  email: string;

  @Field()
  name: string;
}