import { registerEnumType } from "type-graphql";

export enum MuscleGroup {
  BACK = "back",
  SHOULDERS = "shoulders",
  LEGS = "legs",
  CHEST = "chest",
  ARMS = "arms",
  ABS = "abs"
}

registerEnumType(MuscleGroup, {
  name: "MuscleGroup"
});
