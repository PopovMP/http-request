/**
 * HttpRequest
 *
 * A simple XMLHttpRequest helper
 * https://github.com/PopovMP/http-request
 *
 * Copyright @ 2025 Miroslav Popov
 *
 * v2.2 2025.09.04
 */

interface HttpRequestOptions {
    headers     ?: Record<string, string>;
    responseType?: "" | "arraybuffer" | "blob" | "document" | "json" | "text";
    timeout     ?: number; // a number of milliseconds
}

interface HttpRequestResponse {
    response    : ArrayBuffer | Blob | Document | Object | string | undefined | null;
    responseType: "" | "arraybuffer" | "blob" | "document" | "json" | "text";
    responseURL : string;
    status      : number;
    statusText  : string;
    headers     : Record<string, string>;
}

type HttpRequestMethod   = "GET" | "POST" | "HEAD" | "PUT" | "DELETE" | "PATCH" | "OPTIONS";
type HttpRequestCallback = (res: HttpRequestResponse) => void;


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
    public static post(url: string, body: Document | XMLHttpRequestBodyInit | null | undefined, options: HttpRequestOptions,
                       callback: HttpRequestCallback): void {
        HttpRequest.request("POST", url, body, options, callback);
    }

    /**
     * POST JSON
     */
    public static json(url: string, data: object, options: HttpRequestOptions, callback: HttpRequestCallback): void {
        if (!options.headers) {
            options.headers = {};
        }
        options.headers["Content-Type"] = "application/json;charset=UTF-8";

        const bodyText: string = JSON.stringify(data);

        HttpRequest.request("POST", url, bodyText, options, callback);
    }

    /**
     * Make POST request encoded as "application/x-www-form-urlencoded"
     */
    public static form(url: string, formData: Record<string, string|number>, options: HttpRequestOptions,
                       callback: HttpRequestCallback): void {
        if (!options.headers) {
            options.headers = {};
        }
        options.headers["Content-Type"] = "application/x-www-form-urlencoded;charset=UTF-8";

        const parameters: string[] = [];
        for (const param of Object.keys(formData)) {
            const paramEncoded = encodeURIComponent(param);
            const valueEncoded = encodeURIComponent(formData[param]);
            parameters.push(`${paramEncoded}=${valueEncoded}`);
        }
        const bodyText: string = parameters.join("&");

        HttpRequest.request("POST", url, bodyText, options, callback);
    }

    /**
     * Make a request
     */
    public static request(method: HttpRequestMethod, url: string, body: Document | XMLHttpRequestBodyInit | null | undefined,
                          options: HttpRequestOptions, callback: HttpRequestCallback): void {
        let isCompleted: boolean = false; // Ensures that the callback is called only once.

        const req: XMLHttpRequest = new XMLHttpRequest();
        req.open(method, url);
        HttpRequest.setReqHeaders(req, options);
        req.timeout            = typeof options.timeout === "number" ? options.timeout : 20 * 1000;
        req.responseType       = options.responseType || "";
        req.onreadystatechange = req_readyStateChange;
        req.onerror            = (): void => { resError("Request error"  ); };
        req.ontimeout          = (): void => { resError("Request timeout"); };
        req.onabort            = (): void => { resError("Request aborted"); };
        req.send(body);

        function req_readyStateChange(): void {
            if (req.readyState !== XMLHttpRequest.DONE || req.status === 0 || isCompleted) return;
            isCompleted = true;

            callback({
                response    : req.response,
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
                response    : null,
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
        for (let i: number = 0; i < names.length; i++) {
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

        for (let i: number = 0; i < resHeaders.length; i++) {
            const header    : string = resHeaders[i];
            const colonIndex: number = header.indexOf(":");
            if (colonIndex >= 0) {
                const name : string = header.slice(0, colonIndex ).trim();
                const value: string = header.slice(colonIndex + 1).trim();
                if (name.length > 0 && value.length > 0) {
                    if (headers[name]) {
                        headers[name] += "; " + value;
                    } else {
                        headers[name] = value;
                    }
                }
            }
        }

        return headers;
    }
}

