load("convert-text.js");
load("hatenablog-forward.js");

function load(filename) {
	var dir = File(__context__.PATH).parent.path;
	var file = File.joinPaths(dir, filename);
	var uri = services.get("io").newFileURI(file).spec;
	liberator.loadScript(uri+"?"+Date.now(), __context__);
}

