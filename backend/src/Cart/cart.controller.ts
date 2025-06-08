import { Body, BodyParam, Controller, Get, Patch, Post, Req, UseBefore } from "routing-controllers";
import { Service } from "typedi";
import { CartService } from "./cart.service";
import { AddToCartDto } from "./dtos/cart.dto";
import { Auth } from "@/middlewares/auth.middleware";
import { AccountDetailsDto } from "@/auth/dtos/account.dto";

@Service()
@Controller("/cart")
export class CartController {
    constructor(
        private readonly cartService: CartService
    ) {}

    @Post("/add")
    @UseBefore(Auth)
    async addToCart(
        @Req() req: any,
        @Body() addToCartDto: AddToCartDto
    ) {
        const user = req.user as AccountDetailsDto;
        try {
            const cart = await this.cartService.addToCart(user.username, addToCartDto);
            return {
                message: "Product added to cart successfully",
                cart
            };
        } catch (error: any) {
            return {
                message: "Failed to add product to cart",
                error: error.message
            };
        }
    }

    @Get("/view")
    @UseBefore(Auth)
    async viewCart(@Req() req: any) {
        const user = req.user as AccountDetailsDto;
        try {
            const cart = await this.cartService.viewCart(user.username);
            return {
                message: "Cart retrieved successfully",
                cart
            };
        } catch (error: any) {
            return {
                message: "Failed to retrieve cart",
                error: error.message
            };
        }
    }

    @Post("/increase")
    @UseBefore(Auth)
    async increaseQuantity(
        @Req() req: any,
        @BodyParam("productSlug") productSlug: string,
        @BodyParam("amount") amount: number = 1
    ) {
        const user = req.user as AccountDetailsDto;
        try {
            const cart = await this.cartService.increaseQuantity(user.username, productSlug, amount);
            return {
                message: "Product quantity increased successfully",
                cart
            };
        } catch (error: any) {
            return {
                message: "Failed to increase product quantity",
                error: error.message
            };
        }
    }

    @Post("/decrease")
    @UseBefore(Auth)
    async decreaseQuantity(
        @Req() req: any,
        @BodyParam("productSlug") productSlug: string,
        @BodyParam("amount") amount: number = 1
    ) {
        const user = req.user as AccountDetailsDto;
        try {
            const cart = await this.cartService.decreaseQuantity(user.username, productSlug, amount);
            return {
                message: "Product quantity decreased successfully",
                cart
            };
        } catch (error: any) {
            return {
                message: "Failed to decrease product quantity",
                error: error.message
            };
        }
    }

    @Patch("/remove")
    @UseBefore(Auth)
    async removeItem(
        @Req() req: any,
        @BodyParam("productSlug") productSlug: string,
    ) {
        const user = req.user as AccountDetailsDto;
        try {
            const cart = await this.cartService.removeItem(user.username, productSlug);
            return {
                message: "Product removed from cart successfully",
                cart
            };
        } catch (error: any) {
            return {
                message: "Failed to remove product from cart",
                error: error.message
            };
        }
    }
}
