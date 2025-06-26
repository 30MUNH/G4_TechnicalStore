import { Service } from "typedi";
import { Category } from "./category.entity";
import { Repository, getRepository } from "typeorm";

@Service()
export class CategoryService {
  private categoryRepository: Repository<Category>;

  constructor() {
    this.categoryRepository = getRepository(Category);
  }

  async getAllCategories(): Promise<Category[]> {
    return await this.categoryRepository.find({
      order: { name: "ASC" }
    });
  }

  async getCategoryBySlug(slug: string): Promise<Category | null> {
    return await this.categoryRepository.findOne({
      where: { slug }
    });
  }
}
