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

  @Field(() => Date)
  @Column()
  createdAt: Date;

  // TODO: these aren't nullable, but I'm too lazy to drop the db
  @Field(() => Number)
  @Column({ nullable: true, type: "real" })
  flex: number;

  @Field(() => Number)
  @Column({ nullable: true, type: "real" })
  rank: number;

  @Field(() => Number)
  @Column({ nullable: true, type: "real"})
  gains: number;

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
