let AWS = require("aws-sdk");

const { DEPLOYMENT_REGION } = process.env;

AWS.config.update({ region: DEPLOYMENT_REGION });

let dynamoClient = new AWS.DynamoDB.DocumentClient();

let cache = [];

function getFromCache() {
    let result = cache[new Date().getMinutes()];

    if (!result) {
        return null;
    }

    return result;
}

function setCache(result) {
    cache = {
        [new Date().getMinutes()]: result
    };
}

async function getArticles() {
    let cachedResult = getFromCache();

    if (cachedResult) {
        console.log('From cache...');

        return cachedResult;
    }

    console.log('Without cache...');

    let params = {
        TableName: 'blog_articles',
    };

    let result = await dynamoClient.scan(params).promise();

    let articles = [];

    result.Items.forEach(
        item => {
            let { id, slug, title, photo, category, description, timestamp } = item;

            articles.push({ id, slug, title, photo, category, description, timestamp });
        }
    );

    result.Items = articles;

    setCache(result);

    return result;
}

exports.handler = async (event) => {
    try {
        let result = await getArticles();

        let data = {
            data: result.Items,
            meta: {
                last_key: result.lastEvaluatedKey ? result.LastEvaluatedKey.id : null
            }
        };

        return {
            statusCode: 200,
            headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' },
            body: JSON.stringify(data),
        };
    } catch (e) {
        console.error(e);

        return {
            statusCode: 500,
            headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' },
            body: JSON.stringify({ error: 'Something went wrong.' }),
        };
    }
};
