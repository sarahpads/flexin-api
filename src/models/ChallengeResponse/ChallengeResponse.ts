import { Entity, BaseEntity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn, PrimaryColumn } from "typeorm";
import { ObjectType, Field, ID } from "type-graphql";

import { Challenge } from "../Challenge/Challenge";
import { User } from "../User";

@Entity()
@ObjectType()
export class ChallengeResponse extends BaseEntity {
  @PrimaryColumn()
  challengeId: string;

  @PrimaryColumn()
  userId: string;

  @Field(() => Number)
  @Column()
  reps: number;

  /*@Field(() => Date)
  @Column()
  date: Date;*/

  @ManyToOne(
    type => Challenge,
    challenge => challenge.responses,
    {
      primary: true,
      nullable: false
    }
  )
  @JoinColumn()
  challenge: Challenge

  @ManyToOne(
    type => User,
    user => user.challengeResponses,
    {
      primary: true,
      nullable: false
    }
  )
  @JoinColumn()
  user: User
}
