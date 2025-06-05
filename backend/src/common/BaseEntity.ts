import { Exclude } from 'class-transformer';
import {
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  BaseEntity as TypeORMBaseEntity,
  DeleteDateColumn,
} from 'typeorm';

export abstract class BaseEntity extends TypeORMBaseEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @CreateDateColumn({ type: 'timestamp with time zone', name: "created-at" })
  createdAt: Date;

  @UpdateDateColumn({ type: 'timestamp with time zone', name: "updated-at" })
  updatedAt: Date;

  @Exclude()
  @DeleteDateColumn({ type: 'timestamp with time zone', name: "deleted-at"})
  deletedAt?: Date;
}