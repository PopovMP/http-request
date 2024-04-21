/**
 * HttpRequest
 *
 * A simple XMLHttpRequest helper
 * https://github.com/PopovMP/http-request
 *
 * Copyright @ 2024 Miroslav Popov
 *
 * v1.4 2024.04.21
 */

interface HttpRequestOptions {
    headers     ?: Record<string, string>
    responseType?: "" | "arraybuffer" | "blob" | "document" | "json" | "text"
    timeout     ?: number // a number of milliseconds
}

interface HttpRequestResponse {
    response    : ArrayBuffer | Blob | Document | Object | string | undefined
    responseText: string | undefined
    responseType: "" | "arraybuffer" | "blob" | "document" | "json" | "text"
    responseURL : string
    status      : number
    statusText  : string
    headers     : Record<string, string>
}

type HttpRequestMethod   = "GET" | "POST" | "HEAD" | "PUT" | "DELETE" | "PATCH" | "OPTIONS"
type HttpRequestCallback = (res: HttpRequestResponse) => void

/**
 * Provides `get` and `post` methods
 * @class HttpRequest
 */
class HttpRequest {

    /**
     * Make a GET request
     */
    public static get(url: string, options: HttpRequestOptions, callback: HttpRequestCallback): void {
        HttpRequest.request("GET", url, null, options, callback);
    }

    /**
     * Make a POST request
     */
    public static post(url: string, body: any, options: HttpRequestOptions,
                       callback: HttpRequestCallback): void {
        HttpRequest.request("POST", url, body, options, callback);
    }

    /**
     * Make POST request encoded as "application/x-www-form-urlencoded"
     */
    public static form(url: string, formData: Record<string, string|number>,
                  options: HttpRequestOptions, callback: HttpRequestCallback): void {

        const parameters: string[] = [];
        for (const param of Object.keys(formData))
            parameters.push(`${param}=${encodeURIComponent(formData[param])}`);
        const body: string = parameters.join("&");

        if (!options.headers)
            options.headers = {};
        options.headers["Content-Type"] = "application/x-www-form-urlencoded";

        HttpRequest.request("POST", url, body, options, callback);
    }

    /**
     * Make a request
     */
    public static request(method: HttpRequestMethod, url: string, body: any,
                          options: HttpRequestOptions, callback: HttpRequestCallback): void {
        let isCompleted: boolean = false;

        const req: XMLHttpRequest = new XMLHttpRequest();
        req.open(method, url, true);

        if (typeof options.headers === "object") {
            for (const name of Object.keys(options.headers))
                req.setRequestHeader(name, options.headers[name]);
        }

        req.timeout            = typeof options.timeout === "number" ? options.timeout : 20 * 1000;
        req.responseType       = options.responseType || "";
        req.onreadystatechange = req_readyStateChange;
        req.onerror            = req_error;
        req.ontimeout          = req_timeout;
        req.onabort            = req_abort;
        req.send(body);

        function req_readyStateChange(): void {
            if (req.readyState !== XMLHttpRequest.DONE || req.status === 0) return;
            if (isCompleted) return;

            const headers   : Record<string, string> = {};
            const resHeaders: string[] = req.getAllResponseHeaders().trim().split(/[\r\n]+/);
            for (const header of resHeaders) {
                const parts: string[] = header.split(": ");
                headers[parts[0]] = parts[1];
            }

            const isResponseText: boolean = req.responseType === "text" || req.responseType === "";

            isCompleted = true;
            callback({
                 response    : isResponseText ? undefined : req.response,
                 responseText: isResponseText ? req.responseText : undefined,
                 responseType: req.responseType,
                 responseURL : req.responseURL,
                 status      : req.status,
                 statusText  : req.statusText,
                 headers     : headers,
            });
        }

        function req_abort(): void {
            resError("Request aborted");
        }

        function req_timeout(): void {
            resError("Request timeout");
        }

        function req_error(): void {
            resError("An error occurred during the transaction");
        }

        function resError(message: string): void {
            if (isCompleted) return;
            isCompleted = true;
            callback({
                 response    : undefined,
                 responseText: undefined,
                 responseType: req.responseType,
                 responseURL : url,
                 status      : req.status,
                 statusText  : message,
                 headers     : {},
             });
        }
    }
}
