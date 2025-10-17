import { useEffect, useState } from "react";
import { ApiClient } from "~/lib/api-client";
import type { Api } from "./api-client";

export function useAPI() {
    const [api, setAPI] = useState<Api<string>>();

    useEffect(() => {
        setAPI(ApiClient.getOpenAPIClient());
    }, []);

    return {
        api,
    };
}
