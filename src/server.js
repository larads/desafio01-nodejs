import http from 'node:http';
import { routes } from './routes.js';
import { json } from './middlewares/json.js';
import { extractQueryParams } from './utils/extract-query-params.js';

const findRoute = (method, url) => {
    return routes.find(route => route.method === method && route.path.test(url));
};

const extractParams = (url, pathPattern) => {
    const match = url.match(pathPattern);
    if (!match) return { query: '', params: {} };

    const { groups = {} } = match;
    const { query, ...params } = groups;
    return { query, params };
};

const requestHandler = async (req, res) => {
    const { method, url } = req;

    await json(req, res);

    const route = findRoute(method, url);

    if (route) {
        const { query, params } = extractParams(url, route.path);

        req.params = params;
        req.query = query ? extractQueryParams(query) : {};

        return route.handler(req, res);
    }

    res.writeHead(404).end();
};

const server = http.createServer(requestHandler);

server.listen(3333, () => {
    console.log('Server is running on port 3333');
});
