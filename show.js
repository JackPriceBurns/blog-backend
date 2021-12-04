let AWS = require("aws-sdk");

const { DEPLOYMENT_REGION } = process.env;

AWS.config.update({ region: DEPLOYMENT_REGION });

let dynamoClient = new AWS.DynamoDB.DocumentClient();

let cache = [];

function getFromCache(parameters) {
    let articles = cache[parameters['slug']];

    if (!articles) {
        return null;
    }

    let article = articles[new Date().getMinutes()];

    if (!article) {
        return null;
    }

    return article;
}

function setCache(parameters, article) {
    cache[parameters['slug']] = {
        [new Date().getMinutes()]: article
    };
}

async function getArticle(parameters) {
    let cachedArticle = getFromCache(parameters);

    if (cachedArticle) {
        console.log('From cache...');

        return cachedArticle;
    }

    console.log('Without cache...');

    let params = {
        TableName: 'blog_articles',
        IndexName: 'slug-index',
        FilterExpression: 'slug = :slug',
        ExpressionAttributeValues: { ':slug': parameters['slug'] },
    };

    let result = await dynamoClient.scan(params).promise();

    let article = result.Items[0];

    if (!article) {
        return null;
    }

    setCache(parameters, article);

    return article;
}

exports.handler = async (event) => {
    try {
        let article = await getArticle(event.pathParameters);

        return {
            statusCode: 200,
            headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' },
            body: JSON.stringify({ data: article }),
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
