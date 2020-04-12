import { Entity, BaseEntity, PrimaryGeneratedColumn, Column, OneToMany } from "typeorm";
import { ObjectType, Field, ID } from "type-graphql";

import { Challenge } from "../Challenge";
import { ChallengeResponse } from "../ChallengeResponse";
import { UserExercise } from "../UserExercise";

@Entity()
@ObjectType()
export class User extends BaseEntity {
  @Field(() => ID)
  @PrimaryGeneratedColumn()
  id: string;

  @Field(() => String)
  @Column()
  email: string;

  @Field(() => String)
  @Column()
  name: string;

  @OneToMany(
    type => Challenge,
    challenge => challenge.user
  )
  challenges: Challenge[]

  @OneToMany(
    type => ChallengeResponse,
    challengeResponse => challengeResponse.user
  )
  challengeResponses: ChallengeResponse[]

  @OneToMany(
    type => UserExercise,
    userExercise => userExercise.user
  )
  exercises: UserExercise[]

  // TODO: has-many user-baseline
}
