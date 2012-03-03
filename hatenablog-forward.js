var INDICATION_URL = "file:///dev/null?hatenablog-forward";
var EDIT_PAGE_URL = "http://blog.hatena.ne.jp/oupo/oupo.hatenablog.com/edit";

var RE_INDICATION_URL = "^"+util.escapeRegex(INDICATION_URL);
autocommands.remove("PageLoad", RE_INDICATION_URL);
autocommands.add("PageLoad", RE_INDICATION_URL, function () {
	var url = content.location.href;
	var path = url.match(RE_INDICATION_URL+",(.+)")[1];
	gBrowser.removeCurrentTab();
	var text = convertText(File(path).read());
	openEditPage(function() {
		change(text);
	});
});

function change(text) {
	var doc = content.document.wrappedJSObject;
	var edit_anchor = doc.querySelector("li.tab-edit a");
	var textarea = doc.getElementById("body");
	var preview_anchor = doc.querySelector("li.tab-preview a");
	edit_anchor.click();
	textarea.value = text;
	preview_anchor.click();
}

function openEditPage(callback) {
	if (content.location.href.indexOf(EDIT_PAGE_URL) === 0) {
		callback();
		return;
	}
	var tab = gBrowser.addTab(EDIT_PAGE_URL);
	gBrowser.selectedTab = tab;
	var browser = gBrowser.getBrowserForTab(tab);
	browser.addEventListener("load", onLoad, true);

	function onLoad() {
		browser.removeEventListener("load", onLoad, true);
		callback();
	}
}

