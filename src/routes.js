import { randomUUID } from 'node:crypto';
import { Database } from './database.js';
import { buildRoutePath } from './utils/build-route-path.js';

const database = new Database();

const sendResponse = (res, statusCode, data = null) => {
    res.writeHead(statusCode, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify(data));
};

const handleValidationErrors = (data, requiredFields) => {
    const errors = requiredFields.filter(field => !data[field]).map(field => `${field} is required`);
    return errors.length ? { message: errors.join(', ') } : null;
};

const createTaskHandler = (req, res) => {
    const { title, description } = req.body;

    const validationError = handleValidationErrors({ title, description }, ['title', 'description']);
    if (validationError) {
        return sendResponse(res, 400, validationError);
    }

    const task = {
        id: randomUUID(),
        title,
        description,
        completed_at: null,
        created_at: new Date(),
        updated_at: new Date(),
    };

    database.insert('tasks', task);
    sendResponse(res, 201);
};

const getTasksHandler = (req, res) => {
    const { search } = req.query;
    const tasks = database.select('tasks', { title: search, description: search });
    sendResponse(res, 200, tasks);
};

const updateTaskHandler = (req, res) => {
    const { id } = req.params;
    const { title, description } = req.body;

    const validationError = handleValidationErrors({ title, description }, ['title', 'description']);
    if (validationError) {
        return sendResponse(res, 400, validationError);
    }

    const [task] = database.select('tasks', { id });
    if (!task) {
        return sendResponse(res, 404);
    }

    database.update('tasks', id, { title, description, updated_at: new Date() });
    sendResponse(res, 204);
};

const deleteTaskHandler = (req, res) => {
    const { id } = req.params;
    const [task] = database.select('tasks', { id });

    if (!task) {
        return sendResponse(res, 404);
    }

    database.delete('tasks', id);
    sendResponse(res, 204);
};

const toggleTaskCompletionHandler = (req, res) => {
    const { id } = req.params;
    const [task] = database.select('tasks', { id });

    if (!task) {
        return sendResponse(res, 404);
    }

    const isTaskCompleted = !!task.completed_at;
    const completed_at = isTaskCompleted ? null : new Date();

    database.update('tasks', id, { completed_at });
    sendResponse(res, 204);
};

export const routes = [
    {
        method: 'POST',
        path: buildRoutePath('/tasks'),
        handler: createTaskHandler,
    },
    {
        method: 'GET',
        path: buildRoutePath('/tasks'),
        handler: getTasksHandler,
    },
    {
        method: 'PUT',
        path: buildRoutePath('/tasks/:id'),
        handler: updateTaskHandler,
    },
    {
        method: 'DELETE',
        path: buildRoutePath('/tasks/:id'),
        handler: deleteTaskHandler,
    },
    {
        method: 'PATCH',
        path: buildRoutePath('/tasks/:id/complete'),
        handler: toggleTaskCompletionHandler,
    }
];
