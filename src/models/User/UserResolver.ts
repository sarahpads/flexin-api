import { Resolver, Query, Mutation, Arg, Authorized } from "type-graphql";

import { User } from "./User";
import { CreateUserInput } from "./CreateUserInput";
import { UpdateUserInput } from "./UpdateUserInput";
import NotFoundError from "../../errors/NotFoundError";

@Resolver()
export class UserResolver {
  // @Authorized()
  @Query(() => [User])
  users() {
    return User.find();
  }

  @Query(() => User)
  async user(@Arg("id") id: string) {
    const user = await User.findOne({ where: { id } });

    if (!user) {
      throw new NotFoundError(`User ${id} not found`);
    }

    return user;
  }

  // TODO: create profile that takes user and userExercises
/*const photo1 = new Photo();
photo1.url = "me.jpg";
await connection.manager.save(photo1);

const photo2 = new Photo();
photo2.url = "me-and-bears.jpg";
await connection.manager.save(photo2);

const user = new User();
user.name = "John";
user.photos = [photo1, photo2];*/
// With cascades enabled you can save this relation with only one save call.

  @Mutation(() => User)
  async createUser(@Arg("data") data: CreateUserInput) {
    const user = User.create(data);
    await user.save();

    return user;
  }

  @Mutation(() => User)
  async updateUser(@Arg("id") id: string, @Arg("data") data: UpdateUserInput) {
    const user = await User.findOne({ where: { id } });

    if (!user) {
      throw new Error("User not found!");
    }

    Object.assign(user, data);
    await user.save();

    return user;
  }

  @Mutation(() => Boolean)
  async deleteUser(@Arg("id") id: string) {
    const user = await User.findOne({ where: { id } });

    if (!user) {
      throw new Error("User not found!");
    }

    await user.remove();

    return true;
  }
}
