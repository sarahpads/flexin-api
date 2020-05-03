import { Entity, BaseEntity, PrimaryGeneratedColumn, Column, OneToMany, ManyToOne } from "typeorm";
import { ObjectType, Field, ID } from "type-graphql";

import { ChallengeResponse } from "../ChallengeResponse";
import { User } from "../User";
import { Exercise } from "../Exercise";

@Entity()
@ObjectType()
export class Challenge extends BaseEntity {
  @Field(() => ID)
  @PrimaryGeneratedColumn()
  id: string;

  @Field(() => Number)
  @Column()
  reps: number

  @Field(() => Date)
  @Column()
  createdAt: Date

  @Field(() => Date)
  @Column()
  expiresAt: Date

  // TODO: these aren't nullable, but I'm too lazy to drop the db
  @Field(() => Number)
  @Column({ nullable: true })
  flex: number;

  @OneToMany(
    type => ChallengeResponse,
    response => response.challenge
  )
  responses: ChallengeResponse[]

  @ManyToOne(
    type => User,
    user => user.challenges
  )
  user: User

  @ManyToOne(
    type => Exercise,
    exercise => exercise.challenges
  )
  exercise: Exercise
}