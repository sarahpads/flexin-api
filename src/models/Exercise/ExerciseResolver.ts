import { Resolver, Query, Mutation, Arg } from "type-graphql";

import { Exercise } from "./Exercise";
import { CreateExerciseInput } from "./CreateExerciseInput";

@Resolver()
export class ExerciseResolver {
  @Query(() => [Exercise])
  exercises() {
    return Exercise.find()
  }

  @Query(() => Exercise)
  async exercise(@Arg("id") id: string) {
    const exercise = await Exercise.findOne({ where: { id } });

    if (!exercise) {
      throw new Error("Exercise not found");
    }

    return exercise;
  }

  @Mutation(() => Exercise)
  async createExercise(@Arg("data") data: CreateExerciseInput) {
    console.log(data)
    const exercise = Exercise.create(data);
    await exercise.save();

    return exercise;
  }

  @Mutation(() => Exercise)
  async updateExercise(@Arg("id") id: string, @Arg("data") data: CreateExerciseInput) {
    const exercise = await Exercise.findOne({ where: { id } });

    if (!exercise) {
      throw new Error("Exercise not found");
    }

    Object.assign(exercise, data);
    await exercise.save();

    return exercise;
  }
}