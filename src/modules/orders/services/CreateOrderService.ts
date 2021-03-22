import { inject, injectable } from 'tsyringe';

import AppError from '@shared/errors/AppError';

import IProductsRepository from '@modules/products/repositories/IProductsRepository';
import ICustomersRepository from '@modules/customers/repositories/ICustomersRepository';
import Order from '../infra/typeorm/entities/Order';
import IOrdersRepository from '../repositories/IOrdersRepository';

interface IProduct {
  id: string;
  quantity: number;
}

interface IRequest {
  customer_id: string;
  products: IProduct[];
}

@injectable()
class CreateOrderService {
  constructor(
    @inject('OrdersRepository')
    private ordersRepository: IOrdersRepository,
    @inject('ProductsRepository')
    private productsRepository: IProductsRepository,
    @inject('CustomersRepository')
    private customersRepository: ICustomersRepository,
  ) {}

  public async execute({ customer_id, products }: IRequest): Promise<Order> {
    // Customer
    const customer = await this.customersRepository.findById(customer_id);
    if (!customer) throw new AppError('Customer not found');

    // Products
    const productsFound = await this.productsRepository.findAllById(products);
    // Checking for invalid product
    const invalidProducts = products.filter(
      prod => !productsFound.map(p => p.id).includes(prod.id),
    );
    if (invalidProducts.length) throw new AppError('Invalid products found');

    const mappedProducts = productsFound.map(prod => {
      const product = products.find(p => p.id === prod.id);
      if (!product) throw new AppError('Products not found');
      if (prod.quantity < product.quantity)
        throw new AppError('Insufficient products');

      return {
        product_id: prod.id,
        price: prod.price,
        quantity: product.quantity,
        leftQuantity: prod.quantity - product.quantity,
      };
    });

    // updating quantity
    await this.productsRepository.updateQuantity(
      mappedProducts.map(prod => ({
        id: prod.product_id,
        quantity: prod.leftQuantity,
      })),
    );

    const order = await this.ordersRepository.create({
      customer,
      products: mappedProducts,
    });

    return order;
  }
}

export default CreateOrderService;
