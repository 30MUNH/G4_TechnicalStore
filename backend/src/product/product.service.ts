import { Service } from "typedi";
import { Product } from "./product.entity";
import { Category } from "./categories/category.entity";
import { Repository } from "typeorm";
import { DbConnection } from "@/database/dbConnection";
import { CreateProductDto, UpdateProductDto } from "./dtos/product.dto";

@Service()
export class ProductService {
  private productRepository: Repository<Product>;
  private categoryRepository: Repository<Category>;

  constructor() {
    this.initializeRepositories();
  }

  private async initializeRepositories() {
    const dataSource = await DbConnection.getConnection();
    if (!dataSource) {
      throw new Error("Database connection not available");
    }
    this.productRepository = dataSource.getRepository(Product);
    this.categoryRepository = dataSource.getRepository(Category);
  }

  async getAllProducts(): Promise<Product[]> {
    await this.ensureRepositories();
    return await this.productRepository.find({
      where: { isActive: true },
      relations: ["category"],
      order: { createdAt: "DESC" }
    });
  }

  async getNewProducts(limit: number = 8): Promise<Product[]> {
    await this.ensureRepositories();
    return await this.productRepository.find({
      where: { isActive: true },
      relations: ["category"],
      order: { createdAt: "DESC" },
      take: limit
    });
  }

  async getTopSellingProducts(limit: number = 6): Promise<Product[]> {
    // For now, return products with highest stock (as a proxy for popularity)
    // In a real application, this would be based on actual sales data
    await this.ensureRepositories();
    return await this.productRepository.find({
      where: { isActive: true },
      relations: ["category"],
      order: { stock: "DESC" },
      take: limit
    });
  }

  async getProductsByCategory(categorySlug: string): Promise<Product[]> {
    await this.ensureRepositories();
    const category = await this.categoryRepository.findOne({
      where: { slug: categorySlug }
    });

    if (!category) {
      return [];
    }

    return await this.productRepository.find({
      where: { 
        isActive: true,
        categoryId: category.id
      },
      relations: ["category"],
      order: { createdAt: "DESC" }
    });
  }

  async getProductById(id: string): Promise<Product | null> {
    await this.ensureRepositories();
    return await this.productRepository.findOne({
      where: { id, isActive: true },
      relations: ["category"]
    });
  }

  async getProductBySlug(slug: string): Promise<Product | null> {
    await this.ensureRepositories();
    return await this.productRepository.findOne({
      where: { slug, isActive: true },
      relations: ["category"]
    });
  }

  async createProduct(createProductDto: CreateProductDto): Promise<Product> {
    await this.ensureRepositories();
    const product = this.productRepository.create(createProductDto);
    return await this.productRepository.save(product);
  }

  async updateProduct(id: string, updateProductDto: UpdateProductDto): Promise<Product | null> {
    await this.ensureRepositories();
    const product = await this.productRepository.findOne({
      where: { id, isActive: true }
    });

    if (!product) {
      return null;
    }

    Object.assign(product, updateProductDto);
    return await this.productRepository.save(product);
  }

  async deleteProduct(id: string): Promise<boolean> {
    await this.ensureRepositories();
    const product = await this.productRepository.findOne({
      where: { id, isActive: true }
    });

    if (!product) {
      return false;
    }

    product.isActive = false;
    await this.productRepository.save(product);
    return true;
  }

  private async ensureRepositories() {
    if (!this.productRepository || !this.categoryRepository) {
      await this.initializeRepositories();
    }
  }
} 