import { getRepository } from 'typeorm';

import Transaction from '../models/Transaction';
import AppError from '../errors/AppError';

interface Request {
  id: string;
}

class DeleteTransactionService {
  public async execute({ id }: Request): Promise<void> {
    const transactionsRepository = getRepository(Transaction);

    const transactionToDelete = await transactionsRepository.findOne(id);

    if (!transactionToDelete) {
      throw new AppError(
        "It's not possible to delete a transaction that does not exist.",
      );
    }

    await transactionsRepository.delete(id);
  }
}

export default DeleteTransactionService;
