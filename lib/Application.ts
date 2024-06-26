class Application {
    public initialize(): void {
        (document.getElementById("get-text-btn") as HTMLElement)
            .addEventListener("click", this.getTextTest.bind(this));
        (document.getElementById("get-json-btn") as HTMLElement)
            .addEventListener("click", this.getJsonTest.bind(this));
        (document.getElementById("post-text-btn") as HTMLElement)
            .addEventListener("click", this.postTextTest.bind(this));
        (document.getElementById("post-json-btn") as HTMLElement)
            .addEventListener("click", this.postJsonTest.bind(this));
        (document.getElementById("post-form-btn") as HTMLElement)
            .addEventListener("click", this.postFormTest.bind(this));
        (document.getElementById("post-timeout-btn") as HTMLElement)
            .addEventListener("click", this.postTimeoutTest.bind(this));
        (document.getElementById("post-404-btn") as HTMLElement)
            .addEventListener("click", this.post404Test.bind(this));
    }

    public getTextTest(event: Event): void {
        event.preventDefault();
        const resField: HTMLElement = document.getElementById("get-text-res") as HTMLElement;

        const url    : string             = "https://httpbin.org/get";
        const options: HttpRequestOptions = {responseType: "text"};

        HttpRequest.get(url, options, (res: HttpRequestResponse): void => {
            resField.innerText = JSON.stringify(res, null, 2);
        });
    }

    public getJsonTest(event: Event): void {
        event.preventDefault();
        const resField: HTMLElement = document.getElementById("get-json-res") as HTMLElement;

        const url    : string             = "https://httpbin.org/get";
        const options: HttpRequestOptions = {responseType: "json"};

        HttpRequest.get(url, options, (res: HttpRequestResponse): void => {
            resField.innerText = JSON.stringify(res, null, 2);
        });
    }

    public postTextTest(event: Event): void {
        event.preventDefault();
        const resField: HTMLElement = document.getElementById("post-text-res") as HTMLElement;

        const url    : string             = "https://httpbin.org/post";
        const options: HttpRequestOptions = {responseType: "json"};
        const bodyTxt: string             = "Hello, world!";

        HttpRequest.post(url, bodyTxt, options, (res: HttpRequestResponse): void => {
            resField.innerText = JSON.stringify(res, null, 2);
        });
    }

    public postJsonTest(event: Event): void {
        event.preventDefault();
        const resField: HTMLElement = document.getElementById("post-json-res") as HTMLElement;

        const url    : string             = "https://httpbin.org/anything";
        const options: HttpRequestOptions = {responseType: "json"};
        const body   : any                = {foo: "bar", baz: 42};

        HttpRequest.json(url, body, options, (res: HttpRequestResponse): void => {
            resField.innerText = JSON.stringify(res, null, 2);
        });
    }

    public postFormTest(event: Event): void {
        event.preventDefault();
        const resField: HTMLElement = document.getElementById("post-form-res") as HTMLElement;

        const url    : string                               = "https://httpbin.org/post";
        const options: HttpRequestOptions                   = {responseType: "json"};
        const form   : { [param: string]: string | number } = {foo: "bar", baz: 42};

        HttpRequest.form(url, form, options, (res: HttpRequestResponse): void => {
            resField.innerText = JSON.stringify(res, null, 2);
        });
    }

    public postTimeoutTest(event: Event): void {
        event.preventDefault();
        const resField: HTMLElement = document.getElementById("post-timeout-res") as HTMLElement;

        const url    : string             = "https://httpbin.org/delay/10";
        const options: HttpRequestOptions = {timeout: 2 * 1000, responseType: "json"};

        HttpRequest.get(url, options, (res: HttpRequestResponse): void => {
            resField.innerText = JSON.stringify(res, null, 2);
        });
    }

    public post404Test(event: Event): void {
        event.preventDefault();
        const resField: HTMLElement = document.getElementById("post-404-res") as HTMLElement;

        const url    : string             = "https://httpbin.org/status/404";
        const options: HttpRequestOptions = {responseType: "json"};

        HttpRequest.get(url, options, (res: HttpRequestResponse): void => {
            resField.innerText = JSON.stringify(res, null, 2);
        });
    }
}
