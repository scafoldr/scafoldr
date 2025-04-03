class BaseController {
    constructor(service) {
        this.service = service;
    }

    async getAll(req, res) {
        try {
            const data = await this.service.findAll();
            this.handleSuccess(res, data);
        } catch (error) {
            this.handleError(res, error);
        }
    }

    async getById(req, res) {
        try {
            const id = parseInt(req.params.id, 10);
            const data = await this.service.findById(id);
            this.handleSuccess(res, data);
        } catch (error) {
            this.handleError(res, error, error.message === 'Resource not found' ? 404 : 400);
        }
    }

    async create(req, res) {
        try {
            const data = await this.service.create(req.body);
            this.handleSuccess(res, data, 201);
        } catch (error) {
            this.handleError(res, error, 400);
        }
    }

    async update(req, res) {
        try {
            const id = parseInt(req.params.id, 10);
            const data = await this.service.update(id, req.body);
            this.handleSuccess(res, data);
        } catch (error) {
            this.handleError(res, error, error.message === 'Resource not found' ? 404 : 400);
        }
    }

    async delete(req, res) {
        try {
            const id = parseInt(req.params.id, 10);
            await this.service.delete(id);
            this.handleSuccess(res, { message: 'Deleted successfully' }, 200);
        } catch (error) {
            this.handleError(res, error, error.message === 'Resource not found' ? 404 : 400);
        }
    }

    handleSuccess(res, data, statusCode = 200) {
        res.status(statusCode).json(data);
    }

    handleError(res, error, statusCode = 500) {
        res.status(statusCode).json({ error: error.message || 'Internal server error' });
    }
}

module.exports = BaseController;