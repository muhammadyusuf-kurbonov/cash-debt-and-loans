import { ApiClient } from "~/lib/api-client";
import type { Api } from "./api-client";

// Create the API instance immediately when this module is loaded
// This ensures the API is always available and initialized as a true singleton
const apiInstance: Api<string> = ApiClient.getOpenAPIClient();
const apiObject = { api: apiInstance };

export function useAPI() {
    // Return the same object reference every time to avoid unnecessary re-renders
    return apiObject;
}
