import { InputType, Field } from "type-graphql";

@InputType()
export class CreateUserInput {
  @Field()
  id: string;

  @Field()
  email: string;

  @Field()
  name: string;
}