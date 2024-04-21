"use strict";
class Application {
    initialize() {
        document.getElementById("get-text-btn")
            .addEventListener("click", this.getTextTest.bind(this));
        document.getElementById("get-json-btn")
            .addEventListener("click", this.getJsonTest.bind(this));
        document.getElementById("post-json-text-btn")
            .addEventListener("click", this.postJsonTextTest.bind(this));
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
        const options = {};
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
    postJsonTextTest(event) {
        event.preventDefault();
        const resField = document.getElementById("post-json-text-res");
        const url = "https://httpbin.org/post";
        const options = { responseType: "json", headers: { "X-Custom": "custom" } };
        const body = { foo: "bar", baz: 42 };
        const bodyTxt = JSON.stringify(body);
        HttpRequest.post(url, bodyTxt, options, (res) => {
            resField.innerText = JSON.stringify(res, null, 2);
        });
    }
    postJsonTest(event) {
        event.preventDefault();
        const resField = document.getElementById("post-json-res");
        const url = "https://httpbin.org/anything";
        const options = { responseType: "json", headers: { "Content-Type": "application/json" } };
        const body = { foo: "bar", baz: 42 };
        HttpRequest.post(url, body, options, (res) => {
            resField.innerText = JSON.stringify(res, null, 2);
        });
    }
    postFormTest(event) {
        event.preventDefault();
        const resField = document.getElementById("post-form-res");
        const url = "https://httpbin.org/post";
        const options = { responseType: "json" };
        const form = { foo: "bar", baz: 42 };
        HttpRequest.form(url, form, options, (res) => {
            resField.innerText = JSON.stringify(res, null, 2);
        });
    }
    postTimeoutTest(event) {
        event.preventDefault();
        const resField = document.getElementById("post-timeout-res");
        const url = "https://httpbin.org/delay/10";
        const options = { timeout: 5 * 1000 };
        HttpRequest.get(url, options, (res) => {
            resField.innerText = JSON.stringify(res, null, 2);
        });
    }
    post404Test(event) {
        event.preventDefault();
        const resField = document.getElementById("post-404-res");
        const url = "https://httpbin.org/status/404";
        const options = {};
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
 * Copyright @ 2024 Miroslav Popov
 *
 * v1.4 2024.04.21
 */
/**
 * Provides `get` and `post` methods
 * @class HttpRequest
 */
class HttpRequest {
    /**
     * Make a GET request
     */
    static get(url, options, callback) {
        HttpRequest.request("GET", url, null, options, callback);
    }
    /**
     * Make a POST request
     */
    static post(url, body, options, callback) {
        HttpRequest.request("POST", url, body, options, callback);
    }
    /**
     * Make POST request encoded as "application/x-www-form-urlencoded"
     */
    static form(url, formData, options, callback) {
        const parameters = [];
        for (const param of Object.keys(formData))
            parameters.push(`${param}=${encodeURIComponent(formData[param])}`);
        const body = parameters.join("&");
        if (!options.headers)
            options.headers = {};
        options.headers["Content-Type"] = "application/x-www-form-urlencoded";
        HttpRequest.request("POST", url, body, options, callback);
    }
    /**
     * Make a request
     */
    static request(method, url, body, options, callback) {
        let isCompleted = false;
        const req = new XMLHttpRequest();
        req.open(method, url, true);
        if (typeof options.headers === "object") {
            for (const name of Object.keys(options.headers))
                req.setRequestHeader(name, options.headers[name]);
        }
        req.timeout = typeof options.timeout === "number" ? options.timeout : 20 * 1000;
        req.responseType = options.responseType || "";
        req.onreadystatechange = req_readyStateChange;
        req.onerror = req_error;
        req.ontimeout = req_timeout;
        req.onabort = req_abort;
        req.send(body);
        function req_readyStateChange() {
            if (req.readyState !== XMLHttpRequest.DONE || req.status === 0)
                return;
            if (isCompleted)
                return;
            const headers = {};
            const resHeaders = req.getAllResponseHeaders().trim().split(/[\r\n]+/);
            for (const header of resHeaders) {
                const parts = header.split(": ");
                headers[parts[0]] = parts[1];
            }
            const isResponseText = req.responseType === "text" || req.responseType === "";
            isCompleted = true;
            callback({
                response: isResponseText ? undefined : req.response,
                responseText: isResponseText ? req.responseText : undefined,
                responseType: req.responseType,
                responseURL: req.responseURL,
                status: req.status,
                statusText: req.statusText,
                headers: headers,
            });
        }
        function req_abort() {
            resError("Request aborted");
        }
        function req_timeout() {
            resError("Request timeout");
        }
        function req_error() {
            resError("An error occurred during the transaction");
        }
        function resError(message) {
            if (isCompleted)
                return;
            isCompleted = true;
            callback({
                response: undefined,
                responseText: undefined,
                responseType: req.responseType,
                responseURL: url,
                status: req.status,
                statusText: message,
                headers: {},
            });
        }
    }
}
//# sourceMappingURL=index.js.map