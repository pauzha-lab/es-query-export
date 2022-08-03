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
    const result = await exporter.export({
        index: 'index_name',
        query: {
            match: { 'title': 'hello world' }
        },
        filepath: 'output.json'
    });
    
    // convert downloaded json to csv
    await exporter.json2csv(result.headers, 'output.json', 'output.csv')
})();
```
