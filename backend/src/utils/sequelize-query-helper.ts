import { Op, Order } from 'sequelize';

/**
 * Transforms MongoDB-style query objects to Sequelize where clauses.
 */
export function parseWhere(query: any): any {
    if (!query || typeof query !== 'object') return query;

    if (query instanceof RegExp) {
        return { [Op.iLike]: `%${query.source.replace(/\\/g, '')}%` };
    }

    if (Array.isArray(query)) {
        return query.map(parseWhere);
    }

    const parsed: Record<any, any> = {};

    for (const [key, value] of Object.entries(query)) {
        let targetKey: any = key;

        // Map _id to id
        if (key === '_id') {
            targetKey = 'id';
        } else if (key === '$or') {
            targetKey = Op.or;
        } else if (key === '$and') {
            targetKey = Op.and;
        } else if (key === '$in') {
            targetKey = Op.in;
        } else if (key === '$gte') {
            targetKey = Op.gte;
        } else if (key === '$lte') {
            targetKey = Op.lte;
        } else if (key === '$gt') {
            targetKey = Op.gt;
        } else if (key === '$lt') {
            targetKey = Op.lt;
        } else if (key === '$ne') {
            targetKey = Op.ne;
        }

        if (value instanceof RegExp) {
            parsed[targetKey] = { [Op.iLike]: `%${value.source.replace(/\\/g, '')}%` };
        } else if (value && typeof value === 'object' && !Array.isArray(value) && !(value instanceof Date)) {
            // Nested operators like { status: { $in: [...] } }
            const nested: any = {};
            for (const [nKey, nVal] of Object.entries(value)) {
                if (nKey === '$in') nested[Op.in] = nVal;
                else if (nKey === '$gte') nested[Op.gte] = nVal;
                else if (nKey === '$lte') nested[Op.lte] = nVal;
                else if (nKey === '$gt') nested[Op.gt] = nVal;
                else if (nKey === '$lt') nested[Op.lt] = nVal;
                else if (nKey === '$ne') nested[Op.ne] = nVal;
                else if (nKey === '$regex') nested[Op.iLike] = `%${nVal}%`;
                else nested[nKey] = parseWhere(nVal);
            }
            parsed[targetKey] = nested;
        } else if (Array.isArray(value)) {
            parsed[targetKey] = value.map(parseWhere);
        } else {
            parsed[targetKey] = value;
        }
    }

    return parsed;
}

/**
 * Transforms MongoDB-style sort objects to Sequelize order options.
 */
export function parseSort(sort: any): Order {
    if (!sort) return [['createdAt', 'DESC']];

    const order: Order = [];
    if (typeof sort === 'object' && !Array.isArray(sort)) {
        for (const [key, val] of Object.entries(sort)) {
            const field = key === '_id' ? 'id' : key;
            const dir = val === 1 || val === 'asc' || val === 'ASC' ? 'ASC' : 'DESC';
            order.push([field, dir]);
        }
    } else if (typeof sort === 'string') {
        const parts = sort.trim().split(/\s+/);
        for (const p of parts) {
            if (p.startsWith('-')) {
                const f = p.substring(1) === '_id' ? 'id' : p.substring(1);
                order.push([f, 'DESC']);
            } else {
                const f = p === '_id' ? 'id' : p;
                order.push([f, 'ASC']);
            }
        }
    }
    return order.length > 0 ? order : [['createdAt', 'DESC']];
}

/**
 * Attaches _id getter/property to Sequelize model instances or plain objects.
 */
export function enrichWithId(item: any): any {
    if (!item) return item;
    if (Array.isArray(item)) {
        return item.map(enrichWithId);
    }
    if (typeof item === 'object') {
        const plain = typeof item.toJSON === 'function' ? item.toJSON() : { ...item };
        if (plain.id !== undefined && plain._id === undefined) {
            plain._id = plain.id;
        }

        // If populated user is attached, format it for frontend expectation
        if (plain.user) {
            const userObj = typeof plain.user.toJSON === 'function' ? plain.user.toJSON() : { ...plain.user };
            userObj._id = userObj.id;
            plain.userId = userObj;
            delete plain.user;
        }

        // Preserve methods like save(), update(), toJSON() on instance
        if (typeof item.update === 'function') {
            plain.save = item.save ? item.save.bind(item) : undefined;
            plain.update = item.update.bind(item);
            plain.destroy = item.destroy ? item.destroy.bind(item) : undefined;
            plain.toJSON = () => ({ ...plain });
        }

        return plain;
    }
    return item;
}

/**
 * A fluent thenable QueryChain implementing full Promise<T> interface.
 */
export class SequelizeQueryChain<T = any> implements Promise<T> {
    readonly [Symbol.toStringTag]: string = 'SequelizeQueryChain';
    private queryOptions: any = {};
    private executor: (options: any) => Promise<T>;

    constructor(executor: (options: any) => Promise<T>, initialWhere: any = {}) {
        this.executor = executor;
        if (initialWhere && Object.keys(initialWhere).length > 0) {
            this.queryOptions.where = parseWhere(initialWhere);
        }
    }

    where(additionalWhere: any): this {
        this.queryOptions.where = {
            ...this.queryOptions.where,
            ...parseWhere(additionalWhere),
        };
        return this;
    }

    sort(sort: any): this {
        this.queryOptions.order = parseSort(sort);
        return this;
    }

    skip(offset: number): this {
        this.queryOptions.offset = Number(offset) || 0;
        return this;
    }

    limit(limit: number): this {
        this.queryOptions.limit = Number(limit) || 0;
        return this;
    }

    select(fields: string | string[]): this {
        let fieldList: string[] = [];
        if (typeof fields === 'string') {
            fieldList = fields.split(/\s+/).filter(Boolean);
        } else if (Array.isArray(fields)) {
            fieldList = fields;
        }

        const exclude: string[] = [];
        const include: string[] = [];

        fieldList.forEach((f) => {
            if (f.startsWith('-')) {
                exclude.push(f.substring(1));
            } else {
                include.push(f === '_id' ? 'id' : f);
            }
        });

        if (include.length > 0) {
            this.queryOptions.attributes = include;
        } else if (exclude.length > 0) {
            this.queryOptions.attributes = { exclude };
        }
        return this;
    }

    populate(field: string, _selectFields?: string): this {
        if (field === 'userId') {
            this.queryOptions.include = [
                {
                    association: 'user',
                    attributes: ['id', 'name', 'email'],
                    required: false,
                },
            ];
        }
        return this;
    }

    lean(): this {
        // Plain objects with _id are enriched by default
        return this;
    }

    async exec(): Promise<T> {
        return await this.executor(this.queryOptions);
    }

    then<TResult1 = T, TResult2 = never>(
        onfulfilled?: ((value: T) => TResult1 | PromiseLike<TResult1>) | null,
        onrejected?: ((reason: any) => TResult2 | PromiseLike<TResult2>) | null
    ): Promise<TResult1 | TResult2> {
        return this.exec().then(onfulfilled, onrejected);
    }

    catch<TResult = never>(
        onrejected?: ((reason: any) => TResult | PromiseLike<TResult>) | null
    ): Promise<T | TResult> {
        return this.exec().catch(onrejected);
    }

    finally(onfinally?: (() => void) | null): Promise<T> {
        return this.exec().finally(onfinally);
    }
}

/**
 * Creates a model adapter that wraps a Sequelize model with MongoDB/Mongoose-compatible API.
 */
export function createModelAdapter<TInstance extends any = any>(SequelizeModel: any): any {
    const adapter: any = function (values?: any, options?: any) {
        const instance = SequelizeModel.build(values, options);
        return instance;
    };

    // Forward prototype and static members
    Object.setPrototypeOf(adapter, SequelizeModel);
    Object.assign(adapter, SequelizeModel);

    adapter.find = function (query?: any): SequelizeQueryChain<TInstance[]> {
        return new SequelizeQueryChain<TInstance[]>(async (opts) => {
            const records = await SequelizeModel.findAll(opts);
            return enrichWithId(records);
        }, query);
    };

    adapter.findOne = function (query?: any): SequelizeQueryChain<TInstance | null> {
        return new SequelizeQueryChain<TInstance | null>(async (opts) => {
            const record = await SequelizeModel.findOne(opts);
            return record ? enrichWithId(record) : null;
        }, query);
    };

    adapter.findById = function (id: string | any): SequelizeQueryChain<TInstance | null> {
        const targetId = typeof id === 'object' && id?._id ? id._id : String(id || '');
        return new SequelizeQueryChain<TInstance | null>(async (opts) => {
            if (!targetId) return null;
            const record = await SequelizeModel.findByPk(targetId, opts);
            return record ? enrichWithId(record) : null;
        }, { id: targetId });
    };

    adapter.findByIdAndUpdate = async function (id: string | any, updateData: any, _options?: any): Promise<TInstance | null> {
        const targetId = typeof id === 'object' && id?._id ? id._id : String(id || '');
        if (!targetId) return null;
        const record = await SequelizeModel.findByPk(targetId);
        if (!record) return null;
        await record.update(updateData);
        return enrichWithId(record);
    };

    adapter.findOneAndUpdate = async function (
        query: any,
        updateData: any,
        options?: { upsert?: boolean; new?: boolean }
    ): Promise<TInstance | null> {
        const where = parseWhere(query);
        let record = await SequelizeModel.findOne({ where });

        if (!record) {
            if (options?.upsert) {
                const combinedData: any = { ...where };
                if (updateData.$setOnInsert) Object.assign(combinedData, updateData.$setOnInsert);
                if (updateData.$set) Object.assign(combinedData, updateData.$set);
                for (const [k, v] of Object.entries(updateData)) {
                    if (!k.startsWith('$')) combinedData[k] = v;
                }
                const created = await SequelizeModel.create(combinedData);
                return enrichWithId(created);
            }
            return null;
        }

        const dataToUpdate: any = {};
        if (updateData.$set) Object.assign(dataToUpdate, updateData.$set);
        for (const [k, v] of Object.entries(updateData)) {
            if (!k.startsWith('$')) dataToUpdate[k] = v;
        }
        await record.update(dataToUpdate);
        return enrichWithId(record);
    };

    adapter.findByIdAndDelete = async function (id: string | any): Promise<TInstance | null> {
        const targetId = typeof id === 'object' && id?._id ? id._id : String(id || '');
        if (!targetId) return null;
        const record = await SequelizeModel.findByPk(targetId);
        if (!record) return null;
        await record.destroy();
        return enrichWithId(record);
    };

    adapter.findOneAndDelete = async function (query: any): Promise<TInstance | null> {
        const where = parseWhere(query);
        const record = await SequelizeModel.findOne({ where });
        if (!record) return null;
        await record.destroy();
        return enrichWithId(record);
    };

    adapter.countDocuments = async function (query?: any): Promise<number> {
        const where = parseWhere(query);
        return await SequelizeModel.count({ where });
    };

    adapter.insertMany = async function (items: any[]): Promise<TInstance[]> {
        const created = await SequelizeModel.bulkCreate(items);
        return enrichWithId(created);
    };

    adapter.create = async function (values: any): Promise<TInstance> {
        const created = await SequelizeModel.create(values);
        return enrichWithId(created);
    };

    return adapter;
}
