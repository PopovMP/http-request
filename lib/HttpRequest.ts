/**
 * HttpRequest
 *
 * A simple XMLHttpRequest helper
 * https://github.com/PopovMP/http-request
 *
 * Copyright @ 2024 Miroslav Popov
 *
 * v2.0 2024.04.22
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
     * GET request
     */
    public static get(url: string, options: HttpRequestOptions, callback: HttpRequestCallback): void {
        HttpRequest.request("GET", url, null, options, callback);
    }

    /**
     * POST ArrayBuffer, string or null
     */
    public static post(url: string, body: ArrayBuffer | string | null, options: HttpRequestOptions,
                       callback: HttpRequestCallback): void {
        HttpRequest.request("POST", url, body, options, callback);
    }

    /**
     * POST JSON
     */
    public static json(url: string, data: object, options: HttpRequestOptions, callback: HttpRequestCallback): void {
        const bodyText: string = JSON.stringify(data);

        if (!options.headers) options.headers = {};
        options.headers["Content-Type"] = "application/json";

        HttpRequest.request("POST", url, bodyText, options, callback);
    }

    /**
     * Make POST request encoded as "application/x-www-form-urlencoded"
     */
    public static form(url: string, formData: Record<string, string|number>, options: HttpRequestOptions,
                       callback: HttpRequestCallback): void {

        const parameters: string[] = [];
        for (const param of Object.keys(formData))
            parameters.push(`${param}=${encodeURIComponent(formData[param])}`);
        const bodyText: string = parameters.join("&");

        if (!options.headers) options.headers = {};
        options.headers["Content-Type"] = "application/x-www-form-urlencoded";

        HttpRequest.request("POST", url, bodyText, options, callback);
    }

    /**
     * Make a request
     */
    public static request(method: HttpRequestMethod, url: string, body: ArrayBuffer | string | null,
                          options: HttpRequestOptions, callback: HttpRequestCallback): void {
        let isCompleted: boolean = false; // Ensures that the callback is called only once.

        const req: XMLHttpRequest = new XMLHttpRequest();
        req.open(method, url);
        HttpRequest.setReqHeaders(req, options);
        req.timeout            = typeof options.timeout === "number" ? options.timeout : 20 * 1000;
        req.responseType       = options.responseType || "";
        req.onreadystatechange = req_readyStateChange;
        req.onerror            = (): void => { resError("Request error"  ) };
        req.ontimeout          = (): void => { resError("Request timeout") };
        req.onabort            = (): void => { resError("Request aborted") };
        req.send(body);

        function req_readyStateChange(): void {
            if (req.readyState !== XMLHttpRequest.DONE || req.status === 0) return;
            if (isCompleted) return;
            isCompleted = true;

            const isResponseText: boolean = req.responseType === "text" || req.responseType === "";
            callback({
                 response    : isResponseText ? undefined : req.response,
                 responseText: isResponseText ? req.responseText : undefined,
                 responseType: req.responseType,
                 responseURL : req.responseURL,
                 status      : req.status,
                 statusText  : req.statusText,
                 headers     : HttpRequest.getResHeaders(req),
            });
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

    private static setReqHeaders(req: XMLHttpRequest, options: HttpRequestOptions): void {
        if (typeof options.headers !== "object") return;
        if (Array.isArray(options.headers) || options.headers === null) {
            console.error("Wrong headers type in HttpRequest. Got: " + JSON.stringify(options.headers));
            return;
        }

        const names: string[] = Object.keys(options.headers);
        for (let i: number = 0; i < names.length; i += 1) {
            const value: string | any = options.headers[names[i]];
            if (typeof value !== "string") {
                console.error(`Wrong header: ${names[i]} ${value}`);
                continue;
            }

            req.setRequestHeader(names[i], value);
        }
    }

    private static getResHeaders(req: XMLHttpRequest): Record<string, string> {
        const headers   : Record<string, string> = {};
        const resHeaders: string[] = req.getAllResponseHeaders().trim().split(/[\r\n]+/);

        for (let i: number = 0; i < resHeaders.length; i += 1) {
            const header: string   = resHeaders[i];
            const parts : string[] = header.split(": ");
            if (parts.length !== 2) continue;
            const name : string = parts[0].trim();
            const value: string = parts[1].trim();
            if (name.length > 0 && value.length > 0)
                headers[name] = value;
        }

        return headers;
    }
}
