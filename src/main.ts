function doGet() {
	return HtmlService.createTemplateFromFile("index").evaluate();
}

function getUserName(token: string, user: string) {
	const headers: GoogleAppsScript.URL_Fetch.HttpHeaders = {
		"Authorization": "Bearer "+ token,
	};
	const options:GoogleAppsScript.URL_Fetch.URLFetchRequestOptions = {
		"method" : "post",
		"headers": headers,
		"contentType": "application/json",
	};

	const requestURI = "https://slack.com/api/users.info?user=" + user;
	const response = UrlFetchApp.fetch(requestURI, options);
	const json = JSON.parse(response.getContentText());

	return json.user.name;
}

function getReplies(token: string, url: string) {
	const headers: GoogleAppsScript.URL_Fetch.HttpHeaders = {
		"Authorization": "Bearer "+ token,
	};
	const options:GoogleAppsScript.URL_Fetch.URLFetchRequestOptions = {
		"method" : "post",
		"headers": headers,
		"contentType": "application/json",
	};

	const matches = url.match(/(\w+):\/\/([\w.]+)\/([\w.]+)\/([\w.]+)\/p([\w.]+)/);	// 形式変わったらつらい.
	if (matches == null || matches.length != 6) {
		return null;
	}

	const channel = matches[4];
	const ts = matches[5].substring(0, 10) + "." + matches[5].substring(10);	// まあ、いいでしょう.

	const requestURI = "https://slack.com/api/conversations.replies?channel=" + channel + "&ts=" + ts;
	const response = UrlFetchApp.fetch(requestURI, options);
	const json = JSON.parse(response.getContentText());

	if (json.ok == "false") {
		return null;
	}

	// メッセージごとに処理していく.
	let ret: string[] = [];
	for (var i = 0; i < json.messages.length; ++i) {
		const name = getUserName(token, json.messages[i].user);
		ret.push(name + "：" + json.messages[i].text);
	}

	return ret;
}
