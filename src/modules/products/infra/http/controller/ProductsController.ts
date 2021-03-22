import { Request, Response } from 'express';

import { container } from 'tsyringe';
import CreateProductService from '@modules/products/services/CreateProductService';

export default class ProductsController {
  public async create(request: Request, response: Response): Promise<Response> {
    const productsRepository = container.resolve(CreateProductService);
    const product = await productsRepository.execute(request.body);
    return response.status(201).json(product);
  }
}
