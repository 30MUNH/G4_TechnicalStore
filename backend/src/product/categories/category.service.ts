import { Service } from "typedi";
import { Category } from "./category.entity";
import { Repository } from "typeorm";
import { DbConnection } from "@/database/dbConnection";
import { CreateCategoryDto, UpdateCategoryDto } from "../dtos/category.dto";

@Service()
export class CategoryService {
  private categoryRepository: Repository<Category>;

  constructor() {
    this.initializeRepository();
  }

  private async initializeRepository() {
    const dataSource = await DbConnection.getConnection();
    if (!dataSource) {
      throw new Error("Database connection not available");
    }
    this.categoryRepository = dataSource.getRepository(Category);
  }

  async getAllCategories(): Promise<Category[]> {
    await this.ensureRepository();
    return await this.categoryRepository.find({
      order: { name: "ASC" }
    });
  }

  async getCategoryBySlug(slug: string): Promise<Category | null> {
    await this.ensureRepository();
    return await this.categoryRepository.findOne({
      where: { slug }
    });
  }

  async createCategory(createCategoryDto: CreateCategoryDto): Promise<Category> {
    await this.ensureRepository();
    const category = this.categoryRepository.create(createCategoryDto);
    return await this.categoryRepository.save(category);
  }

  async updateCategory(id: string, updateCategoryDto: UpdateCategoryDto): Promise<Category | null> {
    await this.ensureRepository();
    const category = await this.categoryRepository.findOne({
      where: { id }
    });

    if (!category) {
      return null;
    }

    Object.assign(category, updateCategoryDto);
    return await this.categoryRepository.save(category);
  }

  async deleteCategory(id: string): Promise<boolean> {
    await this.ensureRepository();
    const category = await this.categoryRepository.findOne({
      where: { id }
    });

    if (!category) {
      return false;
    }

    await this.categoryRepository.remove(category);
    return true;
  }

  private async ensureRepository() {
    if (!this.categoryRepository) {
      await this.initializeRepository();
    }
  }
}
