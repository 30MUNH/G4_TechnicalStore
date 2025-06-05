export class CreateProductDto {
    name: string;
    code: string;
    categoryName: string;
    url?: string;
    active?: boolean;
}

export class UpdateProductDto {
    name?: string;
    code?: string;
    categoryName?: string;
    url?: string;
    active?: boolean;
}
