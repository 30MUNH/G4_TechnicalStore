import { Service } from "typedi";
import { Product } from "./product.entity";
import { Category } from "./categories/category.entity";
import { Repository, getRepository } from "typeorm";

@Service()
export class ProductService {
  private productRepository: Repository<Product>;
  private categoryRepository: Repository<Category>;

  constructor() {
    this.productRepository = getRepository(Product);
    this.categoryRepository = getRepository(Category);
  }

  async getAllProducts(): Promise<Product[]> {
    return await this.productRepository.find({
      where: { isActive: true },
      relations: ["category"],
      order: { createdAt: "DESC" }
    });
  }

  async getNewProducts(limit: number = 8): Promise<Product[]> {
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
    return await this.productRepository.find({
      where: { isActive: true },
      relations: ["category"],
      order: { stock: "DESC" },
      take: limit
    });
  }

  async getProductsByCategory(categorySlug: string): Promise<Product[]> {
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
    return await this.productRepository.findOne({
      where: { id, isActive: true },
      relations: ["category"]
    });
  }

  async getProductBySlug(slug: string): Promise<Product | null> {
    return await this.productRepository.findOne({
      where: { slug, isActive: true },
      relations: ["category"]
    });
  }
} 