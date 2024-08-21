import { parse } from 'csv-parse';
import fs from 'node:fs';
import fetch from 'node-fetch';

const csvPath = new URL('./tasks.csv', import.meta.url);

const createReadStream = (path) => fs.createReadStream(path);

const createCsvParser = () => parse({
    delimiter: ',',
    skipEmptyLines: true,
    fromLine: 2
});

const processLine = async (line) => {
    const [title, description] = line;

    try {
        const response = await fetch('http://localhost:3333/tasks', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ title, description })
        });

        if (!response.ok) {
            console.error(`Failed to post data: ${response.statusText}`);
        }
    } catch (error) {
        console.error('Error sending data:', error);
    }
};

const run = async () => {
    const stream = createReadStream(csvPath);
    const csvParse = createCsvParser();
    const linesParse = stream.pipe(csvParse);

    for await (const line of linesParse) {
        await processLine(line);

        await wait(100);
    }
};

const wait = (ms) => new Promise(resolve => setTimeout(resolve, ms));

run().catch(error => {
    console.error('Error during processing:', error);
});
