"use strict";
class Application {
    initialize() {
        document.getElementById("get-text-btn")
            .addEventListener("click", this.getTextTest.bind(this));
        document.getElementById("get-json-btn")
            .addEventListener("click", this.getJsonTest.bind(this));
        document.getElementById("post-text-btn")
            .addEventListener("click", this.postTextTest.bind(this));
        document.getElementById("post-json-btn")
            .addEventListener("click", this.postJsonTest.bind(this));
        document.getElementById("post-form-btn")
            .addEventListener("click", this.postFormTest.bind(this));
        document.getElementById("post-timeout-btn")
            .addEventListener("click", this.postTimeoutTest.bind(this));
        document.getElementById("post-404-btn")
            .addEventListener("click", this.post404Test.bind(this));
    }
    getTextTest(event) {
        event.preventDefault();
        const resField = document.getElementById("get-text-res");
        const url = "https://httpbin.org/get";
        const options = { responseType: "text" };
        HttpRequest.get(url, options, (res) => {
            resField.innerText = JSON.stringify(res, null, 2);
        });
    }
    getJsonTest(event) {
        event.preventDefault();
        const resField = document.getElementById("get-json-res");
        const url = "https://httpbin.org/get";
        const options = { responseType: "json" };
        HttpRequest.get(url, options, (res) => {
            resField.innerText = JSON.stringify(res, null, 2);
        });
    }
    postTextTest(event) {
        event.preventDefault();
        const resField = document.getElementById("post-text-res");
        const url = "https://httpbin.org/post";
        const options = { responseType: "json" };
        const bodyTxt = "Hello, world!";
        HttpRequest.post(url, bodyTxt, options, (res) => {
            resField.innerText = JSON.stringify(res, null, 2);
        });
    }
    postJsonTest(event) {
        event.preventDefault();
        const resField = document.getElementById("post-json-res");
        const url = "https://httpbin.org/anything";
        const options = { responseType: "json" };
        const body = { foo: "bar", baz: 42, "поле на форма": "Здравей, Свят!" };
        HttpRequest.json(url, body, options, (res) => {
            resField.innerText = JSON.stringify(res, null, 2);
        });
    }
    postFormTest(event) {
        event.preventDefault();
        const resField = document.getElementById("post-form-res");
        const url = "https://httpbin.org/post";
        const options = { responseType: "json" };
        const form = { foo: "bar", baz: 42, "поле на форма": "Здравей, Свят!" };
        HttpRequest.form(url, form, options, (res) => {
            resField.innerText = JSON.stringify(res, null, 2);
        });
    }
    postTimeoutTest(event) {
        event.preventDefault();
        const resField = document.getElementById("post-timeout-res");
        const url = "https://httpbin.org/delay/10";
        const options = { timeout: 2 * 1000, responseType: "json" };
        HttpRequest.get(url, options, (res) => {
            resField.innerText = JSON.stringify(res, null, 2);
        });
    }
    post404Test(event) {
        event.preventDefault();
        const resField = document.getElementById("post-404-res");
        const url = "https://httpbin.org/status/404";
        const options = { responseType: "json" };
        HttpRequest.get(url, options, (res) => {
            resField.innerText = JSON.stringify(res, null, 2);
        });
    }
}
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
/**
 * Provides `get` and `post` methods
 * @class HttpRequest
 */
class HttpRequest {
    /**
     * GET request
     */
    static get(url, options, callback) {
        HttpRequest.request("GET", url, null, options, callback);
    }
    /**
     * POST ArrayBuffer, string or null
     */
    static post(url, body, options, callback) {
        HttpRequest.request("POST", url, body, options, callback);
    }
    /**
     * POST JSON
     */
    static json(url, data, options, callback) {
        if (!options.headers) {
            options.headers = {};
        }
        options.headers["Content-Type"] = "application/json;charset=UTF-8";
        const bodyText = JSON.stringify(data);
        HttpRequest.request("POST", url, bodyText, options, callback);
    }
    /**
     * Make POST request encoded as "application/x-www-form-urlencoded"
     */
    static form(url, formData, options, callback) {
        if (!options.headers) {
            options.headers = {};
        }
        options.headers["Content-Type"] = "application/x-www-form-urlencoded;charset=UTF-8";
        const parameters = [];
        for (const param of Object.keys(formData)) {
            const paramEncoded = encodeURIComponent(param);
            const valueEncoded = encodeURIComponent(formData[param]);
            parameters.push(`${paramEncoded}=${valueEncoded}`);
        }
        const bodyText = parameters.join("&");
        HttpRequest.request("POST", url, bodyText, options, callback);
    }
    /**
     * Make a request
     */
    static request(method, url, body, options, callback) {
        let isCompleted = false; // Ensures that the callback is called only once.
        const req = new XMLHttpRequest();
        req.open(method, url);
        HttpRequest.setReqHeaders(req, options);
        req.timeout = typeof options.timeout === "number" ? options.timeout : 20 * 1000;
        req.responseType = options.responseType || "";
        req.onreadystatechange = req_readyStateChange;
        req.onerror = () => { resError("Request error"); };
        req.ontimeout = () => { resError("Request timeout"); };
        req.onabort = () => { resError("Request aborted"); };
        req.send(body);
        function req_readyStateChange() {
            if (req.readyState !== XMLHttpRequest.DONE || req.status === 0 || isCompleted)
                return;
            isCompleted = true;
            callback({
                response: req.response,
                responseType: req.responseType,
                responseURL: req.responseURL,
                status: req.status,
                statusText: req.statusText,
                headers: HttpRequest.getResHeaders(req),
            });
        }
        function resError(message) {
            if (isCompleted)
                return;
            isCompleted = true;
            callback({
                response: null,
                responseType: req.responseType,
                responseURL: url,
                status: req.status,
                statusText: message,
                headers: {},
            });
        }
    }
    static setReqHeaders(req, options) {
        if (typeof options.headers !== "object")
            return;
        if (Array.isArray(options.headers) || options.headers === null) {
            console.error("Wrong headers type in HttpRequest. Got: " + JSON.stringify(options.headers));
            return;
        }
        const names = Object.keys(options.headers);
        for (let i = 0; i < names.length; i++) {
            const value = options.headers[names[i]];
            if (typeof value !== "string") {
                console.error(`Wrong header: ${names[i]} ${value}`);
                continue;
            }
            req.setRequestHeader(names[i], value);
        }
    }
    static getResHeaders(req) {
        const headers = {};
        const resHeaders = req.getAllResponseHeaders().trim().split(/[\r\n]+/);
        for (let i = 0; i < resHeaders.length; i++) {
            const header = resHeaders[i];
            const colonIndex = header.indexOf(":");
            if (colonIndex >= 0) {
                const name = header.slice(0, colonIndex).trim();
                const value = header.slice(colonIndex + 1).trim();
                if (name.length > 0 && value.length > 0) {
                    if (headers[name]) {
                        headers[name] += "; " + value;
                    }
                    else {
                        headers[name] = value;
                    }
                }
            }
        }
        return headers;
    }
}
//# sourceMappingURL=index.js.map
