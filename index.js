'use strict'

const fs = require('fs');
const EventEmitter = require('events');
const { AsyncParser } = require('json2csv');

module.exports = class esQueryExport extends EventEmitter {

    constructor({ client }) {
        super()
        this.client = client ? client : null;
    }

    async export({ index, query, size, filepath }) {

        const resultSize = size ? size : 1000;

        const response_queue = [];
        let results_collected = 0;

        const response = await this.client.search({
            scroll: '30s',
            size: resultSize,
            index,
            query
        });

        response_queue.push(response);

        const jsonfile = fs.createWriteStream(filepath, {flags: 'w' });
        const headers = [];

        jsonfile.write('[')

        this.emit('start', { hits: response.hits.total.value, filepath })

        while (response_queue.length) {
            const body = response_queue.shift();

            body.hits.hits.forEach(item => {
                results_collected += 1;

                Object.keys(item._source).forEach((_key) => {
                    if (headers.includes(_key) === false) {
                        headers.push(_key);
                    }
                });
                
                const source = JSON.stringify(item._source);

                if (body.hits.total.value === results_collected) {
                    jsonfile.write(`${source}`);
                } else {
                    jsonfile.write(`${source},\n`);
                }
                
            });

            const progress_percent = Math.round((results_collected/body.hits.total.value) * 100);

            this.emit('progress', progress_percent);

            if (body.hits.total.value === results_collected) {
                break
            }

            response_queue.push(
                await this.client.scroll({
                    scroll_id: body._scroll_id,
                    scroll: '30s'
                })
            )
        }

        jsonfile.write(']');
        jsonfile.end();

        this.emit('complete', { hits: results_collected, headers, filepath });

        return { hits: results_collected, headers, filepath };
    }

    async json2csv(headers, input_file, output_file) {
        const input = fs.createReadStream(input_file);
        const output = fs.createWriteStream(output_file);

        const asyncParser = new AsyncParser({ fields: headers });
        await asyncParser.fromInput(input).toOutput(output).promise();
    }
}
