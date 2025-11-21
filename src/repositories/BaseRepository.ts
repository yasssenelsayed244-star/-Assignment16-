import { Model, Document, FilterQuery, UpdateQuery, QueryOptions } from "mongoose";

export abstract class BaseRepository<T extends Document> {
  protected model: Model<T>;

  constructor(model: Model<T>) {
    this.model = model;
  }

  async create(data: Partial<T>): Promise<T> {
    const doc = await this.model.create(data);
    return doc;
  }

  async findById(id: string): Promise<T | null> {
    return await this.model.findById(id).exec();
  }

  async findOne(filter: FilterQuery<T>): Promise<T | null> {
    return await this.model.findOne(filter).exec();
  }

  async find(filter: FilterQuery<T> = {}): Promise<T[]> {
    return await this.model.find(filter).exec();
  }

  async findWithPopulate(
    filter: FilterQuery<T> = {},
    populateFields: string | string[]
  ): Promise<T[]> {
    return await this.model.find(filter).populate(populateFields).exec();
  }

  async update(
    id: string,
    data: UpdateQuery<T>,
    options: QueryOptions = { new: true }
  ): Promise<T | null> {
    return await this.model.findByIdAndUpdate(id, data, options).exec();
  }

  async updateOne(
    filter: FilterQuery<T>,
    data: UpdateQuery<T>,
    options: QueryOptions = { new: true }
  ): Promise<T | null> {
    return await this.model.findOneAndUpdate(filter, data, options).exec();
  }

  async delete(id: string): Promise<T | null> {
    return await this.model.findByIdAndDelete(id).exec();
  }

  async deleteOne(filter: FilterQuery<T>): Promise<T | null> {
    return await this.model.findOneAndDelete(filter).exec();
  }

  async count(filter: FilterQuery<T> = {}): Promise<number> {
    return await this.model.countDocuments(filter).exec();
  }

  async exists(filter: FilterQuery<T>): Promise<boolean> {
    const doc = await this.model.exists(filter);
    return !!doc;
  }
}