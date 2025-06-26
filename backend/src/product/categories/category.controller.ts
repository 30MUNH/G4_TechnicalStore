import { Controller, Get, Post, Put, Delete, Param, Body } from "routing-controllers";
import { CategoryService } from "./category.service";
import { Container } from "typedi";
import { CreateCategoryDto, UpdateCategoryDto } from "../dtos/category.dto";

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

  @Get("/:slug")
  async getCategoryBySlug(@Param("slug") slug: string) {
    try {
      const category = await this.categoryService.getCategoryBySlug(slug);
      if (!category) {
        return {
          success: false,
          message: "Category not found"
        };
      }
      return {
        success: true,
        data: category,
        message: "Category retrieved successfully"
      };
    } catch (error: any) {
      return {
        success: false,
        message: "Failed to retrieve category",
        error: error.message || "Unknown error"
      };
    }
  }

  @Post("/")
  async createCategory(@Body() createCategoryDto: CreateCategoryDto) {
    try {
      const category = await this.categoryService.createCategory(createCategoryDto);
      return {
        success: true,
        data: category,
        message: "Category created successfully"
      };
    } catch (error: any) {
      return {
        success: false,
        message: "Failed to create category",
        error: error.message || "Unknown error"
      };
    }
  }

  @Put("/:id")
  async updateCategory(
    @Param("id") id: string,
    @Body() updateCategoryDto: UpdateCategoryDto
  ) {
    try {
      const category = await this.categoryService.updateCategory(id, updateCategoryDto);
      if (!category) {
        return {
          success: false,
          message: "Category not found"
        };
      }
      return {
        success: true,
        data: category,
        message: "Category updated successfully"
      };
    } catch (error: any) {
      return {
        success: false,
        message: "Failed to update category",
        error: error.message || "Unknown error"
      };
    }
  }

  @Delete("/:id")
  async deleteCategory(@Param("id") id: string) {
    try {
      const result = await this.categoryService.deleteCategory(id);
      if (!result) {
        return {
          success: false,
          message: "Category not found"
        };
      }
      return {
        success: true,
        message: "Category deleted successfully"
      };
    } catch (error: any) {
      return {
        success: false,
        message: "Failed to delete category",
        error: error.message || "Unknown error"
      };
    }
  }
}
