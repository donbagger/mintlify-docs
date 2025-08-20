var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
import { validate } from '@mintlify/openapi-parser';
import { OpenApiToEndpointConverter } from '@mintlify/validation';
import axios from 'axios';
import dashify from 'dashify';
import { convertEndpointToCategorizedZod } from './helpers.js';
import path from 'path';
import fs from 'fs';
export function createToolsFromOpenApi(server) {
    return __awaiter(this, void 0, void 0, function* () {
        const openApi = fs.readFileSync(path.join(__dirname, 'openapi.json'), 'utf8');
        const { valid, errors, specification } = yield validate(openApi);
        if (!valid || !specification) {
            console.error('Invalid OpenAPI file:', errors);
            return;
        }
        const endpoints = [];
        const paths = specification.paths;
        for (const path in paths) {
            const operations = paths[path];
            for (const method in operations) {
                if (method === 'parameters') {
                    continue;
                }
                const endpoint = OpenApiToEndpointConverter.convert(specification, path, method, true);
                endpoints.push(endpoint);
            }
        }
        endpoints.forEach((endpoint) => {
            var _a;
            const { url, method, paths, queries, body, headers, cookies } = convertEndpointToCategorizedZod(endpoint);
            console.log((_a = endpoint.request.body['application/json']) === null || _a === void 0 ? void 0 : _a.schemaArray[0]);
            const serverArguments = Object.assign(Object.assign(Object.assign(Object.assign(Object.assign({}, paths), queries), body), headers), cookies);
            if (endpoint.title == undefined) {
                return;
            }
            server.tool(dashify(endpoint.title), endpoint.description || endpoint.title, serverArguments, (serverArgumentsWithInput) => __awaiter(this, void 0, void 0, function* () {
                const paramsWithInput = {};
                const bodyWithInput = {};
                const headersWithInput = {};
                const cookiesWithInput = {};
                let urlWithPathParams = url;
                Object.entries(serverArgumentsWithInput).forEach(([key, value]) => {
                    if (key in paths) {
                        urlWithPathParams = urlWithPathParams.replace(`{${key}}`, value);
                    }
                    else if (key in queries) {
                        paramsWithInput[key] = value;
                    }
                    else if (key in body) {
                        bodyWithInput[key] = value;
                    }
                    else if (key in headers) {
                        headersWithInput[key] = value;
                    }
                    else if (key in cookies) {
                        cookiesWithInput[key] = value;
                    }
                });
                try {
                    const response = yield axios({
                        url: urlWithPathParams,
                        method,
                        params: paramsWithInput,
                        data: bodyWithInput,
                        headers: headersWithInput,
                    });
                    return {
                        content: [
                            {
                                type: 'text',
                                text: JSON.stringify(response.data),
                            },
                        ],
                    };
                }
                catch (error) {
                    return {
                        content: [
                            {
                                type: 'text',
                                text: JSON.stringify(error),
                            },
                        ],
                    };
                }
            }));
        });
    });
}
