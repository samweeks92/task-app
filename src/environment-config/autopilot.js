const {SecretManagerServiceClient} = require('@google-cloud/secret-manager');

async function getSecret(secretName) {
    
    const secretmanagerClient = new SecretManagerServiceClient();
    
    const request = {
        name: `projects/${process.env.DEPLOY_PROJECT_NUMBER}/secrets/${secretName}/versions/latest`,
    };

    const [version] = await secretmanagerClient.accessSecretVersion(request);
    return version.payload.data.toString();
}

getSecret("mongo-base-url").then((result) => {
    process.env.MONGO_BASE_URL=result;
    console.log(`MONGO_BASE_URL=${process.env.MONGO_BASE_URL}`)
    // require('./db/mongoose')
}).catch((e) => {
    console.log('e', e) // if the async function threw an error, this would be returned here
})   

getSecret("sendgrid-api-key").then((result) => {
    process.env.SENDGRID_API_KEY=result;
    console.log(`SENDGRID_API_KEY=${process.env.SENDGRID_API_KEY}`)
}).catch((e) => {
    console.log('e', e) // if the async function threw an error, this would be returned here
})

getSecret("jwt-secret").then((result) => {
    process.env.JWT_SECRET=result;
    console.log(`JWT_SECRET=${process.env.JWT_SECRET}`)
}).catch((e) => {
    console.log('e', e) // if the async function threw an error, this would be returned here
})