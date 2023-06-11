# HttpRequest

Simple HTTP Request helper for the browser

## Get JSON

```TypeScript
const url      = "https://example.com/foo.json";
const oprtions = {responseType: "json"};

HttpRequest.get(url, options, (res: HttpRequestResponse) => {
	const foo = res.response;
})
```

## Get binary data

```TypeScript
const url     = "https://exmaple.com/buffer.bin";
const options = {
	headers     : {},
	responseType: "arraybuffer" as XMLHttpRequestResponseType,
};

HttpRequest.get(url, options, (res: HttpRequestResponse) => {
	if ( (res.status === 200 || res.status === 304) && res.response !== undefined) {
		const buffer: ArrayBuffer = res.response;
		// do somethign with the buffer
	}
	else {
		console.error(`Status: ${res.status}`);
	}
})
```
