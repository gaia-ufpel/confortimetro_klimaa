const app = require('./app')

const env_vars = process.env;

app.listen(env_vars.API_PORT, env_vars.API_HOST, () => {
    console.log(`Server running on ${env_vars.API_HOST}:${env_vars.API_PORT}`);
})