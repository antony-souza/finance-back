import { ConflictException, Injectable } from '@nestjs/common';
import { CreateSaleDto } from './dto/create-sale.dto';
import { SalesRepository } from 'src/repositories/sales.repository';

@Injectable()
export class SalesService {
  constructor(private readonly salesRepository: SalesRepository) {}

  async create(createSaleDto: CreateSaleDto) {
    const existingProduct = await this.salesRepository.findProductById(
      createSaleDto.product_id,
    );

    if (existingProduct.stock < createSaleDto.quantitySold) {
      throw new ConflictException('Product out of stock');
    }

    const totalBilled = createSaleDto.quantitySold * existingProduct.price;

    await this.salesRepository.updateStock(
      existingProduct.id,
      createSaleDto.quantitySold,
    );

    const createSales = await this.salesRepository.create({
      ...createSaleDto,
      totalBilled: totalBilled,
    });

    return createSales;
  }
}
