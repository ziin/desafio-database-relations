import { Request, Response } from 'express';

import { container } from 'tsyringe';

import CreateOrderService from '@modules/orders/services/CreateOrderService';
import FindOrderService from '@modules/orders/services/FindOrderService';

export default class OrdersController {
  public async show(request: Request, response: Response): Promise<Response> {
    const { id } = request.params;
    const order = await container.resolve(FindOrderService).execute({ id });
    return response.status(200).json(order);
  }

  public async create(request: Request, response: Response): Promise<Response> {
    const order = await container
      .resolve(CreateOrderService)
      .execute(request.body);
    return response.status(201).json(order);
  }
}
