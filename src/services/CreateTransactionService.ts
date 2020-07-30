import { getRepository, getCustomRepository } from 'typeorm';

import AppError from '../errors/AppError';

import Transaction from '../models/Transaction';
import Category from '../models/Category';

import TransactionsRepository from '../repositories/TransactionsRepository';

interface Request {
  title: string;
  value: number;
  type: string;
  category: string;
}

class CreateTransactionService {
  public async execute({
    title,
    value,
    type,
    category,
  }: Request): Promise<Transaction> {
    if (!title || !value || !type || !category) {
      throw new AppError('Missing information to create a transaction.');
    }

    if (type !== 'income' && type !== 'outcome') {
      throw new AppError("Type must be 'income' or 'outcome'.");
    }

    const customTransactionsRepository = getCustomRepository(
      TransactionsRepository,
    );

    const { total } = await customTransactionsRepository.getBalance();

    if (type === 'outcome' && value > total) {
      throw new AppError(`Can't spend more than you have`);
    }

    const categoriesRepository = getRepository(Category);

    let transactionCategory = await categoriesRepository.findOne({
      where: { title: category },
    });

    if (!transactionCategory) {
      transactionCategory = await categoriesRepository.create({
        title: category,
      });

      await categoriesRepository.save(transactionCategory);
    }

    const transaction = await customTransactionsRepository.create({
      title,
      value,
      type,
      category: transactionCategory,
    });

    await customTransactionsRepository.save(transaction);

    return transaction;
  }
}

export default CreateTransactionService;
