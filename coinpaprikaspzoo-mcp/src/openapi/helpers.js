import { z } from 'zod';
function convertSchemaToZod(schema) {
    let zodSchema = z.unknown();
    if (schema.type === 'string') {
        zodSchema = z.string();
    }
    else if (schema.type === 'number') {
        zodSchema = z.number();
    }
    else if (schema.type === 'boolean') {
        zodSchema = z.boolean();
    }
    else if (schema.type === 'integer') {
        zodSchema = z.number().int();
    }
    else if (schema.type === 'array') {
        const items = schema.items;
        if (items.type === 'string') {
            zodSchema = z.array(z.string());
        }
        else if (items.type === 'number') {
            zodSchema = z.array(z.number());
        }
        else if (items.type === 'boolean') {
            zodSchema = z.array(z.boolean());
        }
        else if (items.type === 'integer') {
            zodSchema = z.array(z.number().int());
        }
    }
    else if (schema.type === 'object') {
        zodSchema = z.record(z.unknown());
    }
    return schema.required ? zodSchema : zodSchema.optional();
}
function convertParameterSection(parameters, paramSection) {
    Object.entries(parameters).forEach(([key, value]) => {
        const schema = value.schema;
        paramSection[key] = convertSchemaToZod(schema);
    });
}
function convertParametersAndAddToRelevantParamGroups(parameters, paths, queries, headers, cookies) {
    convertParameterSection(parameters.path, paths);
    convertParameterSection(parameters.query, queries);
    convertParameterSection(parameters.header, headers);
    convertParameterSection(parameters.cookie, cookies);
}
function convertSecurityParameterSection(securityParameters, securityParamSection) {
    Object.entries(securityParameters).forEach(([key, _]) => {
        securityParamSection[key] = z.string();
    });
}
function convertSecurityParametersAndAddToRelevantParamGroups(securityParameters, queries, headers, cookies) {
    convertSecurityParameterSection(securityParameters.query, queries);
    convertSecurityParameterSection(securityParameters.header, headers);
    convertSecurityParameterSection(securityParameters.cookie, cookies);
}
export function convertEndpointToCategorizedZod(endpoint) {
    var _a, _b, _c;
    const url = `${((_b = (_a = endpoint.servers) === null || _a === void 0 ? void 0 : _a[0]) === null || _b === void 0 ? void 0 : _b.url) || ''}${endpoint.path}`;
    const method = endpoint.method;
    const paths = {};
    const queries = {};
    const headers = {};
    const cookies = {};
    const body = {};
    convertParametersAndAddToRelevantParamGroups(endpoint.request.parameters, paths, queries, headers, cookies);
    if ((_c = endpoint.request.security[0]) === null || _c === void 0 ? void 0 : _c.parameters) {
        convertSecurityParametersAndAddToRelevantParamGroups(endpoint.request.security[0].parameters, queries, headers, cookies);
    }
    // TODO: Add support for body parameters
    return { url, method, paths, queries, body, headers, cookies };
}
