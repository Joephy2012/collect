/**
 * 当当流量统计代码
 * @author langming@dangdang.com qiaofei@dangdang.com
 * @Date: 2016/10/26
 */



/**
 * json2.js
 * 2016-05-01
 */
if (typeof JSON !== "object") {
    JSON = {};
}

(function () {
    "use strict";

    var rx_one = /^[\],:{}\s]*$/;
    var rx_two = /\\(?:["\\\/bfnrt]|u[0-9a-fA-F]{4})/g;
    var rx_three = /"[^"\\\n\r]*"|true|false|null|-?\d+(?:\.\d*)?(?:[eE][+\-]?\d+)?/g;
    var rx_four = /(?:^|:|,)(?:\s*\[)+/g;
    var rx_escapable = /[\\\"\u0000-\u001f\u007f-\u009f\u00ad\u0600-\u0604\u070f\u17b4\u17b5\u200c-\u200f\u2028-\u202f\u2060-\u206f\ufeff\ufff0-\uffff]/g;
    var rx_dangerous = /[\u0000\u00ad\u0600-\u0604\u070f\u17b4\u17b5\u200c-\u200f\u2028-\u202f\u2060-\u206f\ufeff\ufff0-\uffff]/g;

    function f(n) {
        // Format integers to have at least two digits.
        return n < 10
            ? "0" + n
            : n;
    }

    function this_value() {
        return this.valueOf();
    }

    if (typeof Date.prototype.toJSON !== "function") {

        Date.prototype.toJSON = function () {

            return isFinite(this.valueOf())
                ? this.getUTCFullYear() + "-" +
            f(this.getUTCMonth() + 1) + "-" +
            f(this.getUTCDate()) + "T" +
            f(this.getUTCHours()) + ":" +
            f(this.getUTCMinutes()) + ":" +
            f(this.getUTCSeconds()) + "Z"
                : null;
        };

        Boolean.prototype.toJSON = this_value;
        Number.prototype.toJSON = this_value;
        String.prototype.toJSON = this_value;
    }

    var gap;
    var indent;
    var meta;
    var rep;


    function quote(string) {
        rx_escapable.lastIndex = 0;
        return rx_escapable.test(string)
            ? "\"" + string.replace(rx_escapable, function (a) {
            var c = meta[a];
            return typeof c === "string"
                ? c
                : "\\u" + ("0000" + a.charCodeAt(0).toString(16)).slice(-4);
        }) + "\""
            : "\"" + string + "\"";
    }


    function str(key, holder) {

        var i;          // The loop counter.
        var k;          // The member key.
        var v;          // The member value.
        var length;
        var mind = gap;
        var partial;
        var value = holder[key];

        if (value && typeof value === "object" &&
            typeof value.toJSON === "function") {
            value = value.toJSON(key);
        }

        if (typeof rep === "function") {
            value = rep.call(holder, key, value);
        }

        switch (typeof value) {
            case "string":
                return quote(value);

            case "number":

                return isFinite(value)
                    ? String(value)
                    : "null";

            case "boolean":
            case "null":

                return String(value);

            case "object":

                if (!value) {
                    return "null";
                }

                gap += indent;
                partial = [];

                if (Object.prototype.toString.apply(value) === "[object Array]") {

                    length = value.length;
                    for (i = 0; i < length; i += 1) {
                        partial[i] = str(i, value) || "null";
                    }

                    v = partial.length === 0
                        ? "[]"
                        : gap
                        ? "[\n" + gap + partial.join(",\n" + gap) + "\n" + mind + "]"
                        : "[" + partial.join(",") + "]";
                    gap = mind;
                    return v;
                }

                if (rep && typeof rep === "object") {
                    length = rep.length;
                    for (i = 0; i < length; i += 1) {
                        if (typeof rep[i] === "string") {
                            k = rep[i];
                            v = str(k, value);
                            if (v) {
                                partial.push(quote(k) + (
                                        gap
                                            ? ": "
                                            : ":"
                                    ) + v);
                            }
                        }
                    }
                } else {

                    for (k in value) {
                        if (Object.prototype.hasOwnProperty.call(value, k)) {
                            v = str(k, value);
                            if (v) {
                                partial.push(quote(k) + (
                                        gap
                                            ? ": "
                                            : ":"
                                    ) + v);
                            }
                        }
                    }
                }

                v = partial.length === 0
                    ? "{}"
                    : gap
                    ? "{\n" + gap + partial.join(",\n" + gap) + "\n" + mind + "}"
                    : "{" + partial.join(",") + "}";
                gap = mind;
                return v;
        }
    }

    if (typeof JSON.stringify !== "function") {
        meta = {    // table of character substitutions
            "\b": "\\b",
            "\t": "\\t",
            "\n": "\\n",
            "\f": "\\f",
            "\r": "\\r",
            "\"": "\\\"",
            "\\": "\\\\"
        };
        JSON.stringify = function (value, replacer, space) {
            var i;
            gap = "";
            indent = "";

            if (typeof space === "number") {
                for (i = 0; i < space; i += 1) {
                    indent += " ";
                }
            } else if (typeof space === "string") {
                indent = space;
            }

            rep = replacer;
            if (replacer && typeof replacer !== "function" &&
                (typeof replacer !== "object" ||
                typeof replacer.length !== "number")) {
                throw new Error("JSON.stringify");
            }

            return str("", {"": value});
        };
    }

    if (typeof JSON.parse !== "function") {
        JSON.parse = function (text, reviver) {
            var j;

            function walk(holder, key) {
                var k;
                var v;
                var value = holder[key];
                if (value && typeof value === "object") {
                    for (k in value) {
                        if (Object.prototype.hasOwnProperty.call(value, k)) {
                            v = walk(value, k);
                            if (v !== undefined) {
                                value[k] = v;
                            } else {
                                delete value[k];
                            }
                        }
                    }
                }
                return reviver.call(holder, key, value);
            }

            text = String(text);
            rx_dangerous.lastIndex = 0;
            if (rx_dangerous.test(text)) {
                text = text.replace(rx_dangerous, function (a) {
                    return "\\u" +
                        ("0000" + a.charCodeAt(0).toString(16)).slice(-4);
                });
            }

            if (
                rx_one.test(
                    text
                        .replace(rx_two, "@")
                        .replace(rx_three, "]")
                        .replace(rx_four, "")
                )
            ) {

                j = eval("(" + text + ")");

                return (typeof reviver === "function")
                    ? walk({"": j}, "")
                    : j;
            }

            throw new SyntaxError("JSON.parse");
        };
    }
}());


/**
 * 公用方法、函数
 */
var DDF;  //全局变量（用于存放常用方法、函数）
(function (window, undefined) {

    /**
     * 构造函数(实现无new操作)
     * @param selector CSS选择器
     * @param context  上下文
     * @returns F Object
     */
    var F = function (selector, context) {
        return new F.prototype.init(selector, context);
    };

    /**
     * F的实例方法
     */

    F.fn = F.prototype = {

        //初始化元素选择器
        init: function (selector, context) {
            context = context || document;
            var doms = this.qsa(context, selector);
            if (doms.length > 0) {

                //将selector以有序数组的形式并入this(F.fn)
                F.merge(this, doms);
                this.selector = doms;
            }
            return this;
        },

        //获得选择器数组长度
        size: function () {
            return this.length;
        },

        //筛选工具find
        find: function (selector) {
            if (this.selector) {
                var clear = false;
                var $this = this;
                F.each(this.selector, function (key, value) {

                    //清除上一次选择器dom
                    if (clear === false) {
                        $this.clearDom.call($this);
                        clear = true;
                    }
                    var doms = $this.qsa(value, selector);
                    if (doms.length > 0) {

                        //更新selector
                        $this.selector = typeof $this.selector == 'array' ? $this.selector : [];
                        F.merge($this.selector, doms);

                        //将selector以有序数组的形式并入F.fn
                        F.merge($this, doms);
                    }
                });
            }
            return this;
        },

        //元素选择器
        qsa: function (element, selector) {
            if (!selector) {

                //F(""), F(null), F(undefined);
                return [];
            } else if (selector.nodeType) {

                //F(DOMElement)
                var doms = [];
                doms.push(selector);
                return doms;
            } else if (selector === "body" && document.body) {

                //F('body')
                var doms = [];
                doms.push(document.body);
                return doms;

            } else if (selector == window) {
                var doms = [];
                doms.push(window);
                return doms;
            } else if (typeof selector == 'function') {

                //F(function(){}) F().ready(function(){});
                this.ready(selector);
                return [];
            } else if (typeof selector === "string") {
                if (F.idSelectorReg.test(selector)) {

                    //F("#id")
                    var doms = [];
                    doms.push(document.getElementById(selector.slice(1)));
                    return doms;
                } else if (element.querySelectorAll) {

                    //标准浏览器执行querySelectorAll方法
                    return element.querySelectorAll(selector);
                } else if (F.classSelectorReg.test(selector)) {

                    //兼容IE低版本类选择器（只支持F(".classname")单个类选择）
                    var tags = document.getElementsByTagName("*");
                    var doms = [];

                    for (var i in tags) {
                        if (tags[i].nodeType == 1) {
                            var attrs = getAttribute(tags[i], 'class');
                            var attrA = attrs.split(' ');
                            if (F.inArray(selector.slice(1), attrA)) {
                                doms.push(tags[i]);
                            }
                        }
                    }
                    return doms;
                } else if (F.attrSelectorReg.test(selector)) {

                    //兼容IE低版本属性选择器
                    var tags = document.getElementsByTagName("*");
                    var doms = [];
                    for (var i in $tags) {
                        if ($tags[i].nodeType == 1) {

                        }
                    }
                } else {

                    //其他复杂选择器暂不支持
                    return null;
                }
            }
        },

        //DOM文档加载后立即执行
        ready: function (fn) {
            F.bindReady();
            if (F.isReady) {
                fn.call(document, DDF);
            } else if (F.readyList) {
                F.readyList.push(fn);
            }
            return this;
        },

        //获得（赋值）属性方法
        attr: function (name, value) {
            if (arguments.length > 0 && typeof name == 'string') {

                var setAttribute = function (n, a, v) {
                    if (typeof n != 'object' || typeof a != 'string') return;
                    a == 'class' ? n.className = v : n.setAttribute(a, v);
                };
                if (arguments.length > 1) {

                    //赋值方法(可以为多个)
                    $this = this;
                    return F.each($this, function () {

                        //DDF().attr('name', null), DDF().attr('name', value)
                        value == null ? removeAttribute(this, name) : setAttribute(this, name, value);
                    })
                } else {

                    //取值方法(选择器只取第一个)
                    return typeof this[0] != 'undefined' && this[0].nodeType == 1 ? getAttribute(this[0], name) : null;
                }
            }
            return null;
        },

        //获得所有父级元素(不包含html)
        parents: function () {

            //选择器只取第一个
            if (typeof this[0] != 'undefined' && this[0].nodeType == 1) {
                var obj = this[0].parentNode;
                var doms = [];
                var clear = false;
                while (obj != null && obj.tagName != null && obj.tagName.toLowerCase() != 'html') {
                    if (clear === false) {
                        this.clearDom.call(this);
                        clear = true;
                    }
                    doms.push(obj);
                    obj = obj.parentNode;
                }
                F.merge(this, doms);
                return this;
            }
            return null;
        },

        //内部遍历方法
        each: function (callback) {
            F.each(this, callback);
            return this;
        },

        //转为dom对象
        dom: function () {
            return this.selector;
        },

        //清空选择器DOM对象
        clearDom: function () {
            for (var i = 0; i < this.length; i++) {
                delete this[i];
            }
            this.length = 0;
            this.selector = '';
        },


        /*
         * 获取css样式
         * */
        css: function (name, val) {
            var elem = this[0];
            var pros = /^(left|right|bottom|top)$/,
                //判断是否为W3C标准浏览器
                ecma = "getComputedStyle" in window;

            //只有一个参数
            if(arguments.length == 1 && val === undefined){

                //该参数时对象时，设置多个样式
                if( typeof name == "object"){
                    for(var i in name){
                        var i = formatStyleName(i)
                        elem.style[i] = name[i];

                    }
                    return this;
                }

                name = formatStyleName(name);

                // 参数为字符串，获取样式
                return !!elem.style[name] ?
                    elem.style[name] :
                    ecma ?
                        function(){
                            var val = getComputedStyle(elem, null)[name];

                            // 处理top，bottom，left，right为0的情况
                            if(pros.test(name) && val === "auto"){
                                return "0px"
                            }
                            return val;

                        }() :
                        function(){
                            var val = elem.currentStyle[name];

                            // 获取元素在IE6/7/8中的宽度和高度
                            if( name === "width" || name === "height" && val === "auto"){
                                var rect = elem.getBoundingClientRect();
                                return (name === "width" ? rect.right - rect.left : rect.bottom - rect.top) + "px";
                            }

                            // 获取元素在IE6/7/8中的透明度
                            if( name === "opacity" ){
                                var filter = elem.currentStyle.filter;
                                if( /opacity/.test(filter) ){
                                    val = filter.match( /\d / )[0] / 100;
                                    return (val === 1 || val === 0) ? val.toFixed(0) : val.toFixed(1);
                                }
                                else if( val === undefined ){
                                    return "1";
                                }
                            }

                            // 处理top、right、bottom、left为auto的情况
                            if( rPos.test(p) && val === "auto" ){
                                return "0px";
                            }
                            return val;

                        }()
            }else if(arguments.length == 2){
                //参数为两个，设置单个样式
                elem.style[name] = val;
                return this;
            }

        },

        /*
         * 获取window，document的宽高
         * 获取元素的尺寸及位置信息
         * return obj{ ** }
         * */
        site: function () {
            var elem = this[0], width, height;
            var doEle = document.documentElement, doBody = document.body;

            if (elem) {
                if (typeof elem == "object" && "setInterval" in elem) {
                    width = doEle.clientWidth || doBody.clientWidth;
                    height = doEle.clientHeight || doBody.clientHeight;
                    return {
                        width: width,
                        height: height
                    }
                } else if (elem == document) {
                    width = doEle.offsetWidth || doBody.offsetWidth;
                    height = doEle.offsetHeight || doBody.offsetHeight;
                    return {
                        width: width,
                        height: height
                    }
                } else {
                    res = elem.getBoundingClientRect();

                    return {
                        width: res.width || res.right - res.left,
                        height: res.height || res.bottom - res.top,
                        top: res.top,
                        left: res.left,
                        right: res.right,
                        bottom: res.bottom
                    }
                }
            }
        }


    };

    function formatStyleName(name){
        // 处理float
        name = (name === "float") ? ( ecma ? "CSSFloat" : "styleFloat") : name;

        //将中划线改成驼峰规则
        name = name.replace(/\-(\w)/g, function (a, b) {
            return b.toUpperCase();
        });
        return name;
    }

    F.prototype.init.prototype = F.prototype;


    /******以下为F的静态方法 常用函数*******/


    /**
     * ID Class Tag Attr 选择器的正则表达式
     * @type {RegExp}
     */
    F.idSelectorReg = /^#[\w-]+/i;
    F.classSelectorReg = /^\.[\w-]+$/i;
    F.tagSelectorReg = /^\w+$/;
    F.attrSelectorReg = /^[\w\*]+\[([\w-])+\]$/i;

    /**
     * 重写获得属性方法（IE做兼容）
     * @param n
     * @param a
     * @returns {string}
     */
    var getAttribute = function (n, a) {
        if (typeof n != 'object' || typeof a != 'string') return;
        return a == 'class' ? n.className : n.getAttribute(a);
    }

    var removeAttribute = function (n, a) {
        if (typeof n != 'object' || typeof a != 'string') return;
        n.removeAttribute(a);
        if (a == 'class') n.removeAttribute('className');
    }

    /**
     * 通用循环遍历方法
     * @param object 对象
     * @param callback 回调函数
     * @param args
     * @returns {}
     */
    F.each = function (object, callback, args) {
        var name, i = 0,
            length = object.length,
            isObj = length === undefined || typeof object == 'function';

        if (args) {
            if (isObj) {
                for (name in object) {
                    if (callback.apply(object[name], args) === false) {
                        break;
                    }
                }
            } else {
                for (; i < length;) {
                    if (callback.apply(object[i++], args) === false) {
                        break;
                    }
                }
            }
        } else {
            if (isObj) {
                for (name in object) {
                    if (callback.call(object[name], name, object[name]) === false) {
                        break;
                    }
                }
            } else {
                for (var value = object[0];
                     i < length && callback.call(value, i, value) !== false; value = object[++i]) {
                }
            }
        }

        return object;
    };

    /**
     * 合并数组
     * @param first
     * @param second
     * @returns {*}
     */
    F.merge = function (first, second) {
        var i = first.length || 0,
            j = 0;
        if (typeof second.length === "number") {
            for (var l = second.length; j < l; j++) {
                first[i++] = second[j];
            }
        } else {
            while (second[j] !== undefined) {
                first[i++] = second[j++];
            }
        }
        first.length = i;
        return first;
    };

    /**
     * 仅供F.fn.ready调用
     */
    F.isReady = false; //防止重复执行
    F.readyList = []; //保存需要执行的回调函数
    if (document.addEventListener) {
        var DOMContentLoaded = function () {
            document.removeEventListener("DOMContentLoaded", DOMContentLoaded, false);
            F.ready();
        };

    } else if (document.attachEvent) {
        var DOMContentLoaded = function () {
            if (document.readyState === "complete") {
                document.detachEvent("onreadystatechange", DOMContentLoaded);
                F.ready();
            }
        };
    }
    var doScrollCheck = function () {
        if (F.isReady) {
            return;
        }
        try {
            document.documentElement.doScroll("left");
        } catch (e) {
            setTimeout(doScrollCheck, 1);
            return;
        }
        F.ready();
    }
    F.bindReady = function () {

        //放置事件重复绑定
        if (readyBound) {
            return;
        }
        var readyBound = true;

        if (document.readyState === "complete") {
            return setTimeout(DDF.ready, 1);
        }
        if (document.addEventListener) {
            document.addEventListener("DOMContentLoaded", DOMContentLoaded, false);
            window.addEventListener("load", F.ready, false);
        } else if (document.attachEvent) {
            document.attachEvent("onreadystatechange", DOMContentLoaded);
            window.attachEvent("onload", F.ready);

            var toplevel = false;
            try {
                toplevel = window.frameElement == null;
            } catch (e) {
            }
            if (document.documentElement.doScroll && toplevel) {
                doScrollCheck();
            }
        }
    };
    F.ready = function () {
        if (!document.body) {
            return setTimeout(DDF.ready, 1); //需使用全局变量DDF
        }
        F.isReady = true;
        if (F.readyList) {
            var fns = F.readyList;
            F.readyList = null;

            //循环执行回调函数
            for (var i = 0; i < fns.length; i++) {
                fns[i].call(document, DDF);
            }
        }
    };

    /**
     * 是否存在数组当中
     * @param elem
     * @param array
     * @returns {*}
     */
    F.inArray = function (elem, array) {
        if (array.indexOf) {
            return array.indexOf(elem);
        }
        for (var i = 0, length = array.length; i < length; i++) {
            if (array[i] === elem) {
                return i;
            }
        }
        return -1;
    };

    /**
     * 同trim方法
     * @param text
     * @returns {*}
     */
    F.trim = function (text) {
        if (String.trim) {
            return text == null ? "" : String.trim.call(text);
        } else {
            return text == null ? "" : text.toString().replace(/^[\s\xA0]+/, "").replace(/[\s\xA0]+$/, "");
        }
    };

    /**
     * 是否为数组
     * @type {*|Function}
     */
    F.isArray = function (object) {
        return Array.isArray(object) || object instanceof Array;
    };

    /**
     * 获得当前时间
     * @returns {number}
     */
    F.now = function () {
        return (new Date()).getTime();
    };

    /**
     * 抛出错误
     * @param msg
     */
    F.error = function (msg) {
        throw msg;
    };

    /**
     * 获得浏览器信息
     * @returns {{os: string, browser: (*|string), version: (*|string)}}
     */
    F.browser = function () {
        var ua = navigator.userAgent;
        ua = ua.toLowerCase();

        var rwebkit = /(webkit)[ \/]([\w.]+)/,
            ropera = /(opera)(?:.*version)?[ \/]([\w.]+)/,
            rmsie = /(msie) ([\w.]+)/,
            rmozilla = /(mozilla)(?:.*? rv:([\w.]+))?/;

        var match = rwebkit.exec(ua) ||
            ropera.exec(ua) ||
            rmsie.exec(ua) ||
            ua.indexOf("compatible") < 0 && rmozilla.exec(ua) ||
            [];
        return {os: navigator.platform, browser: match[1] || "", version: match[2] || "0"};
    };

    /**
     * ajax请求
     * @param options
     */
    F.ajax = function (options) {
        options = options || {};
        options.type = (options.type || "GET").toUpperCase();
        options.async = (typeof options.async === "undefined") ? true : options.async;
        options.dataType = options.dataType || "json";
        var params = formatParams(options.data);

        var xhr;
        xhr = window.XMLHttpRequest ? new XMLHttpRequest() : new ActiveXObject();

        xhr.onreadystatechange = function (data) {
            if (xhr.readyState == 4 && xhr.status == 200) {
                var data = JSON.stringify(xhr.responseText);
                options.success && options.success(data)
            } else {
                options.fail && options.fail(status);
            }
        }

        if (options.type == "GET") {
            xhr.open("GET", options.url + "?" + params, options.async);
            xhr.send(null);
        } else if (options.type == "POST") {
            xhr.open("POST", options.url, options.async);
            xhr.send(params);
        }
    };


    F.access = function( elems, key, value, exec, fn, pass ){
        var length = elems.length;

        //设置多个属性
        if ( typeof key === "object" ) {
            for ( var k in key ) {
                F.access( elems, k, key[k], exec, fn, value );
            }
            return elems;
        }

        //设置单个属性
        if ( value !== undefined ) {
            // 可选参数
            exec = !pass && exec && typeof value === "function";

            for ( var i = 0; i < length; i++ ) {
                fn( elems[i], key, exec ? value.call( elems[i], i, fn( elems[i], key ) ) : value, pass );
            }

            return elems;
        }

        return length ? fn( elems[0], key ) : undefined;
    }






    // 格式化参数
    function formatParams(data) {
        var arr = [];
        for (var name in data) {
            arr.push(encodeURIComponent(name) + "=" + encodeURIComponent(data[name]));
        }
        return arr.join("&");
    }


    window.DDF = F;
})(window);

