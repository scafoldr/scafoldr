class BaseRepository {
    constructor(model) {
        this.model = model;
    }

    async findAll(options = {}) {
        return this.model.findAll(options);
    }

    async findById(id) {
        return this.model.findByPk(id);
    }

    async create(data) {
        return this.model.create(data);
    }

    async update(id, data) {
        const entity = await this.findById(id);
        if (!entity) return null;
        return entity.update(data);
    }

    async delete(id) {
        const entity = await this.findById(id);
        if (!entity) return null;
        await entity.destroy();
        return entity;
    }
}

module.exports = BaseRepository;