import { Resolver, Query, Mutation, Arg, Authorized, FieldResolver, Root } from "type-graphql";

import { User } from "./User";
import { CreateUserInput } from "./CreateUserInput";
import { UpdateUserInput } from "./UpdateUserInput";
import NotFoundError from "../../errors/NotFoundError";
import { CreateProfileInput } from "./CreateProfileInput";
import { UserExercise } from "../UserExercise";
import { Exercise } from "../Exercise";
import { ChallengeResponse } from "../ChallengeResponse";
import { Role } from "../Role.enum";
import { ROLES } from "../../auth-checker";

@Resolver(type => User)
export class UserResolver {
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

  @FieldResolver(() => [UserExercise])
  async exercises(@Root() user: User) {
    const exercises = await User.createQueryBuilder("user")
      .relation(User, "exercises")
      .of(user)
      .loadMany();

    return exercises
  }

  @FieldResolver(() => [ChallengeResponse])
  async responses(@Root() user: User) {
    const responses = await User.createQueryBuilder("user")
      .relation(User, "responses")
      .of(user)
      .loadMany();

    return responses;
  }

  @Mutation(() => User)
  async createProfile(@Arg("data") data: CreateProfileInput) {
    const user = User.create(data.user);

    user.exercises = data.exercises.map((exercise) => {
      const userExercise = new UserExercise();
      userExercise.user = user;
      userExercise.exercise = new Exercise()
      userExercise.exercise.id = exercise.exercise;
      userExercise.reps = exercise.reps;

      return userExercise;
    });

    user.save();

    return user;
  }

  @Authorized([ROLES.ADMIN])
  @Mutation(() => User)
  async createUser(@Arg("data") data: CreateUserInput) {
    const user = User.create(data);
    await user.save();

    return user;
  }

  @Authorized([ROLES.SAME_USER, ROLES.ADMIN])
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

  @Authorized([ROLES.ADMIN])
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
