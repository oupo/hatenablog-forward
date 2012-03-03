var TEX_REPLACEMENT_MAP = [
	[/%([NZQRC])/g, "\\mathbb{$1}"], // 集合
	[/<==/g, "\\Leftarrow "],
	[/==>/g, "\\Rightarrow "],
	[/<=>/g, "\\Leftrightarrow "],
	[/<=/g, "\\le "],
	[/>=/g, "\\ge "],
	[/, /g, "\\ ,\\ \\ "], // カンマ並びにスペースを
	[/%\|/g, "\\left|"], // 絶対値
	[/\|%/g, "\\right|"],

	[/<(\w)/g, "< $1"], // HTMLタグ？と判別されておかしくなるのでスペースを開ける
	[/\]/g, "\\]"], // 閉じ角括弧のエスケープ
]

function convertText(src) {
	var tokens = parseText(src);
	return tokens.reduce(function (r, token) {
		var [type, val] = token;
		if (type === "marked") {
			return r + val;
		} else if (type === "plain") {
			return r + convertTextPlain(val);
		}
	}, "");
}

function parseText(src) {
	var rest = "\n" + src; // \nを行頭マッチの代わりに使うため
	var tokens = [];
	while (rest !== "") {
		var m;
		m = rest.match(/^\[\w+:(?:[^\]]|\\.)*\]/); // [tex:..], [http://..] など
		m = m || rest.match(/^\n(?:\*+|-+)/); // 見出し・リスト
		if (m) {
			tokens.push(["marked", m[0]]);
			rest = rest.slice(m[0].length);
			continue;
		}
		addPlainChar(tokens, rest[0]);
		rest = rest.slice(1);
	}
	tokens[0][1] = tokens[0][1].slice(1); // 追加しておいた\nを消す
	return tokens;

	function addPlainChar(tokens, chara) {
		var lastToken = tokens[tokens.length - 1];
		if (lastToken && lastToken[0] == "plain") {
			lastToken[1] += rest[0];
		} else {
			tokens.push(["plain", rest[0]]);
		}

	}
}

function convertTextPlain(src) {
	return src.replace(/(?:[!-~][ -~]*[!-~]|[!-~])/g, function(s) {
		if (s[0] == ":") {
			// ":"は普通の文章中に使いたい
			return s[0] + convertTextPlain(s.slice(1));
		}
		if ((/^_.+_/).test(s)) {
			// _をつけることでtex記法になるのを抑止する機能
			// ex) "_abc_ def" => "abc [tex:def]"
			return s.replace(/^_(.+?)_(.*)/,
			                 function (ss, a, b) a + convertTextPlain(b));
		}
		if (/^\d+$/.test(s)) return s; // ただの数字はそのまま
		return "[tex:"+replaceTex(s)+"]";
	});
}

function replaceTex(src) {
	return TEX_REPLACEMENT_MAP.reduce(function (r, [regexp, to]) r.replace(regexp, to), src);
}

