import { InputType, Field } from "type-graphql";
import { Role } from "../Role.enum";

@InputType()
export class UpdateUserInput {
  @Field({ nullable: true })
  email?: string;

  @Field({ nullable: true })
  name?: string;
}