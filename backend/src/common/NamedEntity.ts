import { AfterLoad, BeforeInsert, BeforeUpdate, Column } from "typeorm";
import { BaseEntity } from "./BaseEntity";
import { Exclude } from "class-transformer";

export abstract class NamedEntity extends BaseEntity {
  @Column({ type: "varchar", length: 255, nullable: true })
  name?: string;

  @Column({ type: "varchar", length: 255, unique: true, nullable: true })
  slug?: string;

  //slugify names
  @Exclude()
  private previousName?: string;

  @AfterLoad()
  loadPreviousName() {
    this.previousName = this.name;
  }

  @BeforeInsert()
  @BeforeUpdate()
  generateSlug() {
    if (this.name && this.name !== this.previousName) {
      const baseSlug = slugify(this.name);
      const salt = randomSalt();
      this.slug = `${baseSlug}-${salt}`;
    }
  }
}

function slugify(text: string): string {
  return text
    .toString()
    .toLowerCase()
    .trim()
    .replace(/\s+/g, "-")
    .replace(/[^\w\-]+/g, "")
    .replace(/\-\-+/g, "-")
    .replace(/^-+/, "")
    .replace(/-+$/, "");
}

function randomSalt(length = 7): string {
  const chars =
    "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
  let result = "";
  for (let i = 0; i < length; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}
