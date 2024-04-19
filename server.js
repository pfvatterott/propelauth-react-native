const propelAuth = require("@propelauth/node");
const axios = require('axios');
require('dotenv').config();
const http = require('http');
const cors = require('cors');
const port = 4000;


const allowedOrigins = ['exp://192.168.86.29:8081']; // Replace with the allowed domain
const corsOptions = {
    origin: allowedOrigins,
};


async function getOrgsByQueryCurl() {
    try {
        const response = await axios.get(`${process.env.auth_url}/api/backend/v1/org/query?name=aomni`, {
            headers: {
                Authorization: `Bearer ${process.env.auth_api_key}`
            }
        });
        console.log(response.data)
        return response.data
    } catch (error) {
        console.error(error);
    }
}

async function logoutUser(refresh_token) {
    try {
        const headers = {
            'Content-Type': 'application/json'
        };
        const body = {
            "refresh_token": refresh_token
        }
        const response = await axios.post(`${process.env.auth_url}/api/backend/v1/logout`, body, { headers: headers }
        );
        console.log(response.data)
    } catch (error) {
        console.error('Error fetching data:', error);
    }
};

async function refreshToken(refresh_token) {
    try {
        const headers = {
            'Content-Type': 'application/json'
        };
        const body = {
            "refresh_token": refresh_token
        }
        const response = await axios.post(`${process.env.auth_url}/api/backend/v1/refresh_token`, body, { headers: headers }
        );
        return response.data
    } catch (error) {
        console.error('Error fetching data:', error);
    }
};

const {
    validateAccessTokenAndGetUser,
    validateAccessTokenAndGetUserWithOrgInfo,
    fetchOrg,
    fetchOrgByQuery,
    createAccessToken,
    validateAccessTokenAndGetUserWithOrgInfoWithMinimumRole,
    validateAccessTokenAndGetUserWithOrgInfoWithExactRole,
    validateAccessTokenAndGetUserWithOrgInfoWithPermission,
    validateAccessTokenAndGetUserWithOrgInfoWithAllPermissions,
    fetchUserMetadataByUserId,
    validateApiKey
    // ...
} = propelAuth.initBaseAuth({
    authUrl: process.env.auth_url,
    apiKey: process.env.auth_api_key
});

const server = http.createServer(async (req, res) => {
    await handleRequest(req, res, () => { });
});


async function handleRequest(req, res, next) {
    const corsMiddleware = cors(corsOptions);
    await corsMiddleware(req, res, next);

    if (req.method === 'POST' && req.url === '/') {
        let body = '';
        req.on('data', (chunk) => {
            body += chunk.toString();
        });

        req.on('end', () => {
            const parsed_body = JSON.parse(body)
            logoutUser(parsed_body.refresh_token)
            res.writeHead(200, { 'Content-Type': 'text/plain' });
            res.end('Body received!');
        })
    } else {
        res.statusCode = 404;
        res.end('Not found');
    }
}

server.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`);
});

