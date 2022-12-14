# es-query-export

Export elasticsearch query results into json or csv file

## Install

```bash
npm install es-query-export
```

## Usage

```js

const { Client } = require('@elastic/elasticsearch');
const esQueryExport = require('es-query-export');

(async () => {

    // Create elastic search client
    const esClient = new Client({
        node: "http://localhost:9200",
        auth: {
            username: 'elastic',
            password: 'password'
        }
    });

    const exporter = new esQueryExport({ client: esClient });

    // download search results as json
    exporter.export({
        index: 'index_name',
        query: {
            match: { 'title': 'hello world' }
        },
        filepath: 'output.json'
    });

    // Events
    exporter.on('start', (hits, filepath) => {
        console.log("Total hits", hits)
    });

    exporter.on('progress', (percent) => {
        console.log(percent)
    });

    // convert downloaded json to csv on complete
    exporter.on('complete', async ({ hits, headers, filepath }) => {
        await exporter.json2csv(headers, 'output.json', 'output.csv')
    });

})();
```
