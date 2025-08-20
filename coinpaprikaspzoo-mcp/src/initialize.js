var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { SERVER_NAME, SERVER_VERSION } from '../settings.js';
import { SERVER_URL, SUBDOMAIN } from './config.readonly.js';
export function fetchInitializationConfiguration(subdomain) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const response = yield fetch(`${SERVER_URL}/api/mcp/cli/${subdomain}`, {
                method: 'GET',
            });
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            const contentType = response.headers.get('content-type');
            if (!contentType || !contentType.includes('application/json')) {
                throw new Error('Response is not JSON');
            }
            return yield response.json();
        }
        catch (error) {
            throw new Error('Failed to initialize: Could not fetch configuration');
        }
    });
}
export function initialize() {
    return __awaiter(this, void 0, void 0, function* () {
        console.log('Initializing MCP Server...');
        const config = yield fetchInitializationConfiguration(SUBDOMAIN);
        const server = new McpServer({
            name: SERVER_NAME,
            version: SERVER_VERSION,
        });
        return { server, config };
    });
}
