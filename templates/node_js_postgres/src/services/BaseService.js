class BaseService {
    constructor(repository) {
        this.repository = repository;
    }

    async findAll(options = {}) {
        return this.repository.findAll(options);
    }

    async findById(id) {
        this.validateId(id);
        const entity = await this.repository.findById(id);
        if (!entity) {
            throw new Error('Resource not found');
        }
        return entity;
    }

    async create(data) {
        return this.repository.create(data);
    }

    async update(id, data) {
        this.validateId(id);
        const entity = await this.repository.update(id, data);
        if (!entity) {
            throw new Error('Resource not found');
        }
        return entity;
    }

    async delete(id) {
        this.validateId(id);
        const entity = await this.repository.delete(id);
        if (!entity) {
            throw new Error('Resource not found');
        }
        return entity;
    }

    validateId(id) {
        if (!id || typeof id !== 'number') {
            throw new Error('Invalid ID provided');
        }
    }

    handleServiceError(error) {
        throw error;
    }
}

module.exports = BaseService;