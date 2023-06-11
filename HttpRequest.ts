/**
 * HttpRequest
 *
 * A simple XMLHttpRequest helper
 * https://github.com/PopovMP/http-request
 *
 * Copyright @ 2022 Miroslav Popov
 *
 * v1.1 2023.06.11
 */

interface HttpRequestOptions {
    headers     : object
    responseType: XMLHttpRequestResponseType
}

interface HttpRequestResponse {
    readyState  : number
    response    : ArrayBuffer | Blob | Document | Object | string | undefined
    responseText: string | undefined
    responseType: XMLHttpRequestResponseType
    responseURL : string
    status      : number
    statusText  : string
    headers     : Record<string, string>
}

type HttpRequestCallback = (res: HttpRequestResponse) => void

/**
 * Provides get and post methods
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
    public static post(url: string, body: any, options: HttpRequestOptions, callback: HttpRequestCallback): void {
        HttpRequest.request("POST", url, body, options, callback);
    }

    /**
     * Make a request
     */
    private static request(method: string, url: string, body: any, options: HttpRequestOptions,
        callback: HttpRequestCallback): void {
        const req: XMLHttpRequest = new XMLHttpRequest();

        req.open(method, url, true);

        if (typeof options.headers === "object") {
            for (const name of Object.keys(options.headers)) {
                // @ts-ignore
                req.setRequestHeader(name, options.headers[name]);
            }
        }

        if (typeof options.responseType === "string") {
            req.responseType = options.responseType;
        }

        req.onreadystatechange = HttpRequest.req_readyStateChange.bind(this, req, callback);
        req.onerror            = HttpRequest.req_error.bind(this, callback);
        req.send(body);
    }

    /**
     * Handles XMLHttpRequest :: onreadystatechange
     * Calls the callback when the XMLHttpRequest is DONE
     */
    static req_readyStateChange(req: XMLHttpRequest, callback: HttpRequestCallback): void {
        if (req.readyState !== XMLHttpRequest.DONE) {
            return;
        }

        const headers: {[header: string]: string} = {};
        const reqResponseHeaders: string[] = req.getAllResponseHeaders().trim().split(/[\r\n]+/);
        for (const header of reqResponseHeaders) {
            const parts: string[] = header.split(": ");
            // @ts-ignore
            headers[parts[0]] = parts[1];
        }

        const isResponseText: boolean = req.responseType === "text" || req.responseType === "";

        callback({
            readyState  : req.readyState,
            response    : isResponseText ? undefined : req.response,
            responseText: isResponseText ? req.responseText : undefined,
            responseType: req.responseType,
            responseURL : req.responseURL,
            status      : req.status,
            statusText  : req.statusText,
            headers     : headers,
        });
    }

    /**
     * Handles XMLHttpRequest :: onerror
     * Calls the callback when the XMLHttpRequest rises an error
     */
    static req_error(callback: HttpRequestCallback): void {
        callback({
            readyState  : 4,
            response    : undefined,
            responseText: undefined,
            responseType: "",
            responseURL : "",
            status      : 400,
            statusText  : "An error occurred during the transaction",
            headers     : {},
        });
    }
}
