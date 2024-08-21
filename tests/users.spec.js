const request = require('supertest');
const { validate } = require('uuid');

const app = require('../');

describe('Users', () => {
    it('should be able to create a new user', async () => {
        const response = await request(app)
            .post('/users')
            .send({
                name: 'Mariana Lara',
                username: 'larads'
            })
        expect(201);

        expect(validate(response.body.id)).toBe(true);

        expect(response.body).toMatchObject({
            name: 'Mariana Lara',
            username: 'larads',
            todos: []
        });
    });

    it('should not be able to create a new user when username already exists', async () => {
        await request(app)
            .post('/users')
            .send({
                name: 'Mariana Lara',
                username: 'larads'
            });

        const response = await request(app)
            .post('/users')
            .send({
                name: 'Mariana Lara',
                username: 'larads'
            })
            .expect(400);

        expect(response.body.error).toBeTruthy();
    });
});