import { FilterQuery, Query, Model } from 'mongoose';
import { number } from 'zod';


class QueryBuilder<T> {
  public modelQuery: Query<T[], T>;
  public query: Record<string, unknown>;

  constructor(modelQuery: Query<T[], T>, query: Record<string, unknown>) {
    this.modelQuery = modelQuery;
    this.query = query;
  }

  search(searchableFields: string[]) {
    const searchTerm = this?.query?.searchTerm;
    if (searchTerm) {
      this.modelQuery = this.modelQuery.find({
        $or: searchableFields.map((field) => ({
          [field]: { $regex: searchTerm, $options: 'i' },
        })),
      } as FilterQuery<T>);
    }
    return this;
  }

  filter() {
    const queryObject = { ...this.query };
    const excludeField = ['searchTerm', 'sort', 'limit', 'page', 'fields'];
    excludeField.forEach((field) => delete queryObject[field]);
    this.modelQuery = this.modelQuery.find(queryObject as FilterQuery<T>);
    return this;
  }

  sort() {
    const sort = (this?.query?.sort as string)?.split(',').join(' ');
    if (sort) {
      this.modelQuery = this.modelQuery.sort(sort);
    } else {
      this.modelQuery = this.modelQuery.sort('-createdAt');
    }
    return this;
  }

  pagination() {
    let page = 1;
    let skip = 0;
    let limit: number | undefined = undefined;

    if (this?.query?.limit) {
      limit = Number(this.query?.limit);
      if (limit < 0) limit = undefined;
    }
    if (this?.query?.page && limit !== undefined && limit > 0) {
      page = Number(this?.query?.page);
      if (page < 1) page = 1;
      skip = (page - 1) * limit;
      this.modelQuery = this.modelQuery.skip(skip);
    }

    if (limit !== undefined && limit > 0) {
      this.modelQuery = this.modelQuery.limit(limit);
    }

    return this;
  }

  fields() {
    let fields = '-__v';
    if (this.query?.fields) {
      fields = (this.query?.fields as string).split(',').join(' ');
    }
    this.modelQuery = this.modelQuery.select(fields);
    return this;
  }

  async countTotal() {
    const totalQueries = this.modelQuery.getFilter();
    const total = await this.modelQuery.model.countDocuments(totalQueries);
    const page = Number(this?.query?.page) || 1;
    const limit = Number(this?.query?.limit) || undefined;
    const totalPage = limit && limit > 0 ? Math.ceil(total / limit) : 1;
    return {
      page,
      limit,
      total,
      totalPage,
    };
  }
}

export default QueryBuilder