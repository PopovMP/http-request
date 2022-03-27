type HttpRequestOptions = {
	headers?      : object
	responseType? : XMLHttpRequestResponseType
}

type HttpRequestResponse = {
	readyState    : number
	response?     : any
	responseText? : string
	responseType  : XMLHttpRequestResponseType
	responseURL   : string
	status        : number
	statusText    : string
	headers       : Record<string, string>
}

type HttpRequestCallback = (res: HttpRequestResponse) => void

/**
 * Provides get and post methods
 * @class HttpRequest
 */
class HttpRequest
{
	/**
	 * Makes a GET request
	 */
	public static get(url: string, options: HttpRequestOptions, callback: HttpRequestCallback): void
	{
		HttpRequest.request('GET', url, null, options, callback)
	}

	/**
	 * Makes a POST request
	 */
	public static post(url: string, body: any, options: HttpRequestOptions, callback: HttpRequestCallback): void
	{
		HttpRequest.request('POST', url, body, options, callback)
	}

	/**
	 * Makes a request
	 */
	private static request(method: string, url: string, body: any, options: HttpRequestOptions,
	                       callback: HttpRequestCallback): void
	{
		const req = new XMLHttpRequest()

		req.open(method, url, true)

		if (typeof options.headers === 'object') {
			for (const name of Object.keys(options.headers)) {
				// @ts-ignore
				req.setRequestHeader(name, options.headers[name])
			}
		}

		if (typeof options.responseType === 'string') {
			req.responseType = options.responseType
		}

		req.onreadystatechange = HttpRequest.req_readyStateChange.bind(this, req, callback)
		req.onerror            = HttpRequest.req_error.bind(this, callback)
		req.send(body)
	}

	/**
	 * Handles XMLHttpRequest :: onreadystatechange
	 * Calls the callback when the XMLHttpRequest is DONE
	 */
	static req_readyStateChange(req: XMLHttpRequest, callback: HttpRequestCallback): void
	{
		if (req.readyState !== XMLHttpRequest.DONE)
			return

		const headers = {}
		const reqResponseHeaders = req.getAllResponseHeaders().trim().split(/[\r\n]+/)
		for (const header of reqResponseHeaders) {
			const parts = header.split(': ')
			// @ts-ignore
			headers[parts[0]] = parts[1]
		}

		const isResponseText = req.responseType === 'text' || req.responseType === ''

		callback({
			readyState  : req.readyState,
			response    : isResponseText ? undefined : req.response,
			responseText: isResponseText ? req.responseText : undefined,
			responseType: req.responseType,
			responseURL : req.responseURL,
			status      : req.status,
			statusText  : req.statusText,
			headers     : headers,
		})
	}

	/**
	 * Handles XMLHttpRequest :: onerror
	 * Calls the callback when the XMLHttpRequest rises an error
	 */
	static req_error(callback: HttpRequestCallback): void
	{
		callback({
			readyState  : 4,
			responseType: '',
			responseURL : '',
			status      : 400,
			statusText  : 'An error occurred during the transaction',
			headers     : {},
		})
	}
}
