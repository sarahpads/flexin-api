import { Entity, BaseEntity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn, PrimaryColumn } from "typeorm";
import { ObjectType, Field, ID } from "type-graphql";

import { User } from "../User/User";
import { Exercise } from "../Exercise";

@Entity()
@ObjectType()
export class UserExercise extends BaseEntity {
  @PrimaryColumn()
  @Field()
  userId: string;

  @PrimaryColumn()
  @Field()
  exerciseId: string;

  @Field()
  @Column()
  reps: number

  @ManyToOne(
    type => User,
    user => user.exercises,
    {
      primary: true,
      nullable: false
    }
  )
  @JoinColumn()
  user: User

  @ManyToOne(
    type => Exercise,
    exercise => exercise.userExercises,
    {
      primary: true,
      nullable: false
    }
  )
  @JoinColumn()
  exercise: Exercise
}