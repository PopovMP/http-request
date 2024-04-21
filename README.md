# HttpRequest

Simple HTTP Request helper for the browser.

HttpRequest provides three methods: `get`, `post`, and `form`.

## Acquire

Get the `HttpRequest` class in TypeScript from the `lib` subdirectory.

Get `HttpRequest` compiled to a JavaScript class from the `application.js` file.


## Tests

See examples and tests: https://popovmp.github.io/http-request/

## Get Text

```TypeScript
const url:string = "https://httpbin.org/get";
const options: HttpRequestOptions = {};
HttpRequest.get(url, options, (res: HttpRequestResponse): void => {
    console.log(JSON.stringify(res));
});
```

## Get Json

```TypeScript
const url:string = "https://httpbin.org/get";
const options: HttpRequestOptions = {responseType: "json"};
HttpRequest.get(url, options, (res: HttpRequestResponse): void => {
    console.log(JSON.stringify(res));
});
```


## Get binary data

```TypeScript
const url     = "https://exmaple.com/buffer.bin";
const options = {headers: {}, responseType: "arraybuffer"};

HttpRequest.get(url, options, (res: HttpRequestResponse) => {
    if ((res.status === 200 || res.status === 304) && res.response !== undefined) {
        const buffer: ArrayBuffer = res.response;
        // Do somethign with the buffer
    }
    else {
        console.error(`Status: ${res.status}`);
    }
});
```

## Post JSON

```TypeScript
const url     = "https://exmaple.com/api/user";
const body    = {username: "John", email: "john@example.com", pasword: "12343"};
const options = {headers: {}, responseType: "json"};

HttpRequest.post(url, body, options, (res: HttpRequestResponse) => {
    const user: User = res.response;
});
```

## Post Form

```TypeScript
        const url: string = "https://httpbin.org/post";
const options: HttpRequestOptions = {responseType: "json"};
const form: {[param: string]: string|number} = {foo: "bar", baz: 42};
HttpRequest.form(url, form, options, (res: HttpRequestResponse): void => {
    console.log(JSON.stringify(res));
});
```
