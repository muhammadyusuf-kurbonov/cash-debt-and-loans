// api/client.ts

import { Api } from "~/api/api-client";
import { TOKEN_STORAGE_KEY } from "./telegram-auth";

// Use a placeholder that will be replaced at runtime by the Docker container
const BACKEND_URL = import.meta.env.VITE_BACKEND_URL;

export class ApiClient {

  private static openapiClient: Api<string>;

  static getOpenAPIClient() {
    if (!this.openapiClient) {
      this.openapiClient = new Api({
        baseURL: BACKEND_URL,
        secure: true,
        securityWorker() {
          return {
            headers: {
              'Authorization': `Bearer ${localStorage.getItem(TOKEN_STORAGE_KEY)}`,
            }
          }
        },
      });  
    }
    return this.openapiClient;
  }

  constructor() {
  }
}
