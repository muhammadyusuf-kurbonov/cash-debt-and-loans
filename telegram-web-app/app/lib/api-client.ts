// api/client.ts

import { Api } from "~/api/api-client";
import { getUserToken } from "./telegram-auth";

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
              'Authorization': `Bearer ${getUserToken()}`,
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
