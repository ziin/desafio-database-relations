import { inject, injectable } from 'tsyringe';

import AppError from '@shared/errors/AppError';

import Product from '../infra/typeorm/entities/Product';
import IProductsRepository from '../repositories/IProductsRepository';

interface IRequest {
  name: string;
  price: number;
  quantity: number;
}

@injectable()
class CreateProductService {
  constructor(
    @inject('ProductsRepository')
    private productsRepository: IProductsRepository,
  ) {}

  public async execute({ name, price, quantity }: IRequest): Promise<Product> {
    const existent = await this.productsRepository.findByName(name);
    if (existent) throw new AppError('A product with the same already exists');
    const productCreated = await this.productsRepository.create({
      name,
      price,
      quantity,
    });
    return productCreated;
  }
}

export default CreateProductService;
