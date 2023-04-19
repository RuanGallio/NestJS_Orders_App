import { Logger, NotFoundException } from '@nestjs/common';
import {
  FilterQuery,
  Model,
  Types,
  UpdateQuery,
  SaveOptions,
  Connection,
  ClientSession,
} from 'mongoose';
import { AbstractDocument } from './abstract.schema';

export abstract class AbstractRepository<TDocument extends AbstractDocument> {
  protected abstract readonly logger: Logger;

  constructor(
    protected readonly model: Model<TDocument>,
    protected readonly connection: Connection,
  ) {}

  async create(
    document: Omit<TDocument, '_id'>,
    options?: SaveOptions,
  ): Promise<TDocument> {
    const createdDocument = new this.model({
      ...document,
      _id: new Types.ObjectId(),
    });

    return (
      await createdDocument.save(options)
    ).toJSON() as unknown as TDocument;
  }

  async findOne(filterQuery: FilterQuery<TDocument>): Promise<TDocument> {
    const document = await this.model.findOne(filterQuery, {}, { lean: true });
    if (!document) {
      this.logger.warn(
        `Document not found with filterQuery: ${JSON.stringify(filterQuery)}`,
      );
      throw new NotFoundException('Document not found');
    }

    return document;
  }

  async findeOneAndUpdate(
    filterQuery: FilterQuery<TDocument>,
    updateQuery: UpdateQuery<TDocument>,
  ): Promise<TDocument> {
    const document = await this.model.findOneAndUpdate(
      filterQuery,
      updateQuery,
      {
        lean: true,
        new: true,
      },
    );

    if (!document) {
      this.logger.warn(
        `Document not found with filterQuery: ${JSON.stringify(filterQuery)}`,
      );
      throw new NotFoundException('Document not found');
    }

    return document;
  }

  async upsert(
    filterQuery: FilterQuery<TDocument>,
    document: Partial<TDocument>,
  ): Promise<TDocument> {
    const upsertDocument = await this.model.findOneAndUpdate(
      filterQuery,
      document,
      {
        lean: true,
        new: true,
        upsert: true,
      },
    );

    if (!upsertDocument) {
      this.logger.warn(
        `Document not found with filterQuery: ${JSON.stringify(filterQuery)}`,
      );
      throw new NotFoundException('Document not found');
    }

    return upsertDocument;
  }

  async find(filterQuery: FilterQuery<TDocument>): Promise<TDocument[]> {
    const documents = await this.model.find(filterQuery, {}, { lean: true });
    return documents;
  }

  async startTransaction(): Promise<ClientSession> {
    const session = await this.connection.startSession();
    session.startTransaction();
    return session;
  }
}
