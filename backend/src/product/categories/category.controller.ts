import { Controller, Get } from "routing-controllers";
import { CategoryService } from "./category.service";
import { Container } from "typedi";

@Controller("/categories")
export class CategoryController {
  private categoryService: CategoryService;

  constructor() {
    this.categoryService = Container.get(CategoryService);
  }

  @Get("/")
  async getAllCategories() {
    try {
      const categories = await this.categoryService.getAllCategories();
      return {
        success: true,
        data: categories,
        message: "Categories retrieved successfully"
      };
    } catch (error: any) {
      return {
        success: false,
        message: "Failed to retrieve categories",
        error: error.message || "Unknown error"
      };
    }
  }
}
