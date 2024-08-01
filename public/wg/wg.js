
const unsafeWindow = window;
const GM_info = {};

var httpRequest = new XMLHttpRequest();//第一步：建立所需的对象
httpRequest.open('GET', 'http://wsmud.ii74.com/S/version', true);//第二步：打开连接  将请求参数写在url中  ps:"./Ptest.php?name=test&nameone=testone"
httpRequest.send();//第三步：发送请求  将请求参数写在URL中
/**
 * 获取数据后的处理程序
 */
httpRequest.onreadystatechange = function () {
  if (httpRequest.readyState == 4 && httpRequest.status == 200) {
    var json = httpRequest.responseText;//获取到json字符串，还需解析
    console.log(json);
    GM_info.script = JSON.parse(json);
  }
};


GM_info.script = {"version":""}
function GM_addStyle(css) {
  try {
    var style = document.createElement('style');
    style.textContent = css;
    (document.head || document.body || document.documentElement || document).appendChild(style);
  } catch (e) {
    console.log('GM_addStyle: ' + e);
  }
}

function GM_setValue(key, value) {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch(e) {
    console.log('GM_setValue: ' + e);
  }
}

function GM_getValue(key, defaultValue) {
  let value = localStorage.getItem(key);
  if (!value) {
    return defaultValue;
  }
  try {
    return JSON.parse(value);
  } catch (e) {
    console.log('GM_getValue: ' + e);
    return defaultValue;
  }
}
function GM_listValues(){
    let len = localStorage.length;
    let list = [];
    for(let i = 0 ; i < len; i++){
		if(localStorage.key(i)!='roles'){
			list.push(localStorage.key(i))
		}
    }
    return list;
}
function GM_deleteValue(key) {
  localStorage.removeItem(key);
}

function GM_setClipboard(content) {
  let transfer = document.createElement('input');
  document.body.appendChild(transfer);
  transfer.value = content;
  transfer.focus();
  transfer.select();
  try {
    document.execCommand('copy');
  } catch(e) {
    console.log('GM_setClipboard: ' + e.message);
  }
  transfer.blur();
  document.body.removeChild(transfer);
}
function GM_export(){
    try{
        let lis =GM_listValues();
        let data = {};
        for(let i = 0 ; i<lis.length;i++){
            data[lis[i]] = GM_getValue(lis[i]);
        }
        let res = JSON.stringify(data);
        console.log(res);
        android.myexport(res);
    }
    catch(e){
        console.log('GM_export: ' + e.message);
    }
}
function GM_import(content){
    let _json = content;
    for(let item in _json){
        GM_setValue(item,_json[item])
    }
}
// ==UserScript==
// @name         wsmud_pluginss
// @namespace    cqv1
// @version      0.0.32.300
// @date         01/07/2018
// @modified     07/03/2024
// @homepage     https://greasyfork.org/zh-CN/scripts/371372
// @description  武神传说 MUD 武神脚本 武神传说 脚本 qq群367657589
// @author       fjcqv(源程序) & zhzhwcn(提供websocket监听)& knva(做了一些微小的贡献) &Bob.cn(raid.js作者)
// @match        http://*.wsmud.com/*
// @match        http://*.wamud.com/*
// @run-at       document-start
// @require      https://s4.zstatic.net/ajax/libs/vue/2.2.2/vue.min.js
// @require      https://s4.zstatic.net/ajax/libs/jquery/3.3.1/jquery.min.js
// @require      https://s4.zstatic.net/ajax/libs/store.js/2.0.12/store.modern.min.js
// @require      https://s4.zstatic.net/ajax/libs/jquery-contextmenu/3.0.0-beta.2/jquery.contextMenu.min.js
// @grant        unsafeWindow
// @grant        GM_addStyle
// @grant        GM_getValue
// @grant        GM_setValue
// @grant        GM_listValues
// @grant        GM_setClipboard
// @grant        GM_deleteValue
// @grant        GM_registerMenuCommand

// ==/UserScript==

(function () {
    'use strict';
    Array.prototype.baoremove = function (dx) {
        if (isNaN(dx) || dx > this.length) {
            return false;
        }
        this.splice(dx, 1);
    };
    Array.prototype.remove = function (val) {
        var index = this.indexOf(val);
        if (index > -1) {
            this.splice(index, 1);
        }
    };
    String.prototype.replaceAll = function (s1, s2) {
        return this.replace(new RegExp(s1, "gm"), s2);
    };
    var copyToClipboard = function (text) {
        var textarea = document.createElement('textarea');
        textarea.value = text;
        document.body.appendChild(textarea);
        textarea.select();

        document.execCommand("Copy");
        textarea.parentNode.removeChild(textarea);
    };
    function dateFormat(fmt, date) {
        let ret;
        const opt = {
            "Y+": date.getFullYear().toString(),        // 年
            "m+": (date.getMonth() + 1).toString(),     // 月
            "d+": date.getDate().toString(),            // 日
            "H+": date.getHours().toString(),           // 时
            "M+": date.getMinutes().toString(),         // 分
            "S+": date.getSeconds().toString()          // 秒
            // 有其他格式化字符需求可以继续添加，必须转化成字符串
        };
        for (let k in opt) {
            ret = new RegExp("(" + k + ")").exec(fmt);
            if (ret) {
                fmt = fmt.replace(ret[1], (ret[1].length == 1) ? (opt[k]) : (opt[k].padStart(ret[1].length, "0")))
            };
        };
        return fmt;
    }

    //滚动 -- fork from Suqing funny ---------------fixed
    function AutoScroll(name) {
        if (name) {
            if ($(name).length != 0) {
                let scrollTop = $(name)[0].scrollTop;
                let scrollHeight = $(name)[0].scrollHeight;
                let height = Math.ceil($(name).height());
                if (scrollTop < scrollHeight - height) {
                    let add = (scrollHeight - height < 120) ? 1 : Math.ceil((scrollHeight - height) / 120);
                    $(name)[0].scrollTop = scrollTop + add;
                    setTimeout(function () {
                        AutoScroll(name);
                    }, 1000 / 120);
                }
            }
        }
    }


    /**
     * 为数字加上单位：万或亿
     *
     * 例如：
     * 1000.01 => 1000.01
     * 10000 => 1万
     * 99000 => 9.9万
     * 566000 => 56.6万
     * 5660000 => 566万
     * 44440000 => 4444万
     * 11111000 => 1111.1万
     * 444400000 => 4.44亿
     * 40000000,00000000,00000000 => 4000万亿亿
     * 4,00000000,00000000,00000000 => 4亿亿亿
     *
     * @param {number} number 输入数字.
     * @param {number} decimalDigit 小数点后最多位数，默认为2
     * @return {string} 加上单位后的数字
     */

    function addWan(integer, number, mutiple, decimalDigit) {

        var digit = getDigit(integer);
        if (digit > 3) {
            var remainder = digit % 8;
            if (remainder >= 5) { // ‘十万’、‘百万’、‘千万’显示为‘万’
                remainder = 4;
            }
            return Math.round(number / Math.pow(10, remainder + mutiple - decimalDigit)) / Math.pow(10, decimalDigit) + '万';
        } else {
            return Math.round(number / Math.pow(10, mutiple - decimalDigit)) / Math.pow(10, decimalDigit);
        }
    }
    function getDigit(integer) {
        var digit = -1;
        while (integer >= 1) {
            digit++;
            integer = integer / 10;
        }
        return digit;
    }
    function addChineseUnit(number, decimalDigit) {

        decimalDigit = decimalDigit == null ? 2 : decimalDigit;
        var integer = Math.floor(number);
        var digit = getDigit(integer);
        // ['个', '十', '百', '千', '万', '十万', '百万', '千万'];
        var unit = [];
        if (digit > 3) {
            var multiple = Math.floor(digit / 8);
            if (multiple >= 1) {
                var tmp = Math.round(integer / Math.pow(10, 8 * multiple));
                unit.push(addWan(tmp, number, 8 * multiple, decimalDigit));
                for (var i = 0; i < multiple; i++) {
                    unit.push('亿');
                }
                return unit.join('');
            } else {
                return addWan(integer, number, 0, decimalDigit);
            }
        } else {
            return number;
        }
    }
    function getQueryVariable(variable) {
        var query = window.location.search.substring(1);
        var vars = query.split("&");
        for (var i = 0; i < vars.length; i++) {
            var pair = vars[i].split("=");
            if (pair[0] == variable) { return pair[1]; }
        }
        return (false);
    }
    var CanUse = false;
    if (WebSocket) {
        console.log('插件可正常运行,Plugins can run normally');
        CanUse = true;
        function show_msg(msg) {
            ws_on_message({
                type: "text",
                data: msg
            });
        }
        var _ws = WebSocket,
            ws, ws_on_message;
        unsafeWindow.WebSocket = function (uri) {
            ws = new _ws(uri);
            //document.getElementsByClassName("signinfo")[0].innerHTML = "<HIR>武神传说SS插件正常运行！ QQ群 367657589</HIR>"
            //$('.signinfo').on('click', function () {
            //    ProConsole.init();
            //});
        };
        unsafeWindow.WebSocket.prototype = {
            CONNECTING: _ws.CONNECTING,
            OPEN: _ws.OPEN,
            CLOSING: _ws.CLOSING,
            CLOSED: _ws.CLOSED,
            get url() {
                return ws.url;
            },
            get protocol() {
                return ws.protocol;
            },
            get readyState() {
                return ws.readyState;
            },
            get bufferedAmount() {
                return ws.bufferedAmount;
            },
            get extensions() {
                return ws.extensions;
            },
            get binaryType() {
                return ws.binaryType;
            },
            set binaryType(t) {
                ws.binaryType = t;
            },
            get onopen() {
                return ws.onopen;
            },
            set onopen(fn) {
                ws.onopen = fn;
            },
            get onmessage() {
                return ws.onmessage;
            },
            set onmessage(fn) {
                ws_on_message = fn;
                ws.onmessage = WG.receive_message;
                if (unsafeWindow.funny) {
                    if (unsafeWindow.funny.API != null) {
                        unsafeWindow.funny.API.ws_on_message = fn
                        unsafeWindow.funny.API.websocket = ws
                    }
                }
            },
            get onclose() {
                return ws.onclose;
            },
            set onclose(fn) {
                ws.onclose = (e) => {
                    WG.online = false;
                    G.connected = false;
                    auto_relogin = GM_getValue(roleid + "_auto_relogin", auto_relogin);
                    fn(e);
                    if (auto_relogin == "开") {
                        setTimeout(() => {
                            console.log(new Date());
                            KEY.do_command("score");
                        }, 10000);
                    }
                }

            },
            get onerror() {
                return ws.onerror;
            },
            set onerror(fn) {
                ws.onerror = fn;
            },
            send: function (text) {
                if (G.cookie == undefined) {
                    G.cookie = text;
                }
                if (text.indexOf(G.id) > -1 && !G.connected) {
                    text = G.cookie + ' ' + G.id
                }
                if (G.cmd_echo) {
                    show_msg('<hiy>' + text + '</hiy>');
                }
                if (text[0] == "$") {
                    WG.SendCmd(text);
                    return;
                }
                if (text[0] == '@') {
                    if (unsafeWindow && unsafeWindow.ToRaid) {
                        ToRaid.perform(text);
                        return;
                    } else {
                        messageAppend("插件未安装,请访问 https://greasyfork.org/zh-CN/scripts/375851-wsmud-raid 下载并安装");
                        window.open("https://greasyfork.org/zh-CN/scripts/375851-wsmud-raid ", '_blank').location;
                    }
                }
                if (text.indexOf('drop') == 0) {
                    var itemids = text.split(' ');
                    var itemid = itemids[itemids.length - 1];
                    WG.getItemNameByid(itemid, function (name) {
                        if (lock_list.indexOf(name) >= 0) {
                            messageAppend(`已锁物品${name}，无法丢弃，请解锁后重试`);
                            return;
                        } else {
                            ws.send(text);
                        }
                    })
                    return;
                }
                if (text.indexOf('jh ') == 0 || text.indexOf("go ") == 0) {
                    if (auto_rewardgoto == "开") {
                        WG.Send("tm " + text);
                    }
                }

                switch (text) {
                    case 'sm':
                        T.sm();
                        break;
                    case 'wk':
                        WG.zdwk();
                        break;
                    case 'backup':
                        WG.make_config();
                        break;
                    case 'load':
                        WG.load_config();
                        break;
                    default:
                        ws.send(text);
                        break;
                }
            },
            close: function () {
                ws.close();
            }
        };

        var cmd_queue = [],
            cmd_busy = false,
            echo = false;
        var _send_cmd = function () {
            if (!ws || ws.readyState != 1) {
                cmd_busy = false;
                cmd_queue = []
            } else if (cmd_queue.length > 0) {
                cmd_busy = true;
                var t = new Date().getTime();
                for (var i = 0; i < cmd_queue.length; i++) {
                    if (!cmd_queue[i].timestamp || cmd_queue[i].timestamp >= t - 1300) {
                        cmd_queue.splice(0, i);
                        break
                    }
                }
                for (i = 0; i < Math.min(cmd_queue.length, 5); i++) {
                    if (!cmd_queue[i].timestamp) {
                        try {
                            ws.send(cmd_queue[i].cmd);
                            cmd_queue[i].timestamp = t
                        } catch (e) {
                            cmd_busy = false;
                            cmd_queue = [];
                            return
                        }
                    }
                }
                if (!cmd_queue[cmd_queue.length - 1].timestamp) {
                    setTimeout(_send_cmd, 100)
                } else {
                    cmd_busy = false
                }
            } else {
                cmd_busy = false
            }
        };
        var send_cmd = function (cmd, no_queue) {
            if (ws && ws.readyState == 1) {
                cmd = cmd instanceof Array ? cmd : cmd.split(';');
                if (no_queue) {
                    for (var i = 0; i < cmd.length; i++) {
                        if (G.cmd_echo) {
                            show_msg('<hiy>' + cmd[i] + '</hiy>')
                        }
                        ws.send(cmd[i])
                    }
                } else {
                    for (i = 0; i < cmd.length; i++) {
                        cmd_queue.push({
                            cmd: cmd[i],
                            timestamp: 0
                        })
                    }
                    if (!cmd_busy) {
                        _send_cmd()
                    }
                }
            }
        };

    } else {
        console.log("插件不可运行,请打开'https://greasyfork.org/zh-CN/forum/discussion/41547/x'");
        //document.getElementsByClassName("signinfo")[0].innerHTML = "<HIR>武神传说SS插件没有正常运行！请使用CTRL+F5刷新 QQ群 367657589</HIR>"

    }
    var L = {
        msg: function (msg) {
            const interval = setInterval(() => {
                if (typeof layer !== 'undefined') {
                    clearInterval(interval);
                    layer.msg(msg, {
                        offset: '50%',
                        shift: 5
                    });
                } else {
                    var server = document.createElement('script');
                    server.setAttribute('src', 'https://s4.zstatic.net/ajax/libs/layer/2.3/layer.js');
                    document.head.appendChild(server);
                }
            }, 500); // 每500毫秒检查一次
        },
        isMobile: function () {
            var ua = navigator.userAgent;
            var ipad = ua.match(/(iPad).*OS\s([\d_]+)/),
                isIphone = !ipad && ua.match(/(iPhone\sOS)\s([\d_]+)/),
                isAndroid = ua.match(/(Android)\s+([\d.]+)/),
                isMobile = isIphone || isAndroid;
            return isMobile;
        }
    };

    var roomItemSelectIndex = -1;
    var timer = 0;
    var cnt = 0;
    var zb_npc;
    var zb_place;
    var next = 0;
    var roomData = [];
    var packData = []; // 背包数据
    var storeData = [];// 仓库数据
    var eqData = [];
    var store_list = [];
    var lock_list = [];
    var needfind = {
        "武当派-林间小径": ["go south"],
        "峨眉派-走廊": ["go north", "go south;go south", "go north;go east;go east"],
        "丐帮-暗道": ["go east", "go east;go east", "go east"],
        "逍遥派-林间小道": ["go west;go north", "go south;go south", "go north;go west"],
        "少林派-竹林": ["go north"],
        "逍遥派-地下石室": ["go up"],
        "逍遥派-木屋": ["go south;go south;go south;go south"]
    };
    var pgoods = {};
    var goods = {
        "米饭": {
            "id": null,
            "type": "wht",
            "sales": "店小二",
            "place": "扬州城-醉仙楼"
        },
        "包子": {
            "id": null,
            "type": "wht",
            "sales": "店小二",
            "place": "扬州城-醉仙楼"
        },
        "鸡腿": {
            "id": null,
            "type": "wht",
            "sales": "店小二",
            "place": "扬州城-醉仙楼"
        },
        "面条": {
            "id": null,
            "type": "wht",
            "sales": "店小二",
            "place": "扬州城-醉仙楼"
        },
        "扬州炒饭": {
            "id": null,
            "type": "wht",
            "sales": "店小二",
            "place": "扬州城-醉仙楼"
        },
        "米酒": {
            "id": null,
            "type": "wht",
            "sales": "店小二",
            "place": "扬州城-醉仙楼"
        },
        "花雕酒": {
            "id": null,
            "type": "wht",
            "sales": "店小二",
            "place": "扬州城-醉仙楼"
        },
        "女儿红": {
            "id": null,
            "type": "wht",
            "sales": "店小二",
            "place": "扬州城-醉仙楼"
        },
        "醉仙酿": {
            "id": null,
            "type": "hig",
            "sales": "店小二",
            "place": "扬州城-醉仙楼"
        },
        "神仙醉": {
            "id": null,
            "type": "hiy",
            "sales": "店小二",
            "place": "扬州城-醉仙楼"
        },
        "布衣": {
            "id": null,
            "type": "wht",
            "sales": "杂货铺老板 杨永福",
            "place": "扬州城-杂货铺"
        },
        "钢刀": {
            "id": null,
            "type": "wht",
            "sales": "杂货铺老板 杨永福",
            "place": "扬州城-杂货铺"
        },
        "木棍": {
            "id": null,
            "type": "wht",
            "sales": "杂货铺老板 杨永福",
            "place": "扬州城-杂货铺"
        },
        "英雄巾": {
            "id": null,
            "type": "wht",
            "sales": "杂货铺老板 杨永福",
            "place": "扬州城-杂货铺"
        },
        "布鞋": {
            "id": null,
            "type": "wht",
            "sales": "杂货铺老板 杨永福",
            "place": "扬州城-杂货铺"
        },
        "铁戒指": {
            "id": null,
            "type": "wht",
            "sales": "杂货铺老板 杨永福",
            "place": "扬州城-杂货铺"
        },
        "簪子": {
            "id": null,
            "type": "wht",
            "sales": "杂货铺老板 杨永福",
            "place": "扬州城-杂货铺"
        },
        "长鞭": {
            "id": null,
            "type": "wht",
            "sales": "杂货铺老板 杨永福",
            "place": "扬州城-杂货铺"
        },
        "钓鱼竿": {
            "id": null,
            "type": "wht",
            "sales": "杂货铺老板 杨永福",
            "place": "扬州城-杂货铺"
        },
        "鱼饵": {
            "id": null,
            "type": "wht",
            "sales": "杂货铺老板 杨永福",
            "place": "扬州城-杂货铺"
        },
        "铁剑": {
            "id": null,
            "type": "wht",
            "sales": "铁匠铺老板 铁匠",
            "place": "扬州城-打铁铺"
        },
        "钢刀": {
            "id": null,
            "type": "wht",
            "sales": "铁匠铺老板 铁匠",
            "place": "扬州城-打铁铺"
        },
        "铁棍": {
            "id": null,
            "type": "wht",
            "sales": "铁匠铺老板 铁匠",
            "place": "扬州城-打铁铺"
        },
        "铁杖": {
            "id": null,
            "type": "wht",
            "sales": "铁匠铺老板 铁匠",
            "place": "扬州城-打铁铺"
        },
        "铁镐": {
            "id": null,
            "type": "wht",
            "sales": "铁匠铺老板 铁匠",
            "place": "扬州城-打铁铺"
        },
        "飞镖": {
            "id": null,
            "type": "wht",
            "sales": "铁匠铺老板 铁匠",
            "place": "扬州城-打铁铺"
        },
        "hig金创药": {
            "id": null,
            "type": "hig",
            "sales": "药铺老板 平一指",
            "place": "扬州城-药铺"
        },
        "hig引气丹": {
            "id": null,
            "type": "hig",
            "sales": "药铺老板 平一指",
            "place": "扬州城-药铺"
        },
    };
    var equip = {
        "铁镐": 0,
    };
    var npcs = {
        "店小二": 0,
        "铁匠铺老板 铁匠": 0,
        "药铺老板 平一指": 0,
        "杂货铺老板 杨永福": 0
    };
    var place = {
        "住房": "jh fam 0 start;go west;go west;go north;go enter",
        "住房-卧室": "jh fam 0 start;go west;go west;go north;go enter;go north;store",
        "住房-小花园": "jh fam 0 start;go west;go west;go north;go enter;go northeast",
        "住房-炼药房": "jh fam 0 start;go west;go west;go north;go enter;go east",
        "住房-练功房": "jh fam 0 start;go west;go west;go north;go enter;go west",
        "扬州城-钱庄": "jh fam 0 start;go north;go west;store",
        "扬州城-广场": "jh fam 0 start",
        "扬州城-书院": "jh fam 0 start;go east;go north",
        "扬州城-醉仙楼": "jh fam 0 start;go north;go north;go east",
        "扬州城-杂货铺": "jh fam 0 start;go east;go south",
        "扬州城-打铁铺": "jh fam 0 start;go east;go east;go south",
        "扬州城-药铺": "jh fam 0 start;go east;go east;go north",
        "扬州城-衙门正厅": "jh fam 0 start;go west;go north;go north",
        "扬州城-镖局正厅": "jh fam 0 start;go west;go west;go south;go south",
        "扬州城-矿山": "jh fam 0 start;go west;go west;go west;go west",
        "扬州城-喜宴": "jh fam 0 start;go north;go north;go east;go up",
        "扬州城-擂台": "jh fam 0 start;go west;go south",
        "扬州城-当铺": "jh fam 0 start;go south;go east",
        "扬州城-帮派": "jh fam 0 start;go south;go south;go east",
        "扬州城-有间客栈": "jh fam 0 start;go north;go east",
        "扬州城-赌场": "jh fam 0 start;go south;go west",
        "帮会-大门": "jh fam 0 start;go south;go south;go east;go east",
        "帮会-大院": "jh fam 0 start;go south;go south;go east;go east;go east",
        "帮会-练功房": "jh fam 0 start;go south;go south;go east;go east;go east;go north",
        "帮会-聚义堂": "jh fam 0 start;go south;go south;go east;go east;go east;go east",
        "帮会-仓库": "jh fam 0 start;go south;go south;go east;go east;go east;go east;go north",
        "帮会-炼药房": "jh fam 0 start;go south;go south;go east;go east;go east;go south",
        "扬州城-扬州武馆": "jh fam 0 start;go south;go south;go west",
        "扬州城-武庙": "jh fam 0 start;go north;go north;go west",
        "武当派-广场": "jh fam 1 start;",
        "武当派-三清殿": "jh fam 1 start;go north",
        "武当派-石阶": "jh fam 1 start;go west",
        "武当派-练功房": "jh fam 1 start;go west;go west",
        "武当派-太子岩": "jh fam 1 start;go west;go northup",
        "武当派-桃园小路": "jh fam 1 start;go west;go northup;go north",
        "武当派-舍身崖": "jh fam 1 start;go west;go northup;go north;go east",
        "武当派-南岩峰": "jh fam 1 start;go west;go northup;go north;go west",
        "武当派-乌鸦岭": "jh fam 1 start;go west;go northup;go north;go west;go northup",
        "武当派-五老峰": "jh fam 1 start;go west;go northup;go north;go west;go northup;go northup",
        "武当派-虎头岩": "jh fam 1 start;go west;go northup;go north;go west;go northup;go northup;go northup",
        "武当派-朝天宫": "jh fam 1 start;go west;go northup;go north;go west;go northup;go northup;go northup;go north",
        "武当派-三天门": "jh fam 1 start;go west;go northup;go north;go west;go northup;go northup;go northup;go north;go north",
        "武当派-紫金城": "jh fam 1 start;go west;go northup;go north;go west;go northup;go northup;go northup;go north;go north;go north",
        "武当派-林间小径": "jh fam 1 start;go west;go northup;go north;go west;go northup;go northup;go northup;go north;go north;go north;go north;go north",
        "武当派-后山小院": "jh fam 1 start;go west;go northup;go north;go west;go northup;go northup;go northup;go north;go north;go north;go north;go north;go north",
        "少林派-广场": "jh fam 2 start;",
        "少林派-山门殿": "jh fam 2 start;go north",
        "少林派-东侧殿": "jh fam 2 start;go north;go east",
        "少林派-西侧殿": "jh fam 2 start;go north;go west",
        "少林派-天王殿": "jh fam 2 start;go north;go north",
        "少林派-大雄宝殿": "jh fam 2 start;go north;go north;go northup",
        "少林派-钟楼": "jh fam 2 start;go north;go north;go northeast",
        "少林派-鼓楼": "jh fam 2 start;go north;go north;go northwest",
        "少林派-后殿": "jh fam 2 start;go north;go north;go northwest;go northeast",
        "少林派-练武场": "jh fam 2 start;go north;go north;go northwest;go northeast;go north",
        "少林派-罗汉堂": "jh fam 2 start;go north;go north;go northwest;go northeast;go north;go east",
        "少林派-般若堂": "jh fam 2 start;go north;go north;go northwest;go northeast;go north;go west",
        "少林派-方丈楼": "jh fam 2 start;go north;go north;go northwest;go northeast;go north;go north",
        "少林派-戒律院": "jh fam 2 start;go north;go north;go northwest;go northeast;go north;go north;go east",
        "少林派-达摩院": "jh fam 2 start;go north;go north;go northwest;go northeast;go north;go north;go west",
        "少林派-竹林": "jh fam 2 start;go north;go north;go northwest;go northeast;go north;go north;go north",
        "少林派-藏经阁": "jh fam 2 start;go north;go north;go northwest;go northeast;go north;go north;go north;go west",
        "少林派-达摩洞": "jh fam 2 start;go north;go north;go northwest;go northeast;go north;go north;go north;go north;go north",
        "华山派-镇岳宫": "jh fam 3 start;",
        "华山派-苍龙岭": "jh fam 3 start;go eastup",
        "华山派-舍身崖": "jh fam 3 start;go eastup;go southup",
        "华山派-峭壁": "jh fam 3 start;go eastup;go southup;jumpdown",
        "华山派-山谷": "jh fam 3 start;go eastup;go southup;jumpdown;go southup",
        "华山派-山间平地": "jh fam 3 start;go eastup;go southup;jumpdown;go southup;go south",
        "华山派-林间小屋": "jh fam 3 start;go eastup;go southup;jumpdown;go southup;go south;go east",
        "华山派-玉女峰": "jh fam 3 start;go westup",
        "华山派-玉女祠": "jh fam 3 start;go westup;go west",
        "华山派-练武场": "jh fam 3 start;go westup;go north",
        "华山派-练功房": "jh fam 3 start;go westup;go north;go east",
        "华山派-客厅": "jh fam 3 start;go westup;go north;go north",
        "华山派-偏厅": "jh fam 3 start;go westup;go north;go north;go east",
        "华山派-寝室": "jh fam 3 start;go westup;go north;go north;go north",
        "华山派-玉女峰山路": "jh fam 3 start;go westup;go south",
        "华山派-玉女峰小径": "jh fam 3 start;go westup;go south;go southup",
        "华山派-思过崖": "jh fam 3 start;go westup;go south;go southup;go southup",
        "华山派-山洞": "jh fam 3 start;go westup;go south;go southup;go southup;break bi;go enter",
        "华山派-长空栈道": "jh fam 3 start;go westup;go south;go southup;go southup;break bi;go enter;go westup",
        "华山派-落雁峰": "jh fam 3 start;go westup;go south;go southup;go southup;break bi;go enter;go westup;go westup",
        "华山派-华山绝顶": "jh fam 3 start;go westup;go south;go southup;go southup;break bi;go enter;go westup;go westup;jumpup",
        "峨眉派-金顶": "jh fam 4 start",
        "峨眉派-庙门": "jh fam 4 start;go west",
        "峨眉派-广场": "jh fam 4 start;go west;go south",
        "峨眉派-走廊": "jh fam 4 start;go west;go south;go west",
        "峨眉派-休息室": "jh fam 4 start;go west;go south;go east;go south",
        "峨眉派-厨房": "jh fam 4 start;go west;go south;go east;go east",
        "峨眉派-练功房": "jh fam 4 start;go west;go south;go west;go west",
        "峨眉派-小屋": "jh fam 4 start;go west;go south;go west;go north;go north",
        "峨眉派-清修洞": "jh fam 4 start;go west;go south;go west;go south;go south",
        "峨眉派-大殿": "jh fam 4 start;go west;go south;go south",
        "峨眉派-睹光台": "jh fam 4 start;go northup",
        "峨眉派-华藏庵": "jh fam 4 start;go northup;go east",
        "逍遥派-青草坪": "jh fam 5 start",
        "逍遥派-林间小道": "jh fam 5 start;go east",
        "逍遥派-练功房": "jh fam 5 start;go east;go north",
        "逍遥派-木板路": "jh fam 5 start;go east;go south",
        "逍遥派-工匠屋": "jh fam 5 start;go east;go south;go south",
        "逍遥派-休息室": "jh fam 5 start;go west;go south",
        "逍遥派-木屋": "jh fam 5 start;go north;go north",
        "逍遥派-地下石室": "jh fam 5 start;go down;go down",
        "丐帮-树洞内部": "jh fam 6 start",
        "丐帮-树洞下": "jh fam 6 start;go down",
        "丐帮-暗道": "jh fam 6 start;go down;go east",
        "丐帮-破庙密室": "jh fam 6 start;go down;go east;go east;go east",
        "丐帮-土地庙": "jh fam 6 start;go down;go east;go east;go east;go up",
        "丐帮-林间小屋": "jh fam 6 start;go down;go east;go east;go east;go east;go east;go up",
        "杀手楼-大门": "jh fam 7 start",
        "杀手楼-大厅": "jh fam 7 start;go north",
        "杀手楼-暗阁": "jh fam 7 start;go north;go up",
        "杀手楼-铜楼": "jh fam 7 start;go north;go up;go up",
        "杀手楼-休息室": "jh fam 7 start;go north;go up;go up;go east",
        "杀手楼-银楼": "jh fam 7 start;go north;go up;go up;go up;go up",
        "杀手楼-练功房": "jh fam 7 start;go north;go up;go up;go up;go up;go east",
        "杀手楼-金楼": "jh fam 7 start;go north;go up;go up;go up;go up;go up;go up",
        "杀手楼-书房": "jh fam 7 start;go north;go up;go up;go up;go up;go up;go up;go west",
        "杀手楼-平台": "jh fam 7 start;go north;go up;go up;go up;go up;go up;go up;go up",
        "襄阳城-广场": "jh fam 8 start",
        "襄阳城-南城门": "jh fam 8 start;go south;go south;go south;go south",
        "襄阳城-北城门": "jh fam 8 start;go north;go north;go north;go north;",
        "襄阳城-西城门": "jh fam 8 start;go west;go west;go west;go west",
        "襄阳城-东城门": "jh fam 8 start;go east;go eastgo east;go east",
        "武道塔": "jh fam 9 start"
    };
    var mpz_path = {
        "武当派": "jh fam 1 start;go west;go northup;go north;go west;go northup;go northup;go northup;go north;go north;go north;go north;go north",
        "华山派": "jh fam 3 start;go westup;go north",
        "少林派": "jh fam 2 start;go north;go north;go northwest;go northeast;go north",
        "峨眉派": "jh fam 4 start;go west;go south;go west;go south",
        "逍遥派": "jh fam 5 start;go west;go east;go down",
        "丐帮": "jh fam 6 start;go down;go east;go east;go east;go east;go east",
    };
    var diff_colors = {
        'normal': '',
        'access': 'https://cdn.jsdelivr.net/gh/mapleobserver/wsmud-script/plugins/wsmud_color_accessibility.css',
        'flat': 'https://cdn.jsdelivr.net/gh/mapleobserver/wsmud-script/plugins/wsmud_color_flat.css'
    };
    var fb_path = [];
    var drop_list = [];
    var fenjie_list = [];
    //boss黑名单
    var blacklist = "";
    //pfm黑名单
    var blackpfm = [];
    //角色
    var role;
    var roleid;
    //门派
    var family = null;
    //师门自动放弃
    var sm_loser = "开";
    //师门自动牌子
    var sm_price = null;
    //师门自动取
    var sm_getstore = null;
    //师门无视稀有程度
    var sm_any = "开";
    //
    var wudao_pfm = "";
    //boss战斗前等待(ms)
    var ks_pfm = "2000";
    //boss等待时间(s)
    var ks_wait = "120";
    //自动婚宴
    var automarry = null;
    //自动boss
    var autoKsBoss = null;
    //系列自动
    var stopauto = false;
    //获得物品战士
    var getitemShow = null;
    //自命令展示方式
    var zmlshowsetting = 0;
    //背包已满提示方式
    var bagFull = 0;
    //通知推送开关、方式、Token、Url
    var pushSwitch = "关";
    var pushType = "0";
    var pushToken = "";
    // var pushUrl = "https://";
    //停止后动作
    var auto_command = null;
    //装备列表
    var eqlist = {};
    //{'unarmed':'','force':'','dodge':'','sword':'','blade':'','club':'','staff':'','whip':'','parry':''}
    var skilllist = {};
    //自动施法黑名单
    var unauto_pfm = '';
    //自动施法开关
    var auto_pfmswitch = "开";
    // 自动施法模式 开：智能施法，关：顺序施法
    var auto_pfm_mode = "开";
    //自动转发路径
    var auto_rewardgoto = "关";
    //显示昏迷信息
    var busy_info = "关";
    //仓库位置
    var saveAddr = "关";
    //自动更新仓库数据
    var auto_updateStore = "关";
    //自动重连
    var auto_relogin = "关";
    var autoeq = "";
    //自命令数组  type 0 原生 1 自命令 2js
    //[{"name":"name","zmlRun":"zzzz","zmlShow":"1","zmlType":"0"}]
    var zml = [];
    //自定义存取
    var zdy_item_store = '';
    //自定义存取
    var zdy_item_store2 = '';
    //自定义锁
    var zdy_item_lock = '';
    //自定义丢弃
    var zdy_item_drop = '';
    //自定义分解
    var zdy_item_fenjie = '';
    //状态监控 type 类型  ishave  0 =其他任何人 1= 本人  2 仅npc  send 命令数组
    //[{"name":"","type":"status","action":"remove","keyword":"busy","ishave":"0","send":"","isactive":"1","maxcount":10,"pname":"宋远桥","istip":"1"}]
    var ztjk_item = [];
    //  自定义技能开关
    var zdyskills = "关";
    var zdyskilllist = "";
    //欢迎语
    var welcome = '';
    //屏蔽开关
    var shieldswitch = "开"
    //屏蔽列表
    var shield = '';
    //屏蔽关键字列表
    var shieldkey = '';
    //当你学习，练习，打坐中断后，自动去挖矿或以下操作
    var statehml = '';
    //背景图片
    var backimageurl = '';
    //登录后执行
    var loginhml = '';
    //定时任务
    //名称   类型 一次 1 每天 0 发送命令  触发时间 24小时制
    //[{"name":"","type":"0","send":"","h":"","s":"","m":""}]
    var timequestion = [];
    //安静模式
    var silence = '开';
    //dps统计信息
    var pfmnum = 0;
    var pfmdps = 0;
    var dpssakada = '开'
    var critical = 0;
    var criticalnum = 0;
    var dpslock = 0;
    var battletime = 0;
    var lastcri = 0, lastpfm = 0;
    //funny计算
    var funnycalc = '关'
    //自定义btn
    //[{"name":名称,"send":""},]
    var inzdy_btn = false;
    var zdy_btnlist = [];
    //自动购买
    var auto_buylist = "";
    //自动回收残页清单
    var auto_skillPaperSelllist = "";
    //配色
    var color_select = "normal";
    //死亡提示
    var die_str = "菜";
    //快捷键功能
    var exit1 = undefined;
    var exit2 = undefined;
    var exit3 = undefined;
    var KEY = {
        keys: [],
        roomItemSelectIndex: -1,
        init: function () {
            //添加快捷键说明
            $("span[command=stopstate] span:eq(0)").html("S");
            $("span[command=showcombat] span:eq(0)").html("A");
            $("span[command=showtool] span:eq(0)").html("C");
            $("span[command=pack] span:eq(0)").html("B");
            $("span[command=tasks] span:eq(0)").html("L");
            $("span[command=score] span:eq(0)").html("O");
            $("span[command=jh] span:eq(0)").html("J");
            $("span[command=skills] span:eq(0)").html("K");
            $("span[command=message] span:eq(0)").html("U");
            $("span[command=shop] span:eq(0)").html("P");
            $("span[command=stats] span:eq(0)").html("I");
            $("span[command=setting] span:eq(0)").html(",");

            $(document).on("keydown", this.e);
            this.add(27, function () {
                KEY.dialog_close();
            });
            this.add(192, function () {
                $(".map-icon").click();
            });
            this.add(32, function () {
                KEY.dialog_confirm();
            });
            this.add(83, function () {
                KEY.do_command("stopstate");
            });
            this.add(13, function () {
                KEY.do_command("showchat");
            });
            this.add(65, function () {
                KEY.do_command("showcombat");
            });
            this.add(67, function () {
                KEY.do_command("showtool");
            });
            this.add(66, function () {
                KEY.do_command("pack");
            });
            this.add(76, function () {
                KEY.do_command("tasks");
            });
            this.add(79, function () {
                KEY.do_command("score");
            });
            this.add(74, function () {
                KEY.do_command("jh");
            });
            this.add(75, function () {
                KEY.do_command("skills");
            });
            this.add(73, function () {
                KEY.do_command("stats");
            });
            this.add(85, function () {
                KEY.do_command("message");
            });
            this.add(80, function () {
                KEY.do_command("shop");
            });
            this.add(188, function () {
                KEY.do_command("setting");
            });
            this.add(81, function () {
                inzdy_btn ? WG.zdybtnfunc(0) : WG.sm_button();
            });
            this.add(87, function () {
                inzdy_btn ? WG.zdybtnfunc(1) : WG.go_yamen_task();
            });
            this.add(69, function () {
                inzdy_btn ? WG.zdybtnfunc(2) : WG.kill_all();
            });
            this.add(82, function () {
                inzdy_btn ? WG.zdybtnfunc(3) : WG.get_all();
            });
            this.add(84, function () {
                inzdy_btn ? WG.zdybtnfunc(4) : WG.sell_all();
            });
            this.add(89, function () {
                inzdy_btn ? WG.zdybtnfunc(5) : WG.zdwk();
            });
            this.add(9, function () {
                KEY.onRoomItemSelect();
                return false;
            });
            //方向
            this.add(102, function () {
                // NumPad 6 等同于→
                exit1 = G.exits.get("east");
                exit2 = G.exits.get("eastup");
                exit3 = G.exits.get("eastdown");
                if (exit1) {
                    WG.Send("go east")
                } else if (exit2) {
                    {
                        WG.Send("go eastup")
                    }
                } else if (exit3) {
                    {
                        WG.Send("go eastdown")
                    }
                }
                KEY.onChangeRoom();
            });
            this.add(39, function () {
                exit1 = G.exits.get("east");
                exit2 = G.exits.get("eastup");
                exit3 = G.exits.get("eastdown");
                if (exit1) {
                    WG.Send("go east")
                } else if (exit2) {
                    {
                        WG.Send("go eastup")
                    }
                } else if (exit3) {
                    {
                        WG.Send("go eastdown")
                    }
                }
                KEY.onChangeRoom();
            });
            this.add(100, function () {
                exit1 = G.exits.get("west");
                exit2 = G.exits.get("westup");
                exit3 = G.exits.get("westdown");
                if (exit1) {
                    WG.Send("go west")
                } else if (exit2) {
                    {
                        WG.Send("go westup")
                    }
                } else if (exit3) {
                    {
                        WG.Send("go westdown")
                    }
                }
                KEY.onChangeRoom();
            });
            this.add(37, function () {
                exit1 = G.exits.get("west");
                exit2 = G.exits.get("westup");
                exit3 = G.exits.get("westdown");
                if (exit1) {
                    WG.Send("go west")
                } else if (exit2) {
                    {
                        WG.Send("go westup")
                    }
                } else if (exit3) {
                    {
                        WG.Send("go westdown")
                    }
                }
                KEY.onChangeRoom();
            });
            this.add(98, function () {
                // NumPad 2 等同于↓
                exit1 = G.exits.get("south");
                exit2 = G.exits.get("southup");
                exit3 = G.exits.get("southdown");
                if (exit1) {
                    WG.Send("go south")
                } else if (exit2) {
                    {
                        WG.Send("go southup")
                    }
                } else if (exit3) {
                    {
                        WG.Send("go southdown")
                    }
                }
                KEY.onChangeRoom();
            });
            this.add(40, function () {
                // Down Arrow↓
                exit1 = G.exits.get("south");
                exit2 = G.exits.get("southup");
                exit3 = G.exits.get("southdown");
                if (exit1) {
                    WG.Send("go south")
                } else if (exit2) {
                    {
                        WG.Send("go southup")
                    }
                } else if (exit3) {
                    {
                        WG.Send("go southdown")
                    }
                }
                KEY.onChangeRoom();
            });
            this.add(101, function () {
                // NumPad 3 控制down,按住alt时为up
                WG.Send("go down");
            });
            this.add(101 + 512, function () {
                // NumPad 3 控制down,按住alt时为up
                WG.Send("go up");
            });
            this.add(104, function () {
                exit1 = G.exits.get("north");
                exit2 = G.exits.get("northup");
                exit3 = G.exits.get("northdown");
                if (exit1) {
                    WG.Send("go north")
                } else if (exit2) {
                    {
                        WG.Send("go northup")
                    }
                } else if (exit3) {
                    {
                        WG.Send("go northdown")
                    }
                }
                KEY.onChangeRoom();
            });
            this.add(38, function () {
                exit1 = G.exits.get("north");
                exit2 = G.exits.get("northup");
                exit3 = G.exits.get("northdown");
                if (exit1) {
                    WG.Send("go north")
                } else if (exit2) {
                    {
                        WG.Send("go northup")
                    }
                } else if (exit3) {
                    {
                        WG.Send("go northdown")
                    }
                }
                KEY.onChangeRoom();
            });
            this.add(99, function () {
                WG.Send("go southeast");
                KEY.onChangeRoom();
            });
            this.add(97, function () {
                WG.Send("go southwest");
                KEY.onChangeRoom();
            });
            this.add(105, function () {
                WG.Send("go northeast");
                KEY.onChangeRoom();
            });
            this.add(103, function () {
                WG.Send("go northwest");
                KEY.onChangeRoom();
            });

            this.add(49, function () {
                KEY.combat_commands(0);
            });
            this.add(50, function () {
                KEY.combat_commands(1);
            });
            this.add(51, function () {
                KEY.combat_commands(2);
            });
            this.add(52, function () {
                KEY.combat_commands(3);
            });
            this.add(53, function () {
                KEY.combat_commands(4);
            });
            this.add(54, function () {
                KEY.combat_commands(5);
            });
            this.add(55, function () {//7
                KEY.combat_commands(6);
            });
            this.add(56, function () {//8
                KEY.combat_commands(7);
            });
            this.add(57, function () {//9
                KEY.combat_commands(8);
            });
            this.add(48, function () {//0
                KEY.combat_commands(9);
            });
            this.add(45, function () {//-
                KEY.combat_commands(10);
            });
            this.add(61, function () {//=
                KEY.combat_commands(11);
            });

            //alt
            this.add(49 + 512, function () {
                KEY.onRoomItemAction(0);
            });
            this.add(50 + 512, function () {
                KEY.onRoomItemAction(1);
            });
            this.add(51 + 512, function () {
                KEY.onRoomItemAction(2);
            });
            this.add(52 + 512, function () {
                KEY.onRoomItemAction(3);
            });
            this.add(53 + 512, function () {
                KEY.onRoomItemAction(4);
            });
            this.add(54 + 512, function () {
                KEY.onRoomItemAction(5);
            });
            //ctrl
            this.add(49 + 1024, function () {
                KEY.room_commands(0);
            });
            this.add(50 + 1024, function () {
                KEY.room_commands(1);
            });
            this.add(51 + 1024, function () {
                KEY.room_commands(2);
            });
            this.add(52 + 1024, function () {
                KEY.room_commands(3);
            });
            this.add(53 + 1024, function () {
                KEY.room_commands(4);
            });
            this.add(54 + 1024, function () {
                KEY.room_commands(5);
            });
        },
        add: function (k, c) {
            var tmp = {
                key: k,
                callback: c,
            };
            this.keys.push(tmp);
        },
        e: function (event) {
            if ($(".channel-box").is(":visible")) {
                KEY.chatModeKeyEvent(event);
                return;
            }
            if ($(".dialog-confirm").is(":visible") &&
                ((event.keyCode >= 48 && event.keyCode <= 57) || (event.keyCode >= 96 && event.keyCode <= 105)))
                return;
            if ($('input').is(':focus') || $('textarea').is(':focus')) {
                return;
            }
            var kk = (event.ctrlKey || event.metaKey ? 1024 : 0) + (event.altKey ? 512 : 0) + event.keyCode;
            for (var k of KEY.keys) {
                if (k.key == kk)
                    return k.callback();
            }
        },
        isallow: true,
        dialog_close: function () {
            $(".dialog-close").click();
        },
        dialog_confirm: function () {
            if ($(".dialog-confirm").attr("style").indexOf("block") >= 0) {
                if (this.isallow) {
                    this.isallow = false
                    $(".dialog-btn.btn-ok").click();
                    setTimeout(() => {
                        this.isallow = true;
                    }, 500);
                }
            }
        },
        do_command: function (name) {
            $("span[command=" + name + "]").click();
        },
        room_commands: function (index) {
            $("div.combat-panel div.room-commands span:eq(" + index + ")").click();
        },
        combat_commands: function (index) {
            $("div.combat-panel div.combat-commands span.pfm-item:eq(" + index + ")").click();
        },
        chatModeKeyEvent: function (event) {
            if (event.keyCode == 27) {
                KEY.dialog_close();
            } else if (event.keyCode == 13) {
                if ($(".sender-box").val().length) $(".sender-btn").click();
                else KEY.dialog_close();
            }
        },
        onChangeRoom: function () {
            KEY.roomItemSelectIndex = -1;
        },
        onRoomItemSelect: function () {
            if (KEY.roomItemSelectIndex != -1) {
                $(".room_items div.room-item:eq(" + KEY.roomItemSelectIndex + ")").css("background", "#000");
            }
            KEY.roomItemSelectIndex = (KEY.roomItemSelectIndex + 1) % $(".room_items div.room-item").length;
            var curItem = $(".room_items div.room-item:eq(" + KEY.roomItemSelectIndex + ")");
            curItem.css("background", "#444");
            curItem.click();
        },
        onRoomItemAction: function (index) {
            //NPC下方按键
            $(".room_items .item-commands span:eq(" + index + ")").click();
        },
    }

    function textBecomeImg(text, fontsize, fontcolor) {
        var canvas = document.createElement('canvas');
        //小于32字加1  小于60字加2  小于80字加4    小于100字加6
        var $buHeight = 0;
        if (fontsize <= 32) { $buHeight = 1; }
        else if (fontsize > 32 && fontsize <= 60) { $buHeight = 2; }
        else if (fontsize > 60 && fontsize <= 80) { $buHeight = 4; }
        else if (fontsize > 80 && fontsize <= 100) { $buHeight = 6; }
        else if (fontsize > 100) { $buHeight = 10; }

        //对于g j 等有时会有遮挡，这里增加一些高度
        canvas.height = fontsize + $buHeight;
        var context = canvas.getContext('2d');

        // 擦除(0,0)位置大小为200x200的矩形，擦除的意思是把该区域变为透明
        context.clearRect(0, 0, canvas.width, canvas.height);
        context.fillStyle = fontcolor;
        context.font = fontsize + "px KaiTi";

        //top（顶部对齐） hanging（悬挂） middle（中间对齐） bottom（底部对齐） alphabetic是默认值
        context.textBaseline = 'middle';
        context.fillText(text, 0, fontsize / 2)

        canvas.width = context.measureText(text).width;
        context.fillStyle = fontcolor;
        context.font = fontsize + "px KaiTi";
        context.textBaseline = 'middle';
        context.fillText(text, 0, fontsize / 2)

        var dataUrl = canvas.toDataURL('image/png');//注意这里背景透明的话，需要使用png
        return dataUrl;
    }
    function messageClear() {
        $(".WG_log pre").html("");
    }
    var log_line = 0;

    function textShow(text) {
        imgShow(textBecomeImg(text, 90, 'red'))
    }
    function imgShow(url, t = 2000) {

        $('.container > .content-message').css('background', 'url(' + url + ') no-repeat center center')
        setTimeout(() => {
            $('.container > .content-message').css('background', '')
        }, t);
    }
    function messageAppend(m, t = 0, area = 0) {


        if (area) {
            var ap = m + "\n";
            if (t == 1) {
                ap = "<hiy>" + ap + "</hiy>";
            } else if (t == 2) {
                ap = "<hig>" + ap + "</hig>";
            } else if (t == 3) {
                ap = "<hiw>" + ap + "</hiw>";
            } else if (t == 4) {
                ap = "<hir>" + ap + "</hir>";
            }
            $('.content-message pre').append(ap)
        } else {
            100 < log_line && (log_line = 0, $(".WG_log pre").empty());
            var ap = m + "\n";
            if (t == 1) {
                ap = "<hiy>" + ap + "</hiy>";
            } else if (t == 2) {
                ap = "<hig>" + ap + "</hig>";
            } else if (t == 3) {
                ap = "<hiw>" + ap + "</hiw>";
            } else if (t == 4) {
                ap = "<hir>" + ap + "</hir>";
            }
            $(".WG_log pre").append(ap);
            log_line++;
            $(".WG_log")[0].scrollTop = 99999;
        }
    }
    var sm_array = {
        '武当': {
            "place": "武当派-三清殿",
            "npc": "武当派第二代弟子 武当首侠 宋远桥",
            "sxplace": "武当派-太子岩",
            "sx": "首席弟子"
        },
        '华山': {
            "place": "华山派-镇岳宫",
            "npc": "市井豪杰 高根明",
            "sxplace": "华山派-练武场",
            "sx": "首席弟子"
        },
        '少林': {
            "place": "少林派-天王殿",
            "npc": "少林寺第三十九代弟子 道觉禅师",
            "sxplace": "少林派-练武场",
            "sx": "大师兄"
        },
        '逍遥': {
            "place": "逍遥派-青草坪",
            "npc": "聪辩老人 苏星河",
            "sxplace": "-jh fam 5 start;go west",
            "sx": "首席弟子"
        },
        '丐帮': {
            "place": "丐帮-树洞下",
            "npc": "丐帮七袋弟子 左全",
            "sxplace": "丐帮-破庙密室",
            "sx": "首席弟子"
        },
        '峨眉': {
            "place": "峨眉派-庙门",
            "npc": "峨眉派第五代弟子 苏梦清",
            "sxplace": "峨眉派-广场",
            "sx": "大师姐"
        },
        '武馆': {
            "place": "扬州城-扬州武馆",
            "npc": "武馆教习",
            "sxplace": "扬州城-扬州武馆"
        },
        '杀手楼': {
            "place": "杀手楼-大厅",
            "npc": "杀手教习 何小二",
            "sxplace": "杀手楼-练功房",
            "sx": "金牌杀手"
        },
    };
    var WG = {
        online: false,
        sm_state: -1,
        sm_item: null,
        sm_store: null,
        init: function () {
            $("li[command=SelectRole]").on("click", function () {
                WG.login();
            });
        },
        inArray: function (val, arr) {
            for (let i = 0; i < arr.length; i++) {
                let item = arr[i];
                if (item[0] == "<") {
                    if (item == val) return true;

                } else {
                    if (item != "") {
                        if (val.indexOf(item) >= 0) return true;
                    }
                }
            }
            return false;
        },
        hasStr: function (val, arr) {
            if (arr.length == null) {
                for (let item in arr) {
                    for (let i of arr[item]) {
                        if (i == val) return true;
                    }
                }
            } else {
                for (let i = 0; i < arr.length; i++) {
                    let item = arr[i];
                    if (item == val) return true;
                }
            }
            return false;
        },
        set_value(key, value) {
            return GM_setValue(key, value);
        },
        get_value(key) {
            return GM_getValue(key);
        },
        login: function () {
            role = $('.role-list .select').text().split(/[\s\n]/).pop();
            roleid = $('.role-list .select').attr('roleid')
            GM_listValues().map(function (key) {
                if (key.indexOf(role + "_") == 0) {
                    var tmpVal = key.split(role + "_")[1];
                    console.log(tmpVal)
                    GM_setValue(roleid + "_" + tmpVal, GM_getValue(key, null))
                    GM_deleteValue(key)
                }
            });

            $(".bottom-bar").append("<span class='item-commands' style='display:none'><span WG='WG' cmd=''></span></span>"); //命令行模块
            var html = UI.wgui();
            $(".content-message").after(html);
            $('.content-bottom').after("<div class='zdy-commands'></div>");
            var css = `.zdy-item{
                display: inline-block;border: solid 1px gray;color: gray;background-color: black;
                text-align: center;cursor: pointer;border-radius: 0.25em;min-width: 2.5em;margin-right: 0em;
                margin-left: 0.4em;position: relative;padding-left: 0.4em;padding-right: 0.4em;line-height: 24px;}
                .WG_log{flex: 1;overflow-y: auto;border: 1px solid #404000;max-height: 15em;width: calc(100% - 40px);}
                .WG_log > pre{margin: 0px; white-space: pre-line;}
                .WG_button { width: calc(100% - 40px); overflow-x: auto;display: block;line-height:2em;}
                .WG_button > .zdy-item:active {background-color: gray;color:black;}
                .item-plushp{display: inline-block;float: right;width: 100px;}
                .item-dps{display: inline-block;float: right;width: 100px;}
                .settingbox {margin-left: 0.625 em;border: 1px solid gray;background-color: transparent;color: unset;resize: none;width: 80% ;height: 3rem;}
                .runtest textarea{display:block;width:300px;height:160px;border:10px solid #F8F8F8;border-top-width:0;padding:10px;line-height:20px;overflow:auto;background-color:#3F3F3F;color:#eee;font-size:12px;font-family:Courier New}
                .layui-btn,.layui-input,.layui-select,.layui-textarea,.layui-upload-button{outline:0;-webkit-appearance:none;transition:all .3s;-webkit-transition:all .3s;box-sizing:border-box}
                .layui-btn{display:inline-block;height:38px;line-height:38px;padding:0 18px;background-color:#009688;color:#fff;white-space:nowrap;text-align:center;font-size:14px;border:none;border-radius:2px;cursor:pointer}
                .layui-btn-normal{background-color:#1E9FFF}
                .layui-layer-moves{background-color:transparent}
                .switch2 {display: inline-block;position: relative;height: 1.25em;width: 3.125em;line-height: 1.25em;
                border-radius: 0.875em;background: #dedede;cursor: pointer;-ms-user-select: none;-moz-user-select: none;
                -webkit-user-select: none;user-select: none;vertical-align: middle;text-align: center;}
                .switch2 > .switch-button {position: absolute;left: 0px;height: 1.25em;width: 1.25em;
                border-radius: 0.875em;background: #fff;box-shadow: 0 0 5px rgba(0, 0, 0, 0.2);
                transition: 0.3s;-webkit-transition: 0.3s;left: 0px;}
                .switch2 > .switch-text {color:#898989;margin-left: 0.625em;}
                .on>.switch-button {right:0px;left:auto;}
                .on>.switch-text {color:#ffffff;margin-right: 0.625em;    margin-left: 0px;}
                .on {background-color:#008000;}
                .crit{
                    height:24px;
                    position:relative;
                    animation:myfirst 1s;
                    -webkit-animation:myfirst 0.4s; /* Safari and Chrome */
                }
                    @keyframes myfirst
                {
                    0%   {background:red; left:0px; top:0px;}
                    33% {background:red; left:0px; top:-14px;}
                    66% {background:red; left:0px; top:14px;}
                    100% {background:red; left:0px; top:0px;}
                }

                @-webkit-keyframes myfirst /* Safari and Chrome */
                {
                    0%   {background:red; left:0px; top:0px;}
                    33% {background:red; left:0px; top:-30px;}
                    100% {background:red; left:0px; top:0px;}
                }
                .rainbow-text{
                    color:red;
                    background-image: repeating-linear-gradient(45deg, violet, indigo, blue, green, yellow, orange, red, violet);
                    background-size:800% 800%;
                    -webkit-background-clip: text;
                    -webkit-text-fill-color: transparent;
                    animation: rainbow 8s ease infinite;
                    -webkit-animation: rainbow 8s ease infinite;
                }
                @keyframes rainbow
                {
                    0%{background-position:0% 50%}
                    50%{background-position:100% 25%}
                    100%{background-position:0% 50%}
                }`;
            GM_addStyle(css);
            npcs = GM_getValue("npcs", npcs);
            pgoods = GM_getValue("goods", goods);
            equip = GM_getValue(roleid + "_equip", equip);
            //初始化角色配置
            GI.configInit();
            if (backimageurl != '') {
                GM_addStyle(`body{background-color:rgb(0,0,0,.25)}
                div{ opacity:1;}
                html{background:rgba(255,255,255,0.25);
                background-image:url('${backimageurl}');
                background-repeat:no-repeat;
                background-size:100% 100%;
                -moz-background-size:100% 100%;} `);
            }
            color_select = GM_getValue("color_select", color_select);
            let link = document.createElement("link");
            link.rel = "stylesheet";
            link.type = "text/css";
            link.href = diff_colors[color_select];
            let head = document.getElementsByTagName("head")[0];
            head.appendChild(link);
            setTimeout(() => {
                try {
                    if (GM_registerMenuCommand) {
                        GM_registerMenuCommand("初始化", WG.update_id_all)
                        GM_registerMenuCommand("设  置", WG.setting)
                        GM_registerMenuCommand("调  试", WG.cmd_echo_button)
                    }
                }
                catch (e) {
                }
                role = role;
                roleid = roleid;
                var logintext = '';
                document.title = role + "-MUD游戏-武神传说";
                L.msg(`欢迎使用 ${welcome} 版本号${GM_info.script.version}`);
                KEY.do_command("showtool");
                KEY.do_command("pack");
                KEY.do_command("score");
                WG.SendCmd("score2");
                WG.SendCmd("party load");
                setTimeout(() => {
                    //bind settingbox
                    KEY.do_command("score");
                    var rolep = role;
                    if (G.level) {
                        rolep = G.level + role;
                        if (G.isGod()) {
                            $('.zdy-item.zdwk').html("修炼(Y)");
                        }
                    }
                    rolep = welcome + "" + rolep;
                    if (CanUse) {
                        if (shieldswitch == "开" || silence == '开') {
                            messageAppend('已注入屏蔽系统', 0, 1);
                        }
                        if (npcs['店小二'] == 0) {
                            logintext = `
                                <hiy>欢迎${rolep},插件已加载！第一次使用,请在设置中,初始化ID,并且设置一下是否自动婚宴,自动传送boss
                                插件版本: ${GM_info.script.version}
                                </hiy>`;
                        } else {
                            $.get("https://wsmud.ii74.com/hello/" + role, (result) => {

                                let tmp = `
                                <hiy>欢迎${rolep},插件已加载！
                                插件版本: ${GM_info.script.version}
                                更新日志: ${result}
                                </hiy>`;
                                messageAppend(tmp);
                            });
                        }
                        WG.ztjk_func();
                        WG.zml_showp();
                        WG.dsj_func();
                        setTimeout(() => {
                            WG.wsdelaytest();
                        }, 1000)

                        if (G.level && G.isGod()) {
                            WG.ytjk_func()
                        }
                    } else {
                        logintext = `
                            <hiy>欢迎${role},插件未正常加载！
                            当前浏览器不支持自动喜宴自动boss,请使用centbrowser浏览器
                            谷歌系浏览器,请在network中勾选disable cache,多刷新几次,直至提示已加载!
                            多次刷新无法仍然出现本提示，请打开tampermonkey 插件设置
                            开启高级设置，在最下方实验 设置 “注入模式：即时”“严格模式：禁用”
                            实在不会用加群交流
                            插件版本: ${GM_info.script.version}
                            </hiy>`;
                    }
                    messageAppend(logintext);
                }, 500);
                KEY.do_command("showcombat");
                //执行记忆面板
                var closeBorad = localStorage.getItem("closeBorad");
                if (closeBorad === "true") {
                    WG.showhideborad()
                }
                WG.runLoginhml();
                //开启定时器
                var systime = setInterval(() => {
                    var myDate = new Date();
                    let timeTips = {
                        data: JSON.stringify({
                            type: "time",
                            h: myDate.getHours(),
                            m: myDate.getMinutes(),
                            s: myDate.getSeconds(),
                            time: myDate.toTimeString()
                        })
                    };
                    WG.receive_message(timeTips);
                }, 1000);
            }, 1000);
        },
        update_goods_id: function () {
            var lists = $(".dialog-list > .obj-list:first");
            var id;
            var name;
            var gtype;
            if (lists.length) {
                messageAppend("检测到商品清单");
                for (var a of lists.children()) {
                    a = $(a);
                    id = a.attr("obj");
                    name = $(a.children()[0]).html();

                    gtype = a.children()[0].localName;
                    if (name == "金创药" || name == "引气丹") {
                        if (pgoods[gtype + name]) {
                            pgoods[gtype + name].id = id;
                        } else {
                            pgoods[gtype + name] = {
                                "id": id,
                                "type": gtype,
                                "sales": "药铺老板 平一指",
                                "place": "扬州城-药铺"
                            }

                        }

                    }
                    else {
                        pgoods[name].id = id;
                    }
                    messageAppend(`<${gtype}>${name}</${gtype}>:${id}`);
                }
                GM_setValue("goods", pgoods);
                return true;
            } else {
                messageAppend("未检测到商品清单");
                return false;
            }
        },
        update_npc_id: function () {
            var lists = $(".room_items .room-item");

            for (var npc of lists) {
                if (npc.lastElementChild.innerText.indexOf("[") >= 0) {
                    if (npc.lastElementChild.lastElementChild.lastElementChild.lastElementChild == null) {
                        if (npc.lastElementChild.firstChild.nodeType == 3 &&
                            npc.lastElementChild.firstChild.nextSibling.tagName == "SPAN") {
                            npcs[npc.lastElementChild.innerText.split('[')[0]] = $(npc).attr("itemid");
                            messageAppend(npc.lastElementChild.innerText.split('[')[0] + " 的ID:" + $(npc).attr("itemid"));
                        }
                    }
                } else {
                    if (npc.lastElementChild.lastElementChild == null) {
                        npcs[npc.lastElementChild.innerText] = $(npc).attr("itemid");
                        messageAppend(npc.lastElementChild.innerText + " 的ID:" + $(npc).attr("itemid"));
                    }
                }
            }
            GM_setValue("npcs", npcs);
        },
        update_id_all: function () {

            GM_setValue("goods", goods);
            WG.SendCmd("stopstate")
            var t = [];
            Object.keys(pgoods).forEach(function (key) {
                if (t[pgoods[key].place] == undefined)
                    t[pgoods[key].place] = pgoods[key].sales;
            });
            var keys = Object.keys(t);
            var i = 0;
            var state = 0;
            var place, sales;
            //获取
            var timer = setInterval(() => {

                switch (state) {
                    case 0:
                        if (i >= keys.length) {
                            messageAppend("初始化完成");
                            WG.go("武当派-广场");
                            clearInterval(timer);
                            return;
                        }
                        place = keys[i];
                        sales = t[place];
                        WG.go(place);
                        state = 1;
                        break;
                    case 1:
                        WG.update_npc_id();
                        var id = npcs[sales];
                        WG.Send("list " + id);
                        state = 2;
                        break;
                    case 2:
                        if (WG.update_goods_id()) {
                            state = 0;
                            i++;
                        } else
                            state = 1;
                        break;
                }
            }, 1000);
        },
        clean_id_all: function (jm = true) {
            GM_setValue("goods", goods);
            pgoods = goods
            if (jm) {
                alert("清空完毕,请刷新一下页面")
            }
        },
        update_store_hook: undefined,
        wsdelaytest: async function () {
            G.wsdelaySetTime = new Date().getTime();
            G.wsdelaySetCount = 1;
            G.wsdelay = undefined;
            WG.SendCmd("test");
        },
        update_store: async function () {
            WG.update_store_hook = WG.add_hook(['dialog', 'text'], (data) => {
                if (data.dialog == 'list' && data.max_store_count) {
                    messageAppend("<hio>仓库信息获取</hio>开始");
                    var stores = data.stores;
                    store_list = [];
                    for (let store of stores) {
                        store_list.push(store.name.toLowerCase());
                    }
                    zdy_item_store = store_list.join(',');
                    $('#store_info').val(zdy_item_store);
                    GM_setValue(roleid + "_zdy_item_store", zdy_item_store);
                } else if (data.type == 'text' && data.msg == '没有这个玩家。') {
                    messageAppend("<hio>仓库信息获取</hio>完成");

                    $('.dialog-close').click();
                    WG.remove_hook(WG.update_store_hook);
                    WG.update_store_hook = undefined;
                }
            });
            WG.SendCmd("$to 扬州城-广场;$to 扬州城-钱庄;look3 1");
        },
        clean_dps: function () {
            if (dpslock && battletime != 0) {
                let allpfmnum = pfmnum + criticalnum;
                let alldps = pfmdps + critical;
                let battle_t = (new Date().getTime() - battletime.getTime()) / 1000;

                let real_dps = alldps / battle_t;
                let real_act = allpfmnum / battle_t;
                if (battle_t < 1) {
                    real_dps = alldps;
                    real_act = allpfmnum;
                }
                setTimeout(() => {
                    messageAppend(`⚔️战斗过程分析:
                    ⏱️战斗时长:${battle_t}秒
                    ⚔️普通攻击:${pfmnum}次
                    ⚔️普通伤害:${addChineseUnit(pfmdps)}
                    🌟暴击攻击:${criticalnum}次
                    🌟暴击伤害:${addChineseUnit(critical)}
                    ⚔️总计攻击:${(allpfmnum)}次
                    ⚔️总计伤害:${addChineseUnit(alldps)}
                    ⏱️每秒伤害:${addChineseUnit(real_dps)}
                    ⏱️每秒攻击:${Math.round(real_act)}次`, 4);
                    pfmdps = 0;
                    pfmnum = 0;
                    critical = 0;
                    criticalnum = 0;
                    dpslock = 0;
                }, 100);



            }
        },
        Send: async function (cmd) {
            if (CanUse) {
                send_cmd(cmd, true);
            } else {
                if (cmd) {
                    cmd = cmd instanceof Array ? cmd : cmd.split(';');
                    for (var c of cmd) {
                        $("span[WG='WG']").attr("cmd", c).click();
                    };
                }
            }
        },
        SendStep: async function (cmd) {
            if (cmd) {
                cmd = cmd instanceof Array ? cmd : cmd.split(';');
                for (var c of cmd) {
                    WG.SendCmd(c);
                    await WG.sleep(12000);
                };
            }
        },
        SendCmd: async function (cmd) {
            if (cmd) {
                if (cmd.indexOf(",") >= 0) {
                    if (cmd instanceof Array) {
                        cmd = cmd;
                    } else {
                        if (cmd.indexOf(";") >= 0) {
                            cmd = cmd.split(";");
                        } else {
                            cmd = cmd.split(",");
                        }
                    }
                } else {
                    cmd = cmd instanceof Array ? cmd : cmd.split(';');
                }
                let idx = 0;
                let cmds = '';
                for (var c of cmd) {
                    if (c.indexOf("$") >= 0) {
                        if (c[0] == "$") {
                            c = c.replace("$", "");
                            let p0 = c.split(" ")[0];
                            let p1 = c.split(" ")[1];
                            cmds = cmd.join(";");
                            eval("T." + p0 + "(" + idx + ",'" + p1 + "','" + cmds + "')");
                            return;
                        } else {
                            var p_c = c.split(" ");
                            p_c = p_c[p_c.length - 1];
                            // buy $sitem from $snpc
                            if (p_c) {
                                if (p_c[0] == "$") {
                                    p_c = p_c.replace("$", "");
                                    let patt = new RegExp(/\".*?\"/);
                                    let result = patt.exec(p_c)[0];
                                    cmds = cmd.join(";");
                                    eval("T." + p_c.split('(')[0] + "(" + idx + "," + result + ",'" + cmds + "')");
                                    return;
                                } else {
                                    p_c = c.split(" ");
                                    if (p_c[1].indexOf('$') >= 0) {
                                        p_c = p_c[1].replace("$", "");
                                        let patt = new RegExp(/\".*?\"/);
                                        let result = patt.exec(p_c)[0];
                                        cmds = cmd.join(";");
                                        eval("T." + p_c.split('(')[0] + "(" + idx + "," + result + ",'" + cmds + "')");
                                        return;
                                    }
                                }
                            } else {

                                return;
                            }
                        }
                    }
                    //npc id解析
                    if (c.indexOf("%") >= 0) {
                        var rep = c.match("\%([^%]+)\%");
                        if (npcs[rep[1]] != undefined) {
                            var subStr = new RegExp('\%([^%]+)\%'); //创建正则表达式对象
                            c = c.replace(subStr, npcs[rep[1]]);
                        } else {
                            for (let item of roomData) {
                                if (item != 0) {
                                    if (item.name.indexOf(rep[1]) >= 0) {
                                        var subStr = new RegExp('\%([^%]+)\%');
                                        c = c.replace(subStr, item.id);
                                        break;
                                    }
                                }
                            }
                        }
                    }
                    //商店 id解析
                    if (c.indexOf("*") >= 0) {
                        var rep = c.match("\\*([^%]+)\\*");
                        if (pgoods[rep[1]] != undefined) {
                            var subStr = new RegExp('\\*([^%]+)\\*');
                            c = c.replace(subStr, pgoods[rep[1]].id);
                        }
                    }

                    WG.Send(c);
                    idx = idx + 1;
                };
            }
        },
        sleep: function (time) {
            return new Promise((resolve) => setTimeout(resolve, time));
        },
        stopAllAuto: function () {
            stopauto = true;
        },
        reSetAllAuto: function () {
            stopauto = false;
        },
        go: async function (p) {
            if (saveAddr == '开' && p == '扬州城-钱庄') {
                p = '住房-卧室'
            }
            if (needfind[p] == undefined) {
                if (WG.at(p)) {
                    return;
                }
            }
            if (place[p] != undefined) {
                G.ingo = true;
                await WG.SendCmd(place[p]);
                G.ingo = false;
            }
        },
        at: function (p) {
            if (saveAddr == '开' && p == '扬州城-钱庄') {
                p = '住房-卧室'
            }
            var w = $(".room-name").html();
            return w.indexOf(p) == -1 ? false : true;
        },

        getIdByName: function (n) {
            for (let i = 0; i < roomData.length; i++) {
                if (roomData[i].name && roomData[i].name.indexOf(n) >= 0) {
                    return roomData[i].id;
                }
            }
            return null;
        },
        smhook: undefined,
        ythook: undefined,
        ungetStore: false,
        kala_count: 0,

        doSmTask: async function (action) {
            return new Promise(async (resolve) => {
                try {
                    switch (action) {
                        case 0:
                            //前往师门接收任务
                            WG.go(sm_array[family].place);
                            WG.sm_state = 1;

                            // 如果kala_count大于5，则重置id
                            if (WG.kala_count > 2) {
                                WG.clean_id_all(false);
                                if (WG.kala_count > 5) {
                                    WG.kala_count = 0;
                                    WG.sm_state = 0;
                                    $(".sm_button").text("师门(Q)");
                                    messageAppend('错误:师门任务错误,脚本将重试')
                                }
                            }
                            resolve();
                            break;
                        case 1:
                            // 接受任务
                            var lists = $(".room_items .room-item");
                            var id = null;
                            for (var npc of lists) {
                                if (npc.lastElementChild.innerText.indexOf("[") >= 0) {
                                    if (npc.lastElementChild.lastElementChild.lastElementChild.lastElementChild == null) {
                                        if (npc.lastElementChild.firstChild.nodeType == 3 &&
                                            npc.lastElementChild.firstChild.nextSibling.tagName == "SPAN") {
                                            if (npc.lastElementChild.innerText.split('[')[0] == sm_array[family].npc)
                                                id = $(npc).attr("itemid");
                                        }
                                    }
                                } else {
                                    if (npc.lastElementChild.lastElementChild == null) {
                                        if (npc.lastElementChild.innerText == sm_array[family].npc) {
                                            id = $(npc).attr("itemid");
                                        }
                                    }
                                }
                            }
                            if (id != undefined) {
                                WG.Send("task sm " + id);
                                WG.Send("task sm " + id);
                                WG.sm_state = 2;
                            } else {
                                WG.update_npc_id();
                                WG.clean_id_all(false);
                                WG.sm_state = 0;
                                WG.kala_count = WG.kala_count + 1;
                            }
                            resolve();
                            break;
                        case 2:
                            // 获取师门任务物品
                            var mysm_loser = GM_getValue(roleid + "_sm_loser", sm_loser);
                            //获取师门任务物品
                            var item = $("span[cmd$='giveup']:last").parent().prev();
                            if (item.length == 0) {
                                WG.sm_state = 0;
                                WG.kala_count = WG.kala_count + 1
                            };
                            var itemName = item.html();
                            let _gtype = item[0].localName;
                            item = item[0].outerHTML;

                            if (WG.ungetStore) {
                                if (mysm_loser == "开") {
                                    $("span[cmd$='giveup']:last").click();
                                    messageAppend("放弃任务");
                                    WG.ungetStore = false;
                                    WG.sm_state = 0;
                                    WG.kala_count = 0;
                                    resolve()
                                    break;
                                } else if (mysm_loser == "关") {
                                    WG.sm_state = -1;
                                    WG.kala_count = 0;
                                    $(".sm_button").text("师门(Q)");
                                    resolve()
                                    break;
                                }
                            }
                            //能上交直接上交
                            var tmpObj = $("span[cmd$='giveup']:last").prev();
                            for (let i = 0; i < 6; i++) {
                                if (tmpObj.children().html()) {
                                    if (tmpObj.html().indexOf(item) >= 0) {
                                        tmpObj.click();
                                        messageAppend("自动上交" + item);
                                        WG.sm_state = 0;
                                        WG.kala_count = 0;
                                        resolve()
                                        return;
                                    }
                                    tmpObj = tmpObj.prev();
                                }
                            }
                            //不能上交自动购买
                            if (itemName == "金创药" || itemName == "引气丹") {
                                WG.sm_item = pgoods[_gtype + itemName];
                            } else {
                                WG.sm_item = pgoods[itemName];
                            }

                            if (item != undefined) {
                                WG.sm_itemx = item;
                                if (WG.inArray(item, store_list) && sm_getstore == "开") {
                                    if (item.indexOf("hiz") >= 0 || item.indexOf("hio") >= 0) {
                                        sm_any = GM_getValue(roleid + "_sm_any", sm_any);
                                        if (sm_any == "开") {
                                            messageAppend("自动仓库取" + item);
                                            WG.sm_store = item;
                                            WG.sm_state = 4;
                                            resolve()
                                            return;
                                        } else {
                                            var a = window.confirm("您确定要交稀有物品吗");
                                            if (a) {
                                                messageAppend("自动仓库取" + item);
                                                WG.sm_store = item;
                                                WG.sm_state = 4;
                                                resolve()
                                                return;
                                            }
                                        }
                                    } else {
                                        messageAppend("自动仓库取" + item);
                                        WG.sm_store = item;
                                        WG.sm_state = 4;
                                        resolve()
                                        return;
                                    }
                                }
                            }
                            if (WG.sm_item != undefined && item.indexOf(WG.sm_item.type) >= 0) {

                                if (WG.smbuyNum == null) {
                                    WG.smbuyNum = 0;

                                    WG.kala_count = WG.kala_count + 1;
                                } else if (WG.smbuyNum > 3) {
                                    WG.sm_state = 5;
                                }

                                WG.go(WG.sm_item.place);
                                messageAppend("自动购买" + item);
                                WG.sm_state = 3;
                            } else {

                                WG.sm_state = 5;
                            }
                            resolve();
                            break;
                        case 3:
                            // 前往商店购买任务物品
                            WG.go(WG.sm_item.place);
                            if (WG.buy(WG.sm_item)) {
                                WG.sm_state = 0;
                                if (WG.smbuyNum == 0) {
                                    WG.lastBuy = WG.sm_item
                                }
                                if (WG.lastBuy == WG.sm_item) {
                                    WG.smbuyNum = WG.smbuyNum + 1;
                                }
                            }
                            resolve();
                            break;
                        case 4:
                            // 前往钱庄取出仓库中的任务物品
                            var mysm_loser = GM_getValue(roleid + "_sm_loser", sm_loser);
                            WG.go("扬州城-钱庄");
                            WG.qu(WG.sm_store, (res) => {
                                if (res) {
                                    WG.sm_state = 0;
                                } else {
                                    messageAppend("无法取" + WG.sm_store);
                                    if (WG.sm_item != undefined && WG.sm_store.indexOf(WG.sm_item.type) >= 0) {
                                        WG.go(WG.sm_item.place);
                                        messageAppend("自动购买" + WG.sm_store);
                                        WG.sm_state = 3;
                                    } else {
                                        if (mysm_loser == "开") {
                                            WG.ungetStore = true;
                                            WG.sm_state = 0;
                                        } else {
                                            WG.sm_state = 5;
                                            // $(".sm_button").text("师门(Q)");
                                        }
                                    }
                                }
                                resolve();

                            });
                            break;
                        case 5:
                            // 判断是否需要上交牌子
                            var mysm_loser = GM_getValue(roleid + "_sm_loser", sm_loser);
                            if (sm_price == "开") {
                                let pz = [{}, {}, {}, {}, {}]
                                tmpObj = $("span[cmd$='giveup']:last").prev();
                                for (let i = 0; i < 6; i++) {
                                    if (tmpObj.children().html()) {
                                        if (tmpObj.html().indexOf('放弃') == -1 &&
                                            tmpObj.html().indexOf('令牌') >= 0) {
                                            if (tmpObj.html().indexOf('hig') >= 0) {
                                                pz[0] = tmpObj;
                                            }
                                            if (tmpObj.html().indexOf('hic') >= 0) {
                                                pz[1] = tmpObj;
                                            }
                                            if (tmpObj.html().indexOf('hiy') >= 0) {
                                                pz[2] = tmpObj;
                                            }
                                            if (tmpObj.html().indexOf('hiz') >= 0) {
                                                pz[3] = tmpObj;
                                            }
                                            if (tmpObj.html().indexOf('hio') >= 0) {
                                                pz[4] = tmpObj;
                                            }
                                        }
                                    }
                                    tmpObj = tmpObj.prev();
                                }
                                let _p = false;
                                for (let p of pz) {
                                    if (p.html != undefined) {
                                        p.click();
                                        messageAppend("自动上交牌子");
                                        WG.sm_state = 0;

                                        WG.kala_count = 0;
                                        _p = true;
                                        resolve()
                                        return;
                                    }
                                }
                                if (!_p) {
                                    messageAppend("没有牌子并且无法购买");
                                    WG.smbuyNum = null;
                                    if (mysm_loser == "开") {
                                        $("span[cmd$='giveup']:last").click();
                                        messageAppend("放弃任务");
                                        WG.sm_state = 0;
                                        WG.kala_count = 0;
                                        resolve()
                                        return;
                                    } else {
                                        WG.sm_state = -1;
                                        $(".sm_button").text("师门(Q)");
                                        resolve()
                                        return;
                                    }
                                }
                            }
                            else {
                                messageAppend("无法提交" + WG.sm_itemx);
                                WG.smbuyNum = null;
                                if (mysm_loser == "关") {
                                    WG.sm_state = -1;
                                    $(".sm_button").text("师门(Q)");
                                } else if (mysm_loser == "开") {
                                    $("span[cmd$='giveup']:last").click();
                                    messageAppend("放弃任务");
                                    WG.sm_state = 0;

                                    WG.kala_count = 0;
                                }
                            }
                            resolve();
                            break;
                        default:
                            break;
                    }
                } catch (e) {
                    console.error(e);
                    resolve();
                }
            });
        },

        smTask: async function () {
            if (!WG.smhook) {
                WG.smhook = WG.add_hook('text', function (data) {
                    if (data.msg.indexOf("辛苦了， 你先去休息") >= 0 ||
                        data.msg.indexOf("和本门毫无瓜葛") >= 0 ||
                        data.msg.indexOf("你没有") >= 0
                    ) {
                        WG.Send("taskover signin");
                        WG.sm_state = -1;
                        $(".sm_button").text("师门(Q)");
                        WG.remove_hook(WG.smhook);
                        WG.smhook = undefined;
                    }
                });
            }
            while (WG.sm_state != -1) {
                try {
                    await WG.doSmTask(WG.sm_state);
                    await WG.sleep(1000);
                } catch (e) {
                    console.error(e);
                    break;
                }
            }
        },

        sm_button: async function () {
            if (WG.sm_state >= 0) {
                WG.sm_state = -1;
                $(".sm_button").text("师门(Q)");
            } else {
                WG.sm_state = 0;
                $(".sm_button").text("停止(Q)");
                await WG.smTask()
            }
        },
        buy: function (good) {
            var tmp = npcs[good.sales];
            if (tmp == undefined) {
                WG.update_npc_id();
                return false;
            }
            WG.Send("list " + tmp);
            WG.Send("buy 1 " + good.id + " from " + tmp);
            return true;
        },
        qu_hook: undefined,
        qu: function (good, callback) {

            let storestatus = false;
            // $(".obj-item").each(function () {
            //     if ($(this).html().toLowerCase().indexOf(good) != -1) {
            //         storestatus = true;
            //         var id = $(this).attr("obj")
            //         WG.Send("qu 1 " + id);
            //         return;
            //     }
            // })
            WG.qu_hook = WG.add_hook("dialog", async function (data) {
                if (data.dialog != undefined & data.stores != undefined) {
                    for (let item of data.stores) {
                        if (item.name.toLocaleLowerCase().indexOf(good) != -1) {
                            storestatus = true;
                            var id = item.id;
                            WG.Send("qu 1 " + id);
                            break;
                        }
                    }
                    setTimeout(() => {
                        callback(storestatus);
                    }, 300);
                    WG.remove_hook(WG.qu_hook)
                    WG.qu_hook = undefined;
                }
            });

            WG.SendCmd('store')
        },
        Give: function (items) {
            var tmp = npcs["店小二"];
            if (tmp == undefined) {
                WG.update_npc_id();
                return false;
            }
            WG.Send("give " + tmp + " " + items);
            return true;
        },
        eq: function (e) {
            WG.Send("eq " + equip[e]);
        },
        ask: function (npc, i) {
            npc = npcs[npc];
            npc != undefined ? WG.Send("ask" + i + " " + npc) : WG.update_npc_id();
        },
        yamen_lister: undefined,
        yamen_err_no: 0,
        go_yamen_task: async function () {
            if (!WG.yamen_lister) {
                WG.yamen_lister = WG.add_hook('text', function (data) {
                    if (data.msg.indexOf("最近没有在逃的逃犯了，你先休息下吧。") >= 0) {
                        clearInterval(WG.check_yamen_task);
                        WG.check_yamen_task = 'over';
                        WG.remove_hook(WG.yamen_lister);
                        WG.yamen_lister = undefined;
                        WG.yamen_err_no = 0;
                    } else if (data.msg.indexOf("没有这个人") >= 0) {
                        WG.update_npc_id();
                    }
                });
            }
            WG.go("扬州城-衙门正厅");
            await WG.sleep(200);
            WG.update_npc_id();
            WG.ask("扬州知府 程药发", 1);
            if (WG.check_yamen_task == 'over') {
                return;
            }
            window.setTimeout(WG.check_yamen_task, 1000);
        },
        check_yamen_task: function () {
            if (WG.check_yamen_task == 'over') {
                return;
            }
            messageAppend("查找任务中");
            var task = $(".task-desc:eq(-2)").text();
            for (let idx = 3; idx < 10; idx++) {
                if (task.indexOf("扬州知府") == -1) {
                    task = $(".task-desc:eq(-" + idx + ")").text();
                } else {
                    break;
                }
            }

            if (task.length == 0) {
                KEY.do_command("tasks");
                window.setTimeout(WG.check_yamen_task, 1000);
                return;
            }
            try {
                zb_npc = task.match("犯：([^%]+)，据")[1];
                zb_place = task.match("在([^%]+)出")[1];
                messageAppend("追捕任务：" + zb_npc + "   地点：" + zb_place);
                KEY.do_command("score");
                WG.go(zb_place);
                window.setTimeout(WG.check_zb_npc, 1000);
            } catch (error) {
                messageAppend("查找衙门追捕失败");
                if (WG.yamen_err_no < 4) {
                    KEY.do_command("tasks");
                    window.setTimeout(WG.check_yamen_task, 1000);
                    WG.yamen_err_no = WG.yamen_err_no + 1;
                } else {
                    clearInterval(WG.check_yamen_task);
                    WG.remove_hook(WG.yamen_lister);
                    WG.yamen_lister = undefined;
                    WG.yamen_err_no = 0;
                }

            }
        },
        zb_next: 0,
        check_zb_npc: function () {
            var lists = $(".room_items .room-item");
            var found = false;

            for (var npc of lists) {
                if (npc.innerText.indexOf(zb_npc) != -1) {
                    found = true;
                    WG.Send("kill " + $(npc).attr("itemid"));
                    messageAppend("找到" + zb_npc + "，自动击杀！！！");
                    WG.zb_next = 0;
                    return;
                }
            }
            var fj = needfind[zb_place];
            if (!found && needfind[zb_place] != undefined && WG.zb_next < fj.length) {
                messageAppend("寻找附近");
                WG.Send(fj[WG.zb_next]);
                WG.zb_next++;
            }
            if (!found) {
                window.setTimeout(WG.check_zb_npc, 1000);
            }
        },
        kill_all: function () {
            var lists = $(".room_items .room-item");
            for (var npc of lists) {
                if ($(npc).html().indexOf("尸体") == -1) {
                    WG.Send("kill " + $(npc).attr("itemid"));
                }
            }
        },
        get_all: function () {
            var lists = $(".room_items .room-item");
            for (var npc of lists) {
                WG.Send("get all from " + $(npc).attr("itemid"));
            }
        },
        clean_all: function () {
            WG.go("扬州城-打铁铺");
            WG.Send("sell all");
        },
        sort_hook: undefined,
        sort_all: function () {

            var storeset = [
            ];
            if (WG.sort_hook) {
                messageAppend("<hio>仓库排序</hio>运行中");
                messageAppend("<hio>仓库排序</hio>手动结束");
                WG.remove_hook(WG.sort_hook);
                WG.sort_hook = undefined;
                return;
            }
            var sortCmd = "";
            var getandstore = function (set) {

                var cmds = [];
                for (let s of set) {
                    cmds.push("qu " + s.count + " " + s.id + ";$wait 350;");
                }
                set = set.sort(function (a, b) {
                    return a.name.length - b.name.length;
                })
                for (let s of set) {
                    cmds.push("store " + s.count + " " + s.id + ";$wait 350;");
                }
                return cmds.join("");
            }
            WG.sort_hook = WG.add_hook(['dialog', 'text'], (data) => {
                if (data.type == 'dialog' && data.dialog == 'list') {
                    if (data.stores == undefined) {
                        return;
                    }
                    const colorSet = ['wht', 'hig', 'hic', 'hiy', 'hiz', 'hio', 'red', 'hir', 'ord'];

                    for (let store of data.stores) {
                        let num = 0;
                        for (let cx of colorSet) {
                            if (store.name.toLocaleLowerCase().indexOf(cx) >= 0) {
                                if (storeset[num]) {
                                    storeset[num].push(store);
                                } else {
                                    storeset[num] = [store];
                                }
                            }
                            num++;
                        }

                    }
                    for (let item of storeset) {
                        if (item) {
                            sortCmd += getandstore(item);
                        }
                    }
                    sortCmd += "look3 1";
                    WG.SendCmd(sortCmd);
                } else if (data.type == 'text' && data.msg == '没有这个玩家。') {
                    messageAppend("<hio>仓库排序</hio>完成");
                    WG.remove_hook(WG.sort_hook);
                    WG.sort_hook = undefined;
                }

            });
            messageAppend("<hio>仓库排序</hio>开始");
            if (WG.at("扬州城-钱庄")) {
                WG.Send("store");
            } else {
                WG.go("扬州城-钱庄");
            }
        },
        sort_all_bag: function () {

            var storeset = [
            ];
            if (WG.sort_hook) {
                messageAppend("<hio>背包排序</hio>运行中");
                messageAppend("<hio>背包排序</hio>手动结束");
                WG.remove_hook(WG.sort_hook);
                WG.sort_hook = undefined;
                return;
            }
            var sortCmd = "";
            var getandstore = function (set) {

                var cmds = [];
                for (let s of set) {
                    cmds.push("store " + s.count + " " + s.id + ";$wait 350;");
                }
                set = set.sort(function (a, b) {
                    return a.name.length - b.name.length;
                })
                for (let s of set) {
                    cmds.push("qu " + s.count + " " + s.id + ";$wait 350;");
                }
                return cmds.join("");
            }
            WG.sort_hook = WG.add_hook(['dialog', 'text'], (data) => {
                if (data.type == 'dialog' && data.dialog == 'pack') {
                    if (data.items == undefined) {
                        return;
                    }
                    const colorSet = ['wht', 'hig', 'hic', 'hiy', 'hiz', 'hio', 'red', 'hir', 'ord'];

                    for (let store of data.items) {
                        let num = 0;
                        for (let cx of colorSet) {
                            if (store.name.toLocaleLowerCase().indexOf(cx) >= 0) {
                                if (storeset[num]) {
                                    storeset[num].push(store);
                                } else {
                                    storeset[num] = [store];
                                }
                            }
                            num++;
                        }
                    }
                    for (let item of storeset) {
                        if (item) {
                            sortCmd += getandstore(item);
                        }
                    }
                    sortCmd += "look3 1";
                    WG.SendCmd(sortCmd);
                } else if (data.type == 'text' && data.msg == '没有这个玩家。') {
                    messageAppend("<hio>背包排序</hio>完成,执行后请刷新并重新登录");
                    WG.remove_hook(WG.sort_hook);
                    WG.sort_hook = undefined;
                }

            });
            messageAppend("<hio>背包排序</hio>开始");
            if (WG.at("扬州城-钱庄")) {
                WG.Send("pack");
                KEY.dialog_close();
                //WG.Send("store");
            } else {
                WG.go("扬州城-钱庄");
            }
        },
        packup_listener: null,
        packup_ready: false,
        sell_all: function (store = 1, fenjie = 1, drop = 1) {
            if (WG.packup_listener) {
                messageAppend("<hio>包裹整理</hio>运行中");
                messageAppend("<hio>包裹整理</hio>手动结束");
                WG.packup_ready = false;
                WG.remove_hook(WG.packup_listener);
                WG.packup_listener = undefined;
                return;
            }

            let stores = [];
            WG.packup_listener = WG.add_hook(["dialog", "text"], (data) => {
                if (data.type == "dialog" && data.dialog == "list") {
                    if (data.stores == undefined || WG.packup_ready) {
                        return;
                    }
                    stores = [];
                    //去重
                    for (let i = 0; i < data.stores.length; i++) {
                        let s = null;
                        for (let j = 0; j < stores.length; j++) {
                            if (stores[j].name == data.stores[i].name.toLowerCase()) {
                                s = stores[j];
                                break;
                            }
                        }
                        if (s != null) {
                            s.count += data.stores[i].count;
                        } else {
                            stores.push(data.stores[i]);
                        }
                    }
                } else if (data.type == "dialog" && data.dialog == "pack") {
                    let cmds = [];
                    let dropcmds = [];
                    if (data.items == undefined || WG.packup_ready) {
                        return;
                    }
                    for (var i = 0; i < data.items.length; i++) {
                        //仓库
                        if (store_list.length != 0) {
                            if (WG.inArray(data.items[i].name.toLowerCase(), store_list) && store) {
                                if (data.items[i].can_eq) {
                                    //装备物品，不能叠加，计算总数
                                    let store = null;
                                    for (let j = 0; j < stores.length; j++) {
                                        if (stores[j].name == data.items[i].name.toLowerCase()) {
                                            store = stores[j];
                                            break;
                                        }
                                    }
                                    if (store != null) {
                                        if (store.count < 4) {
                                            store.count += data.items[i].count;
                                            cmds.push("store " + data.items[i].count + " " + data.items[i].id);
                                            cmds.push("$wait 350");
                                            messageAppend("<hio>包裹整理</hio>" + data.items[i].name + "储存到仓库");
                                        } else {
                                            messageAppend("<hio>包裹整理</hio>" + data.items[i].name + "超过设置的储存上限");
                                        }
                                    } else {
                                        stores.push(data.items[i]);
                                        cmds.push("store " + data.items[i].count + " " + data.items[i].id);
                                        cmds.push("$wait 350");
                                        messageAppend("<hio>包裹整理</hio>" + data.items[i].name + "储存到仓库");
                                    }
                                } else {
                                    cmds.push("store " + data.items[i].count + " " + data.items[i].id);
                                    cmds.push("$wait 350");
                                    messageAppend("<hio>包裹整理</hio>" + data.items[i].name + "储存到仓库");
                                }
                            }
                        }
                        //丢弃
                        if (WG.inArray(data.items[i].name.toLowerCase(), drop_list) && drop && (data.items[i].name.indexOf("★") == -1 || data.items[i].name.indexOf("☆") == -1)) {
                            if (lock_list.indexOf(data.items[i].name.toLowerCase()) >= 0) { continue; }
                            if (data.items[i].count == 1) {
                                dropcmds.push("drop " + data.items[i].id);
                                dropcmds.push("$wait 350");
                            } else {
                                dropcmds.push("drop " + data.items[i].count + " " + data.items[i].id);
                                dropcmds.push("$wait 350");
                            }


                            messageAppend("<hio>包裹整理</hio>" + data.items[i].name + "丢弃");

                        }
                        //分解
                        if (fenjie_list.length && WG.inArray(data.items[i].name.toLowerCase(), fenjie_list) && data.items[i].name.indexOf("★") == -1 && fenjie) {
                            cmds.push("fenjie " + data.items[i].id);
                            cmds.push("$wait 350");
                            messageAppend("<hio>包裹整理</hio>" + data.items[i].name + "分解");

                        }
                    }
                    cmds.push("$wait 1000")
                    cmds.push("$to 扬州城-杂货铺");
                    cmds.push("sell all");
                    cmds.push("$wait 1000");
                    cmds = cmds.concat(dropcmds);
                    // cmds.push("$zxbuy");
                    cmds.push("look3 1");
                    if (cmds.length > 0 || WG.packup_ready) {
                        WG.SendCmd(cmds);
                        WG.packup_ready = true;
                    }
                } else if (data.type == 'text' && data.msg == '没有这个玩家。') {

                    messageAppend("<hio>包裹整理</hio>完成");
                    WG.packup_ready = false;
                    WG.remove_hook(WG.packup_listener);
                    WG.packup_listener = undefined;
                }
            });

            messageAppend("<hio>包裹整理</hio>开始");

            WG.go("扬州城-钱庄");
            WG.Send("store;pack");
        },
        cmd_echo_button: function () {
            if (G.cmd_echo) {
                G.cmd_echo = false;
                messageAppend("<hio>命令代码关闭</hio>");
            } else {
                G.cmd_echo = true;
                ProConsole.init();
                messageAppend("<hio>命令代码显示</hio>");
            }
        },
        getItemNameByid: (id, callback) => {
            packData.forEach(function (item) {
                if (item != 0) {
                    if (item.id == id) {
                        callback(item.name);
                        return;
                    }
                }
            })
        },
        addstore: (itemname) => {
            if (zdy_item_store2 == "") {
                zdy_item_store2 = itemname;
            } else {
                zdy_item_store2 = zdy_item_store2 + "," + itemname;
            }
            GM_setValue(roleid + "_zdy_item_store2", zdy_item_store2);

            $('#store_info2').val(zdy_item_store2);

            if (zdy_item_store2) {
                store_list = zdy_item_store2.split(",");
            }

            messageAppend("添加存仓成功" + itemname);
        },
        addlock: (itemname) => {
            if (zdy_item_lock == "") {
                zdy_item_lock = itemname;
            } else {
                zdy_item_lock = zdy_item_lock + "," + itemname;
            }
            GM_setValue(roleid + "_zdy_item_lock", zdy_item_lock);

            $('#lock_info').val(zdy_item_lock);

            if (zdy_item_lock) {
                lock_list = zdy_item_lock.split(",");
            }

            messageAppend("添加物品锁成功" + itemname);
        },
        dellock: (itemname) => {
            lock_list.remove(itemname);
            zdy_item_lock = lock_list.join(',');
            GM_setValue(roleid + "_zdy_item_lock", zdy_item_lock);

            $('#lock_info').val(zdy_item_lock);

            messageAppend("解锁物品锁成功" + itemname);
        },
        addfenjieid: (itemname) => {
            if (zdy_item_fenjie == "") {
                zdy_item_fenjie = itemname;
            } else {
                zdy_item_fenjie = zdy_item_fenjie + "," + itemname;
            }
            GM_setValue(roleid + "_zdy_item_fenjie", zdy_item_fenjie);


            if (zdy_item_fenjie) {
                fenjie_list = zdy_item_fenjie.split(",");
            }
            messageAppend("添加分解成功" + itemname);

            $('#store_fenjie_info').val(zdy_item_fenjie);
        },
        adddrop: (itemname) => {
            if (itemname.indexOf("hio") >= 0 || itemname.indexOf("hir") >= 0 || itemname.indexOf("ord") >= 0) {
                messageAppend("高级物品,不添加整理时丢弃" + itemname);
                return;
            }
            if (zdy_item_drop == "") {
                zdy_item_drop = itemname;
            } else {
                zdy_item_drop = zdy_item_drop + "," + itemname;
            }
            GM_setValue(roleid + "_zdy_item_drop", zdy_item_drop);
            if (zdy_item_drop) {
                drop_list = zdy_item_drop.split(",");
            }
            messageAppend("添加丢弃成功" + itemname);

            $('#store_drop_info').val(zdy_item_drop);
        },
        addzxbuy: (itemname) => {
            if (itemname.indexOf("hio") >= 0 || itemname.indexOf("hir") >= 0 || itemname.indexOf("ord") >= 0) {
                messageAppend("高级物品,不添加" + itemname);
                return;
            }
            if (auto_skillPaperSelllist == "") {
                auto_skillPaperSelllist = itemname;
            } else {
                auto_skillPaperSelllist = auto_skillPaperSelllist + "," + itemname;
            }
            GM_setValue(roleid + "_auto_skillPaperSelllist", auto_skillPaperSelllist);

            messageAppend("添加成功" + itemname);

            $('#autoSkillPaperSell').val(auto_skillPaperSelllist);
        },
        zdwk: async function (v, x = true) {
            if (x) {
                if (G.level) {
                    if (G.isGod()) {
                        WG.go("住房-练功房");
                        WG.Send("xiulian");
                        return;
                    }
                }
            }
            if (CanUse) {
                if (v == "remove") {
                    if (G.wk_listener) {
                        WG.remove_hook(G.wk_listener);
                        G.wk_listener = undefined;
                    }
                    return;
                }
                if (G.wk_listener) return;
                let tiejiang_id;
                let wk_busy = false;
                G.wk_listener = WG.add_hook(["dialog", "text"], async function (data) {
                    if (data.type == "dialog" && data.dialog == "pack") {
                        //检查是否装备铁镐
                        let tiegao_id;
                        if (data.name) {
                            if (data.name == "<wht>铁镐</wht>") {
                                WG.Send("eq " + data.id);
                                await WG.sleep(2000);
                                WG.go("扬州城-矿山");
                                WG.Send("wa");
                                WG.zdwk("remove", false);
                                return;
                            }
                        } else if (data.items) {
                            if (data.eqs[0] && data.eqs[0].name.indexOf("铁镐") > -1) {

                                await WG.sleep(1000);
                                WG.go("扬州城-矿山");
                                await WG.sleep(1000);
                                WG.Send("wa");
                                WG.zdwk("remove", false);
                                return;
                            } else {
                                for (let i = 0; i < data.items.length; i++) {
                                    let item = data.items[i];
                                    if (item.name.indexOf("铁镐") > -1) {
                                        tiegao_id = item.id;
                                        break;
                                    }
                                }
                                if (tiegao_id) {
                                    WG.Send("eq " + tiegao_id);
                                    await WG.sleep(2000);
                                    WG.go("扬州城-矿山");
                                    WG.Send("wa");
                                    WG.zdwk("remove", false);
                                    return;
                                } else {
                                    WG.go("扬州城-打铁铺");
                                    WG.Send("look 1");
                                }
                            }
                        }
                    }
                    if (data.type == 'text' && data.msg == '你要看什么？') {
                        let id = WG.getIdByName('铁匠');
                        if (id) {
                            tiejiang_id = id;
                            WG.Send('list ' + id);
                        } else {
                            messageAppend("<hio>自动挖矿</hio>未发现铁匠");
                            WG.zdwk("remove", false);
                        }
                    } else if (data.type == 'text') {
                        if (data.msg == '你挥着铁镐开始认真挖矿。') WG.zdwk("remove");
                        else if ((data.msg == "你现在正忙。" || data.msg == "你正在战斗，待会再说。" || data.msg.indexOf("不要急") >= 0 || data.msg.indexOf("这个方向没有出路") >= 0) && wk_busy == false) {
                            wk_busy = true;
                            messageAppend('卡顿,五秒后再次尝试操作', 0, 1);
                            setTimeout(() => {
                                wk_busy = false;
                                WG.zdwk("remove", false);
                                WG.zdwk();
                            }, 5000);
                        }
                    }
                    if (data.type == 'dialog' && data.dialog == 'list' && data.seller == tiejiang_id) {
                        let item_id;
                        for (let i = 0; i < data.selllist.length; i++) {
                            let item = data.selllist[i];
                            if (item.name == "<wht>铁镐</wht>") {
                                item_id = item.id;
                                break;
                            }
                        }
                        if (item_id) {
                            WG.Send('buy 1 ' + item_id + ' from ' + tiejiang_id);

                            await WG.sleep(2000);
                        } else {
                            messageAppend("<hio>自动挖矿</hio>无法购买<wht>铁镐</wht>");
                            WG.zdwk("remove", false);
                        }
                    }
                });
                WG.Send("stopstate;pack");

            } else {
                var t = $(".room_items .room-item:first .item-name").text();
                t = t.indexOf("<挖矿");

                if (t == -1) {
                    messageAppend("当前不在挖矿状态");
                    if (timer == 0) {
                        console.log(timer);
                        WG.go("扬州城-矿山");
                        WG.eq("铁镐");
                        WG.Send("wa");
                        timer = setInterval(WG.zdwk, 5000);
                    }
                } else {
                    WG.timer_close();
                }

                if (WG.at("扬州城-矿山") && t == -1) {
                    //不能挖矿，自动买铁镐
                    WG.go("扬州城-打铁铺");
                    WG.buy(pgoods["铁镐"]);
                    //买完等待下一次检查
                    messageAppend("自动买铁镐");
                    return;
                }
                if (WG.at("扬州城-打铁铺")) {
                    var lists = $(".dialog-list > .obj-list:eq(1)");
                    var id;
                    var name;
                    if (lists.length) {
                        messageAppend("查找铁镐ID");
                        for (var a of lists.children()) {
                            a = $(a);
                            id = a.attr("obj");
                            name = $(a.children()[0]).html();
                            if (name == "铁镐") {
                                equip["铁镐"] = id;
                                WG.eq("铁镐");
                                break;
                            }
                        }
                        GM_setValue(roleid + "_equip", equip);
                        WG.go("扬州城-矿山");
                        WG.Send("wa");
                    }
                    return;
                }
            }
        },
        timer_close: function () {
            if (timer) {
                clearInterval(timer);
                timer = 0;
            }
        },
        wudao_hook: undefined,
        wudao_auto: function () {
            //创建定时器
            if (timer == 0) {
                timer = setInterval(WG.wudao_auto, 1000);
            }
            if (!WG.at("武道塔")) {
                //进入武道塔 对于武神塔不知道咋操作
                if (CanUse) {
                    if (!WG.wudao_hook) {
                        WG.wudao_hook = WG.add_hook("dialog", (data) => {
                            var item = data.items
                            for (var ii of item) {
                                if (ii.id == "signin") {
                                    WG.go("武道塔");
                                    //var pattern = "/-?[1-9]\d*/-?[1-9]\d*/", str = ii.desc;//写不来正则
                                    var reg = new RegExp("进度([^%]+)，<");
                                    var wudaojindu = (ii.desc.match(reg))[1];
                                    if (wudaojindu != null) {
                                        messageAppend("爬塔 : " + wudaojindu);
                                        var index = wudaojindu.indexOf('<');
                                        var wudao = wudaojindu.substring(0, index).split('/')
                                        var wudaocongz = ii.desc.indexOf("武道塔可以重置") != -1;
                                        // messageAppend("测试结果 : "+wudaocongz+"__" + wudao [0]+ "__" + wudao [1] );
                                        if (wudao[0] == wudao[1]) {
                                            messageAppend("爬塔完成! ");
                                            if (wudaocongz) { //重置
                                                WG.ask("守门人", 1);
                                                messageAppend("爬塔重置完成! ");
                                                WG.Send("go enter");
                                            } else {
                                                messageAppend("爬塔已经重置过了!");
                                                WG.timer_close();
                                            }
                                        } else { //没爬完
                                            messageAppend("爬塔未完成!");
                                            WG.Send("go enter");
                                        }
                                        //messageAppend(" ii  "+ wudaojindu +" ____" + wudaocongz);
                                    } else {
                                        messageAppend("获取爬塔信息失败 : " + ii.desc);
                                    }
                                    break;
                                }
                            }
                            WG.remove_hook(WG.wudao_hook);
                            WG.wudao_hook = undefined;
                        })
                    }
                    WG.Send("tasks");
                } else {
                    WG.go("武道塔");
                    WG.ask("守门人", 1);
                    WG.Send("go enter");
                }
            } else {
                //武道塔内处理
                //messageAppend("武道塔");
                var w = $(".room_items .room-item:last");
                var t = w.text();
                if (t.indexOf("守护者") != -1) {
                    WG.Send("kill " + w.attr("itemid"));
                    WG.wudao_autopfm();
                } else {
                    WG.Send("go up");
                }
            }
        },
        wudao_autopfm: function () {
            var pfm = wudao_pfm.split(',');
            for (var p of pfm) {
                if ($("div.combat-panel div.combat-commands span.pfm-item:eq(" + p + ") span").css("left") == "0px")
                    $("div.combat-panel div.combat-commands span.pfm-item:eq(" + p + ") ").click();
            }
        },
        xue_auto: function () {
            var t = $(".room_items .room-item:first .item-name").text();
            t = t.indexOf("<打坐") != -1 || t.indexOf("<学习") != -1 || t.indexOf("<练习") != -1;
            //创建定时器
            if (timer == 0) {
                if (t == false) {
                    messageAppend("当前不在打坐或学技能");
                    return;
                }
                timer = setInterval(WG.xue_auto, 1000);
            }
            if (t == false) {
                //学习状态中止，自动去挖矿
                WG.timer_close();
                WG.zdwk();
            } else {
                messageAppend("自动打坐学技能");
            }
        },
        fbnum: 0,
        needGrove: 0,
        oncegrove: function () {
            this.fbnum += 1;
            messageAppend("第" + this.fbnum + "次");
            WG.Send("cr yz/lw/shangu;cr over");
            if (this.needGrove <= this.fbnum) {
                WG.Send("taskover signin");
                messageAppend("<hiy>" + this.fbnum + "次副本小树林秒进秒退已完成</hiy>");
                WG.remove_hook(WG.daily_hook);
                WG.daily_hook = undefined;
                this.timer_close();
                //WG.zdwk();
                this.needGrove = 0;
                this.fbnum = 0;
            }
        },
        grove_ask_info: function () {
            return prompt("请输入需要秒进秒退的副本次数", "");
        },
        grove_auto: function (needG = null) {
            if (timer == 0) {
                if (needG == null) {
                    this.needGrove = this.grove_ask_info();
                } else {
                    this.needGrove = needG;
                }
                if (this.needGrove) //如果返回的有内容
                {
                    if (parseFloat(this.needGrove).toString() == "NaN") {
                        messageAppend("请输入数字");
                        return;
                    }
                    messageAppend("开始秒进秒退小树林" + this.needGrove + "次");

                    timer = setInterval(() => {
                        this.oncegrove()
                    }, 1000);
                }
            }
        },
        showhideborad: function () {
            if ($('.WG_log').css('display') == 'none') {
                window.localStorage.setItem("closeBorad", "false")
                $('.WG_log').show();
            } else {
                window.localStorage.setItem("closeBorad", "true")
                $('.WG_log').hide();
            }
        },
        showhidebtn: function () {
            if ($('.WG_button').css('display') == 'none') {
                window.localStorage.setItem("closeBtn", "false")
                $('.WG_button').show();
            } else {
                window.localStorage.setItem("closeBtn", "true")
                $('.WG_button').hide();
            }
        },
        calc: function () {
            messageClear();
            var html = UI.jsquivue;
            messageAppend(html);
            const jsqset = new Vue({
                el: '.JsqVueUI',
                data: {
                    status: 1
                },
                methods: {
                    qnjs_btn: function () {
                        WG.qnjs();
                    },
                    lxjs_btn: function () {
                        WG.lxjs();
                    },
                    khjs_btn: function () {
                        WG.khjs();
                    },
                    zcjs_btn: function () {
                        WG.zcjs();
                    },
                    getskilljson: function () {
                        WG.getPlayerSkill();
                    },
                    autoAddLianxi: function () {
                        // 询问修炼到多少级
                        var level = prompt("请输入修炼到多少级", "1");
                        if (level == null) {
                            return;
                        }
                        if (parseFloat(level).toString() == "NaN") {
                            messageAppend("请输入数字");
                            return;
                        }

                        WG.selectLowKongfu(level);
                    },
                    onekeydaily: function () {
                        WG.SendCmd("$daily");
                    },
                    onekeypk: function () {
                        WG.auto_fight();
                    },
                    onekeysansan: function () {
                        let mlh = `//~silent
                        // 导入三三懒人包流程，方便后续导入操作
                        // 自命令类型选 Raidjs流程
                        // 四区白三三
                        ($f_ss)={"name":"三三懒人包","source":"https://cdn.jsdelivr.net/gh/mapleobserver/wsmud-script/三三懒人包.flow.txt","finder":"根文件夹"}
                        @js var time=Date.parse(new Date());var f=(f_ss);var n=f["name"];var s=f["source"];var fd=f["finder"];WorkflowConfig.removeWorkflow({"name":n,"type":"flow","finder":fd});$.get(s,{stamp:time},function(data,status){WorkflowConfig.createWorkflow(n,data,fd);});
                        @await 2000
                        tm 【三三懒人包】流程已导入，如果曾用早期版本的懒人包导入过流程，请先删除这些流程后再使用。`;

                        if (unsafeWindow && unsafeWindow.ToRaid) {
                            ToRaid.perform(mlh);
                        } else {
                            messageAppend("请先安装Raid.js");
                        }
                    },
                    onelddh: function () {
                        let mlh = `//
                        ($f_ss)={"name":"来点动画","source":"http://ii74.oss-cn-qingdao.aliyuncs.com/gif.txt","finder":"根文件夹"}
                        @js var time=Date.parse(new Date());var f=(f_ss);var n=f["name"];var s=f["source"];var fd=f["finder"];WorkflowConfig.removeWorkflow({"name":n,"type":"flow","finder":fd});$.get(s,{stamp:time},function(data,status){WorkflowConfig.createWorkflow(n,data,fd);});
                        @awiat 2000
                        tm 来点动画已导入`;

                        if (unsafeWindow && unsafeWindow.ToRaid) {
                            ToRaid.perform(mlh);
                        } else {
                            messageAppend("请先安装Raid.js");
                        }
                    },
                    onekeystore: function () {
                        WG.SendCmd("$store")
                    },
                    onekeysell: function () {
                        WG.SendCmd("$drop")
                    },
                    onekeyfenjie: function () {
                        WG.SendCmd("$fenjie")
                    },
                    updatestore: function () {
                        WG.update_store();
                    },
                    cleandps: function () {
                        WG.clean_dps();
                    },
                    sortstore: function () {
                        WG.sort_all();
                    },
                    sortbag: function () {
                        WG.sort_all_bag();
                    },
                    dsrw: function () {
                        WG.dsj();
                    },
                    zdybtnset: function () {
                        WG.zdy_btnset();
                    },
                    cleankksboss: function () {
                        GM_setValue(roleid + "_autoKsBoss", null);
                        GM_setValue(roleid + "_automarry", null);
                        L.msg("操作成功");
                    },
                    onekeydelaytest: function () {
                        WG.wsdelaytest();
                    },
                    yuanshen: function () {
                        //
                        window.location.href = 'https://ys.mihoyo.com/cloud/?utm_source=default#/'
                    },
                    onekeyyaota: function () {
                        T.goyt();
                    }
                }
            })

        },
        dsj_hook: undefined,
        dsj_func: function () {
            if (WG.dsj_hook) {
                WG.remove_hook(WG.dsj_hook);
            }
            messageAppend("已注入定时任务", 0, 1);
            timequestion = GM_getValue(roleid + "_timequestion", timequestion);
            WG.dsj_hook = WG.add_hook("time", (data) => {
                if (data.type == 'time') {
                    let i = 0;
                    for (let p of timequestion) {
                        if ((p.h == data.h && p.m == data.m && p.s == data.s) ||
                            (p.h == "" && p.m == data.m && p.s == data.s) ||
                            (p.h == "" && p.m == "" && p.s == data.s)) {
                            messageAppend("已触发计划" + p.name, 1, 0);
                            WG.SendCmd(p.send);
                            if (p.type == 1) {
                                messageAppend("一次性任务,已移除" + p.name, 1, 0);
                                timequestion.baoremove(i);
                                GM_setValue(roleid + "_timequestion", timequestion);
                            }
                        }
                        i = i + 1;
                    }
                }
            })
        },
        dsj: function () {
            WG.dsj_func();
            messageClear();
            var html = UI.timeoutui;
            messageAppend(html);
            $(".startQuest").off('click');
            $(".removeQuest").off('click');
            //[{"name":"","type":"0","send":"","h":"","s":"","m":""}]
            timequestion = GM_getValue(roleid + "_timequestion", timequestion);
            for (let q of timequestion) {
                let phtml = `<span class='addrun${q.name}'>编辑${q.name}</span>
                <span class='stoprun${q.name}'>删除${q.name}</span>
             <br/>
                `
                $('.questlist').append(phtml);
                $("." + `addrun${q.name}`).on("click", () => {
                    $("#questname").val(q.name);
                    $("#rtype").val(q.type);
                    $("#ht").val(q.h);
                    $("#mt").val(q.m);
                    $("#st").val(q.s);
                    $("#zml_info").val(q.send);
                });
                $("." + `stoprun${q.name}`).on("click", () => {
                    let questname = q.name;
                    let i = 0
                    for (let p of timequestion) {
                        if (p.name == questname) {
                            timequestion.baoremove(i);
                        }
                        i = i + 1;
                    }
                    GM_setValue(roleid + "_timequestion", timequestion);
                    WG.dsj();
                });
            }
            $(".startQuest").on("click", () => {
                let questname = $("#questname").val();
                let type = $("#rtype").val();
                let h = $("#ht").val();
                let m = $("#mt").val();
                let s = $("#st").val();
                let send = $("#zml_info").val();
                questname = questname.replaceAll(" ", "_");
                let item = {
                    "name": questname,
                    "type": type,
                    "send": send,
                    "h": h,
                    "m": m,
                    "s": s
                };
                let i = 0;
                for (let p of timequestion) {
                    if (questname == p.name) {
                        timequestion[i] = item;
                        GM_setValue(roleid + "_timequestion", timequestion);
                        WG.dsj();
                        return;
                    }
                    i = i + 1;
                }

                timequestion.push(item);
                GM_setValue(roleid + "_timequestion", timequestion);
                WG.dsj();
            });
            $(".removeQuest").on("click", () => {
                let questname = $("#questname").val();
                let i = 0
                for (let p of timequestion) {
                    if (p.name == questname) {
                        timequestion.baoremove(i);
                        return;
                    }
                    i = i + 1;
                }
                GM_setValue(roleid + "_timequestion", timequestion);
                WG.dsj();
            });


        },
        qnjs: function () {
            messageClear();
            var html = UI.qnjsui;
            messageAppend(html);
            const qnvue = new Vue({
                el: ".QianNengCalc",
                data: {
                    qnsx: {
                        m: 0,
                        c: 0,
                        color: 0
                    }
                },
                methods: {
                    qnjscalc: function () {
                        $.each(this.qnsx, (key, value) => {
                            this.qnsx[key] = Number(value);
                        })
                        messageAppend("需要潜能:" + WG.dian(this.qnsx.c, this.qnsx.m, this.qnsx.color));
                    }
                }
            })

        },
        lxjs: function () {
            messageClear();
            var html = UI.lxjsui;
            messageAppend(html);
            const lxjsvue = new Vue({
                el: ".StudyTimeCalc",
                data: {
                    jsqsx: {
                        xtwx: 0,
                        htwx: 0,
                        lxxl: 0,
                        clevel: 0,
                        mlevel: 0,
                        color: 0
                    }
                },
                created() {
                    this.jsqsx.xtwx = G.score.int;
                    this.jsqsx.htwx = G.score.int_add;
                    this.jsqsx.lxxl = parseInt(G.score2.lianxi_per.replaceAll("%", ""));
                },
                methods: {
                    lxjscalc: function () {
                        $.each(this.jsqsx, (key, value) => {
                            this.jsqsx[key] = Number(value);
                        })
                        const lxObj = WG.lx(this.jsqsx.xtwx, this.jsqsx.htwx, this.jsqsx.lxxl,
                            this.jsqsx.clevel, this.jsqsx.mlevel, this.jsqsx.color);
                        messageAppend("需要潜能:" + lxObj.qianneng + "     所需时间:" + lxObj.time);
                    }
                }
            })
        },
        khjs: function () {
            messageClear();
            var html = UI.khjsui;
            messageAppend(html);
            const khvue = new Vue({
                el: ".KaihuaCalc",
                data: {
                    khsx: {
                        nl: 0,
                        xg: 0,
                        hg: 0
                    }
                },
                created() {
                    this.khsx.nl = G.score.max_mp;
                    this.khsx.xg = G.score.con;
                    this.khsx.hg = G.score.con_add;
                },
                methods: {
                    khjscalc: function () {
                        $.each(this.khsx, (key, value) => {
                            this.khsx[key] = Number(value);
                        })
                        messageAppend("你的分值:" + WG.gen(this.khsx.nl, this.khsx.xg, this.khsx.hg));
                    }
                }
            })
        }, zcjs: function () {
            messageClear();
            var html = UI.zcjsui;
            messageAppend(html);
            const khvue = new Vue({
                el: ".ZiChuangCalc",
                data: {
                    zcsx: {
                        level: 0,
                        percentage: 0
                    }
                },
                methods: {
                    zcjscalc: function () {
                        messageAppend("自创" + this.zcsx.level + "级,词条百分比:" + this.zcsx.percentage + " 需要词条等级:" +
                            Math.ceil((this.zcsx.percentage - 4 - 2.5e-3 * this.zcsx.level) / this.zcsx.level / 2.5e-5));
                    }
                }
            })
        },
        switchReversal: function (e) {
            let p = e.hasClass("on");
            if (!p) {
                return "开";
            }
            return "关";
        },

        auto_preform_switch: function () {

            if (G.auto_preform) {
                G.auto_preform = false;
                messageAppend("<hio>自动施法</hio>关闭");

                WG.auto_preform("stop");
            } else {
                G.auto_preform = true;
                messageAppend("<hio>自动施法</hio>开启");
                WG.auto_preform();
            }
        },
        forcebufskil: '',
        bufskill: {},
        xubuf: null,
        pfmskill: null,
        is_free: function () {
            if (WG.hasStr("faint", G.selfStatus) || WG.hasStr("busy", G.selfStatus) || WG.hasStr("rash", G.selfStatus) || WG.hasStr("bss", G.selfStatus)) {
                return false;
            } else {
                return true;
            }
        },
        is_zero_releasetime: function () {
            return G.score2.releasetime.indexOf('0秒') >= 0;
        },
        auto_preform: function (v) {
            if (v == "stop") {
                G.selfStatus = [];
                WG.xubuf = null;
                WG.pfmskil = null;
                if (G.preform_timer) {
                    clearInterval(G.preform_timer);
                    G.preform_timer = undefined;
                    $(".auto_perform").css("background", "");
                    WG.forcebufskil = ''
                    WG.bufskill = {}
                }
                return;
            }
            if (G.preform_timer || G.auto_preform == false) return;
            $(".auto_perform").css("background", "#3E0000");
            //出招时重新获取黑名单
            unauto_pfm = GM_getValue(roleid + "_unauto_pfm", unauto_pfm);
            var unpfm = unauto_pfm.split(',');
            for (var pfmname of unpfm) {
                if (!WG.hasStr(pfmname, blackpfm))
                    blackpfm.push(pfmname);
            }
            // if (family.indexOf("逍遥") >= 0) {
            //     if (!WG.hasStr("force.duo", blackpfm)) {
            //         blackpfm.push('force.duo');
            //     }
            // }
            if (!WG.hasStr("force.tuoli", blackpfm)) {
                blackpfm.push('force.tuoli');
            }
            // 如果 auto_pfm_mode 等于 true 则使用智能施法
            if (G.auto_pfm_mode) {
                let force_buff_skill = ['force.cui', 'force.power', 'force.xi',
                    'force.xin', 'force.chu', 'force.ztd', 'force.zhen', 'force.busi', 'force.wang'];
                let buff_skill_dict = {
                    "weapon": ['sword.wu', 'blade.shi', 'sword.yu'],
                    "ztd": ["force.ztd"],
                    "mingyu": ["force.wang"],
                    "force": ["*"],
                    "dodge": ["dodge.power", "dodge.fo", "dodge.gui", "dodge.lingbo", "dodge.zhui"]
                }
                WG.xubuf = null;
                WG.pfmskill = null
                G.preform_timer = setInterval(() => {
                    if (G.in_fight == false) { WG.auto_preform("stop"); return; }
                    var alreay_pfm = [];
                    if (WG.xubuf == null) {
                        WG.xubuf = setTimeout(async () => {
                            for (var skill of G.skills) {
                                if (WG.hasStr(skill.id, blackpfm)) {
                                    continue;
                                }
                                for (let buf in buff_skill_dict) {
                                    for (let ski of buff_skill_dict[buf]) {
                                        if (ski == skill.id) {
                                            if (!G.gcd && !G.cds.get(skill.id) && !WG.hasStr(buf, G.selfStatus)) {
                                                WG.Send("perform " + skill.id);
                                                // break;
                                                await WG.sleep(200);
                                                while (!G.cds.get(skill.id)) {
                                                    if (G.in_fight == false) { WG.auto_preform("stop"); return; }
                                                    if (!WG.is_free()) break;
                                                    WG.Send("perform " + skill.id);
                                                    await WG.sleep(200);
                                                }
                                                if (WG.hasStr(buf, G.selfStatus)) {
                                                    console.log('buf技能' + skill.id)
                                                    WG.bufskill[buf] = skill.id;
                                                }
                                                // alreay_pfm.push(skill.id)
                                            }
                                            // alreay_pfm.push(skill.id)
                                            break;
                                        }
                                    }
                                }
                                if (WG.hasStr(skill.id, force_buff_skill)) {
                                    if (!G.gcd && !G.cds.get(skill.id) && !WG.hasStr("force", G.selfStatus)) {
                                        WG.Send("perform " + skill.id);
                                        // break;
                                        await WG.sleep(200);
                                        while (!G.cds.get(skill.id) && !WG.hasStr("force", G.selfStatus)) {
                                            if (G.in_fight == false) { WG.auto_preform("stop"); return; }
                                            if (!WG.is_free()) break;
                                            WG.Send("perform " + skill.id);
                                            await WG.sleep(200);

                                        }
                                        if (WG.hasStr("force", G.selfStatus)) {
                                            console.log('内功buf技能' + skill.id)
                                            WG.forcebufskil = skill.id;
                                        }
                                        alreay_pfm.push(skill.id)
                                    }
                                    // alreay_pfm.push(skill.id)
                                }
                            }
                            WG.xubuf = null;
                        }, 10);
                    }
                    if (WG.pfmskill == null) {
                        WG.pfmskill = setTimeout(async () => {
                            for (var skill of G.skills) {
                                if (WG.hasStr(skill.id, blackpfm)) {
                                    continue;
                                }
                                if (G.gcd) break;
                                // console.log(skill);
                                if (!G.gcd && !G.cds.get(skill.id) && !(WG.hasStr(skill.id, force_buff_skill) || WG.hasStr(skill.id, buff_skill_dict))) {
                                    WG.Send("perform " + skill.id);
                                    if (WG.is_zero_releasetime()) break; // 非0出招者只放一个技能
                                    await WG.sleep(20);
                                    if (!WG.is_free()) break;

                                }
                                if (WG.forcebufskil != '') {
                                    if (!G.gcd && !G.cds.get(skill.id) && WG.hasStr(skill.id, force_buff_skill) && skill.id != WG.forcebufskil &&
                                        !WG.hasStr(skill.id, buff_skill_dict['mingyu']) && !WG.hasStr(skill.id, buff_skill_dict['ztd'])) {
                                        console.log('使用无buf的内功技能' + skill.id)
                                        WG.Send("perform " + skill.id);
                                        if (!WG.is_free()) break;
                                    }
                                }
                                // if (WG.bufskill.hasOwnProperty('weapon') && WG.bufskill['weapon'] != '') {
                                //     if (!G.gcd && !G.cds.get(skill.id) && WG.hasStr(skill.id, buff_skill_dict) && skill.id != WG.bufskill['weapon'] &&
                                //         !WG.hasStr(skill.id, buff_skill_dict['mingyu']) && !WG.hasStr(skill.id, buff_skill_dict['ztd'])) {
                                //         console.log('使用无buf的武器技能' + skill.id)
                                //         WG.Send("perform " + skill.id);
                                //         if (!WG.is_free()) break;
                                //     }
                                // }
                            }

                            WG.pfmskill = null
                        }, 10);
                    }
                }, 300);
            }
            else {
                G.preform_timer = setInterval(() => {

                    if (G.in_fight == false) WG.auto_preform("stop");
                    for (var skill of G.skills) {

                        if (WG.inArray(skill.id, blackpfm)) {
                            continue;
                        }
                        if (!G.gcd && !G.cds.get(skill.id)) {
                            WG.Send("perform " + skill.id);
                            break;
                        }
                    }
                }, 350);
            }
        },

        formatCurrencyTenThou: function (num) {
            num = num.toString().replace(/\$|\,/g, '');
            if (isNaN(num)) num = "0";
            var sign = (num == (num = Math.abs(num)));
            num = Math.floor(num * 10 + 0.50000000001); //cents = num%10;
            num = Math.floor(num / 10).toString();
            for (var i = 0; i < Math.floor((num.length - (1 + i)) / 3); i++) {
                num = num.substring(0, num.length - (4 * i + 3)) + ',' + num.substring(num.length - (4 * i + 3));
            }
            return (((sign) ? '' : '-') + num);
        },
        gen: function (nl, xg, hg) {
            var jg = nl / 100 + xg * hg / 10;
            var sd = this.formatCurrencyTenThou(jg);
            return sd;
        },
        dian: function (c, m, se) {
            var j = c + m;
            var jj = m - c;
            var jjc = jj / 2;
            var z = j * jjc * se * 5;
            var sd = this.formatCurrencyTenThou(z);
            return sd;
        },
        lx: function (xtwx, htwx, lxxl, dqdj, mbdj, k) {
            var qianneng = (mbdj * mbdj - dqdj * dqdj) * 2.5 * k;
            var time = qianneng / (xtwx + htwx) / (1 + lxxl / 100 - xtwx / 100) / 12;
            var timeString = time < 60 ? `${parseInt(time)}分钟` : `${parseInt(time / 60)}小时${parseInt(time % 60)}分钟`;
            return { qianneng: qianneng, time: timeString };
        },
        //找boss,boss不在,-1,
        findboss: function (data, bossname, callback) {
            for (let i = 0; i < data.items.length; i++) {
                if (data.items[i] != 0) {
                    if (data.items[i].name.indexOf(bossname) >= 0) {
                        callback(data.items[i].id);
                    }
                }
            }
            callback(-1);
        },
        ksboss: undefined,
        kksBoss: function (data) {
            var boss_place = data.content.match("出现在([^%]+)一带。")[1];
            var boss_name = data.content.match("听说([^%]+)出现在")[1];
            if (boss_name == null || boss_place == null) {
                return;
            }
            blacklist = GM_getValue(roleid + "_blacklist", blacklist);
            blacklist = blacklist instanceof Array ? blacklist : blacklist.split(",");
            if (WG.inArray(boss_name.replace("/<(.*?)>/g", ""), blacklist)) {
                messageAppend("黑名单boss,忽略!");
                return;
            }
            autoKsBoss = GM_getValue(roleid + "_autoKsBoss", autoKsBoss);
            ks_pfm = GM_getValue(roleid + "_ks_pfm", ks_pfm);
            ks_wait = GM_getValue(roleid + "_ks_wait", ks_wait);
            autoeq = GM_getValue(roleid + "_auto_eq", autoeq);
            console.log("boss");
            console.log(boss_place);
            var c = "<div class=\"item-commands\"><span id = 'closeauto'>关闭自动执行后命令</span></div>";
            messageAppend("自动前往BOSS地点 " + c);
            $('#closeauto').off('click');
            $('#closeauto').on('click', () => {
                if (timer != 0) {
                    WG.timer_close();
                    messageAppend("已停止后命令");
                } else {
                    messageAppend("已经停止");
                }
            });

            WG.Send("stopstate");
            WG.go(boss_place);
            WG.ksboss = WG.add_hook(["items", "itemadd", "die", "room"], function (data) {
                if (data.type == "items") {
                    if (!WG.at(boss_place)) {
                        return;
                    }
                    WG.findboss(data, boss_name, function (bid) {
                        if (bid != -1) {
                            next = 999;
                            if (autoeq != "") {
                                WG.eqhelper(autoeq);
                            }
                            setTimeout(() => {
                                WG.Send("kill " + bid);
                                //WG.Send("select " + bid);
                                next = 0;
                            }, Number(ks_pfm));
                        } else {
                            if (next == 999) {
                                console.log('found');
                                return;
                            }
                            let lj = needfind[boss_place];
                            if (needfind[boss_place] != undefined && next < lj.length) {
                                setTimeout(() => {
                                    console.log(lj[next]);
                                    WG.Send(lj[next]);
                                    next++;
                                }, 1000);
                            } else {
                                console.log("not found");
                            }
                        }
                    });
                }
                if (data.type == "itemadd") {
                    if (data.name.indexOf(boss_name) >= 0) {
                        next = 0;
                        WG.Send("get all from " + data.id);
                        WG.remove_hook(this.index);
                    }
                }
                if (data.type == "die") {
                    next = 0;
                    WG.Send('relive');
                    WG.remove_hook(this.index);
                }
                if (data.type == 'room') {
                    if (next == 999) {
                        next = 0;
                    }
                }
            });
            timer = setTimeout(() => {
                console.log("复活挖矿");
                WG.Send('relive');
                WG.remove_hook(this.ksboss);
                auto_command = GM_getValue(roleid + "_auto_command", auto_command);
                if (auto_command && auto_command != null && auto_command != "" && auto_command != "null") {
                    WG.SendCmd(auto_command);
                } else {
                    WG.zdwk();
                }
                next = 0;
                WG.timer_close();
            }, 1000 * ks_wait);

        },
        marryhy: undefined,
        xiyan: async function () {

            var c = "<div class=\"item-commands\"><span id = 'closeauto'>关闭自动执行后命令</span></div>";
            messageAppend("自动喜宴 " + c);
            $('#closeauto').off('click');
            $('#closeauto').on('click', () => {
                if (timer != 0) {
                    WG.timer_close();
                    messageAppend("已停止后命令");
                } else {
                    messageAppend("已经停止");
                }
            });
            WG.Send("stopstate");
            WG.go("扬州城-喜宴");
            WG.marryhy = WG.add_hook(['items', 'cmds', 'text', 'msg'], function (data) {
                if (data.type == 'items') {
                    for (let idx = 0; idx < data.items.length; idx++) {
                        if (data.items[idx] != 0) {
                            if (data.items[idx].name.indexOf(">婚宴礼桌<") >= 0) {
                                console.log("拾取");
                                WG.Send('get all from ' + data.items[idx].id);
                                console.log("xy" + WG.marryhy);
                                WG.remove_hook(WG.marryhy);
                                break;
                            }
                        }
                    }
                } else if (data.type == 'text') {
                    if (data.msg == "你要给谁东西？") {
                        console.log("没人");
                    }
                    if (/^店小二拦住你说道：怎么又是你，每次都跑这么快，等下再进去。$/.test(data.msg)) {
                        console.log("cd");
                        messageAppend("<hiy>你太勤快了, 1秒后回去挖矿</hiy>")
                    }
                    if (/^店小二拦住你说道：这位(.+)，不好意思，婚宴宾客已经太多了。$/.test(data.msg)) {
                        console.log("客满");
                        messageAppend("<hiy>你来太晚了, 1秒后回去挖矿</hiy>")

                    }
                } else if (data.type == 'cmds') {
                    for (let idx = 0; idx < data.items.length; idx++) {
                        if (data.items[idx].name == '1金贺礼') {
                            WG.SendCmd(data.items[idx].cmd + ';go up;$wait 2000;go down;go up');
                            console.log("交钱");
                            break;
                        }
                    }
                }
            });
            timer = setTimeout(() => {
                console.log("挖矿");
                WG.remove_hook(this.marryhy);
                if (auto_command && auto_command != null && auto_command != "" && auto_command != "null") {
                    WG.SendCmd(auto_command);
                } else {
                    WG.zdwk();
                }
                next = 0;
                WG.timer_close();
            }, 30000);
        },

        saveRoomstate(data) {
            roomData = data.items;
        },
        haspack: function (name, callback) {
            WG.Send('pack');
            for (let item of packData) {
                if (item.name.indexOf(name) >= 0) {
                    callback(item.id);
                    return;
                }
            }
            callback('');
        },
        eqx: null,
        eqxp: null,
        eqhelper(type, enaskill = 0, realy = false) {
            var deepCopy = function (source) {
                var result = {};
                for (var key in source) {
                    result[key] = typeof source[key] === 'object' ? deepCopy(source[key]) : source[key];
                }
                return result;
            }
            if (type == undefined || type == 0 || type > eqlist.length) {
                return;
            }

            if (eqlist == null || eqlist[type] == null || eqlist[type] == "") {
                if (enaskill == 1) {
                    return;
                }
                messageAppend("套装未保存,保存当前装备作为套装" + type + "!", 1);
                WG.eqx = WG.add_hook("dialog", (data) => {
                    if (data.dialog == "pack" && data.eqs != undefined) {
                        eqlist[type] = deepCopy(data.eqs);
                        GM_setValue(roleid + "_eqlist", eqlist);
                        messageAppend("套装" + type + "保存成功!", 1);
                        WG.remove_hook(WG.eqx);
                        WG.eqx = null;
                    }
                });
                WG.eqxp = WG.add_hook("dialog", (data) => {
                    if (data.dialog == 'skills' && data.items != null) {
                        var nowskill = { 'throwing': '', 'unarmed': '', 'force': '', 'dodge': '', 'sword': '', 'blade': '', 'club': '', 'staff': '', 'whip': '', 'parry': '' };
                        for (let item of data.items) {
                            if (nowskill[item.id] != null) {
                                if (item.enable_skill == null) {
                                    nowskill[item.id] = 'none';
                                } else {
                                    nowskill[item.id] = item.enable_skill;
                                }
                            }
                        }
                        skilllist[type] = nowskill;
                        GM_setValue(roleid + "_skilllist", skilllist);
                        messageAppend("技能" + type + "保存成功!", 1);
                        WG.remove_hook(WG.eqxp);
                        WG.eqxp = null;
                    }
                });
                WG.Send("cha");
                WG.Send("pack");
            } else {
                if (WG.eqx != null || WG.eqxp != null) {
                    WG.remove_hook(WG.eqx);
                    WG.remove_hook(WG.eqxp);
                    WG.eqx = null;
                    WG.eqxp = null;
                }
                eqlist = GM_getValue(roleid + "_eqlist", eqlist);
                skilllist = GM_getValue(roleid + "_skilllist", skilllist);
                if (realy) {
                    var eqdata = ""
                    if (enaskill == 0) {
                        //从eqlist第一项开始遍历
                        for (let i = 1; i < 11; i++) {
                            if (eqlist[type][i] != null && eqlist[type][i] != "") {
                                eqdata += "eq " + eqlist[type][i].id + ";";
                            }
                        }
                        // 将eqlist第一项的id添加到eqdata
                        eqdata += "eq " + eqlist[type][0].id + ";";

                    } else {
                        //使用for in遍历skilllist 获取其中的id
                        for (let i in skilllist[type]) {
                            if (skilllist[type][i] != null && skilllist[type][i] != "") {
                                eqdata += "enable " + i + " " + skilllist[type][i] + ";";
                            }
                        }
                    }
                    copyToClipboard(eqdata);
                    messageAppend(type + "已复制到剪贴板!", 1);
                    return
                }

                var p_cmds = "";
                //  console.log(G.enable_skills)
                let mySkills = [];
                let myEqs = "";

                for (let ski of G.eqs) {
                    if (ski) {
                        myEqs = myEqs + ski.id;
                    }
                }
                let tsMsg = "套装"
                if (enaskill === 0) {
                    for (let i = 1; i < 11; i++) {
                        if (eqlist[type][i] != null && myEqs.indexOf(eqlist[type][i].id) < 0) {
                            p_cmds += ("$wait 20;eq " + eqlist[type][i].id + ";");
                        }
                    }
                    if (eqlist[type][0] != null && myEqs.indexOf(eqlist[type][0].id) < 0) {
                        p_cmds += ("$wait 40;eq " + eqlist[type][0].id + ";");
                    }
                }
                if (enaskill === 1) {
                    for (var key in skilllist[type]) {
                        for (let ski of G.enable_skills) {
                            if (ski.name != skilllist[type][key] && ski.type == key) {
                                p_cmds += (`$wait 40;enable ${key} ${skilllist[type][key]};`);
                                break
                            }
                        }
                    }
                    tsMsg = "技能"
                    $("span[command=skills]").click();
                }


                p_cmds = p_cmds + '$wait 40;cha;look3 1';

                WG.eqx = WG.add_hook('text', function (data) {
                    if (data.type == 'text') {

                        if (data.msg.indexOf('没有这个玩家') >= 0) {
                            messageAppend(tsMsg + "装备成功" + type + "!", 1);
                            if (enaskill == 1) {
                                $("span[command=skills]").click();
                            }
                            WG.remove_hook(WG.eqx);
                        }
                    }
                });

                WG.SendCmd(p_cmds);

            }
        },
        eqhelperdel: function (type) {
            eqlist = GM_getValue(roleid + "_eqlist", eqlist);
            skilllist = GM_getValue(roleid + "_skilllist", skilllist);
            delete eqlist[type];
            delete skilllist[type];
            GM_setValue(roleid + "_eqlist", eqlist);
            GM_setValue(roleid + "_skilllist", skilllist);
            messageAppend("清除套装 技能" + type + "设置成功!", 1);
        },
        uneqall: function (isskill = "0") {
            if (isskill == "0") {
                this.eqx = WG.add_hook("dialog", (data) => {
                    if (data.dialog == "pack" && data.eqs != undefined) {
                        for (let i = 0; i < data.eqs.length; i++) {
                            if (data.eqs[i] != null) {
                                WG.Send("uneq " + data.eqs[i].id);
                            }
                        }
                        WG.remove_hook(this.eqx);
                    }
                });
                WG.Send("pack");
                messageAppend("取消所有装备成功!", 1);
            } else {
                const enaNone = "enable unarmed none;enable blade none;enable force none;enable parry none;enable dodge none;enable sword none;enable throwing none;enable whip none;enable club none;enable staff none";
                const enalist = enaNone.split(";");
                for (let i = 0; i < enalist.length; i++) {
                    WG.sleep(10);
                    WG.Send(enalist[i]);
                }

                messageAppend("取消所有技能成功!", 1);
            }

        },
        eqloader: function () {
            let tmp_eqlist = GM_getValue(roleid + "_eqlist", null);

            var subItems = {

            };
            for (let item in tmp_eqlist) {
                subItems[item] = { name: "装备" + item, icon: "fa-compress", callback: function () { WG.eqhelper(item, 0) } }
                subItems[item + "sk"] = { name: "技能" + item, icon: "fa-magic", callback: function () { WG.eqhelper(item, 1) } }
                subItems[item + "del"] = { name: "删除组" + item, icon: "fa-remove", callback: function () { WG.eqhelperdel(item) } }
            }
            subItems['setting'] = { name: "套装管理", icon: "edit", callback: function () { WG.eqhelperui() } }
            var dfd = jQuery.Deferred();
            setTimeout(function () {
                dfd.resolve(subItems);
            }, 20);
            //setTimeout(function () {
            //    dfd.reject(errorItems);
            //}, 1000);
            return dfd.promise();

        },

        eqhelperui: function () {
            messageClear();
            var a = UI.skillsPanel;
            messageAppend(a);
            new Vue({
                el: "#skillsPanelUI",
                data: {
                    role: role,
                    roleid: roleid,
                    eqlist: {},
                    cpeqlist: {},
                    eqlistdel: {},
                    covereqlist: {},
                    eqskills_id: "none"
                },
                created() {

                },
                mounted() {
                    this.eqlist = GM_getValue(this.roleid + "_eqlist", {});
                },
                methods: {
                    eq: function (name) {
                        WG.eqhelper(name, 0)
                    },
                    eqs: function (name) {
                        WG.eqhelper(name, 1)
                    },
                    copyeq: function (name) {
                        WG.eqhelper(name, 0, true)
                    },
                    copyeqs: function (name) {
                        WG.eqhelper(name, 1, true)
                    },
                    save: function (name) {
                        WG.eqhelper(name)
                        setTimeout(() => {
                            this.eqlist = GM_getValue(this.roleid + "_eqlist", {});
                            WG.eqhelperui()
                        }, 300);
                    },
                    covereq: function (name) {
                        // var that = this;
                        this.deleq(name)
                        this.save(name)
                    },
                    deleq: function (name) {
                        WG.eqhelperdel(name)
                        setTimeout(() => {
                            WG.eqhelperui()
                        }, 200);
                    },
                    show: function () {
                        WG.eqhelperui()
                    },
                    saveUI: function () {
                        var that = this
                        layer.prompt({ title: '请输入套装名...', formType: 2 }, function (text, index) {
                            layer.close(index);
                            if (text != null) {
                                that.save(text)
                            }
                        });

                    },
                    eqskills_opts_change: function (eqskills_id) {
                        switch (eqskills_id) {
                            case "save":
                                this.saveUI();
                                break;
                            case "copyeq":
                                this.covereqlist = {}
                                this.eqlist = {};
                                this.eqlistdel = {};
                                this.cpeqlist = GM_getValue(this.roleid + "_eqlist", {});
                                this.role = "<< 返回";
                                break
                            case "delete":
                                this.cpeqlist = {}
                                this.eqlist = {};
                                this.covereqlist = {};
                                this.eqlistdel = GM_getValue(this.roleid + "_eqlist", {});
                                this.role = "<< 返回";
                                break;
                            case "covereq":
                                this.cpeqlist = {}
                                this.eqlist = {};
                                this.eqlistdel = {};
                                this.covereqlist = GM_getValue(this.roleid + "_eqlist", {});
                                this.role = "<< 返回";
                                break;
                            case "uneqall":
                                WG.uneqall();
                                break;
                            case "none":
                            default:
                                break;
                        };
                    },

                }
            });
        },


        fight_listener: undefined,
        auto_fight: function () {

            if (WG.fight_listener) {
                messageAppend("<hio>自动比试</hio>结束");
                WG.remove_hook(WG.fight_listener);
                WG.fight_listener = undefined;
                return;
            }
            let name = prompt("请输入NPC名称,例如:\"高根明\"");
            let id = WG.find_item(name);

            if (id == null) return;
            WG.fight_listener = WG.add_hook(["text", "sc", "combat"], async function (data) {
                if (data.type == "combat" && data.end) {
                    let item = G.items.get(G.id);
                    if (item.mp / item.max_mp < 0.8) {
                        WG.SendCmd("dazuo");
                    }
                    WG.SendCmd("liaoshang");
                } else if (data.type == "sc" && data.id == id) {
                    let item = G.items.get(id);
                    if (item.hp >= item.max_hp) {
                        WG.Send("stopstate;fight " + id);
                    }
                } else if (data.type == 'sc' && data.id == G.id) {
                    if (data.hp >= data.max_hp) {
                        WG.Send("stopstate;fight " + id);
                    }
                } else if (data.type == 'text') {
                    if (data.msg.indexOf("你先调整好自己的状态再来找别人比试吧") >= 0) {
                        WG.SendCmd("liaoshang");
                    }
                    if (data.msg.indexOf("你想趁人之危吗") >= 0) {
                        WG.SendCmd("dazuo");
                    }
                    if (data.msg.indexOf(">你疗伤完毕，深深吸了口气") >= 0) {
                        WG.Send("stopstate;fight " + id);
                    }
                }

            });
            WG.Send("stopstate;fight " + id);
            messageAppend("<hio>自动比试</hio>开始");
        },
        find_item: function (name) {
            for (let [k, v] of G.items) {
                if (v.name == name) {
                    return k;
                }
            }
            return null;
        },
        recover: function (hp, mp, cd, callback) {
            //返回定时器
            if (hp == 0) {
                if (WG.recover_timer) {
                    clearTimeout(WG.recover_timer);
                    WG.recover_timer = undefined;
                }
                return;
            }
            WG.Send("dazuo");
            WG.recover_timer = setInterval(function () {
                //检查状态
                let item = G.items.get(G.id);
                if (item.mp / item.max_mp < mp) { //内力控制
                    if (item.state != "打坐") {
                        WG.Send("stopstate;dazuo");
                    }
                    return;
                }
                if (item.hp / item.max_hp < hp) {
                    //血满
                    if (item.state != "疗伤") {
                        WG.Send("stopstate;liaoshang");
                    }
                    return;
                }
                if (item.state) WG.Send("stopstate");
                if (cd) {
                    for (let [k, v] of G.cds) {
                        if (k == "force.tu") continue;
                        if (v) return;
                    }
                }
                clearInterval(WG.recover_timer);
                callback();
            }, 1000);
        },
        useitem_hook: undefined,
        auto_useitem: async function () {
            var useflag = true;
            if (!WG.useitem_hook) {
                WG.useitem_hook = WG.add_hook("text", function (data) {
                    if (data.msg.indexOf("你身上没有这个东西") >= 0 || data.msg.indexOf("太多") >= 0 || data.msg.indexOf("不能使用") >= 0) {
                        useflag = false;
                        WG.remove_hook(WG.useitem_hook);
                        WG.useitem_hook = undefined;
                    }
                })
            }
            let name = prompt("请输入物品id,在背包中点击查看物品,即可在提示窗口看到物品id输出");
            if (!name) {
                WG.remove_hook(WG.useitem_hook);
                WG.useitem_hook = undefined;
                return;
            }
            let num = prompt("请输入物品使用次数,例如:\"10\"", '10');
            if (name) {
                if (name.length != 11) {
                    L.msg('id不合法');
                    WG.remove_hook(WG.useitem_hook);
                    WG.useitem_hook = undefined;
                    return;
                }
                for (var i = 0; i < num; i++) {
                    if (useflag) {
                        WG.Send('use ' + name);
                        await WG.sleep(1000);
                    } else {
                        WG.remove_hook(WG.useitem_hook);
                        WG.useitem_hook = undefined;
                        return;
                    }
                }
            }
            WG.remove_hook(WG.useitem_hook);
            WG.useitem_hook = undefined;
        },

        auto_Development_medicine: function () {
            messageClear();
            var a = UI.lyui;
            messageAppend(a);
            const lianyaovue = new Vue({
                el: "#LianYao",
                data: {
                    level: 0,
                    num: 1,
                    info: ""
                },
                created() {
                    this.info = GM_getValue("lastmed", $('#medicint_info').val());
                    this.level = GM_getValue("lastmedlevel", $('#medicine_level').val());
                },
                methods: {
                    startDev: function () {
                        if (WG.at('住房-炼药房') || WG.at('帮会-炼药房')) {
                            WG.auto_start_dev_med(this.info.replace(" ", ""), this.level, this.num);
                        } else {
                            L.msg("请先前往炼药房");
                        }
                    },
                    stopDev: function () {
                        WG.Send("stopstate");
                    }
                }
            });
        },
        findMedItems_hook: undefined,
        auto_start_dev_med: function (med_item, level, num) {
            GM_setValue("lastmed", med_item);
            GM_setValue("lastmedlevel", level);
            if (med_item) {
                if (med_item.split(",").length < 2) {
                    L.msg("素材不足");
                    return;
                }
            } else {
                L.msg("素材不足");
                return;
            }
            var tmpitme = med_item.split('|');
            var med_items = [];
            for (let pitem of tmpitme) {
                //去除空格
                pitem = pitem.replace(/(^\s*)|(\s*$)/g, "");
                med_items.push(pitem.split(","));
            }

            WG.findMedItems_hook = WG.add_hook("dialog", function (data) {
                if (data.dialog == "pack" && data.items != undefined && data.items.length >= 0) {
                    let med_items_ids = [];

                    let med_haves = [];

                    for (let item of med_items) {
                        let med_items_id = [];
                        let med_have = [];
                        for (let med_item of item) {
                            if (JSON.stringify(data.items).indexOf(med_item) >= 0) {
                                for (let pitem of data.items) {
                                    if (pitem.name.indexOf(med_item) >= 0) {
                                        med_items_id.push(pitem.id);
                                        med_have.push(med_item);
                                    }
                                }
                            }
                        }
                        med_haves.push(med_have);
                        med_items_ids.push(med_items_id);
                    }
                    let idx = 0;
                    for (let med_items_id of med_items_ids) {
                        if (med_items_id.length != med_items[idx].length) {
                            var temp = [];
                            var temparray = [];
                            for (var i = 0; i < med_haves[idx].length; i++) {
                                temp[med_haves[idx][i]] = typeof med_haves[idx][i];;
                            }
                            for (var i = 0; i < med_items[idx].length; i++) {
                                var type = typeof med_items[idx][i];
                                if (!temp[med_items[idx][i]]) {
                                    temparray.push(med_items[idx][i]);
                                } else if (temp[med_items[idx][i]].indexOf(type) < 0) {
                                    temparray.push(med_items[idx][i]);
                                }
                            }
                            let arr = [];
                            for (const item of new Set(temparray)) {
                                arr.push(item)
                            }

                            L.msg("素材不足,请检查背包是否存在" + arr.join('.'));
                            WG.remove_hook(WG.findMedItems_hook);
                            WG.findMedItems_hook = null;
                            return;
                        }
                        idx = idx + 1;
                    }
                    var p_Cmd = WG.make_med_cmd(med_items_ids, level, num);
                    console.log(p_Cmd);
                    WG.SendStep(p_Cmd);
                    WG.remove_hook(WG.findMedItems_hook);
                }
            });
            WG.Send('pack');

        },
        make_med_cmd: function (medItem_ids, level, num) {
            let result = "";
            for (let medItem_id of medItem_ids) {
                for (let i = 0; i < parseInt(num); i++) {
                    let startCmd = "lianyao2 start " + level + ";";
                    let endCmd = "lianyao2 stop;";
                    let midCmd = "lianyao2 add ";
                    for (let medid of medItem_id) {
                        result += startCmd + midCmd + medid + ";"
                    }
                    result += endCmd;
                }
            }
            return result + "$syso 炼制完成;";
        },
        zmlfire: async function (zml) {
            if (zml) {

                messageAppend("运行" + zml.name, 2);
                if (zml.zmlType == 0 || zml.zmlType == "" || zml.zmlType == undefined) {
                    await WG.SendCmd(zml.zmlRun);
                } else if (zml.zmlType == 1) {
                    if (unsafeWindow && unsafeWindow.ToRaid) {
                        ToRaid.perform(zml.zmlRun);
                    }
                } else if (zml.zmlType == 2) {
                    eval(zml.zmlRun);
                }

            }
        },
        zmlztjk: function () {
            zml = GM_getValue(roleid + "_zml", zml);
            if (! typeof zml instanceof Array) {
                zml = [];
            }
            messageClear();
            var a = UI.zmlandztjkui;
            messageAppend(a);
            const zmlvue = new Vue({
                el: "#zmlandztjk",
                data: {
                },
                created() {
                    this.zmldata = zml;
                },
                methods: {
                    run: function (v) {
                        WG.zmlfire(v);
                    },
                    zml: function () {
                        WG.zml_edit();
                    },
                    ztjk: function () {
                        WG.ztjk_edit();
                    },
                    startjk: function () {
                        WG.ztjk_func();
                    },
                    stopjk: function () {
                        if (WG.ztjk_hook) {
                            WG.remove_hook(WG.ztjk_hook);
                            WG.ztjk_hook = undefined;
                            messageAppend("已取消注入", 2);
                            return;
                        }
                        messageAppend("未注入", 2);
                    }

                }
            })
        },
        zml_edit: function () {
            zml = GM_getValue(roleid + "_zml", zml);
            if (! typeof zml instanceof Array) {
                zml = [];
            }
            messageClear();
            var edithtml = UI.zmlsetting;
            messageAppend(edithtml);
            const zmlvue = new Vue({
                el: "#zmldialog",
                data: {
                    singnalzml: {
                        name: "",
                        zmlType: "0",
                        zmlRun: ""
                    },
                    zmldata: zml
                },
                created() {
                    this.zmldata = zml;
                },
                methods: {
                    add: function () {
                        let zmljson = {
                            "name": this.singnalzml.name,
                            "zmlRun": this.singnalzml.zmlRun,
                            "zmlShow": 0,
                            "zmlType": this.singnalzml.zmlType
                        };
                        let _flag = true;
                        for (let item of this.zmldata) {
                            if (item.name == zmljson.name) {
                                zmljson.zmlShow = item.zmlShow;
                                item = zmljson;
                                _flag = false;
                            }
                        }

                        if (_flag) {
                            this.zmldata.push(zmljson);
                        }
                        GM_setValue(roleid + "_zml", this.zmldata);
                        L.msg("保存成功");
                    },
                    del: function () {
                        this.zmldata.forEach((v, k) => {
                            if (v.name == this.singnalzml.name) {
                                this.zmldata.baoremove(k);
                                GM_setValue(roleid + "_zml", this.zmldata);
                                L.msg("删除成功");
                            }
                        });
                    },
                    getShare: function () {
                        var id = prompt("请输入分享码");
                        S.getShareJson(id, (res) => {
                            let v = JSON.parse(res.json);
                            if (v.zmlRun != undefined) {
                                this.singnalzml = v;
                            } else {
                                L.msg("不合法")
                            }
                        });
                    },
                    edit: function (v) {
                        this.singnalzml = v;
                    },
                    showp: function (v) {
                        zmlshowsetting = GM_getValue(roleid + "_zmlshowsetting", zmlshowsetting);
                        //<span class="zdy-item act-item-zdy" zml="use j8ea35f34ce">大还丹</span>
                        let a = $(".room-commands");

                        if (zmlshowsetting == 1) {
                            a = $(".zdy-commands");
                        }

                        for (let item of a.children()) {
                            if (item.textContent == v.name) {
                                item.remove();
                                v.zmlShow = 0;
                                GM_setValue(roleid + "_zml", zml);
                                messageAppend("删除快速使用" + v.name, 1);
                                return;
                            }
                        }
                        a.append("<span class=\"zdy-item act-item-zdy act-item\">" + v.name + "</span>")
                        v.zmlShow = 1;
                        GM_setValue(roleid + "_zml", zml);
                        messageAppend("设置快速使用" + v.name, 0, 1);
                        //绑定事件
                        $('.act-item-zdy').off('click');
                        $(".act-item-zdy").on('click', function () {
                            T.usezml(0, this.textContent, "");
                        });
                    },
                    share: function (v) {
                        S.shareJson(G.id, v);
                    }
                }
            })

        },
        isseted: false,
        zml_showp: function () {
            $(".zdy-commands").empty();
            $('.act-item-zdy').remove();
            zmlshowsetting = GM_getValue(roleid + "_zmlshowsetting", zmlshowsetting);
            for (let zmlitem of zml) {
                let a = $(".room-commands");
                if (zmlshowsetting == 1) {
                    for (let item of a.children()) {
                        if (item.textContent == zmlitem.name) {
                            item.remove();
                        }
                    }
                    a = $(".zdy-commands");
                    if (!WG.isseted) {
                        let px = $('.tool-bar.right-bar').css("bottom");
                        px.replace("px", "");
                        px = parseInt(px);
                        px = px + 24;
                        $('.tool-bar.right-bar').css("bottom", px + "px");
                        WG.isseted = true;
                    }

                } else {
                    for (let item of $(".zdy-commands").children()) {
                        if (item.textContent == zmlitem.name) {
                            item.remove();
                        }
                    }
                }

                if (zmlitem.zmlShow == 1) {

                    a.append("<span class=\"zdy-item act-item-zdy act-item\">" + zmlitem.name + "</span>")
                    messageAppend("设置快速使用" + zmlitem.name, 0, 1);
                    //绑定事件
                    $('.act-item-zdy').off('click');
                    $(".act-item-zdy").on('click', function () {
                        T.usezml(0, this.textContent, "");
                    });
                }
            }
        },
        ztjk_edit: function () {

            //[{"name":"","type":"state","action":"remove","keyword":"busy","ishave":"0","send":""}]
            ztjk_item = GM_getValue(roleid + "_ztjk", ztjk_item);
            messageClear();
            var edithtml = UI.ztjksetting;
            messageAppend(edithtml);
            $(".ztjk_sharedfind").on('click', () => {
                var id = prompt("请输入分享码");
                S.getShareJson(id, (res) => {
                    let v = JSON.parse(res.json);
                    if (v.type != undefined) {
                        $('#ztjk_name').val(v.name);
                        $('#ztjk_type').val(v.type);
                        $('#ztjk_action').val(v.action);
                        $('#ztjk_keyword').val(v.keyword);
                        $('#ztjk_ishave').val(v.ishave);
                        $('#ztjk_send').val(v.send);
                        $('#ztjk_senduser').val(v.senduser);
                        $("#ztjk_maxcount").val(v.maxcount);
                        $("#ztjk_istip").val(v.istip);
                    } else {
                        L.msg("不合法")
                    }
                });
            });
            $('.ztjk_editadd').on("click", function () {
                var ztjk = {
                    name: $('#ztjk_name').val(),
                    type: $('#ztjk_type').val(),
                    action: $('#ztjk_action').val(),
                    keyword: $('#ztjk_keyword').val(),
                    ishave: $('#ztjk_ishave').val(),
                    send: $('#ztjk_send').val(),
                    senduser: $('#ztjk_senduser').val(),
                    isactive: 1,
                    maxcount: $('#ztjk_maxcount').val(),
                    istip: $('#ztjk_istip').val()
                };
                let _flag = true;
                ztjk_item.forEach(function (v, k) {
                    if (v.name == $('#ztjk_name').val()) {
                        ztjk_item[k] = ztjk;
                        _flag = false;
                    }
                });
                if (_flag) {
                    ztjk_item.push(ztjk);
                }
                GM_setValue(roleid + "_ztjk", ztjk_item);

                WG.ztjk_edit();
                messageAppend("保存成功", 2);
                WG.ztjk_func();
            });
            $(".ztjk_editdel").on('click', function () {
                let name = $('#ztjk_name').val();
                ztjk_item.forEach(function (v, k) {
                    if (v.name == name) {
                        ztjk_item.baoremove(k);
                        GM_setValue(roleid + "_ztjk", ztjk_item);
                        WG.ztjk_edit();
                        messageAppend("删除成功", 2);
                        WG.ztjk_func();
                    }
                });
            })
            ztjk_item.forEach(function (v, k) {
                var btn = "<span class='addrun" + k + "'>编辑" + v.name + "</span>";
                $('#ztjk_show').append(btn);
                var tmptext = "注入";
                if (v.isactive && v.isactive == 1) {
                    tmptext = "暂停";
                }
                var setbtn = "<span class='setaction" + k + "'>" + tmptext + v.name + "</span>";
                $('#ztjk_set').append(setbtn);
                var btn3 = "<span class='shareztjk" + k + "'>分享" + v.name + "</span>";
                $('#ztjk_show').append(btn3);
            });
            ztjk_item.forEach(function (v, k) {
                $(".addrun" + k).on("click", function () {
                    $('#ztjk_name').val(v.name);
                    $('#ztjk_type').val(v.type);
                    $('#ztjk_action').val(v.action);
                    $('#ztjk_keyword').val(v.keyword);
                    $('#ztjk_ishave').val(v.ishave);
                    $('#ztjk_send').val(v.send);
                    $('#ztjk_senduser').val(v.senduser);
                    $("#ztjk_maxcount").val(v.maxcount);
                    if (v.istip == null) {
                        $("#ztjk_istip").val(1);
                    } else {

                    } $("#ztjk_istip").val(v.istip);
                });
                $('.setaction' + k).on('click', function () {
                    if (this.textContent.indexOf("暂停") >= 0) {
                        ztjk_item[k].isactive = 0;
                    } else {
                        ztjk_item[k].isactive = 1;
                    }
                    GM_setValue(roleid + "_ztjk", ztjk_item);
                    WG.ztjk_func();
                    WG.ztjk_edit();
                });
                $('.shareztjk' + k).on('click', function () {
                    S.shareJson(G.id, v);
                });
            });

        },
        ytjk_func: function () {
            WG.add_hook("room", async function (data) {
                if (G.yaotaFlag && data.path != 'zc/mu/shishenta') {
                    $('.channel pre').append("<hig>【插件】" + "第 " + G.yaotaCount + " 次妖塔共获得 " + G.yaoyuan + " 点妖元，结束时间: " + dateFormat("YYYY-mm-dd HH:MM", new Date()) + "。<br><hig>")
                    $('.tm').append("<hig>【插件】" + "第 " + G.yaotaCount + " 次妖塔共获得 " + G.yaoyuan + " 点妖元，结束时间: " + dateFormat("YYYY-mm-dd HH:MM", new Date()) + "。<br><hig>")
                    setTimeout(async function () {
                        while (!WG.is_free()) {
                            await WG.sleep(1000)
                        }
                        if (G.yaoyuan == 261) {
                            WG.SendCmd("tm 第 " + G.yaotaCount + " 次妖塔圆满完成，撒花~~~~~")
                        } else {
                            WG.SendCmd("tm 第 " + G.yaotaCount + " 次妖塔遗憾收场，撒花~~~~~")
                        }
                        $('#yt_prog').remove()
                        G.yaotaFlag = false;
                        G.yaoyuan = 0;

                    }, 0)
                }
                if (data.path == 'zc/mu/shishenta') {
                    $(`.state-bar`).before(`<div id=yt_prog>开始攻略妖塔</div>`)
                    G.yaotaCount = G.yaotaCount + 1;
                    $('.channel pre').append("<hig>【插件】" + "开始第 " + G.yaotaCount + " 次攻略妖塔，现在时间是:" + dateFormat("YYYY-mm-dd HH:MM", new Date()) + "。<br><hig>")
                    $('.tm').append("<hig>【插件】" + "开始第 " + G.yaotaCount + " 次攻略妖塔，现在时间是:" + dateFormat("YYYY-mm-dd HH:MM", new Date()) + "。<br><hig>")
                    G.yaoyuan = 0;
                    G.yaotaFlag = true;
                }
            })
        },
        ztjk_hook: undefined,
        ztjk_func: function () {
            if (WG.ztjk_hook) {
                WG.remove_hook(WG.ztjk_hook);
            }
            WG.ztjk_hook = undefined;
            ztjk_item = GM_getValue(roleid + "_ztjk", ztjk_item);
            WG.ztjk_hook = WG.add_hook(["dispfm", "enapfm", "dialog", "room", "itemadd", "itemremove", "status", "text", "msg", "die", "combat", "sc"], function (data) {
                ztjk_item.forEach(function (v, k) {
                    if (v.isactive != 1) {
                        return;
                    }
                    if (data.type == v.type) {
                        let keywords = v.keyword.split("|");
                        switch (v.type) {
                            case "status":
                                if (!data.name) {
                                    if (v.action == data.action) {
                                        for (var keyworditem of keywords) {
                                            if (data.sid.indexOf(keyworditem) >= 0) {
                                                if (v.ishave == "0" && data.id != G.id) {
                                                    if (v.istip == "1") {
                                                        messageAppend("已触发" + v.name, 1);
                                                    }
                                                    if (data.id) {
                                                        let p = v.send.replace("{id}", data.id);
                                                        WG.SendCmd(p);
                                                    } else {
                                                        WG.SendCmd(v.send);
                                                    }
                                                } else if (v.ishave == "1" && data.id == G.id) {
                                                    if (data.count != undefined && v.maxcount) {
                                                        if (parseInt(data.count) < parseInt(v.maxcount)) {
                                                            if (v.istip != "0") {
                                                                messageAppend("已触发" + v.name, 1);
                                                            }
                                                            if (data.id) {
                                                                let p = v.send.replace("{id}", data.id);
                                                                WG.SendCmd(p);
                                                            } else {
                                                                WG.SendCmd(v.send);
                                                            }
                                                        }
                                                    } else {
                                                        if (v.istip != "0") {
                                                            messageAppend("已触发" + v.name, 1);
                                                        }
                                                        if (data.id) {
                                                            let p = v.send.replace("{id}", data.id);
                                                            WG.SendCmd(p);
                                                        } else {
                                                            WG.SendCmd(v.send);
                                                        }
                                                    }
                                                }
                                            }
                                        }
                                    }
                                } else {
                                    if (v.action == data.action) {
                                        for (var keyworditem of keywords) {
                                            if (data.sid.indexOf(keyworditem) >= 0 || data.name.indexOf(keyworditem) >= 0) {
                                                if (v.ishave == "0" && data.id != G.id) {
                                                    if (v.istip != "0") {
                                                        messageAppend("已触发" + v.name, 1);
                                                    }
                                                    if (data.id) {
                                                        let p = v.send.replace("{id}", data.id);
                                                        WG.SendCmd(p);
                                                    } else {
                                                        WG.SendCmd(v.send);
                                                    }
                                                } else if (v.ishave == "1" && data.id == G.id) {
                                                    if (data.count != undefined && v.maxcount) {
                                                        if (parseInt(data.count) < parseInt(v.maxcount)) {
                                                            messageAppend("当前层数" + data.count + ",已触发" + v.name, 1);
                                                            if (data.id) {
                                                                let p = v.send.replace("{id}", data.id);
                                                                WG.SendCmd(p);
                                                            } else {
                                                                WG.SendCmd(v.send);
                                                            }
                                                        }
                                                    } else {
                                                        if (v.istip != "0") {
                                                            messageAppend("已触发" + v.name, 1);
                                                        }
                                                        if (data.id) {
                                                            let p = v.send.replace("{id}", data.id);
                                                            WG.SendCmd(p);
                                                        } else {
                                                            WG.SendCmd(v.send);
                                                        }
                                                    }
                                                }
                                            }
                                        }
                                    }
                                }
                                break;
                            case "text":
                                for (var keyworditem of keywords) {
                                    if (data.msg.indexOf(keyworditem) >= 0) {
                                        if (v.istip != "0") {
                                            messageAppend("已触发" + v.name, 1);
                                        }
                                        if (data.msg) {
                                            let p = v.send.replace("{content}", data.msg.replaceAll("\n", "").replaceAll(",", "").replaceAll(";", ""));
                                            WG.SendCmd(p);
                                        } else {
                                            WG.SendCmd(v.send);
                                        }
                                    }
                                }
                                break;
                            case "msg":
                                if (!v.senduser || v.senduser == "" || v.senduser == null) {
                                    for (var keyworditem of keywords) {
                                        if (data.content.indexOf(keyworditem) >= 0) {
                                            if (v.istip != "0") {
                                                messageAppend("已触发" + v.name, 1);
                                            }
                                            if (data.content) {
                                                let p = v.send.replace("{content}", data.content.replaceAll("\n", "").replaceAll(",", "").replaceAll(";", ""));
                                                WG.SendCmd(p);
                                            } else {
                                                WG.SendCmd(v.send);
                                            }
                                        }
                                    }
                                    return;
                                }
                                let sendusers = v.senduser.split("|");
                                for (let item of sendusers) {
                                    if (data.name == item) {
                                        for (var keyworditem of keywords) {
                                            if (data.content.indexOf(keyworditem) >= 0) {
                                                if (v.istip != "0") {
                                                    messageAppend("已触发" + v.name, 1);
                                                }
                                                if (data.content) {
                                                    let p = v.send.replace("{content}", data.content);
                                                    WG.SendCmd(p);
                                                } else {
                                                    WG.SendCmd(v.send);
                                                }
                                            }
                                        }
                                    } else if ((item == "谣言" && data.ch == "rumor") ||
                                        (item == "系统" && data.ch == 'sys') ||
                                        (item == "门派" && data.ch == 'fam') ||
                                        (item == "帮派" && data.ch == 'pty')) {
                                        for (var keyworditem of keywords) {
                                            if (data.content.indexOf(keyworditem) >= 0) {
                                                if (v.istip != "0") {
                                                    messageAppend("已触发" + v.name, 1);
                                                }
                                                if (data.content) {
                                                    let p = v.send.replace("{content}", data.content);
                                                    WG.SendCmd(p);
                                                } else {
                                                    WG.SendCmd(v.send);
                                                }
                                            }
                                        }
                                    }
                                    // else if (item == "系统" && data.ch == 'sys') {
                                    //     for (var keyworditem of keywords) {
                                    //         if (data.content.indexOf(keyworditem) >= 0) {
                                    //             messageAppend("已触发" + v.name, 1);
                                    //             WG.SendCmd(v.send);
                                    //         }
                                    //     }
                                    // }
                                }
                                break;

                            case "die":
                                if (data.commands != null) {
                                    if (v.istip != "0") {
                                        messageAppend("已触发" + v.name, 1);
                                    }
                                    WG.SendCmd(v.send);
                                }
                                break;
                            case "itemadd":
                                for (var keyworditem of keywords) {

                                    if (data.name.indexOf(keyworditem) >= 0) {
                                        if (v.ishave == 2) {
                                            if (data.p != null) {
                                                break
                                            }
                                        }
                                        if (v.istip != "0") {
                                            messageAppend("已触发" + v.name, 1);
                                        }
                                        if (data.id) {
                                            let p = v.send.replace("{id}", data.id);
                                            WG.SendCmd(p);
                                        } else {
                                            WG.SendCmd(v.send);
                                        }
                                    }
                                }
                                break;
                            case "room":
                                for (var keyworditem of keywords) {
                                    if (data.name.indexOf(keyworditem) >= 0) {
                                        if (v.istip != "0") {
                                            messageAppend("已触发" + v.name, 1);
                                        }
                                        let p = v.send.replace("{name}", data.name);
                                        WG.SendCmd(p);
                                        return;
                                    }
                                    for (let roomItem of roomData) {
                                        if (roomItem == 0) { return; }
                                        if (roomItem.name.indexOf(keyworditem) >= 0 && roomItem.p == undefined) {
                                            if (v.istip != "0") {
                                                messageAppend("已触发" + v.name, 1);
                                            }
                                            let p = v.send.replace("{name}", data.name);
                                            WG.SendCmd(p);
                                            return;
                                        }
                                    }
                                }
                                break;
                            case "dialog":
                                if (data.dialog && data.dialog == "pack") {
                                    for (var keyworditem of keywords) {
                                        if (data.name && data.name.indexOf(keyworditem) >= 0) {
                                            if (v.istip != "0") {
                                                messageAppend("已触发" + v.name, 1);
                                            }
                                            let p = v.send.replace("{id}", data.id);
                                            WG.SendCmd(p);
                                        }
                                    }
                                }
                                break;
                            case "combat":
                                for (var keyworditem of keywords) {
                                    if (keyworditem == "start" && data.start == 1) {
                                        if (v.istip != "0") {
                                            messageAppend("已触发" + v.name, 1);
                                        }
                                        WG.SendCmd(v.send);
                                    } else if (keyworditem == "end" && data.end == 1) {
                                        if (v.istip != "0") {
                                            messageAppend("已触发" + v.name, 1);
                                        }
                                        WG.SendCmd(v.send);
                                    }
                                }
                                break;
                            case "sc":
                                let item = G.items.get(G.id);
                                if (v.ishave == "0") {
                                    //查找id
                                    if (!v.senduser) { }
                                    let pid = WG.find_item(v.senduser);
                                    item = G.items.get(pid);
                                }
                                if (item && item.hp) {
                                    if ((item.hp / item.max_hp) * 100 < (parseInt(keywords[0]))) {
                                        if (v.istip != "0") {
                                            messageAppend("已触发" + v.name, 1);
                                        }
                                        WG.SendCmd(v.send);
                                    }
                                }
                                if (item && item.mp) {
                                    if ((item.mp / item.max_mp) * 100 < (parseInt(keywords[1]))) {
                                        if (v.istip != "0") {
                                            messageAppend("已触发" + v.name, 1);
                                        }
                                        WG.SendCmd(v.send);
                                    }
                                }
                                break;
                            case "enapfm":
                                for (let item of keywords) {
                                    if (item == data.id) {
                                        if (v.istip != "0") {
                                            messageAppend("已触发" + v.name, 1);
                                        }
                                        WG.SendCmd(v.send);
                                    }
                                }
                                break;
                            case "dispfm":
                                for (let item of keywords) {
                                    if (item == data.id) {
                                        if (v.istip != "0") {
                                            messageAppend("已触发" + v.name, 1);
                                        }
                                        WG.SendCmd(v.send);
                                    }
                                }
                                break;
                            default:
                                break;
                        }
                    }

                });

            });
            messageAppend("已重新注入自动监控", 0, 1);
        },
        daily_hook: undefined,
        oneKeyDaily: async function () {
            messageAppend("本脚本会自动执行师门及自动进退小树林,请确保精力足够再执行,请不要点击任务菜单", 1);
            var fbnums = 0;
            WG.daily_hook = WG.add_hook("dialog", async function (data) {
                if (data.dialog == "tasks") {
                    if (data.items) {
                        let dailylog = "";
                        let dailystate = "";
                        for (let item of data.items) {
                            if (item.id == "signin") {
                                dailylog = item.desc;
                                dailystate = item.state;
                            }
                        }
                        if (dailystate == 3) {
                            messageAppend("日常已完成", 1);
                            //WG.zdwk();
                            setTimeout(() => {
                                WG.remove_hook(WG.daily_hook);
                                WG.daily_hook = undefined;
                            }, 1);

                            return;
                        } else {
                            let str = dailylog;
                            str = str.replace(/<(?!\/?p\b)[^>]+>/ig, '');
                            let str1 = str.split("精力消耗");

                            let n = str1[0].match("：([^%]+)/20")[1];
                            let n1 = str1[1].match("：([^%]+)/200")[1];
                            n = 20 - parseInt(n);
                            fbnums = 20 - parseInt(n1) / 10;
                            messageAppend("还需要" + n + "次师门任务," + fbnums + "次副本,才可签到");
                            if (n != 0) {
                                //$(".sm_button").click();
                                $(".sm_button").text("停止(Q)");
                                WG.sm_state = 0;
                                setTimeout(WG.smTask, 200);
                                return
                            } else {
                                WG.sm_state = -1;
                            }

                            //WG.remove_hook(WG.daily_hook);
                            //WG.daily_hook = undefined;
                        }

                    }
                }
            });
            WG.SendCmd("tasks");

            await WG.sleep(2000);
            while (WG.sm_state >= 0) {
                await WG.sleep(2000);
            }
            if (fbnums <= 0) {
                WG.Send("taskover signin");
                messageAppend("<hiy>任务完成</hiy>");
                WG.remove_hook(WG.daily_hook);
                WG.daily_hook = undefined;
                this.timer_close();
                //WG.zdwk();
                this.needGrove = 0;
                this.fbnum = 0;
            } else {
                WG.grove_auto(fbnums);
            }

            // var sxplace = sm_array[family].sxplace;
            // var sx = sm_array[family].sx;
            // if (sxplace.indexOf("-") == 0) {
            //     WG.Send(sxplace.replace('-', ''));
            // } else {
            //     WG.go(sxplace);
            // }
            // await WG.sleep(1000);
            // WG.SendCmd("ask2 $findPlayerByName(\"" + sx + "\")");
            // await WG.sleep(1000);

        },
        oneKeyQA: async function () {
            WG.Send("stopstate");
            WG.sm_state = -1;
            var sxplace = sm_array[family].sxplace;
            var sx = sm_array[family].sx;
            if (sxplace.indexOf("-") == 0) {
                WG.Send(sxplace.replace('-', ''));
            } else {
                WG.go(sxplace);
            }
            await WG.sleep(2000);
            WG.SendCmd("select $findPlayerByName(\"" + sx + "\");$wait 200;ask2 $findPlayerByName(\"" + sx + "\")");
            await WG.sleep(1000);

        },
        sd_hook: undefined,
        oneKeySD: function () {
            var n = 0;
            messageAppend("本脚本自动执行购买扫荡符,进行追捕扫荡,请确保元宝足够，请不要点击任务菜单\n注意! 超过上限会自动放弃", 1);
            WG.sd_hook = WG.add_hook(["dialog", "text"], async function (data) {
                var id = 0;
                var loop = 2;
                if (data.type == 'text' && data.msg) {
                    id = WG.getIdByName("程药发");
                    if (data.msg.indexOf("无法快速完") >= 0) {
                        WG.Send("select " + id);
                        await WG.sleep(200);
                        WG.Send("ask1 " + id);
                        await WG.sleep(200);
                        WG.Send("ask2 " + id);
                        await WG.sleep(200);
                        while (loop) {
                            loop--;
                            console.log("ask3 " + id);

                            WG.Send("ask3 " + id);
                            await WG.sleep(1000);
                        }

                        //messageAppend("追捕已完成", 1);
                        //WG.Send("ask3 " + id);
                        //WG.zdwk();
                        //WG.remove_hook(WG.sd_hook);
                        //WG.sd_hook = undefined;
                    }
                    //<hig>你的追捕任务完成了，目前完成20/20个，已连续完成40个。</hig>
                    if (data.msg.indexOf("追捕任务完成了") >= 0) {
                        let str = data.msg;
                        str = str.replace(/<(?!\/?p\b)[^>]+>/ig, '');
                        n = str.match("目前完成([^%]+)/20")[1];
                        if (n == "20") {
                            messageAppend("追捕已完成", 1);
                            await WG.sleep(2000);
                            WG.remove_hook(WG.sd_hook);
                            WG.sd_hook = undefined;
                        }
                    }
                    if (data.msg.indexOf("多历练一番") >= 0 || data.msg.indexOf("没有那么多元宝") >= 0) {
                        messageAppend("等级太低无法接取追捕,自动取消", 1);
                        WG.remove_hook(WG.sd_hook);
                        WG.sd_hook = undefined;
                    }
                    if (data.msg.indexOf("你的追捕任务已经完成了") >= 0) {
                        messageAppend("追捕已完成", 1);
                        WG.remove_hook(WG.sd_hook);
                        WG.sd_hook = undefined;
                    }
                    if (data.msg.indexOf("你的扫荡符不够。") >= 0) {
                        id = WG.getIdByName("程药发");

                        messageAppend("还需要" + n + "次扫荡,自动购入" + n + "张扫荡符");
                        WG.Send("shop 0 " + n);
                        await WG.sleep(1000);
                        while (loop) {
                            loop--;
                            console.log("ask3 " + id);
                            WG.Send("ask3 " + id);
                            await WG.sleep(1000);
                        }

                    }
                }
                if (data.dialog == "tasks") {
                    if (data.items) {
                        let dailylog = "";
                        for (let item of data.items) {
                            if (item.id == "yamen") {
                                dailylog = item.desc;
                            }
                        }
                        let str = dailylog;
                        str = str.replace(/<(?!\/?p\b)[^>]+>/ig, '');

                        n = str.match("完成([^%]+)/20")[1];
                        n = 20 - parseInt(n);
                        if (n == 0) {
                            messageAppend("追捕已完成", 1);
                            //WG.zdwk();
                            WG.remove_hook(WG.sd_hook);
                            WG.sd_hook = undefined;
                            return;
                        } else {
                            do {
                                WG.go("扬州城-衙门正厅");
                                await WG.sleep(1000);
                            }
                            while (!WG.getIdByName("程药发"))
                            WG.SendCmd("ask3 $pname(\"程药发\")");
                        }

                    }
                }
            });
            WG.Send("stopstate");
            WG.SendCmd("tasks");
        },
        gpSkill_hook: undefined,
        getPlayerSkill: async function () {
            WG.gpSkill_hook = WG.add_hook("dialog", (data) => {
                if ((data.dialog && data.dialog == 'skills') && data.items && data.items != null) {
                    var html = `<div class="item-commands ">
                <span class = "copycha" data-clipboard-target = ".target1" >
                        技能详情复制到剪贴板 </span></div> `;
                    messageAppend(html);
                    $(".copycha").on('click', () => {
                        var dd = G.level.replace(/<\/?.+?>/g, "");
                        var dds = dd.replace(/ /g, "");
                        var copydata = {
                            player: role,
                            roleid: roleid,
                            level: dds,
                            family: G.pfamily,
                            items: data.items
                        };
                        copyToClipboard(JSON.stringify(copydata));
                        messageAppend("复制成功");
                    });
                    WG.remove_hook(WG.gpSkill_hook);
                    WG.gpSkill_hook = undefined;
                }
            });
            KEY.do_command("skills");
            KEY.do_command("skills");
            WG.Send("cha");
        },
        make_config: async function () {
            let _config = {};
            let keys = GM_listValues();
            keys.forEach(key => {
                if (key.indexOf(roleid) >= 0) {
                    _config[key] = GM_getValue(key);
                }
            });
            _config._shieldswitch = GM_getValue("_shieldswitch", shieldswitch);
            _config._shield = GM_getValue("_shield", shield);
            _config._shieldkey = GM_getValue("_shieldkey", shieldkey);
            _config._pushSwitch = GM_getValue("_pushSwitch", pushSwitch);
            _config._pushType = GM_getValue("_pushType", pushType);
            _config._pushToken = GM_getValue("_pushToken", pushToken);
            // _config._pushUrl = GM_getValue("_pushUrl", pushUrl);

            S.uploadUserConfig(G.id, _config, (res) => {
                if (res == "true") {
                    L.msg("已成功上传");
                }
            });
        },
        load_config: async function () {
            S.getUserConfig(G.id, (res) => {
                if (res != "") {
                    let _config = JSON.parse(res);
                    for (const key in _config) {
                        GM_setValue(key, _config[key]);
                    }


                    GI.configInit();

                    WG.setting();
                    WG.ztjk_func();
                    WG.zml_showp();
                    WG.dsj_func();
                    L.msg("已成功加载");
                }
            });
        }, //设置
        setting: function () {
            KEY.do_command("setting");

            $('.footer-item')[$('.footer-item').length - 1].click();
            // GI.configInit();

            if ($('.dialog-custom .zdy_dialog').length == 0) {
                var a = UI.syssetting();
                $(".dialog-custom").prepend(a);

            }
            $(".dialog-custom").off('click');
            $("#family").off('change');
            $('#wudao_pfm').off('focusout');
            $(".savebtn").off('click')
            $('.clear_skillJson').off('click')
            $('.backup_btn').off('click')
            $('.clean_dps').off('click')
            $('.load_btn').off('click')
            $(".update_store").off('click')
            $(".update_id_all").off('click')
            $(".clean_id_all").off('click')
            $('#autobuy').off('change')
            $('#autoSkillPaperSell').off('change')
            $('#loginhml').off('change')
            $('#backimageurl').off('change')
            $('#statehml').off('change')
            $('#shieldkey').off('focusout');
            $('#shield').off('focusout');
            $('#funnycalc').off('click')
            $('#dpssakada').off('click')
            $('#silence').off('click')
            $('#zdyskilllist').off('change')
            $('#zdyskillsswitch').off('click')
            $('#shieldswitch').off('click')
            $('#welcome').off('focusout');
            $('#die_str').off('focusout');
            $('#blacklist').off('change')
            $('#auto_command').off('change')
            $('#store_fenjie_info').off('change')
            $('#store_drop_info').off('change')
            $('#lock_info').off('change')
            $('#store_info2').off('change')
            $('#store_info').off('change')
            $('#unauto_pfm').off('change')
            $('#getitemShow').off('click')
            $("#zmlshowsetting").off('change')
            $("#bagFull").off('change')
            $("pushSwitch").off('click');
            $("pushType").off('change');
            $("pushToken").off('change');
            // $("pushUrl").off('change');
            $('#autorelogin').off('click')
            $('#autoupdateStore').off('click')
            $('#saveAddr').off('click')
            $('#autorewardgoto').off('click')
            $('#autopfmswitch').off('click')
            $('#auto_eq').off('change')
            $('#ks_Boss').off('click')

            $('#marry_kiss').off('click')
            $('#ks_wait').off('focusout');

            $('#ks_pfm').off('focusout');
            $('#sm_getstore').off('click')

            $('#sm_price').off('click')
            $('#sm_any').off('click')
            $('#sm_loser').off('click')


            $(".dialog-custom").on("click", ".switch2", UI.switchClick);
            $("#family").change(function () {
                family = $("#family").val();
                GM_setValue(roleid + "_family", family);
            });
            $('#wudao_pfm').focusout(function () {
                wudao_pfm = $('#wudao_pfm').val();
                GM_setValue(roleid + "_wudao_pfm", wudao_pfm);
            });
            $('#sm_loser').click(function () {
                sm_loser = WG.switchReversal($(this));
                GM_setValue(roleid + "_sm_loser", sm_loser);
            });
            $('#sm_any').click(function () {
                sm_any = WG.switchReversal($(this));
                GM_setValue(roleid + "_sm_any", sm_any);
            });
            $('#sm_price').click(function () {
                sm_price = WG.switchReversal($(this));
                GM_setValue(roleid + "_sm_price", sm_price);
            });
            $('#sm_getstore').click(function () {
                sm_getstore = WG.switchReversal($(this));
                GM_setValue(roleid + "_sm_getstore", sm_getstore);
            });
            $('#ks_pfm').focusout(function () {
                ks_pfm = $('#ks_pfm').val();
                GM_setValue(roleid + "_ks_pfm", ks_pfm);
            });
            $('#ks_wait').focusout(function () {
                ks_wait = $('#ks_wait').val();
                GM_setValue(roleid + "_ks_wait", ks_wait);
            });
            $('#marry_kiss').click(function () {
                automarry = WG.switchReversal($(this));
                GM_setValue(roleid + "_automarry", automarry);
            });
            $('#ks_Boss').click(function () {
                autoKsBoss = WG.switchReversal($(this));
                GM_setValue(roleid + "_autoKsBoss", autoKsBoss);
            });
            $('#auto_eq').focusout(function () {
                autoeq = $('#auto_eq').val();
                GM_setValue(roleid + "_auto_eq", autoeq);
            });
            $('#autopfmswitch').click(function () {
                auto_pfmswitch = WG.switchReversal($(this));
                GM_setValue(roleid + "_auto_pfmswitch", auto_pfmswitch);
                if (auto_pfmswitch == "开") {
                    G.auto_preform = true;
                } else {
                    G.auto_preform = false;
                }
            });
            $('#autopfmmode').click(function () {
                auto_pfm_mode = WG.switchReversal($(this));
                GM_setValue(roleid + "_auto_pfm_mode", auto_pfm_mode);
                if (auto_pfm_mode == "开") {
                    G.auto_pfm_mode = true;
                } else {
                    G.auto_pfm_mode = false;
                }
            });
            $('#autorewardgoto').click(function () {
                auto_rewardgoto = WG.switchReversal($(this));
                GM_setValue(roleid + "_auto_rewardgoto", auto_rewardgoto);
            });

            $('#busyinfo').click(function () {
                busy_info = WG.switchReversal($(this));
                GM_setValue(roleid + "_busy_info", busy_info);
            });
            $('#saveAddr').click(function () {
                saveAddr = WG.switchReversal($(this));
                GM_setValue(roleid + "_saveAddr", saveAddr);
            });

            $('#autoupdateStore').click(function () {
                auto_updateStore = WG.switchReversal($(this));
                GM_setValue(roleid + "_auto_updateStore", auto_updateStore);
            });
            $('#autorelogin').click(function () {
                auto_relogin = WG.switchReversal($(this));
                GM_setValue(roleid + "_auto_relogin", auto_relogin);
            });
            $("#zmlshowsetting").change(function () {
                zmlshowsetting = $('#zmlshowsetting').val();
                GM_setValue(roleid + "_zmlshowsetting", zmlshowsetting);
                WG.zml_showp();
            });
            $("#bagFull").change(function () {
                bagFull = $('#bagFull').val();
                GM_setValue(roleid + "_bagFull", bagFull);
            });
            $("#pushSwitch").click(function () {
                pushSwitch = WG.switchReversal($(this));
                GM_setValue("_pushSwitch", pushSwitch);
            });
            $("#pushType").change(function () {
                pushType = $('#pushType').val();
                GM_setValue("_pushType", pushType);
            });
            $("#pushToken").focusout(function () {
                pushToken = $('#pushToken').val();
                GM_setValue("_pushToken", pushToken);
            });
            // $("#pushUrl").focusout(function () {
            //     pushUrl = $('#pushUrl').val();
            //     GM_setValue("_pushUrl", pushUrl);
            // });
            $("#color_select").change(function () {
                color_select = $('#color_select').val();
                GM_setValue("color_select", color_select);
            });
            $('#getitemShow').click(function () {
                getitemShow = WG.switchReversal($(this));
                GM_setValue(roleid + "_getitemShow", getitemShow);

                if (getitemShow == "开") {
                    G.getitemShow = true;
                } else {
                    G.getitemShow = false;
                }
            });
            $('#unauto_pfm').change(function () {
                unauto_pfm = $('#unauto_pfm').val();
                GM_setValue(roleid + "_unauto_pfm", unauto_pfm);
                var unpfm = unauto_pfm.split(',');
                blackpfm = [];
                for (var pfmname of unpfm) {
                    if (pfmname)
                        blackpfm.push(pfmname);
                }
            });
            $('#store_info').change(function () {
                zdy_item_store = $('#store_info').val();
                GM_setValue(roleid + "_zdy_item_store", zdy_item_store);
                store_list = zdy_item_store.split(",");
                store_list = store_list.concat(zdy_item_store2.split(","));
            });
            $('#store_info2').change(function () {
                zdy_item_store2 = $('#store_info2').val();
                GM_setValue(roleid + "_zdy_item_store2", zdy_item_store2);
                store_list = zdy_item_store2.split(",");
                store_list = store_list.concat(zdy_item_store.split(","));
            });
            $('#lock_info').change(function () {
                zdy_item_lock = $('#lock_info').val();
                GM_setValue(roleid + "_zdy_item_lock", zdy_item_lock);
                lock_list = zdy_item_lock.split(",");
            });
            $('#store_drop_info').change(function () {
                zdy_item_drop = $('#store_drop_info').val();
                GM_setValue(roleid + "_zdy_item_drop", zdy_item_drop);
                drop_list = zdy_item_drop.split(",");
            });
            $('#store_fenjie_info').change(function () {
                zdy_item_fenjie = $('#store_fenjie_info').val();
                GM_setValue(roleid + "_zdy_item_fenjie", zdy_item_fenjie);
                fenjie_list = zdy_item_fenjie.split(",");
            });
            $('#auto_command').change(function () {
                auto_command = $('#auto_command').val();
                GM_setValue(roleid + "_auto_command", auto_command);
            });
            $('#blacklist').change(function () {
                blacklist = $('#blacklist').val();
                GM_setValue(roleid + "_blacklist", blacklist);
            });
            $('#welcome').focusout(function () {
                welcome = $('#welcome').val();
                GM_setValue(roleid + "_welcome", welcome);
            });
            $('#die_str').focusout(function () {
                die_str = $('#die_str').val();
                GM_setValue(roleid + "_die_str", die_str);
            });

            $('#shieldswitch').click(function () {

                shieldswitch = WG.switchReversal($(this));
                GM_setValue("_shieldswitch", shieldswitch);
                if (shieldswitch == "开") {
                    messageAppend('已注入屏蔽系统', 0, 1);
                }
            });
            $('#zdyskillsswitch').click(function () {

                zdyskills = WG.switchReversal($(this));
                GM_setValue(roleid + "_zdyskills", zdyskills);
                if (zdyskills == "开") {
                    messageAppend('已开启自定义技能顺序，填写顺序后，请刷新游戏生效', 0, 1);
                }
            });

            $('#zdyskilllist').change(function () {

                let x = JSON.parse($("#zdyskilllist").val());
                if (!typeof x instanceof Array) {
                    alert("无效的输入")
                    return false;
                } else {
                    zdyskilllist = $("#zdyskilllist").val();
                    GM_setValue(roleid + "_zdyskilllist", zdyskilllist);
                }
            });
            $('#silence').click(function () {

                silence = WG.switchReversal($(this));
                GM_setValue(roleid + "_silence", silence);
                if (silence == "开") {
                    messageAppend('已开启安静模式', 0, 1);
                }
            });
            $('#dpssakada').click(function () {

                dpssakada = WG.switchReversal($(this));
                GM_setValue(roleid + "_dpssakada", dpssakada);
                if (dpssakada == "开") {
                    messageAppend('已开启战斗统计', 0, 1);
                }
            });
            $('#funnycalc').click(function () {

                funnycalc = WG.switchReversal($(this));
                GM_setValue(roleid + "_funnycalc", funnycalc);
                if (funnycalc == "开") {
                    messageAppend('已开启FUNNY计算', 0, 1);
                }
            });
            $('#shield').focusout(function () {
                shield = $('#shield').val();
                GM_setValue("_shield", shield);
            });
            $('#shieldkey').focusout(function () {
                shieldkey = $('#shieldkey').val();
                GM_setValue("_shieldkey", shieldkey);
            });

            $('#statehml').change(function () {
                statehml = $('#statehml').val();
                GM_setValue(roleid + "_statehml", statehml);
            });
            $('#backimageurl').change(function () {
                backimageurl = $('#backimageurl').val();
                GM_setValue(roleid + "_backimageurl", backimageurl);
                if (backimageurl != '') {
                    WG.SendCmd("setting backcolor none");
                    GM_addStyle(`body{
              background-color:rgb(0,0,0,.25)
                }
                div{
                    opacity:1;
                }
                html{
                background:rgba(255,255,255,0.25);
                background-image:url('${backimageurl}');
                background-repeat:no-repeat;
                background-size:100% 100%;
                -moz-background-size:100% 100%;
            }
            `);
                }
            });
            $('#loginhml').change(function () {
                loginhml = $('#loginhml').val();
                GM_setValue(roleid + "_loginhml", loginhml);
            });
            $('#autobuy').change(function () {
                auto_buylist = $('#autobuy').val();
                GM_setValue(roleid + "_auto_buylist", auto_buylist);
            });
            $('#autoSkillPaperSell').change(function () {
                auto_skillPaperSelllist = $('#autoSkillPaperSell').val();
                GM_setValue(roleid + "_auto_skillPaperSelllist", auto_skillPaperSelllist);
            });
            $(".update_id_all").on("click", WG.update_id_all);
            $(".clean_id_all").on("click", WG.clean_id_all);
            $(".update_store").on("click", WG.update_store);
            $('.backup_btn').on('click', WG.make_config);
            $('.load_btn').on('click', WG.load_config);
            $('.clean_dps').on('click', WG.clean_dps);

            $('.clear_skillJson').on('click', () => {
                zdyskilllist == "";
                messageAppend("已关闭自定义，请刷新重新获取技能数据!");
                zdyskills = "关";
                GM_setValue(roleid + "_zdyskilllist", "");
                GM_setValue(roleid + "_zdyskills", zdyskills);
            });


            $(".savebtn").on("click", function () {
                let tmp = [];
                for (let item of keyitem) {
                    let zdybtnitem = {
                        name: '无',
                        send: ''
                    };
                    let pname = $(`#name${item}`).val();
                    let psend = $(`#send${item}`).val();
                    if (pname != '') {
                        zdybtnitem.name = pname;
                        zdybtnitem.send = psend;
                    }

                    tmp.push(zdybtnitem);
                }
                zdy_btnlist = tmp;
                GM_setValue(roleid + "_zdy_btnlist", zdy_btnlist);
                messageAppend("保存自定义按钮成功");
                WG.zdy_btnListInit();
            });


            $('#family').val(family);
            $('#wudao_pfm').val(wudao_pfm);
            $('#sm_loser').val(sm_loser);
            $('#sm_any').val(sm_any);
            $('#sm_price').val(sm_price);
            $('#sm_getstore').val(sm_getstore);
            $('#ks_pfm').val(ks_pfm);
            $("#ks_wait").val(ks_wait);
            $('#marry_kiss').val(automarry);
            $('#ks_Boss').val(autoKsBoss);
            $('#auto_eq').val(autoeq);
            $('#autopfmswitch').val(auto_pfmswitch);
            $('#autopfmmode').val(auto_pfm_mode);
            $('#autorewardgoto').val(auto_rewardgoto);
            $('#busyinfo').val(busy_info);
            $('#saveAddr').val(saveAddr);
            $('#autoupdateStore').val(auto_updateStore);
            $('#autorelogin').val(auto_relogin);
            $("#zmlshowsetting").val(zmlshowsetting);
            $("#bagFull").val(bagFull);
            $("#pushSwitch").val(pushSwitch);
            $("#pushType").val(pushType);
            $("#pushToken").val(pushToken);
            // $("#pushUrl").val(pushUrl);

            $("#color_select").val(color_select);
            $('#getitemShow').val(getitemShow);
            $('#unauto_pfm').val(unauto_pfm);
            $('#store_info').val(zdy_item_store);
            $('#store_info2').val(zdy_item_store2);

            $('#lock_info').val(zdy_item_lock);
            $('#store_drop_info').val(zdy_item_drop);
            $('#store_fenjie_info').val(zdy_item_fenjie);
            $('#auto_command').val(auto_command);
            $("#blacklist").val(blacklist);
            $('#welcome').val(welcome);
            $('#die_str').val(die_str);
            $('#shieldswitch').val(shieldswitch);
            $('#silence').val(silence);
            $('#dpssakada').val(dpssakada);
            $('#funnycalc').val(funnycalc);
            $('#shield').val(shield);
            $('#shieldkey').val(shieldkey);
            $('#statehml').val(statehml);
            $("#backimageurl").val(backimageurl);
            $("#loginhml").val(loginhml);
            $("#autobuy").val(auto_buylist);
            $("#autoSkillPaperSell").val(auto_skillPaperSelllist);

            $("#zdyskillsswitch").val(zdyskills);
            $("#zdyskilllist").val(zdyskilllist);
            //自定义按钮刷新
            var keyitem = ["Q", "W", "E", "R", "T", "Y"];
            let zdybtni = 0;
            for (let item of keyitem) {
                $(`#name${item}`).val(zdy_btnlist[zdybtni].name);
                $(`#send${item}`).val(zdy_btnlist[zdybtni].send);
                zdybtni = zdybtni + 1;
            }
            for (let w = $(".setting>.setting-item2"), t = 0; t < w.length; t++) {
                var s = $(w[t]),
                    i = s.attr("for");
                if (i) {
                    var n = eval(i);
                    switch (i) {
                        default:
                            "开" == n && (s.find(".switch2").addClass("on"), s.find(".switch-text").html("开"))
                    }
                }
            }
        },
        zdybtnfunc: function (type) {
            WG.SendCmd(zdy_btnlist[type].send);
        },
        zdy_btnset: function () {
            zdy_btnlist = GM_getValue(roleid + "_zdy_btnlist", zdy_btnlist);
            messageClear();
            let html = UI.zdyBtnsetui();
            messageAppend(html);
            var keyitem = ["Q", "W", "E", "R", "T", "Y"];
            let i = 0;
            for (let item of keyitem) {
                $(`#name${item}`).val(zdy_btnlist[i].name);
                $(`#send${item}`).val(zdy_btnlist[i].send);
                i = i + 1;
            }
            $(".savebtn").off('click');
            $(".savebtn").on("click", function () {
                let tmp = [];
                for (let item of keyitem) {
                    let zdybtnitem = {
                        name: '无',
                        send: ''
                    };
                    let pname = $(`#name${item}`).val();
                    let psend = $(`#send${item}`).val();
                    if (pname != '') {
                        zdybtnitem.name = pname;
                        zdybtnitem.send = psend;
                    }

                    tmp.push(zdybtnitem);
                }
                zdy_btnlist = tmp;
                GM_setValue(roleid + "_zdy_btnlist", zdy_btnlist);
                messageAppend("保存成功");
                WG.zdy_btnListInit();
            });
        },
        zdy_btnListInit: function () {
            zdy_btnlist = GM_getValue(roleid + "_zdy_btnlist", zdy_btnlist);
            inzdy_btn = GM_getValue(roleid + "_inzdy_btn", inzdy_btn);
            if (zdy_btnlist.length == 0) {
                for (var i = 0; i < 6; i++) {
                    zdy_btnlist.push({
                        "name": "无",
                        "send": ""
                    });
                }
                GM_setValue(roleid + "_zdy_btnlist", zdy_btnlist);
            }
            if (inzdy_btn) {
                WG.zdy_btnshow();
            } else {
                WG.zdy_btnshow('off');
            }
        },
        zdy_btnshow: function (type = 'on') {
            if (type == 'on') {
                inzdy_btn = true;
                var html = UI.zdybtnui();
                $('.WG_button').remove();
                $(".WG_log").after(html);
                let keyitem = ["Q", "W", "E", "R", "T", "Y"];

                for (let i = 0; i < keyitem.length; i++) {
                    $(`#keyin${keyitem[i]}`).on('click', function () {
                        WG.zdybtnfunc(i);
                    });
                }
                $(".auto_perform").on("click", WG.auto_preform_switch);
                $(".cmd_echo").on("click", WG.cmd_echo_button);
            } else if (type == 'off') {
                inzdy_btn = false;

                var html = UI.btnui();
                $('.WG_button').remove();

                $(".WG_log").after(html);
                $(".sm_button").on("click", WG.sm_button);
                $(".go_yamen_task").on("click", WG.go_yamen_task);
                $(".kill_all").on("click", WG.kill_all);
                $(".get_all").on("click", WG.get_all);
                $(".sell_all").on("click", WG.sell_all);
                $(".zdwk").on("click", WG.zdwk);
                $(".auto_perform").on("click", WG.auto_preform_switch);
                $(".cmd_echo").on("click", WG.cmd_echo_button);
                if (G.isGod()) {
                    $('.zdy-item.zdwk').html("修炼(Y)");
                }
            }

            GM_setValue(roleid + "_inzdy_btn", inzdy_btn);
        },
        runLoginhml: function () {
            WG.SendCmd(loginhml);
        },
        tnBuy_hook: null,
        tnBuy: function () {
            WG.tnBuy_hook = WG.add_hook(["dialog", "text"], (data) => {
                let _seller;
                let _itemids = new Map();
                let _sendcmd = ""
                if (data.type == 'dialog' && data.title != null && data.title.indexOf("唐楠正在贩卖") >= 0) {
                    _seller = data.seller;
                    for (let item of data.selllist) {
                        if (WG.inArray(item.name, auto_buylist.split(","))) {
                            _itemids.set(item.id, item.count);
                        }
                    }
                    _itemids.forEach((val, key, map) => {
                        _sendcmd = _sendcmd + "buy " + val + " " + key + " from " + _seller + ";";
                        _sendcmd = _sendcmd + "$wait 500;";
                    });
                    _sendcmd = _sendcmd + "look3 1;"
                    WG.SendCmd(_sendcmd);
                }
                if (data.type == "text" && data.msg.indexOf("没有这个玩家") >= 0) {
                    messageAppend("执行结束");
                    $(".dialog-close").click();
                    WG.remove_hook(WG.tnBuy_hook);
                }

            });

            WG.SendCmd("$to 扬州城-广场;$wait 100;$to 扬州城-当铺;$wait 200;list %唐楠%");

        },
        zxBuy_hook: null,
        zxBuy: function () {
            WG.zxBuy_hook = WG.add_hook(["dialog", "text"], (data) => {
                let _seller = WG.getIdByName("朱熹")
                let _itemids = new Map();
                let _sendcmd = ""
                if (data.type == 'dialog' && data.dialog == 'pack') {

                    for (let item of data.items) {
                        if (WG.inArray(item.name.toLowerCase(), auto_skillPaperSelllist.split(","))) {
                            _itemids.set(item.id, item.count);
                        }
                    }
                    _itemids.forEach((val, key, map) => {
                        _sendcmd = _sendcmd + "sell " + val + " " + key + " to " + _seller + ";";
                        _sendcmd = _sendcmd + "$wait 500;";
                    });
                    _sendcmd = _sendcmd + "look3 1;"
                    WG.SendCmd(_sendcmd);
                }
                if (data.type == "text" && data.msg.indexOf("没有这个玩家") >= 0) {
                    //messageAppend("执行结束");
                    $(".dialog-close").click();
                    WG.remove_hook(WG.zxBuy_hook);
                }

            });

            WG.SendCmd("$to 扬州城-广场;go east;go north;$wait 100;$wait 200;pack");

        },
        selectLowKongfu: function (n = 0) {

            WG.gpSkill_hook = WG.add_hook("dialog", (data) => {
                if ((data.dialog && data.dialog == 'skills') && data.items && data.items != null) {

                    var lianxiCodeStart = "jh fam 0 start,go west,go west,go north,go enter,go west,";
                    var lianxiCode = "";
                    var lianxiCodeMin = "";
                    var lianxiCodeEnd = "wakuang";
                    if (G.isGod()) {
                        lianxiCodeEnd = "xiulian";
                    }
                    var __skillNameList = [];
                    var __skillMinNameList = [];

                    var maxSkill = n;
                    if (n == 0 || isNaN(n)) {
                        maxSkill = data.limit;
                    }
                    var nowCount = 0;
                    var __enaSkill = [];
                    for (let item of data.items) {
                        if (nowCount > 5) {
                            break;
                        }
                        if (item.enable_skill) {
                            __enaSkill.push(item.enable_skill);
                        }


                        if (WG.inArray(item.id, __enaSkill) || item.name.indexOf("基本") >= 0) {
                            if (parseInt(item.level) < parseInt(maxSkill)) {
                                lianxiCode = lianxiCode + `lianxi ${item.id} ${maxSkill},`
                                if (nowCount < 4) {
                                    lianxiCodeMin = lianxiCodeMin + `lianxi ${item.id} ${maxSkill},`
                                    __skillMinNameList.push(item.name);
                                }
                                __skillNameList.push(item.name);
                                nowCount++;
                            }
                        }

                    }
                    var __code = `setting auto_work ${lianxiCodeStart}${lianxiCode}${lianxiCodeEnd}`
                    if (__code.length <= 200) {
                        WG.Send(`setting auto_work ${lianxiCodeStart}${lianxiCode}${lianxiCodeEnd}`);
                        messageAppend(`添加` + __skillNameList.join(",") + `到${maxSkill}`);
                    } else {
                        WG.Send(`setting auto_work ${lianxiCodeStart}${lianxiCodeMin}${lianxiCodeEnd}`);
                        messageAppend(`添加` + __skillMinNameList.join(",") + `到${maxSkill}`);
                    }
                    messageAppend("添加成功,数据刷新后显示");

                    WG.remove_hook(WG.gpSkill_hook);
                    WG.gpSkill_hook = undefined;
                }
            });
            KEY.do_command("skills");
            KEY.do_command("skills");
            WG.Send("cha");
        },
        hooks: [],
        hook_index: 0,
        add_hook: function (types, fn) {
            var hook = {
                'index': WG.hook_index++,
                'types': types,
                'fn': fn
            };
            WG.hooks.push(hook);
            return hook.index;
        },
        remove_hook: function (hookindex) {
            var that = this;
            for (var i = 0; i < that.hooks.length; i++) {
                if (that.hooks[i].index == hookindex) {
                    that.hooks.baoremove(i);
                }
            }
        },
        run_hook: function (type, data) {
            //console.log(data);
            for (var i = 0; i < this.hooks.length; i++) {
                // if (this.hooks[i] !== undefined && this.hooks[i].type == type) {
                //     this.hooks[i].fn(data);
                // }
                try {
                    var listener = this.hooks[i];
                    if (listener.types == data.type || (listener.types instanceof Array && $
                        .inArray(data.type, listener.types) >= 0)) {
                        listener.fn(data);
                    }
                }
                catch (e) {
                    console.error('hook error', e);
                }
            }
        },
        receive_message: function (msg) {
            if (!msg || !msg.data) return;
            var data;
            var deepCopy = function (source) {
                var result = {};
                for (var key in source) {
                    result[key] = typeof source[key] === 'object' ? deepCopy(source[key]) : source[key];
                }
                return result;
            }
            if (msg.data[0] == '{' || msg.data[0] == '[') {
                var func = new Function("return " + msg.data + ";");
                data = func();
            } else {
                data = {
                    type: 'text',
                    msg: msg.data
                };
            }
            if (G.cmd_echo && data.type != 'time') {
                console.log(data);
            }
            if (G.yaotaFlag && typeof (data.msg) == 'string') {
                let ytdata = data.msg;
                if (ytdata.indexOf("一股奇异的能量涌入你的体内，你获得") >= 0) {
                    G.yaoyuan = G.yaoyuan + parseInt(ytdata.replace(/[^0-9]/ig, ""))
                    $('#yt_prog').html("<hiy>目前已获得 " + G.yaoyuan + " 妖元</hiy>")
                    if (G.yaoyuan == 261) {
                        $('#yt_prog').html("<hiy>目前已获得 " + G.yaoyuan + " 妖元，boss出现！</hiy>")
                    }
                }
            }
            if (silence == "开") {
                if (data.type == 'state') {
                    if (data.silence == undefined) {
                        if (data.desc != []) {
                            data.desc = [];
                            data.silence = 1;
                            let p = deepCopy(msg);
                            p.data = JSON.stringify(data);
                            WG.run_hook(data.type, data);
                            ws_on_message.apply(this, [p]);
                            return;
                        }
                    }
                }
                if (data.type == 'text') {
                    let pdata = data.msg;
                    let a = pdata.split(/.*造成<wht>|.*造成<hir>|<\/wht>点|<\/hir>点/);
                    if (a[2]) {
                        let b = a[2].split(/伤害|\(|</);
                        messageAppend(`造成<wht>${a[1]}</wht>点<hir>${b[0]}</hir>伤害！`, 0, 1);
                        WG.run_hook(data.type, data);
                        return;
                    }
                }
            }
            if (data.type == 'msg') {
                if (shieldswitch == '开') {
                    if (shield != undefined &&
                        (shield.indexOf(data.name) >= 0 ||
                            shield.indexOf(data.uid) >= 0))
                        return;
                    var skey = shieldkey.split(",");
                    for (let keyword of skey) {
                        if (keyword != "" && data.content.indexOf(keyword) >= 0) {
                            return;
                        }
                    }
                }
            }
            if (data.type == 'text') {
                if (shieldswitch == '开') {

                    var skey = shieldkey.split(",");
                    for (let keyword of skey) {
                        if (keyword != "" && data.msg.indexOf(keyword) >= 0) {
                            return;
                        }
                    }
                }
            }

            if (data.type == 'dialog' && data.t == 'fam' && data.k == undefined) {
                if (UI.toui[data.index] != undefined) {
                    data.desc += "\n";
                    data.desc += UI.toui[data.index];
                    data.k = 'knva';
                    let p = deepCopy(msg);
                    p.data = JSON.stringify(data);
                    WG.run_hook(data.type, data);
                    ws_on_message.apply(this, [p]);
                    return;
                }
            }

            if (data.type == 'text' && data.msg == '什么？' && G.wsdelaySetTime != undefined) {
                if (G.wsdelaySetCount <= 3) {
                    G.wsdelaySetCount += 1;
                    if (G.wsdelay == undefined) {
                        G.wsdelay = new Date().getTime() - G.wsdelaySetTime;
                    } else {
                        G.wsdelay = (new Date().getTime() - G.wsdelaySetTime + G.wsdelay) / 2
                    }
                    G.wsdelaySetTime = new Date().getTime()
                    WG.SendCmd("test")
                } else {
                   
                    G.wsdelay = (new Date().getTime() - G.wsdelaySetTime + G.wsdelay) / 2
                    WG.SendCmd("tm 服务器到本地来回延迟约 " + G.wsdelay + " 毫秒")
                    G.wsdelaySetTime = undefined;
                    G.wsdelaySetCount = undefined;
                    setTimeout(() => {
                        let content = $(".content-message pre").html();
                        content = content.replaceAll('什么？\n', '');
                        $(".content-message pre").html(content);
                    }, 10);
                }
            }

            if (data.type == 'dialog' && data.t == 'fb' && data.k == undefined) {
                data.desc += "\n";
                data.desc += UI.fbui(fb_path[data.index], data.is_multi, data.is_diffi)
                data.k = 'knva';
                let p = deepCopy(msg);
                p.data = JSON.stringify(data);
                WG.run_hook(data.type, data);
                ws_on_message.apply(this, [p]);
                return;
            }
            if (data.type == 'dialog' && data.dialog == 'pack' && data.from == 'item' && data.k == undefined) {
                let itemname = data.desc.split("\n")[0];
                data.desc += "\n";
                data.desc += UI.itemui(itemname);
                data.k = 'knva';
                let p = deepCopy(msg);
                p.data = JSON.stringify(data);
                WG.run_hook(data.type, data);
                ws_on_message.apply(this, [p]);
                return;
            }
            if (data.type == "perform") {
                if (zdyskills == "开") {
                    zdyskilllist = GM_getValue(roleid + "_zdyskilllist", zdyskilllist);
                    data.skills = JSON.parse(zdyskilllist);
                    let p = deepCopy(msg);
                    p.data = JSON.stringify(data);
                    WG.run_hook(data.type, data);
                    ws_on_message.apply(this, [p]);
                    return;
                }
            }
            if (data.type == 'cmds') {
                if (unsafeWindow && unsafeWindow.ToRaid) {
                    if (JSON.stringify(data.items).indexOf('进入副本') >= 0) {
                        let cr_path = data.items[0].cmd
                        let sd_path = ''
                        if (cr_path.indexOf("1 0") >= 0) {
                            sd_path = cr_path.replaceAll('1 0', '1')
                        } else {
                            sd_path = cr_path + " 0"
                        }
                        let cp = {}
                        cp.name = '扫荡指定次数';
                        cp.cmd = `@js ($sdnum) =prompt("请输入次数,注意:若副本掉落物品过多,请不要输入超过50次,否则可能号没了","10")
                                    [if] (sdnum)!=null
                                      ${sd_path} (sdnum)`;
                        data.items.push(cp);
                        let toudu = {}
                        toudu.name = '偷渡指定次数';
                        toudu.cmd = `@js ($sdnum) =prompt("请输入次数","10")
                                    [if] (sdnum)!=null
                                      [while] (sdnum) !=0
                                        ($sdnum) = (sdnum)-1
                                        ${cr_path}
                                        cr over`;
                        data.items.push(toudu);
                        let p = deepCopy(msg);
                        p.data = JSON.stringify(data);
                        WG.run_hook(data.type, data);
                        ws_on_message.apply(this, [p]);
                        return;
                    }
                }
            }
            //任务进度 -- fork from Suqing funny
            if (data.type == 'dialog' && data.dialog == 'tasks' && data.items) {
                let jl, fb, qa, wd, wd1, wd2, wd3, xy, mpb, boss, wdtz, syt, ys, sm1, sm2, ym1, ym2, yb1, yb2;
                data.items.forEach(task => {
                    if (task.state === 2) WG.SendCmd(`taskover ${task.id}`);//自动完成
                    if (task.id === 'signin') {
                        //精力消耗
                        const a = task.desc.match(/精力消耗：<...>(\d+)\/200<....>/);
                        if (a) {
                            jl = parseInt(a[1]) < 200 ? `<hig>${a[1]}</hig>` : a[1];
                        }
                        //武道塔进度
                        const b = task.desc.match(/武道塔(.+)，进度(\d+)\/(\d+)<....>/);
                        if (b) {
                            wd1 = b[2];
                            wd2 = b[3];
                            if (wd1 < wd2) wd1 = `<hig>${wd1}</hig>`;
                            /可以重置/.test(b[1]) ? wd3 = "<hig>可以重置</hig>" : wd3 = "已经重置";
                            wd = wd1 + "/" + wd2 + " " + wd3
                        } else { wd = "只打塔主" }
                        //首席请安
                        const c = task.desc.match(/<.+?>(.+)首席请安<.+?>/);
                        if (c) {
                            /已经/.test(c[1]) ? qa = "已经请安" : qa = "<hig>尚未请安</hig>";
                        } else { qa = "无需请安" }
                        //今日副本次数
                        const d = task.desc.match(/今日副本完成次数：(\d+)。/);
                        if (d) {
                            fb = d[1];
                        }
                        //襄阳
                        const e = task.desc.match(/尚未协助襄阳守城/);
                        (e) ? xy = `<hig>0</hig>` : xy = 1;
                        //门派BOSS
                        const f = task.desc.match(/尚未挑战门派BOSS/);
                        (f) ? mpb = `<hig>0</hig>` : mpb = 1;
                        //武神BOSS
                        const g = task.desc.match(/挑战(\d+)次武神BOSS/);
                        if (g) {
                            boss = 5 - parseInt(g[1]);
                            boss = `<hig>${boss}</hig>`;
                        } else {
                            if (G.level && /武神|剑神|刀皇|兵主|战神/.test(G.level)) boss = 5;
                        }
                        //武道塔主
                        const h = task.desc.match(/尚未挑战武道塔塔主/);
                        (h) ? wdtz = `<hig>0</hig>/1` : wdtz = `已打或未解锁`;
                        //妖塔
                        const i = task.desc.match(/挑战弑妖塔(\d+)\/50/);
                        if (i) {
                            syt = i[1];
                        }
                        //妖神
                        const j = task.desc.match(/尚未挑战妖神/);
                        (j) ? ys = `<hig>0</hig>/1` : ys = `已打或未解锁`;
                    } else if (task.id === 'sm') {
                        //师门任务
                        let a = task.desc.match(/目前完成(.*)\/20个，共连续完成(.*)个。/);
                        (parseInt(a[1]) < 20) ? sm1 = `<hig>${a[1]}</hig>` : sm1 = a[1];
                        sm2 = a[2];
                    } else if (task.id === 'yamen') {
                        //追捕
                        let a = task.desc.match(/目前完成(.*)\/20个，共连续完成(.*)个。/);
                        (parseInt(a[1]) < 20) ? ym1 = `<hig>${a[1]}</hig>` : ym1 = a[1];
                        ym2 = a[2];
                    } else if (task.id === 'yunbiao') {
                        //运镖
                        let a = task.desc.match(/本周完成(.*)\/20个，共连续完成(.*)个。/);
                        (parseInt(a[1]) < 20) ? yb1 = `<hig>${a[1]}</hig>` : yb1 = a[1];
                        yb2 = a[2];
                    }
                });
                //合并生成进度数据
                let taskprog = `门派请安 => ${qa}\n武道之塔 => ${wd}\n`;
                taskprog += `精力消耗 => ${jl}/200 副本次数 => ${fb}次\n师门任务 => ${sm1}/20 ${sm2}连\n`;
                taskprog += `衙门追捕 => ${ym1}/20 ${ym2}连\n每周运镖 => ${yb1}/20 ${yb2}连\n`;
                taskprog += `襄阳守城 => ${xy}/1 门派BOSS => ${mpb}/1\n`;
                taskprog += `武道塔主 => ${wdtz}\n`;
                if (boss) taskprog += `武神BOSS => ${boss}/5\n`;
                if (syt) taskprog += `挑战弑妖塔 => ${syt}/50 挑战妖神 => ${ys}\n`;
                $(".remove_taskprog").remove();
                $(".content-message pre").append(`<span class="remove_taskprog">${taskprog}</span>`);
                AutoScroll(".content-message");
            }
            //按指定顺序排序背包 -- fork from Suqing funny
            let ITEMS = [
                "师门补给包", "背包扩充石", "小箱子", "随从礼包",
                "神魂碎片", "武道</hio>", "武道残页", "元晶", "帝魄碎片", "ord", "hir",
                "玄晶", "养精丹</hig>", "养精丹", "培元丹", "玫瑰花",
                "扫荡符", "天师符", "叛师符", "洗髓丹", "<hig>喜宴", "<hic>喜宴", "<hiy>喜宴",
                "师门令牌</hig>", "师门令牌</hic>", "师门令牌</hiy>", "师门令牌</HIZ>", "师门令牌</hio>",//师门令牌排序
                "碎裂的红宝石", "碎裂的绿宝石", "碎裂的蓝宝石", "碎裂的黄宝石",//宝石排序
                "红宝石</hic>", "绿宝石</hic>", "蓝宝石</hic>", "黄宝石</hic>",
                "精致的红宝石", "精致的绿宝石", "精致的蓝宝石", "精致的黄宝石",
                "完美的红宝石", "完美的绿宝石", "完美的蓝宝石", "完美的黄宝石",
                "聚气丹</hig>", "聚气丹</hic>", "聚气丹</hiy>", "聚气丹</HIZ>", "聚气丹</hio>",//聚气丹排序
                "突破丹</hig>", "突破丹</hic>", "突破丹</hiy>", "突破丹</hiz>", "突破丹</hio>",//突破丹排序
                "残页</hio>", "残页</HIZ>", "残页</hiy>", "残页</hic>", "残页</hig>",//残页排序
                "鲤鱼", "草鱼", "鲢鱼", "鲮鱼", "鳊鱼", "鲂鱼", "黄金鳉", "黄颡鱼", "太湖银鱼", "虹鳟", "孔雀鱼", "反天刀",//鱼排序
                "银龙鱼", "黑龙鱼", "罗汉鱼", "巨骨舌鱼", "七星刀鱼", "帝王老虎魟",
                "当归", "芦荟", "山楂叶", "柴胡", "金银花", "石楠叶", "茯苓", "沉香", "熟地黄", "九香虫", "络石藤", "冬虫夏草",//药材排序
                "人参", "何首乌", "凌霄花", "灵芝", "天仙藤", "盘龙参",
                "秘籍</wht>", "秘籍",
                "四十二章经一", "四十二章经二", "四十二章经三", "四十二章经四", "四十二章经五", "四十二章经六", "四十二章经七", "四十二章经八",
            ];
            if (data.type == 'dialog' && data.dialog == 'pack') {
                //生成快速使用按钮 -- fork from Suqing funny
                function autoUse(item) {
                    if (/养精丹|朱果|潜灵果|背包扩充石|小箱子|师门补给包|随从礼包|技能重置包/.test(item.name)) {
                        let cmd = ["stopstate"];
                        let count = item.count;
                        let zl = "use";
                        if (/小箱子|师门补给包|随从礼包|技能重置包/.test(item.name)) zl = "open";
                        for (let i = 0; i < count; i++) {
                            cmd.push(`$wait 250;${zl} ${item.id}`);
                        }
                        $(".content-message pre").append(
                            $(`<div class="item-commands"><span class="autouse">使用 ${item.name} ${count}次</span></div>`).click(() => WG.SendCmd(cmd)),
                        );
                        AutoScroll(".content-message");
                    }
                }
                //获得物品后检测生成快速使用按钮 -- fork from Suqing funny
                if (data.name) {
                    autoUse(data);
                }
                //按指定顺序排序 -- fork from Suqing funny
                // if (data.items) {
                //     let pack_items = [];
                //     ITEMS.forEach(name => {
                //         for (let i =0; i < data.items.length; i++) {
                //             let item = data.items[i];
                //             if (item !==0 && item.name.includes(name)) {
                //                 pack_items.push(data.items[i]);
                //                 data.items[i] = 0;
                //             }
                //         }
                //     });
                //     data.items.forEach(item => {
                //         if (item !== 0) pack_items.push(item);
                //     });
                //     pack_items.forEach(item => autoUse(item));
                //     data.type = "dialog";
                //     //data.dialog = "pack";
                //     data.items = pack_items;
                //     let p = deepCopy(msg);
                //     p.data = JSON.stringify(data);
                //     WG.run_hook(data.type, data);
                //     ws_on_message.apply(this, [p]);
                //     return;
                // }
            }
            if (data.type == 'room') {
                if (!(/桃花岛|慈航静斋/).test(data.name)) {
                    //精简房间描述、生成功能按钮 -- fork from Suqing funny
                    let room_desc = data.desc;
                    if (room_desc.length > 30) {
                        let desc0 = room_desc.replace(/<([^<]+)>/g, "");
                        let desc1 = desc0.substr(0, 30);
                        let desc2 = desc0.substr(30);
                        data.desc = `<span id="show">${desc1} <hic>»»»</hic></span><span id="more" style="display:none">${desc0}</span><span id="hide" style="display:none"> <hiy>«««</hiy></span>`
                        //data.desc = `${desc1}<span id="show"> <hic>»»»</hic></span><span id="more" style="display:none">${desc2}</span><span id="hide" style="display:none"> <hiy>«««</hiy></span>`;
                    }
                    if (room_desc.includes("cmd")) {
                        room_desc = room_desc.replace("<hig>椅子</hig>", "椅子");//新手教程的椅子
                        room_desc = room_desc.replace("<CMD cmd='look men'>门(men)<CMD>", "<cmd cmd='look men'>门</cmd>");//兵营副本的门
                        room_desc = room_desc.replace(/span/g, "cmd"); //古墓里的画和古琴是<span>标签
                        room_desc = room_desc.replace(/"/g, "'"); // "" => ''
                        room_desc = room_desc.replace(/\((.*?)\)/g, "");//去除括号和里面的英文单词
                        //console.log(room_desc);
                        let cmds = room_desc.match(/<cmd cmd='([^']+)'>([^<]+)<\/cmd>/g);
                        //console.log(cmds);
                        cmds.forEach(cmd => {
                            let x = cmd.match(/<cmd cmd='(.*)'>(.*)<\/cmd>/);
                            data.commands.unshift({ cmd: x[1], name: `<hic>${x[2]}</hic>` });
                        });
                        // room_desc = room_desc.replace(/<([^<]+)>/g, "");
                        cmds.forEach(desc => data.desc = `<hic>${desc}</hic>　${data.desc}`);
                    }
                    let p = deepCopy(msg);
                    p.data = JSON.stringify(data);
                    WG.run_hook(data.type, data);
                    ws_on_message.apply(this, [p]);
                    $("#show").click(() => { $("#more").show(); $("#show").hide(); $("#hide").show(); });
                    $("#hide").click(() => { $("#more").hide(); $("#show").show(); $("#hide").hide(); });
                    return;
                }
            }

            WG.run_hook(data.type, data);

            ws_on_message.apply(this, arguments);

            if (unsafeWindow.funny) {
                if (unsafeWindow.funny.API != null) { unsafeWindow.funny.API.onmessage(msg); }
            }
        },

    };
    //助手函数
    var T = {
        //private
        _recmd: function (cmds) {
            if (cmds) {
                cmds = cmds instanceof Array ? cmds : cmds.split(';');
                cmds.baoremove(0);
                cmds = cmds.join(";");
                return cmds;
            } else {
                return "";
            }
        },
        recmd: function (idx, cmds) {
            for (let i = 0; i < idx + 1; i++) {
                cmds = T._recmd(cmds);
            }
            return cmds;
        },
        findhook: undefined,
        _findItem: async function (itemname, callback) {
            console.log("finditem" + itemname);
            T.findhook = WG.add_hook("dialog", async function (data) {
                if (data.items) {
                    for (let item of data.items) {
                        if (item.name == itemname) {
                            callback(item.id);
                            WG.remove_hook(T.findhook);
                        }
                    }
                    callback("");
                }
                WG.remove_hook(T.findhook);
            });

            WG.Send("pack");
        },
        //public
        pname: function (idx = 0, n, cmds) {
            T.findPlayerByName(idx, n, cmds);
        },
        findPlayerByName: function (idx = 0, n, cmds) {
            cmds = T.recmd(idx - 1, cmds);
            if (cmds.indexOf(",") >= 0) {
                cmds = cmds.split(",");
            } else {
                cmds = cmds.split(";");
            }
            let p = cmds[0].split("$")[0];
            cmds = T.recmd(0, cmds);
            p = p.replaceAll("-", " ");
            if (p[p.length - 1] == " ") {

                p = p.substring(0, p.length - 1)
            }
            console.log("findPlayerByName" + n);

            for (let i = 0; i < roomData.length; i++) {
                if (roomData[i].name && roomData[i].name.indexOf(n) >= 0) {
                    WG.Send(p + " " + roomData[i].id);
                }
            }
            WG.SendCmd(cmds);
        },
        findItem: async function (idx = 0, n, cmds) {
            cmds = T.recmd(idx - 1, cmds);
            if (cmds.indexOf(",") >= 0) {
                cmds = cmds.split(",");
            } else {
                cmds = cmds.split(";");
            }
            let p = cmds[0].split(" ")[0];
            cmds = T.recmd(0, cmds);
            console.log("finditem" + n);

            WG.Send("pack");
            // console.log(packData)
            for (let item of packData) {
                if (item.name == n) {
                    if (p == "fenjie" || p == "drop") {
                        if (item.name.indexOf("★") >= 0) {
                            messageAppend("高级物品 ,不分解");
                            continue;
                        }
                    }
                    WG.SendCmd(p + " " + item.id);
                }
            }

            WG.SendCmd(cmds);
        },
        wait: async function (idx = 0, n, cmds) {
            cmds = T.recmd(idx, cmds);
            console.log("延时:" + n + "ms,延时触发:" + cmds);
            await WG.sleep(parseInt(n));
            WG.SendCmd(cmds);
        },
        batwait: async function (idx = 0, n, cmds) {
            if (G.in_fight) {
                cmds = T.recmd(idx, cmds);
                console.log("延时:" + n + "ms,延时触发:" + cmds);
                await WG.sleep(parseInt(n));
                WG.SendCmd(cmds);
            }
        },
        goyt: async function () {
            WG.SendCmd("jh fam 9 start;go enter;go up;")
            await WG.sleep(1000);
            var ltId = "";
            for (let i = 0; i < roomData.length; i++) {
                if (roomData[i].name && roomData[i].name.indexOf("疯癫的老头") >= 0) {
                    ltId = roomData[i].id
                }
            }
            WG.SendCmd("ggdl " + ltId + ";go north;go north;go north;go north;$wait 250;go north;go north;look shi;tiao1 shi;tiao3 shi;$wait 250;tiao1 shi;tiao3 shi;tiao2 shi;go north;")
        },
        gogzm: async function () {
            WG.SendCmd("jh fam 9 start;go enter;go up;")
            await WG.sleep(1000);
            var ltId = "";
            for (let i = 0; i < roomData.length; i++) {
                if (roomData[i].name && roomData[i].name.indexOf("疯癫的老头") >= 0) {
                    ltId = roomData[i].id
                }
            }
            WG.SendCmd("ggdl " + ltId + ";go north;go north;go north;go north;$wait 250;go north;go north;$wait 250;look shi;tiao1 shi;tiao1 shi;tiao2 shi;$wait 250;jumpdown;")
        },
        godddb: async function () {
            WG.SendCmd("jh fam 9 start;go enter;go up;")
            await WG.sleep(1000);
            var ltId = "";
            for (let i = 0; i < roomData.length; i++) {
                if (roomData[i].name && roomData[i].name.indexOf("疯癫的老头") >= 0) {
                    ltId = roomData[i].id
                }
            }
            WG.SendCmd("ggdl " + ltId + ";go north;go north;go north;go north;$wait 250;go north;go down;")
        },
        killall: async function (idx = 0, n = null, cmds) {
            cmds = T.recmd(idx, cmds);
            console.log("叫杀");
            WG.kill_all();
            await WG.sleep(100);
            WG.SendCmd(cmds);
        },
        getall: async function (idx = 0, n = null, cmds) {
            cmds = T.recmd(idx, cmds);
            console.log("拾取");
            WG.get_all();
            await WG.sleep(100);
            WG.SendCmd(cmds);
        },
        cleanall: async function (idx = 0, n = null, cmds) {
            cmds = T.recmd(idx, cmds);
            console.log("清包");
            WG.clean_all();
            await WG.sleep(100);
            WG.SendCmd(cmds);
        },
        to: async function (idx = 0, n, cmds) {
            cmds = T.recmd(idx, cmds);
            WG.go(n);
            await WG.sleep(100);
            WG.SendCmd(cmds);
        },
        eq: async function (idx = 0, n, cmds) {
            cmds = T.recmd(idx, cmds);
            if (n == "0") {
                WG.uneqall();
            } else {
                WG.eqhelper(n);
            }
            await WG.sleep(100);
            WG.SendCmd(cmds);
        },
        eqskill: async function (idx = 0, n, cmds) {
            cmds = T.recmd(idx, cmds);
            if (n == "0") {
                WG.uneqall(1);
            } else {
                WG.eqhelper(n, 1);
            }
            await WG.sleep(100);
            WG.SendCmd(cmds);
        },
        eqdel: async function (idx = 0, n, cmds) {
            cmds = T.recmd(idx, cmds);
            WG.eqhelperdel(n);
            await WG.sleep(100);
            WG.SendCmd(cmds);
        },
        zdwk: async function (idx = 0, n, cmds) {
            cmds = T.recmd(idx, cmds);
            WG.zdwk();
            await WG.sleep(100);
            WG.SendCmd(cmds);
        },
        rzdwk: async function (idx = 0, n, cmds) {
            cmds = T.recmd(idx, cmds);
            WG.zdwk("", false);
            await WG.sleep(100);
            WG.SendCmd(cmds);
        },
        killhook: undefined,
        killw: async function (idx = 0, n, cmds) {
            cmds = T.recmd(idx, cmds);
            var killid = "";
            for (let i = 0; i < roomData.length; i++) {
                if (roomData[i].name && roomData[i].name.indexOf(n) >= 0) {
                    killid = roomData[i].id;
                }
            }
            T.killhook = WG.add_hook('itemremove', function (data) {
                if (data.id == killid) {
                    WG.SendCmd(cmds);
                    WG.remove_hook(T.killhook);
                    T.killhook = undefined;
                }
            });
            WG.SendCmd("kill " + killid);
        },
        eqhook: undefined,
        eqw: async function (idx = 0, n, cmds) {
            var pcmds = T.recmd(idx, cmds);
            if (n.indexOf("<") >= 0) {
                T._findItem(n, async function (id) {
                    let p_itemid = id;
                    let p_flag = true;
                    if (p_itemid == "") {
                        p_flag = false;
                        WG.SendCmd(pcmds);
                        return;
                    }
                    T.eqhook = WG.add_hook('dialog', function (data) {
                        if (data.eq == 0 && data.id == p_itemid) {
                            p_flag = false;
                            WG.SendCmd(pcmds);
                            WG.remove_hook(T.eqhook);
                            T.eqhook = undefined;
                        }
                    });
                    while (p_flag) {
                        WG.Send("pack");
                        WG.SendCmd('eq ' + p_itemid);
                        await WG.sleep(1000);
                    }

                });
            } else {
                let p_itemid = n;
                let p_flag = true;
                if (p_itemid == "") {
                    p_flag = false;
                    WG.SendCmd(pcmds);
                    return;
                }
                T.eqhook = WG.add_hook(['text', 'dialog'], function (data) {
                    if (data.type == 'dialog') {
                        if (data.eq == 0 && data.id == p_itemid) {
                            p_flag = false;
                            WG.SendCmd(pcmds);
                            WG.remove_hook(T.eqhook);
                            T.eqhook = undefined;
                        }
                    }
                    if (data.type == 'text') {
                        if (data.msg.indexOf("你要装备什么") >= 0) {
                            p_flag = false;
                            WG.SendCmd(pcmds);
                            WG.remove_hook(T.eqhook);
                            T.eqhook = undefined;
                        }
                    }
                });
                while (p_flag) {
                    WG.Send("pack");
                    WG.SendCmd('eq ' + p_itemid);
                    await WG.sleep(1000);
                }
            }
        },
        usezml: async function (idx = 0, n, cmds) {
            cmds = T.recmd(idx, cmds);
            zml = GM_getValue(roleid + "_zml", zml);
            for (var zmlitem of zml) {
                if (zmlitem.name == n) {
                    await WG.zmlfire(zmlitem);
                }
            }
            await WG.sleep(100);
            WG.SendCmd(cmds);
        },
        waitpfm: async function (idx = 0, n, cmds) {
            cmds = T.recmd(idx, cmds);
            let _flag = true;
            let pfmnum = 0;

            while (_flag) {
                if (!G.gcd && !G.cds.get(n)) {
                    WG.Send("perform " + n);
                    pfmnum++;
                    if (G.cds.get(n) && _flag) {
                        _flag = false;
                        WG.SendCmd(cmds);
                    }
                    if (!G.in_fight && _flag) {
                        _flag = false;
                        WG.SendCmd(cmds);
                    }
                    if (pfmnum >= 1 && _flag) {
                        _flag = false;
                        WG.SendCmd(cmds);
                    }
                }
                pfmnum++;
                await WG.sleep(350);
            }

        },
        startjk: async function (idx = 0, n, cmds) {
            cmds = T.recmd(idx, cmds);
            ztjk_item = GM_getValue(roleid + "_ztjk", ztjk_item);
            for (var item of ztjk_item) {
                if (item.name == n) {
                    item.isactive = 1;
                    GM_setValue(roleid + "_ztjk", ztjk_item);
                    WG.ztjk_func();
                    messageAppend("已注入" + item.name, 0, 1);
                    break;
                }
            }
            await WG.sleep(100);
            WG.SendCmd(cmds);
        },
        stopjk: async function (idx = 0, n, cmds) {
            cmds = T.recmd(idx, cmds);
            ztjk_item = GM_getValue(roleid + "_ztjk", ztjk_item);
            for (var item of ztjk_item) {
                if (item.name == n) {
                    item.isactive = 0;
                    GM_setValue(roleid + "_ztjk", ztjk_item);
                    WG.ztjk_func();
                    messageAppend("已暂停" + item.name);
                    break;
                }
            }
            await WG.sleep(100);
            WG.SendCmd(cmds);
        },
        sm: async function (idx = 0, n = 0, cmds = '') {
            cmds = T.recmd(idx, cmds);
            WG.sm_button();

            while ($('.sm_button').text().indexOf("停止") >= 0) {
                await WG.sleep(1000);
            }
            await WG.sleep(100);
            WG.SendCmd(cmds);
        },
        daily: async function (idx = 0, n, cmds) {
            cmds = T.recmd(idx, cmds);
            KEY.do_command("tasks");
            messageAppend("执行请安.", 1);
            await WG.oneKeyQA();
            WG.oneKeyDaily();
            await WG.sleep(2000);
            while (WG.daily_hook != undefined) {
                await WG.sleep(1000);
            }
            WG.Send('tasks');
            await WG.sleep(1000);
            WG.oneKeySD();
            while (WG.sd_hook) {
                await WG.sleep(1000);
            }

            await WG.sleep(100);
            WG.SendCmd(cmds);
        },
        xiyan: async function (idx = 0, n, cmds) {
            cmds = T.recmd(idx, cmds);
            WG.xiyan();
            await WG.sleep(1000);
            while (WG.marryhy) {
                await WG.sleep(1000);
            }
            await WG.sleep(100);
            WG.SendCmd(cmds);
        },
        yamen: async function (idx = 0, n, cmds) {
            cmds = T.recmd(idx, cmds);
            WG.go_yamen_task();
            await WG.sleep(1000);
            while (WG.yamen_lister) {
                await WG.sleep(1000);
            }
            await WG.sleep(100);
            WG.SendCmd(cmds);
        },
        wudao: async function (idx = 0, n, cmds) {
            cmds = T.recmd(idx, cmds);
            WG.wudao_auto();
            await WG.sleep(100);
            WG.SendCmd(cmds);
        },
        boss: async function (idx = 0, n, cmds) {
            cmds = T.recmd(idx, cmds);
            WG.kksBoss({
                content: "听说xxx出现在逍遥派-青草坪一带。"
            });
            await WG.sleep(1000);
            while (WG.ksboss) {
                await WG.sleep(1000);
            }
            await WG.sleep(100);
            WG.SendCmd(cmds);
        },
        stoppfm: async function (idx = 0, n, cmds) {
            cmds = T.recmd(idx, cmds);
            if (G.auto_preform) {
                G.auto_preform = false;
                messageAppend("<hio>自动施法</hio>关闭");
                WG.auto_preform("stop");
            }
            await WG.sleep(100);
            WG.SendCmd(cmds);
        },
        startpfm: async function (idx = 0, n, cmds) {
            cmds = T.recmd(idx, cmds);
            if (!G.auto_preform) {
                G.auto_preform = true;
                messageAppend("<hio>自动施法</hio>开启");
                WG.auto_preform();
            }
            await WG.sleep(100);
            WG.SendCmd(cmds);
        },
        stopautopfm: async function (idx = 0, n, cmds) {
            cmds = T.recmd(idx, cmds);
            var dellist = n.split(",");
            for (let p of dellist) {
                if (!WG.inArray(p, blackpfm)) {
                    blackpfm.push(p);
                }
            }
            console.log("当前自动施法黑名单为:" + blackpfm);
            await WG.sleep(100);
            WG.SendCmd(cmds);
        },
        startautopfm: async function (idx = 0, n, cmds) {
            cmds = T.recmd(idx, cmds);
            let dellist = n.split(",");
            for (var i = 0; i < blackpfm.length; i++) {
                for (var item of dellist) {
                    if (item == blackpfm[i]) {
                        blackpfm.baoremove(i);
                    }
                }
            }
            console.log("当前自动施法黑名单为:" + blackpfm);
            await WG.sleep(100);
            WG.SendCmd(cmds);
        },
        store: async function (idx = 0, n, cmds) {
            cmds = T.recmd(idx, cmds);
            await WG.sell_all(1, 0, 0);
            while (WG.packup_listener) {
                await WG.sleep(200);
            }
            await WG.sleep(100);
            WG.SendCmd(cmds);
        },
        fenjie: async function (idx = 0, n, cmds) {
            cmds = T.recmd(idx, cmds);
            await WG.sell_all(0, 1, 0);
            while (WG.packup_listener) {
                await WG.sleep(200);
            }
            await WG.sleep(100);
            WG.SendCmd(cmds);
        },
        drop: async function (idx = 0, n, cmds) {
            cmds = T.recmd(idx, cmds);
            await WG.sell_all(0, 0, 1);
            while (WG.packup_listener) {
                await WG.sleep(200);
            }
            await WG.sleep(100);
            WG.SendCmd(cmds);
        },
        sellall: async function (idx = 0, n, cmds) {
            cmds = T.recmd(idx, cmds);
            await WG.sell_all(1, 1, 1);
            while (WG.packup_listener) {
                await WG.sleep(200);
            }
            await WG.sleep(100);
            WG.SendCmd(cmds);
        },
        callcontextMenu: function (idx = 0, n, cmds) {
            $('.container').contextMenu({
                x: 1,
                y: 1
            })
        },
        stopallauto: function (idx = 0, n, cmds) {
            cmds = T.recmd(idx, cmds);
            WG.stopAllAuto();
            messageAppend("暂停自动喜宴及自动BOSS", 0, 1);
            WG.SendCmd(cmds);
        },
        startallauto: function (idx, n, cmds) {
            cmds = T.recmd(idx, cmds);
            WG.reSetAllAuto();
            messageAppend("恢复自动喜宴及自动BOSS", 0, 1);
            WG.SendCmd(cmds);
        },
        roll: function (idx, n, cmds) {
            cmds = T.recmd(idx, cmds);
            if (n == 1) {
                WG.SendCmd("pty " + Math.random() * 100);
            } else if (n == 2) {

                WG.SendCmd("chat " + Math.random() * 100);
            } else if (n == 3) {

                WG.SendCmd("say " + Math.random() * 100);
            }
            WG.SendCmd(cmds);
        },
        addstore: function (idx, n, cmds) {
            cmds = T.recmd(idx, cmds);
            WG.addstore(n);
            WG.SendCmd(cmds);
        }, addlock: function (idx, n, cmds) {
            cmds = T.recmd(idx, cmds);
            WG.addlock(n);
            WG.SendCmd(cmds);
        }, dellock: function (idx, n, cmds) {
            cmds = T.recmd(idx, cmds);
            WG.dellock(n);
            WG.SendCmd(cmds);
        }, tnbuy: function (idx, n, cmds) {
            cmds = T.recmd(idx, cmds);
            WG.tnBuy();
            WG.SendCmd(cmds);
        }, zxbuy: function (idx, n, cmds) {
            cmds = T.recmd(idx, cmds);
            WG.zxBuy();
            WG.SendCmd(cmds);
        }, atlx: function (idx, n, cmds) {
            cmds = T.recmd(idx, cmds);

            WG.selectLowKongfu(parseInt(n));
            WG.SendCmd(cmds);
        },
        addfenjieid: function (idx, n, cmds) {
            cmds = T.recmd(idx, cmds);
            WG.addfenjieid(n);
            WG.SendCmd(cmds);
        },
        adddrop: function (idx, n, cmds) {
            cmds = T.recmd(idx, cmds);
            WG.adddrop(n);
            WG.SendCmd(cmds);
        }, addzxbuy: function (idx, n, cmds) {
            cmds = T.recmd(idx, cmds);
            WG.addzxbuy(n);
            WG.SendCmd(cmds);
        },
        clsSakada: function (idx, n, cmds) {
            cmds = T.recmd(idx, cmds);
            WG.clean_dps();
            WG.SendCmd(cmds);
        },
        cls: function (idx, n, cmds) {
            cmds = T.recmd(idx, cmds);
            messageClear();
            WG.SendCmd(cmds);
        },
        syso: function (idx, n, cmds) {
            cmds = T.recmd(idx, cmds);
            messageAppend(n);
            WG.SendCmd(cmds);
        },
        stop: function (idx, n, cmds) {
            cmds = T.recmd(idx, cmds);
            WG.timer_close();
            WG.SendCmd(cmds);
        },
        tts: function (idx, n, cmds) {
            cmds = T.recmd(idx, cmds);
            FakerTTS.playtts(n);
            WG.SendCmd(cmds);
        },
        beep: async function (idx, n, cmds) {
            cmds = T.recmd(idx, cmds);
            Beep();
            WG.SendCmd(cmds);
        },
        music: function (idx, n, cmds) {
            cmds = T.recmd(idx, cmds);
            var music = new MusicBox({
                loop: false, // 循环播放
                musicText: '6 - - 5 - 3 2 - 1 - - - 3 - - 2 1 - ·6 ·5 - - - ·5 - ·6 - ·5 - ·6 - 1 - - 2 - 3 5 6 - - 3 2 1 - 2',  // 绿色
                autoplay: 6, // 自动弹奏速度
                type: 'triangle',  // 音色类型  sine|square|triangle|sawtooth
                duration: 2  // 键音延长时间
            });
            WG.SendCmd(cmds);
        }


    };
    var ProConsole = {
        init: function () {
            //判断
            if (!L.isMobile()) {
                layer.open({
                    type: 1,
                    title: "运行命令",
                    shade: false,
                    offset: "rb",
                    zIndex: 961024,
                    success: function (layero, index) {
                        $(".runtesta").show();
                    },
                    content: $(".runtest"),
                    end: function () {
                        $(".runtesta").off("click");
                        $(".runtesta").hide();
                    }
                });
                var lastrun = GM_getValue("_lastrun", "");
                if (lastrun != "") {
                    $("#testmain").val(lastrun);
                }
                $(".runtesta").off("click");
                $(".runtesta").on('click', function () {
                    if ($('#testmain').val().split("\n")[0].indexOf("//") >= 0) {
                        if (unsafeWindow && unsafeWindow.ToRaid) {
                            ToRaid.perform($('#testmain').val());
                        }
                    } else if ($('#testmain').val().split("\n")[0].indexOf("#js") >= 0) {
                        var jscode = $('#testmain').val().split("\n");
                        jscode.baoremove(0)
                        eval(jscode.join(""));
                    } else {
                        WG.SendCmd($('#testmain').val());
                    }

                });
                $("#testmain").focusout(function () {
                    GM_setValue("_lastrun", $('#testmain').val());
                })
            } else {
                layer.prompt({ title: '请输入...', formType: 2 }, function (text, index) {
                    layer.close(index);
                    if (text != null) {
                        if (text.split("\n")[0].indexOf("//") >= 0) {
                            if (unsafeWindow && unsafeWindow.ToRaid) {
                                ToRaid.perform(text);
                            }
                        } else if (text.split("\n")[0].indexOf("#js") >= 0) {
                            var jscode = text.split("\n");
                            jscode.baoremove(0)
                            eval(jscode.join(""));
                        } else {
                            WG.SendCmd(text);
                        }
                    }
                });
            }

        },
        close: function () {
            layer.close();
        }

    }
    //UI
    var UI = {
        codeInput: `<div class="runtest layui-layer-wrap" style="display: none;">
                         <textarea class="site-demo-text" id="testmain" data-enpassusermodified="yes">
                         //<-第一行输入双斜杠即可运行流程命令 ,第一行输入#js 即可运行JS\n
                        </textarea>
                        <a class="layui-btn layui-btn-normal runtesta" style="position:absolute;right:20px;bottom:20px"  >立即运行</a>
                     </div>`,
        zdybtnui: function () {
            let ui = `<div class='WG_button'>`;
            let keyitem = ["Q", "W", "E", "R", "T", "Y"];
            let i = 0;
            for (let item of zdy_btnlist) {
                ui = ui + ` <span class='zdy-item' id = 'keyin${keyitem[i]}'>${item.name}(${keyitem[i]})</span>`;
                i = i + 1;
            }
            return ui + `<span class="zdy-item auto_perform" style="float:right;"> 自动攻击 </span>
                <span class="zdy-item cmd_echo" style="float:right;">代码</span> </div>`;
        },
        btnui: function () {
            return `<div class='WG_button'><span class='zdy-item sm_button'>师门(Q)</span>
            <span class='zdy-item go_yamen_task'>追捕(W)</span>
            <span class='zdy-item kill_all'>击杀(E)</span>
            <span class='zdy-item get_all'>拾取(R)</span>
            <span class='zdy-item sell_all'>清包(T)</span>
            <span class='zdy-item zdwk'>挖矿(Y)</span>
            <span class="zdy-item auto_perform" style="float:right;"> 自动攻击 </span>
                <span class="zdy-item cmd_echo" style="float:right;">代码</span> </div>`
        },
        wgui: function () {
            let p;
            if (inzdy_btn) {
                p = UI.zdybtnui();
            } else {
                p = UI.btnui();
            }
            return ` <div class='WG_log'>
                    <pre></pre>
                </div>` +
                p;
        },
        zdyBtnsetui: function () {
            let ui = '';

            let keyitem = ["Q", "W", "E", "R", "T", "Y"];
            for (let item of keyitem) {
                ui = ui + `<div class="setting-item setting-item2 ">
                 <div style='width:10%'>${item}:</div><span>名称:<input style='width:20%' id='name${item}' /></span> <span style='margin-left:5px'>命令:<input id='send${item}'/></span>
                </div>`
            }
            ui = ui + `
                         <div class="setting-item" >
                <div class="item-commands"><span class="savebtn">保存自定义按钮设置</span></div>
                        </div>
            `;
            return ui;
        },
        html_lninput: function (prop, title) {
            return `
              <div class="setting-item" >
                <span><label for="${prop}">${title}</label><input id="${prop}" name="${prop}" type="text" style="width:80px" value>
                </span>        </div> `;
        },
        html_input: function (prop, title) {
            return `
                 <div class="setting-item" >
                <span><label for="${prop}"> ${title}</label> </span>
              </div>
              <textarea class="settingbox hide zdy-box" id="${prop}" name="${prop}" style="display: inline-block;">  </textarea>
            `;
        },
        html_switch: function (prop, title, pfor) {
            return `<div class="setting-item setting-item2 " for="${pfor}" style='display: inline-block;'>
                <span class="title"> ${title}</span>
                <span class="switch2" id="${prop}" >
                <span class="switch-button"></span>
                <span class="switch-text">关</span>
                </span>
                </div>
                `;
        },
        switchClick: function (e) {
            let t = $(this),
                s = t.parent().attr("for");
            if (t.is(".on")) {
                t.removeClass("on");
                t.find(".switch-text").html("关")
            } else {
                t.addClass("on");
                t.find(".switch-text").html("开");
            }
        },
        syssetting: function () {
            return `<h3>插件</h3>
                    <div class="setting-item zdy_dialog" >
                有空的话请点个star,您的支持是我最大的动力<a href="https://github.com/knva/wsmud_plugins" target="_blank">https://github.com/knva/wsmud_plugins</a>
                </div> `+
                UI.html_lninput("welcome", "欢迎语句： ") +
                UI.html_lninput("die_str", "死亡提示： ") + `
                <div class="setting-item">
                <span> <label for="color_select"> 界面配色： </label><select id="color_select" style="width:80px">
                    <option value="normal"> 原版 </option>
                    <option value="flat"> flat模式 </option>
                    <option value="access"> 色若模式</option>
                </select> *此功能刷新后生效
                </span></div>  
                <div class="setting-item" >
                <span><label for="family">门派选择：</label><select id="family" style="width:80px">
                        <option value="武当">武当</option>
                        <option value="华山">华山</option>
                        <option value="少林">少林</option>
                        <option value="峨眉">峨眉</option>
                        <option value="逍遥">逍遥</option>
                        <option value="丐帮">丐帮</option>
                        <option value="武馆">武馆</option>
                        <option value="杀手楼">杀手楼</option>
                    </select>
                </span>
                </div>`

                + UI.html_switch('autorelogin', '自动重连: ', 'auto_relogin')
                + UI.html_switch('shieldswitch', '聊天频道屏蔽开关: ', 'shieldswitch')
                + UI.html_switch('silence', '安静模式:', 'silence')
                + UI.html_switch('dpssakada', '战斗统计:', 'dpssakada')
                + UI.html_switch('funnycalc', 'funny计算:', 'funnycalc')
                + `<h3>屏蔽选项</h3>`
                + UI.html_lninput("shield", "屏蔽人物名(用半角逗号分隔)：")
                + UI.html_lninput("shieldkey", "屏蔽关键字(用半角逗号分隔)：")

                + `<h3>师门任务配置</h3>`
                + UI.html_switch('sm_loser', '师门自动放弃：', "sm_loser")
                + UI.html_switch('sm_any', '师门任务提交稀有：', "sm_any")
                + UI.html_switch('sm_price', '师门自动牌子：', 'sm_price')
                + UI.html_switch('sm_getstore', '师门自动仓库取：', "sm_getstore")

                + `<h3>自命令配置</h3>
                <div class="setting-item" >
                <span> <label for="zmlshowsetting"> 自命令显示位置： </label><select id="zmlshowsetting" style="width:80px">
                    <option value="0"> 物品栏 </option>
                    <option value="1"> 技能栏下方 </option>
                </select>
                </span></div> `
                + `<h3>武道塔配置</h3>`
                + UI.html_lninput("wudao_pfm", "武道释放技能(用半角逗号分隔)：")
                + `<h3>杂项配置</h3>`
                + UI.html_switch('autorewardgoto', '开启转发路径：', 'auto_rewardgoto')
                + UI.html_switch('busyinfo', '显示昏迷信息：', 'busy_info')
                + UI.html_switch('saveAddr', '使用豪宅仓库：', "saveAddr")
                + UI.html_switch('getitemShow', '显示获得物品：', 'getitemShow')

                + UI.html_input("statehml", "当你各种状态中断后，自动以下操作(部分地点不执行)：")
                + UI.html_input("backimageurl", "背景图片url(建议使用1920*1080分辨率图片)：")
                + UI.html_input("loginhml", "登录后执行命令：") + `
                <div class="setting-item">
                <span> <label for="bagFull"> 背包已满提示： </label><select id="bagFull" style="width:80px">
                    <option value="0"> 文字提醒 </option>
                    <option value="1"> 提示音 </option>
                    <option value="2"> 语音提醒 </option>
                </select>
                </span></div>`
                + `<h3>推送配置</h3>`
                + UI.html_switch('pushSwitch', '远程通知推送开关(使用@push推送通知，语法参考@print)：', 'pushSwitch') + `
                <div class="setting-item">
                <span> <label for="pushType"> 通知推送方式(使用方法加群看)： </label><select id="pushType" style="width:80px">
                    <option value="0"> Server酱(限32字符) </option>
                    <option value="1"> Bark iOS </option>
                    <option value="2"> PushPlus.plus(支持html标签) </option>
                    <option value="3"> 飞书机器人 </option>
                    <option value="4"> Qmsg私聊 </option>
                    <option value="5"> Qmsg群聊 </option>
                </select>
                </span></div> `
                + UI.html_lninput("pushToken", "推送方式对应的Token或Key(只要Key不要填整个网址)：")
                //+ UI.html_lninput("pushUrl", "推演方式对应的推送网址(末尾不要加斜杠/)：")

                + `<h3>自动BOSS配置</h3>`
                + UI.html_switch('marry_kiss', '自动喜宴：', "automarry")
                + UI.html_switch('ks_Boss', '自动传到boss：', "autoKsBoss")
                + UI.html_lninput("auto_eq", "BOSS击杀时自动换装：")
                + UI.html_lninput("ks_pfm", "BOSS叫杀延时(ms)： ")
                + UI.html_lninput("ks_wait", "BOSS击杀等待延迟(s)： ")
                + UI.html_input("auto_command", "输入喜宴及boss后命令(留空为自动挖矿或修炼)：")
                + UI.html_input("blacklist", "输入黑名单boss名称(黑名单boss不会去打,中文,用半角逗号分隔)：")


                + `<h3>自动施法配置</h3>`
                + UI.html_input("unauto_pfm", "自动施法黑名单(填技能代码，使用半角逗号分隔)：")
                + UI.html_switch('autopfmswitch', '自动施法开关：', 'auto_pfmswitch')
                + UI.html_switch('autopfmmode', 'AI施法模式：', 'auto_pfm_mode')


                + `<h3>仓库存储配置</h3>`
                + UI.html_switch('autoupdateStore', '自动更新仓库数据：', 'auto_updateStore')
                + UI.html_input("store_info", "自动存储的物品名称（自动获得的物品信息,随仓库内容更新）：")
                + UI.html_input("store_info2", "手动添加的自动存仓物品信息（不会随仓库内容更新，使用半角逗号分隔）：")
                + UI.html_input("lock_info", "已锁物品名称(锁定物品不会自动丢弃,使用半角逗号分隔)：")
                + UI.html_input("store_drop_info", "输入自动丢弃的物品名称(使用半角逗号分隔)：")
                + UI.html_input("store_fenjie_info", "输入自动分解的物品名称(使用半角逗号分隔)：")

                + UI.html_input("autobuy", "自动当铺购买清单：(用半角逗号分隔)")
                + UI.html_input("autoSkillPaperSell", "自动回收残页清单：(用半角逗号分隔)")

                + `<h3>技能自定义</h3>`
                + UI.html_switch('zdyskillsswitch', '自定义技能顺序开关：', 'zdyskills')

                + UI.html_input("zdyskilllist", "自定义技能顺序json数组：")
                + ` <div class="setting-item" ><div class="item-commands"><span class="clear_skillJson">清空技能json数组</span></div></div>`
                + `

                <div class="setting-item" >
                <div class="item-commands"><span class="update_id_all">初始化ID</span>
                                            <span class="clean_id_all">清空商品ID配置</span></div>
                        </div>
                <div class="setting-item" >
                <div class="item-commands"><span class="update_store">更新存仓数据(覆盖)</span><span class="clean_dps">重置伤害统计</span></div>
                    </div>
                <div class="setting-item" >
                <div class="item-commands"><span class="backup_btn">备份到云</span><span class="load_btn">加载云配置</span></div>
            </div>

            <h3>自定义按钮</h3>`
                + UI.zdyBtnsetui() +
                ` <h3>系统</h3> `
        },

        skillsPanel: `<div class="item-commands" style="text-align:center" id='skillsPanelUI'>
                <div style="margin-top:0.5em">
                    <div style="width:8em;float:left;text-align:left;padding:0px 0px 0px 2em;height:1.23em" id="wsmud_raid_left" @click='show'><wht>{{role}}</wht></div>
                    <div style="width:calc(100% - 16em);float:left;height:1.23em"><hig>套装列表</hig></div>
                    <div style="width:8em;float:left;text-align:right;padding:0px 2em 0px 0px;height:1.23em" id="wsmud_raid_right">
                    <select style="width:80px" id="eqskills-opts" @change="eqskills_opts_change(eqskills_id)" v-model="eqskills_id">
                        <option value="none">选择操作</option>
                        <option value="save">新建套装</option>
                        <option value="covereq">覆盖套装</option>
                        <option value="copyeq">复制命令</option>
                        <option value="delete">删除套装</option>
                        <option value="uneqall">脱光装备</option>
                    </select></div>
                </div>
                <br><br>
				<div class="item-commands">
                <span class="zdy-item"  v-for="(item, index) in eqlistdel" @click='deleq(index)'
                        style="width: 120px;">
                        <div class="eqsname" style="width: 100%;">删除{{index}}</div>
                </span>
				</div>
				<div class="item-commands">
                <span class="zdy-item"  v-for="(item, index) in eqlist" @click='eq(index)'
                        style="width: 120px;">
                        <div class="eqsname" style="width:100%;">装备套装:{{index}}</div>
                </span>

				</div>
                <div class="item-commands">
                <span class="zdy-item"  v-for="(item, index) in covereqlist" @click='covereq(index)'
                        style="width: 120px;">
                        <div class="eqsname" style="width:100%;">覆盖套装:{{index}}</div>
                </span>

				</div>
                <br>
				<div class="item-commands">
                    <span class="zdy-item"  v-for="(item, index) in eqlist" @click='eqs(index)'
                        style="width: 120px;">
                        <div class="eqsname" style="width: 100%;">装备技能:{{index}}</div>
                </span>
				</div>
                <div class="item-commands">
                <span class="zdy-item"  v-for="(item, index) in cpeqlist" @click='copyeq(index)'
                        style="width: 120px;">
                        <div class="eqsname" style="width:100%;">复制装备套装:{{index}}</div>
                </span>

				</div>
                <br>
				<div class="item-commands">
                    <span class="zdy-item"  v-for="(item, index) in cpeqlist" @click='copyeqs(index)'
                        style="width: 120px;">
                        <div class="eqsname" style="width: 100%;">复制装备技能:{{index}}</div>
                </span>
				</div>
                 <br>

                </div>
        `,


        zmlsetting: `<div class='zdy_dialog' style='text-align:right;width:280px' id="zmldialog">
    <div class="setting-item"><span><label for="zml_name"> 输入自定义命令名称:</label></span><span><input id="zml_name"
                style='width:80px' type="text" name="zml_name" value="" v-model="singnalzml.name"></span></div>
    <div class="setting-item"> <label for="zml_type"> 自命令类型： </label><select id="zml_type" style="width:80px"
            v-model="singnalzml.zmlType">
            <option value="0"> 插件原生 </option>
            <option value="1"> Raidjs流程 </option>
            <option value="2"> JS原生 </option>
        </select> </div>
    <div class="setting-item"> <label for="zml_info"> 输入自定义命令(用半角分号(;)分隔):</label></div>
    <div class="setting-item"><textarea class="settingbox hide zdy-box" style="display: inline-block;" id='zml_info'
            v-model="singnalzml.zmlRun"></textarea></div>
    <div class="item-commands"><span class="getSharezml" @click="getShare"> 查询分享 </span> <span class="editadd"
            @click="add"> 保存 </span> <span class="editdel" @click="del"> 删除 </span> </div>
    <div class="item-commands" id="zml_show">
        <span v-for="(item, index) in zmldata" @click="edit(item)">
            编辑{{item.name}}
        </span>
        <br />
        <span v-for="(item, index) in zmldata" @click="showp(item)">
             <label v-if="item.zmlShow == '1'">取消快速使用</label><label v-else>快速使用</label>{{item.name}}
        </span>
        <br />
        <span v-for="(item, index) in zmldata" @click="share(item)">
            分享{{item.name}}
        </span>
        <br />
    </div>
</div> `,




        zmlandztjkui: `<div class='zdy_dialog' style='text-align:right;width:280px' id="zmlandztjk">
     <div class="item-commands"> <span class="editzml" @click="zml"> 编辑自命令 </span> </div>
     <div class="item-commands"> <span class="editztjk" @click="ztjk"> 编辑自定义监控 </span>
         <div class="item-commands"> <span class="startzdjk" @click="startjk"> 注入所有监控 </span> <span class="stopzdjk"
                 @click="stopjk"> 暂停所有监控
             </span>
         </div>
     </div>
     <div class="item-commands" id="zml_show">
                 <span v-for="(item, index) in zmldata" @click="run(item)">
                     {{item.name}}
                 </span>
     </div>
 </div>`, ztjksetting: `<div class='zdy_dialog' style='text-align:right;width:280px'>
    <div class="setting-item"> <label> 请打开插件首页,查看文档及例子,本人血量状态监控 请按如下规则输入关键字 90|90 这样监控的是hp 90% mp 90% 以下触发</label></div>
    <div class="setting-item"> <label for="ztjk_name"> 名称:</label><input id="ztjk_name" style='width:80px' type="text"
            name="ztjk_name" value=""></div>
    <div class="setting-item"><label for="ztjk_type"> 类型(type):</label><select style='width:80px' id="ztjk_type">
            <option value="status"> 状态(status) </option>
            <option value="text"> 文本(text) </option>
            <option value="msg"> 聊天(msg) </option>
            <option value="die"> 死亡(die) </option>
            <option value="itemadd"> 人物刷新(itemadd) </option>
            <option value="room"> 地图名与房间人物(room) </option>
            <option value="dialog"> 背包监控(dialog) </option>
            <option value="combat"> 战斗状态(combat) </option>
            <option value="sc"> 血量状态(sc) </option>
            <option value="enapfm"> 技能监控(enapfm) </option>
            <option value="dispfm"> 技能监控(dispfm) </option>
        </select></div>
    <div class="setting-item"><span id='actionp' style='display:block'><label for="ztjk_action">
                动作(action):</label><input id="ztjk_action" style='width:80px' type="text" name="ztjk_action"
                value=""></span></div>
    <div class="setting-item"><span><label for="ztjk_keyword"> 关键字(使用半角 | 分割):</label><input id="ztjk_keyword"
                style='width:80px' type="text" name="ztjk_keyword" value=""></span></div>
    <div class="setting-item"><span><label for="ztjk_ishave"> 触发对象: </label><select style='width:80px' id="ztjk_ishave">
                <option value="0"> 其他人 </option>
                <option value="1"> 本人 </option>
                <option value="2"> 仅NPC </option>
            </select></span></div>
    <div class="setting-item"> <span id='senduserp' style='display:block'><label for="ztjk_senduser"> MSG/其他人名称(使用半角 |
                分割):</label><input id="ztjk_senduser" style="width:80px;" type="text" name="ztjk_senduser"
                value=""></span></div>
    <div class="setting-item"> <span style='display:block'><label> Buff层数:</label><input id="ztjk_maxcount"
                style="width:80px;" type="text" name="ztjk_maxcount" value=""></span></div>
    <div class="setting-item"> <span style='display:block'><label> 状态监控提示:</label><select style='width:80px'
                id="ztjk_istip">
                <option value="1"> 提示 </option>
                <option value="0"> 不提示 </option>
            </select></span></div>
    <div class="setting-item"><span><label for="ztjk_send"> 输入自定义命令(用半角分号(;)分隔):</label></span></div>
    <div class="setting-item"> <textarea class="settingbox hide zdy-box" style="display: inline-block;"
            id='ztjk_send'></textarea></div>
    <div class="item-commands"><span class="ztjk_sharedfind"> 查询分享 </span> <span class="ztjk_editadd"> 保存 </span> <span
            class="ztjk_editdel"> 删除 </span></div>
    <div class="item-commands" id="ztjk_show"></div>
    <div class="item-commands" id="ztjk_set"></div>
</div> `,
        jsquivue: `
                    <div class="JsqVueUI">
                    <div class="item-commands">
                <span @click='qnjs_btn'>潜能计算</span>
                <span @click='lxjs_btn'>练习时间及潜能计算</span>
                <span @click='khjs_btn'>开花计算</span>
                <span @click='zcjs_btn'>自创等级计算</span>
                <span  @click='getskilljson'>提取技能属性(可用于苏轻模拟器)</span>
                <span  @click='autoAddLianxi'>自动将最低等级技能添加到离线练习</span>
            </div>
            <div class="item-commands">
                <span  @click='onekeydaily'>一键日常</span>
                <span  @click='onekeypk'>自动比试</span>
                <span  @click='onekeysansan'>导入白三三懒人包（依赖raid.js）</span>
                <span  @click='onelddh'>来点动画（依赖raid.js）</span>
            </div>
            <div class="item-commands">
                <span  @click="onekeystore">存仓及贩卖</span>
                <span  @click='onekeysell'>丢弃及贩卖</span>
                <span  @click='onekeyfenjie'>分解及贩卖</span>
            </div>
            <div class="item-commands">
                <span @click='updatestore'>更新仓库数据(覆盖)</span>
                <span @click='sortstore'>排序仓库</span>
                <span @click='sortbag'>排序背包</span>
                <span @click='dsrw'>定时任务</span>
                <span @click='cleandps'>清空伤害</span>
                <span @click='cleankksboss'>不再提示婚宴及boss传送信息</span>
            </div>
            <div class="item-commands">
                <span @click='onekeyyaota'>一键妖塔</span>
                <span @click='onekeydelaytest'>延迟测试</span>
                <span @click='yuanshen'>原神</span>
            </div>
            </div>`,
        lxjsui: `
                       <div style="width:50%;float:left" class='StudyTimeCalc'>
     <div class="setting-item"> <span>练习时间计算器</span></div>
     <div class="setting-item">先天悟性:<input type="number"  placeholder="先天悟性" style="width:50%"
             class="mui-input-speech" v-model=jsqsx.xtwx></div>
     <div class="setting-item">后天悟性:<input type="number"  placeholder="后天悟性" style="width:50%"
             class="mui-input-speech" v-model=jsqsx.htwx></div>
     <div class="setting-item">练习效率:<input type="number"  placeholder="练习效率" style="width:50%"
             class="mui-input-speech" v-model=jsqsx.lxxl></div>
     <div class="setting-item">初始等级:<input type="number" placeholder="初始等级" style="width:50%"
             class="mui-input-speech" v-model=jsqsx.clevel></div>
     <div class="setting-item"> 目标等级:<input type="number" placeholder="目标等级" style="width:50%"
             v-model=jsqsx.mlevel></div>
     <div class="setting-item">技能颜色: <select style="width:50%" v-model=jsqsx.color>
             <option value='0'>选择技能颜色</option>
             <option value='1' style="color: #c0c0c0;">白色</option>
             <option value='2' style="color:#00ff00;">绿色</option>
             <option value='3' style="color:#00ffff;">蓝色</option>
             <option value='4' style="color:#ffff00;">黄色</option>
             <option value='5' style="color:#912cee;">紫色</option>
             <option value='6' style="color: #ffa600;">橙色</option>
             <option value='7' style="color: #CC0000;">红色</option>
         </select></div>
                <div class="setting-item">
        <div class="item-commands"><span @click="lxjscalc">计算</span></div>
             </div>
    </div>`,
        qnjsui: ` <div style="width:50%;float:left" class="QianNengCalc">
    <div class="setting-item"> <span>潜能计算器</span></div>
    <div class="setting-item">初始等级:<input type="number" placeholder="初始等级" style="width:50%"
            class="mui-input-speech" v-model='qnsx.c'>
    </div>
    <div class="setting-item"> 目标等级:<input type="number" v-model='qnsx.m' placeholder="目标等级" style="width:50%">
    </div>
    <div class="setting-item"> 技能颜色:<select id="se" style="width:50%" v-model='qnsx.color'>
            <option value='0'>选择技能颜色</option>
            <option value='1' style="color: #c0c0c0;">白色</option>
            <option value='2' style="color:#00ff00;">绿色</option>
            <option value='3' style="color:#00ffff;">蓝色</option>
            <option value='4' style="color:#ffff00;">黄色</option>
            <option value='5' style="color:#912cee;">紫色</option>
            <option value='6' style="color: #ffa600;">橙色</option>
        </select>
        </div>
        <div class="setting-item">
        <div class="item-commands"><span @click="qnjscalc">计算</span></div>
             </div>

</div>`,
        khjsui: `<div style="width:50%;float:left" class="KaihuaCalc">
    <div class="setting-item"><span>开花计算器</span></div>
    <div class="setting-item"> 当前内力:<input type="number" placeholder="当前内力" style="width:50%"
            class="mui-input-speech" v-model="khsx.nl"></div>
    <div class="setting-item"> 先天根骨:<input type="number" placeholder="先天根骨" style="width:50%"
        v-model="khsx.xg"></div>
    <div class="setting-item"> 后天根骨:<input type="number" placeholder="后天根骨" style="width:50%"
        v-model="khsx.hg"></div>
    <div class="setting-item">      <div class="item-commands"><span @click="khjscalc" >计算</span></div></div>
    <div class="setting-item"> <label>人花分值：5000 地花分值：6500 天花分值：8000</label></div>
</div>`,
        zcjsui: `<div style="width:50%;float:left" class="ZiChuangCalc">
    <div class="setting-item"><span>自创等级计算器</span></div>
    <div class="setting-item"> 自创等级:<input type="number" placeholder="自创等级" style="width:50%"
            class="mui-input-speech" v-model="zcsx.level"></div>
    <div class="setting-item"> 目标属性百分比:<input type="number" placeholder="目标属性百分比" style="width:50%"
        v-model="zcsx.percentage"></div>

    <div class="setting-item">      <div class="item-commands"><span @click="zcjscalc" >计算</span></div></div>

</div>`,
        lyui: `<div class='zdy_dialog' id="LianYao" style='text-align:right;width:280px'> 有空的话请点个star,您的支持是我最大的动力 <a target="_blank"
        href="https://github.com/knva/wsmud_plugins">https://github.com/knva/wsmud_plugins</a> 药方链接:<a target="_blank"
        href="https://emeisuqing.github.io/wsmud.old/yaofang/">https://emeisuqing.github.io/wsmud.old/yaofang/</a>
    <div class="setting-item"> <span> <label for="medicine_level"> 级别选择： </label><select style='width:80px'
                id="medicine_level" v-model="level">
                <option value="1">绿色</option>
                <option value="2">蓝色</option>
                <option value="3">黄色</option>
                <option value="4">紫色</option>
                <option value="5">橙色</option>
                <option value="6">红色</option>
            </select></span></div>
    <div class="setting-item"> 数量:<span><input id="mednum" v-model="num" style="width:80px;" type="number" name="mednum" value="1">
        </span></div>
    <div class="setting-item"> <span><label for="medicint_info"> 输入使用的顺序(使用半角逗号分隔,多配方使用 | 分割):</label></span></div>
    <div class="setting-item"><textarea v-model="info"  class="settingbox hide zdy-box" style="display: inline-block;"
            id='medicint_info'>石楠叶,金银花,金银花,金银花,当归</textarea></div>
    <div class="item-commands"> <span class="startDev" @click="startDev"> 开始 </span><span class="stopDev" @click="stopDev"> 停止 </span> </div>
</div>`,
        timeoutui: `<div class='zdy_dialog' style='text-align:right;width:280px'> 注意,可以留空的时或者分,这样就是每分钟/小时 的x秒触发任务,秒为必填项目 <div class="setting-item">    <span>任务名:<input type="text" id="questname" placeholder="任务名" style="width:50%"></span></div> <div class="setting-item">     <label for = "rtype"> 运行次数 </label><select style='width:80px' id="rtype"></div> <option value="1">一次</option> <option value="2">每天</option> </select></span></div> <div class="setting-item">  <span>时:<input type="number" id="ht" placeholder="时" style="width:50%"></span></div> <div class="setting-item">   <span>分:<input type="number" id="mt" placeholder="分" style="width:50%"></span></div> <div class="setting-item">  <span>秒:<input type="number" id="st" placeholder="秒" style="width:50%"></span></div> <div class="setting-item">  <span><label for="zml_info"> 输入自定义命令(用半角分号(;)分隔):</label></span></div> <div class="setting-item">   <textarea class = "settingbox hide zdy-box"style = "display: inline-block;"id = 'zml_info'></textarea></div> <div class = "item-commands"> <span class = "startQuest"> 开始 </span><span class = "removeQuest"> 删除 </span>  </div> <div class='questlist item-commands'></div> </div>`,
        toui: [
            `<div class='item-commands'><span cmd = "$to 扬州城-衙门正厅" > 衙门 </span>
            <span cmd = "$to 扬州城-当铺" > 当铺 </span>
            <span cmd = "$to 扬州城-醉仙楼" > 醉仙 </span>
            <span cmd = "$to 扬州城-杂货铺" > 杂货 </span>
            <span cmd = "$to 扬州城-打铁铺" > 打铁 </span>
            <span cmd = "$to 扬州城-钱庄" > 钱庄 </span>
            <span cmd = "$to 扬州城-药铺" > 药铺 </span>
            <span cmd = "$to 扬州城-扬州武馆" > 武馆 </span>
            <span cmd = "$to 扬州城-镖局正厅" > 镖局 </span>
            <span cmd = "$to 住房" > 住房 </span>
            <span cmd = "$to 扬州城-武庙" > 武庙 </span>
            <span cmd = "$to 帮会-大院" > 帮派 </span>
            <span cmd = "$to 扬州城-赌场" > 赌场 </span>
            <span cmd = "$to 扬州城-有间客栈" > 客栈 </span>
            <span cmd = "$to 扬州城-擂台" > 擂台 </span>
            <span cmd = "$to 扬州城-矿山" > 矿山 </span></div>`,
            `<div class='item-commands'><span cmd = "$to 武当派-后山小院" >掌门</span>
             <span cmd = "$to 武当派-石阶" >后勤</span>
             <span cmd = "$to 武当派-三清殿" >三清殿</span></div>`,
            `<div class='item-commands'><span cmd = "$to 少林派-方丈楼" >掌门</span>
             <span cmd = "$to 少林派-山门殿" >后勤</span>
             <span cmd = "$to 少林派-天王殿" >天王殿</span></div>`,
            `<div class='item-commands'><span cmd = "$to 华山派-客厅" >掌门</span>
             <span cmd = "$to 华山派-练武场" >后勤</span>
             <span cmd = "$to 华山派-落雁峰" >落雁峰</span>
             <span cmd = "$to 华山派-林间小屋" >封不平</span></div>`,
            `<div class='item-commands'><span cmd = "$to 峨眉派-清修洞" >掌门</span>
            <span cmd = "$to 峨眉派-走廊" >后勤</span>
            <span cmd = "$to 峨眉派-小屋" >周芷若</span>
            <span cmd = "$to 峨眉派-大殿" >静心</span></div>`,
            `<div class='item-commands'><span cmd = "$to 逍遥派-地下石室" >掌门</span>
             <span cmd = "$to 逍遥派-林间小道" >后勤</span>
             <span cmd = "$to 逍遥派-木屋" >薛慕华</span>
             <span cmd = "$to 逍遥派-练功房" >木桩</span></div>`,
            `<div class='item-commands'><span cmd = "$to 丐帮-林间小屋" >掌门</span>
             <span cmd = "$to 丐帮-暗道;go east;" >后勤</span>
             <span cmd = "$to 丐帮-土地庙" >土地庙</span></div>`,
            `<div class='item-commands'><span cmd = "$to 杀手楼-书房" >掌门</span>
             <span cmd = "$to 杀手楼-休息室;" >后勤</span></div>`,
            `<div class='item-commands'><span cmd = "@call 自动襄阳" >自动襄阳</span></div>`,
            `<div class='item-commands'><span cmd = "@call 自动武道塔" >自动武道塔</span>
            <span cmd = "$goyt">妖塔</span>
            <span cmd = "$gogzm">古宗门</span>
            <span cmd = "$godddb">大殿底部</span></div>`
        ],
        fbui: function (name, mulit, diffi) {
            let ui = `<div class='item-commands'>`;
            if (unsafeWindow && unsafeWindow.ToRaid) {
                if (ToRaid.existAutoDungeon(`${name} 0`)) {
                    ui = ui + `<span cmd = "@fb ${name} 0" >自动副本-${name}</span>`;
                }
                if (diffi) {
                    if (ToRaid.existAutoDungeon(`${name} 1`)) {
                        ui += `<span cmd = "@fb ${name} 1" >自动副本-${name}-困难</span>`;
                    }
                }
                if (mulit) {
                    if (ToRaid.existAutoDungeon(`${name} 2`)) {
                        ui += `<span cmd = "@fb ${name} 2" >自动副本-${name}-组队</span>`;
                    }
                }
            } else {
                ui += `未安装Raid.js插件`;
            }
            if (ui == `<div class='item-commands'>`) {
                return `<div>暂无自动副本脚本,欢迎共享。可以到三三仓库寻找更多脚本。</div>`
            } else {
                return ui + `</div>`;
            }

        },
        itemui: function (itemname) {
            itemname = itemname.toLowerCase();
            let ui = `<div class="item-commands ">
            <span class = "addstore" cmd='$addstore ${itemname}'> 添加到存仓 </span>`;
            if (lock_list.indexOf(itemname) >= 0) {
                ui = ui + `<span class = "dellock" cmd='$dellock ${itemname}'> 移除物品锁 </span>`;
            } else {
                ui = ui + `<span class = "addlock" cmd='$addlock ${itemname}'> 添加物品锁 </span>`;
            }

            if (itemname.indexOf("★") >= 0 || itemname.indexOf("☆") >= 0 || itemname.indexOf("hio") >= 0 || itemname.indexOf("hir") >= 0 || itemname.indexOf("ord") >= 0) {
                ui = ui + `</div>`;
            } else {
                if (itemname.indexOf("残页") >= 0 && itemname != "武道残页") {
                    ui = ui + `<span class = "addzxbuy"  cmd='$addzxbuy ${itemname}'> 添加到回收 </span>`;
                } else {
                    ui = ui + `<span class = "addfenjieid"  cmd='$addfenjieid ${itemname}'> 添加到分解 </span>`;
                }
                if (lock_list.indexOf(itemname) == -1) {
                    ui = ui + `<span class = "adddrop" cmd='$adddrop ${itemname}'> 添加到丢弃 </span>`;
                }
                ui = ui + `</div>`;
            }

            return ui;
        },

    }

    //全局变量
    var G = {
        id: undefined,
        state: undefined,
        room_name: undefined,
        family: undefined,
        items: new Map(),
        stat_boss_success: 0,
        stat_boss_find: 0,
        stat_xiyan_success: 0,
        stat_xiyan_find: 0,
        cds: new Map(),
        in_fight: false,
        fight_id: "",
        auto_preform: false,
        auto_pfm_mode: false,
        can_auto: false,
        level: undefined,
        getitemShow: undefined,
        wk_listener: undefined,
        status: new Map(),
        score: undefined,
        party: '',
        yaoyuan: 0,
        yaotaFlag: false,
        yaotaCount: 0,
        jy: 0,
        qn: 0,
        selfStatus: [],
        wsdelaySetTime: undefined,
        wsdelaySetCount: undefined,
        wsdelay: undefined,
        enable_skills: [{ type: "unarmed", name: "none" },
        { type: "force", name: "none" },
        { type: "parry", name: "none" },
        { type: "dodge", name: "none" },
        { type: "sword", name: "none" },
        { type: "throwing", name: "none" },
        { type: "blade", name: "none" },
        { type: "whip", name: "none" },
        { type: "club", name: "none" },
        { type: "staff", name: "none" },],

        eqs: [],
        isGod: function () {
            if (G.level != null) {
                if (G.level.indexOf('武帝') >= 0 ||
                    G.level.indexOf('武神') >= 0 ||
                    G.level.indexOf('剑神') >= 0 ||
                    G.level.indexOf('刀皇') >= 0 ||
                    G.level.indexOf('兵主') >= 0 ||
                    G.level.indexOf('战神') >= 0) {
                    return true
                } else {
                    return false
                }
            } else {
                return false
            }
        },
        cookie: undefined,
        connected: false
    };

    //GlobalInit
    var GI = {
        gcdThread: null,
        init: function () {
            WG.add_hook("items", function (data) {
                WG.saveRoomstate(data);
            });
            var sendStore = false;
            WG.add_hook(['dialog', 'text'], function (data) {
                if (data.type == "dialog") {
                    if (WG.packup_listener == null && data.id != null && data.store != null) {
                        if (sendStore) {
                            WG.SendCmd("store")
                            sendStore = false;
                        }
                    }
                    var stores = data.stores;
                    if (stores != null) {
                        store_list = [];
                        for (let store of stores) {
                            store_list.push(store.name.toLowerCase());
                        }
                        zdy_item_store = store_list.join(',');
                        $('#store_info').val(zdy_item_store);
                        GM_setValue(roleid + "_zdy_item_store", zdy_item_store);
                        store_list = store_list.concat(zdy_item_store2.split(","));
                    }
                }
                else {
                    auto_updateStore = GM_getValue(roleid + "_auto_updateStore", auto_updateStore);
                    if (WG.sort_hook == null && auto_updateStore == "开" && data.msg.indexOf("书架") < 0 &&
                        (/^你把(.+)存入仓库。$/.test(data.msg) || /^你从仓库里取出(.+)。$/.test(data.msg))) {
                        sendStore = true;

                    }
                }

            });
            WG.add_hook("dialog", function (data) {
                if (data.dialog == "pack" && data.items != undefined) {
                    packData = data.items;
                    eqData = data.eqs;
                    G.eqs = data.eqs
                }
                if (data.dialog == "pack" && data.uneq != undefined) {
                    G.eqs[data.uneq] = null;
                }
                if (data.dialog == "pack" && data.eq != undefined) {
                    G.eqs[data.eq] = { id: data.id, name: "" };
                }
                if (data.dialog == "skills") {
                    if (data.enable != null && zdyskills == "开") {
                        zdyskilllist == "";
                        messageAppend("检测到更换技能,请刷新重新获取技能数据!");
                        zdyskills = "关";
                        GM_setValue(roleid + "_zdyskilllist", "");
                        GM_setValue(roleid + "_zdyskills", zdyskills);
                    }
                    if (data.items) {
                        for (let item of data.items) {
                            if (item.name.indexOf("基本") >= 0) {
                                if (item.enable_skill) {
                                    for (let eitem of G.enable_skills) {
                                        if (eitem.type == item.id) {
                                            eitem.name = item.enable_skill
                                            break;
                                        }
                                    }
                                } else {
                                    for (let eitem of G.enable_skills) {
                                        if (eitem.type == item.id) {
                                            eitem.name = 'none'
                                            break;
                                        }
                                    }
                                    // G.enable_skills.push({ name: 'none', type: item.id })
                                }
                            }
                        }
                    }
                    if (data.enable != undefined) {
                        for (let item of G.enable_skills) {
                            if (item.type == data.id) {
                                item.name = data.enable
                                break;
                            }
                        }
                    }
                }
                if (data.dialog == 'party') {
                    G.party = data.name;
                }


            });
            WG.add_hook(["status", "login", "exits", "room", "items", "itemadd", "itemremove", "sc", "text", "state", "msg", "perform", "clearDistime", "dispfm", "combat", "die"], function (data) {
                switch (data.type) {
                    case "login":
                        G.id = data.id;
                        G.connected = true;
                        WG.online = true;
                        break;
                    case "exits":
                        G.exits = new Map();
                        if (data.items["north"]) {
                            G.exits.set("north", {
                                exits: data.items["north"]
                            });
                        }
                        if (data.items["south"]) {
                            G.exits.set("south", {
                                exits: data.items["south"]
                            });
                        }
                        if (data.items["east"]) {
                            G.exits.set("east", {
                                exits: data.items["east"]
                            });
                        }
                        if (data.items["west"]) {
                            G.exits.set("west", {
                                exits: data.items["west"]
                            });
                        }
                        if (data.items["northup"]) {
                            G.exits.set("northup", {
                                exits: data.items["northup"]
                            });
                        }
                        if (data.items["southup"]) {
                            G.exits.set("southup", {
                                exits: data.items["southup"]
                            });
                        }
                        if (data.items["eastup"]) {
                            G.exits.set("eastup", {
                                exits: data.items["eastup"]
                            });
                        }
                        if (data.items["westup"]) {
                            G.exits.set("westup", {
                                exits: data.items["westup"]
                            });
                        }
                        if (data.items["northdown"]) {
                            G.exits.set("northdown", {
                                exits: data.items["northdown"]
                            });
                        }
                        if (data.items["southdown"]) {
                            G.exits.set("southdown", {
                                exits: data.items["southdown"]
                            });
                        }
                        if (data.items["eastdown"]) {
                            G.exits.set("eastdown", {
                                exits: data.items["eastdown"]
                            });
                        }
                        if (data.items["westdown"]) {
                            G.exits.set("westdown", {
                                exits: data.items["westdown"]
                            });
                        }
                        if (data.items["up"]) {
                            G.exits.set("up", {
                                exits: data.items["up"]
                            });
                        }
                        if (data.items["down"]) {
                            G.exits.set("down", {
                                exits: data.items["down"]
                            });
                        }
                        if (data.items["enter"]) {
                            G.exits.set("enter", {
                                exits: data.items["enter"]
                            });
                        }
                        if (data.items["out"]) {
                            G.exits.set("out", {
                                exits: data.items["out"]
                            });
                        }
                        break;
                    case "room":
                        let tmp = data.path.split("/");
                        G.map = tmp[0];
                        G.room = tmp[1];
                        if (G.map == 'home' || G.room == 'kuang')
                            G.can_auto = true;
                        else
                            G.can_auto = false;

                        G.room_name = data.name;
                        //强制结束pfm
                        if (G.in_fight) {
                            G.in_fight = false;
                            WG.auto_preform("stop");
                            WG.clean_dps();
                        }
                        break;
                    case "items":
                        G.items = new Map();
                        for (var i = 0; i < data.items.length; i++) {
                            let item = data.items[i];
                            if (item.id) {
                                if (item.id == G.id && item.status != null) {
                                    G.selfStatus = []
                                    for (var x = 0; x < item.status.length; x++) {
                                        G.selfStatus.push(item.status[x].sid)
                                    }
                                }
                                let n = $.trim($('<body>' + item.name + '</body>').text());
                                let i = n.lastIndexOf(' ');
                                let j = n.lastIndexOf('<');
                                let t = "";
                                let s = "";
                                if (j >= 0) {
                                    s = n.substr(j + 1, 2);
                                }
                                if (i >= 0) {
                                    t = n.substr(0, i);
                                    n = n.substr(i + 1).replace(/<.*>/g, '');
                                }

                                G.items.set(item.id, {
                                    name: n,
                                    title: t,
                                    state: s,
                                    max_hp: item.max_hp,
                                    max_mp: item.max_mp,
                                    hp: item.hp,
                                    mp: item.mp,
                                    p: item.p,
                                    damage: 0,
                                    status: item.status
                                });
                            }
                        }
                        break;
                    case "itemadd":
                        if (data.id) {
                            let n = $.trim($('<body>' + data.name + '</body>').text());
                            let i = n.lastIndexOf(' ');
                            let j = n.lastIndexOf('<');
                            let t = "";
                            let s = "";
                            if (i >= 0) {
                                t = n.substr(0, i);
                                if (j >= 0) {
                                    s = n.substr(j + 1, 2);
                                }
                                n = n.substr(i + 1).replace(/<.*>/g, '');
                            }
                            G.items.set(data.id, {
                                name: n,
                                title: t,
                                state: s,
                                max_hp: data.max_hp,
                                max_mp: data.max_mp,
                                hp: data.hp,
                                mp: data.mp,
                                p: data.p,
                                damage: 0,
                                status: data.status
                            });
                        }
                        break;
                    case "itemremove":
                        G.items.delete(data.id);
                        break
                    case "sc":
                        let xitem = G.items.get(data.id);
                        if (data.hp !== undefined) {
                            xitem.hp = data.hp;
                            if (data.id != G.id) {
                                G.scid = data.id; //伤害统计需要
                            }
                            // WG.showallhp();
                        }
                        if (data.mp !== undefined) {
                            xitem.mp = data.mp;
                        }
                        if (data.id != G.id) break;
                        if (data.hp != null) G.hp = data.hp;
                        if (data.max_hp != null) G.maxHp = data.max_hp;
                        if (data.mp != null) G.mp = data.mp;
                        if (data.max_mp != null) G.maxMp = data.max_mp;
                        break
                    case "perform":
                        G.skills = data.skills;
                        if (zdyskilllist == "") {
                            zdyskilllist = JSON.stringify(data.skills);
                            GM_setValue(roleid + "_zdyskilllist", zdyskilllist);
                        }
                        break
                    case 'clearDistime':
                        G.cds.forEach(function (v, k) {
                            G.cds.set(k, false);
                        });
                    case 'dispfm':
                        if (data.id) {
                            if (data.distime) { }
                            G.cds.set(data.id, true);
                            var _id = data.id;
                            setTimeout(function () {
                                G.cds.set(_id, false);
                                //技能cd时间到
                                let pfmtimeTips = {
                                    data: JSON.stringify({
                                        type: "enapfm",
                                        id: _id
                                    })
                                };
                                WG.receive_message(pfmtimeTips);
                            }, data.distime);
                        }
                        if (data.rtime) {
                            if (G.gcd) {
                                clearTimeout(GI.gcdThread);
                            }
                            G.gcd = true;
                            GI.gcdThread = setTimeout(function () {
                                G.gcd = false;
                            }, data.rtime);
                        }
                        break
                    case "combat":
                        if (data.start) {
                            G.in_fight = true;
                            battletime = new Date();
                            WG.auto_preform();
                        }
                        if (data.end) {
                            G.in_fight = false;
                            WG.auto_preform("stop");
                            WG.clean_dps();
                        }
                        break
                    case "status":
                        if (data.count != undefined) {
                            G.status.set(data.id, {
                                "sid": data.sid,
                                "count": data.count
                            });
                        }
                        if (data.id == G.id) {
                            if (data.action == 'add') {
                                G.selfStatus.push(data.sid)
                                if (data.duration) {
                                    setTimeout(() => {
                                        G.selfStatus.remove(data.sid);
                                    }, data.duration - (data.overtime || 0));
                                }
                            } else if (data.action == 'remove') {
                                let tmpbufflist = []
                                for (let i = 0; i < G.selfStatus.length; i++) {
                                    if (G.selfStatus[i] != data.sid) {
                                        tmpbufflist.push(G.selfStatus[i])
                                    }
                                }
                                G.selfStatus = tmpbufflist;
                            } else if (data.action == 'clear') {
                                G.selfStatus = []
                            }
                        }
                        if (busy_info === '开') {
                            if (data.id == G.id) {
                                if (data.action == 'add') {
                                    if (data.sid == 'busy' || data.sid == 'faint') {
                                        var _id = data.id;
                                        messageAppend(`你被${data.name}了${data.duration / 1000}秒`, 2, 0);
                                        if (data.name == '绊字诀') return;
                                    }
                                }
                            } else {
                                if (data.action == 'add') {
                                    if (data.sid == 'busy' || data.sid == 'faint' || data.sid == 'chidun' || data.sid == 'unarmed') {
                                        let npc = G.items.get(data.id)
                                        messageAppend(`${npc.name}被${data.name}了${data.duration / 1000}秒`, 2, 0);
                                    }
                                }
                            }
                        }
                        let item = G.items.get(data.id);
                        if (item == null) {
                            break;
                        }
                        if (data.action == 'add') {
                            if (item.status == null) {
                                item.status = [];
                            }
                            item.status.push({ sid: data.sid, name: data.name, duration: data.duration, overtime: 0 });
                        } else if (data.action == 'remove') {
                            for (let i = 0; i < item.status.length; i++) {
                                let s = item.status[i];
                                if (s.sid == data.sid) {
                                    item.status.splice(i, 1);
                                    break;
                                }
                            }
                        } else if (data.action == 'clear') {
                            for (let i = 0; i < item.status.length; i++) {
                                item.status.splice(i, 1);
                            }
                        }
                        break
                    case "text":
                        if (data.msg.indexOf("还没准备好，你还不能使用。") >= 0) {
                            // let skillname = data.msg.replaceAll("还没准备好，你还不能使用。","");
                            // let skillid = G.skills.map(e => { return e['name'] == skillname ? e['id'] : '' }).join("")
                            // if (skillid!=''){
                            //     G.cds.set(skillid,true)
                            //     setTimeout(() => {
                            //         G.cds.set(skillid,false)
                            //     }, 1000);
                            // }
                            if (!G.gcd) {
                                G.gcd = true;
                                setTimeout(() => {
                                    G.gcd = false
                                }, 500);
                            }
                        }
                        if ((data.msg.indexOf("不要急") >= 0 || data.msg.indexOf("你现在手忙脚乱") >= 0 ||
                            data.msg.indexOf("你正在昏迷") >= 0 || data.msg.indexOf("你上个技能") >= 0) && G.auto_preform) {
                            if (!G.gcd) {
                                G.gcd = true;
                                setTimeout(() => {
                                    G.gcd = false
                                }, 500);
                            }
                        }
                        break
                    case 'die':
                        // console.log('死亡，清除bf')
                        G.selfStatus = []

                        if (die_str != '' && data.relive == null) {
                            textShow(die_str)
                        }
                        break;
                    default:
                        break;
                }
            });
            WG.add_hook("state", function (data) {
                console.dir(data);
                if (data.type == 'state' && data.state == undefined) {
                    if (G.room_name.indexOf('副本') >= 0 || G.room_name.indexOf('襄阳') >= 0 ||
                        G.room_name.indexOf('矿山') >= 0 || G.room_name.indexOf('练功房') >= 0) {
                        return;
                    }
                    statehml = GM_getValue(roleid + '_statehml', statehml);
                    WG.SendCmd(statehml);
                }

            });
            WG.add_hook("dialog", function (data) {
                //console.dir(data);
                if (data.dialog == "pack" && data.items != undefined && data.items.length >= 0) {
                    //equip =
                    for (var i = 0; i < data.items.length; i++) {
                        if (data.items[i].name.indexOf("铁镐") >= 0) {
                            equip["铁镐"] = data.items[i].id;
                            //messageAppend("铁镐ID:" + data.items[i].id);
                        }
                    }
                    for (var j = 0; j < data.eqs.length; j++) {
                        if (data.eqs[j] != null && data.eqs[j].name.indexOf("铁镐") >= 0) {
                            equip["铁镐"] = data.eqs[j].id;
                            //messageAppend("铁镐ID:" + data.eqs[j].id);
                        }
                    }

                } else if (data.dialog == 'pack' && data.desc != undefined) {
                    messageClear();
                    var itemname = data.desc.split("\n")[0];
                    var htmla = `<div class="item-commands ">
                <span class = "copyid" data-clipboard-target = ".target1" > ` + itemname + ":" + data.id +
                        `复制到剪贴板 </span></div>
                         `;
                    messageAppend(htmla);
                    $(".copyid").off("click");
                    $(".copyid").on('click', () => {
                        var copydata = data.id;
                        GM_setClipboard(copydata);
                        messageAppend("复制成功");
                    });


                } else if (data.dialog == 'pack' && data.name != null) {
                    let item = {
                        id: data.id,
                        name: data.name,
                        count: data.count
                    }
                    packData.push(item)
                } else if (data.dialog == 'list' && data.stores != null) {
                    storeData = data.stores;
                    // packData.push(item)
                } else if (data.dialog == 'list' && data.store != null) {
                    let scan_store = true;
                    let bag_remove_id = null;
                    let store_remove_id = null;

                    for (let i = 0; i < packData.length; i++) {
                        let bag_item = packData[i];
                        if (bag_item == null) { continue; }
                        if (bag_item.id == data.id) {     // 道具存于背包时, 先判断数量  若数量为0 删除背包数据,若不为0 修改背包数据
                            scan_store = false;
                            let over_num = bag_item.count - data.store;
                            if (over_num == 0) {
                                // packData.splice(i, 1)
                                bag_remove_id = i;
                            } else {
                                packData[i].count = over_num;
                            }
                            break;
                        }
                    }
                    if (scan_store) {   // 如果不存在于背包时, 添加数据到背包,并判断仓库数量
                        for (let j = 0; j < storeData.length; j++) {
                            let store_item = storeData[j];
                            if (store_item == null) { continue; }
                            if (store_item.id == data.storeid) {
                                let item = {
                                    id: data.id,
                                    name: store_item.name,
                                    count: Math.abs(data.store)
                                }
                                //更新背包
                                packData.push(item);
                                break;
                            }

                        }
                    }
                    //计算仓库数据,若仓库存在该数据 修改其数量,若不存在 则添加,如果计算后数量为0 则删除该条数据
                    let found_store = true;
                    for (let j = 0; j < storeData.length; j++) {
                        let store_item = storeData[j];
                        if (store_item == null) { continue; }

                        if (store_item.id == data.id) {
                            found_store = false;
                            let store_count = store_item.count + data.store;
                            if (store_count === 0) {
                                // storeData.splice(j, 1)
                                store_remove_id = j;
                            } else {
                                storeData[j].count = store_count;
                            }
                            break;
                        }

                    }
                    if (found_store) {
                        for (let j = 0; j < packData.length; j++) {
                            let store_item = packData[j];
                            if (store_item == null) { continue; }
                            if (store_item.id === data.id) {
                                let item = {
                                    id: data.stroeid,
                                    name: store_item.name,
                                    count: Math.abs(data.store)
                                }
                                //更新背包
                                storeData.push(item)
                                break;
                            }
                        }
                    }
                    // 移除队列数据
                    if (bag_remove_id != null) {
                        packData.splice(bag_remove_id, 1)
                    }
                    if (store_remove_id != null) {
                        storeData.splice(store_remove_id, 1)
                    }

                } else if (data.dialog == 'pack' && data.jldesc != undefined) {
                    let jl = data.jldesc.match(/<(.*)>(.*)<\/.*><br\/>精炼<(hig|hic|hiy|hiz|hio|ord)>＋(.*)\s</i);
                    if (jl) {
                        let l = jl[1];
                        let n = `<${l}>` + jl[2] + `</${l}>`;
                        let j = parseInt(jl[4]);
                        let c = 13 - j;
                        //let cmd = `jinglian ${data.id} ok[${c}]`
                        let cmd = [];
                        for (let i = 0; i < c; i++) {
                            cmd.push(`jinglian ${data.id} ok`);
                        }
                        $(".content-message pre").append(
                            $(`<div class="item-commands"><span class="jinglian">精炼6星 => ${n}</span></div>`).click(() => WG.SendCmd(cmd)),
                        );
                        AutoScroll(".content-message");
                    }
                }
                if (data.dialog == 'score') {

                    console.log("score update");
                    if (!G.level && (data.level != null)) {
                        G.level = data.level;
                        console.log("欢迎" + G.level);
                    }
                    if (!G.family && (data.family != null)) {
                        G.pfamily = data.family;
                        G.family = data.family.replaceAll('派', '');
                        console.log(G.family);
                        if (G.family == "无门无") {
                            G.family = "武馆";
                        }
                        family = G.family;
                        G.score = data;
                        GM_setValue(roleid + "_family", G.family);
                    } else if (data.study_per != null) {
                        G.score2 = data;
                    }
                    if (data.hp && data.mp && data.pot) {
                        G.score = data;
                    }
                }
            });
            //师门id自动刷新
            WG.add_hook(["dialog", "items"], (data) => {
                if (data.type == 'dialog') {
                    if (data.selllist) {
                        for (let item of data.selllist) {
                            let realname = item.name.replace(/<[^>]+>/g, ""); //去尖括号
                            let _gtype = /<([^<>]*)>/.exec(item.name)[1]
                            if (pgoods[realname] != undefined) {
                                pgoods[realname].id = item.id;
                            }
                            if (pgoods[_gtype + realname] != undefined) {
                                pgoods[_gtype + realname].id = item.id;
                            }
                        }
                        GM_setValue("goods", pgoods);
                    }
                } else if (data.type == 'items') {
                    if (WG.at("扬州城-醉仙楼")) {
                        for (let item of data.items) {
                            if (item.name == '店小二') {
                                npcs['店小二'] = item.id;
                                GM_setValue("npcs", npcs);
                                return;
                            }
                        }
                    } else {
                        for (let item of data.items) {
                            if (item.name == '店小二') return;
                            if (npcs[item.name] != undefined) {
                                npcs[item.name] = item.id;

                                GM_setValue("npcs", npcs);
                                return;
                            }
                        }
                    }
                }
            });
            WG.add_hook("msg", function (data) {

                if (data.ch == "sys") {
                    var automarry = GM_getValue(roleid + "_automarry", automarry);
                    if (data.content.indexOf("，婚礼将在一分钟后开始。") >= 0) {
                        console.dir(data);
                        if (automarry == "开" && G.in_fight == false) {
                            if (stopauto || WG.at('副本')) {
                                let b = "<div class=\"item-commands\"><span  id = 'onekeyjh'>参加喜宴</span></div>"
                                messageClear();
                                messageAppend("<hiy>点击参加喜宴</hiy>");
                                messageAppend(b);
                                $('#onekeyjh').on('click', function () {
                                    WG.xiyan();
                                });
                            } else {
                                console.log("xiyan");
                                WG.xiyan();
                            }
                        } else if (automarry == "关" || G.in_fight == true) {
                            let b = "<div class=\"item-commands\"><span  id = 'onekeyjh'>参加喜宴</span></div>"
                            messageClear();
                            messageAppend("<hiy>点击参加喜宴,由于未开启自动传送,或者在战斗中,需要手动传送</hiy>");
                            messageAppend(b);
                            $('#onekeyjh').on('click', function () {
                                WG.xiyan();
                            });
                        }
                    }
                } else if (data.ch == "rumor") {
                    if (data.content.indexOf("听说") >= 0 &&
                        data.content.indexOf("出现在") >= 0 &&
                        data.content.indexOf("一带。") >= 0) {
                        console.dir(data);
                        if (autoKsBoss == "开" && G.in_fight == false) {
                            if (stopauto || WG.at('副本')) {
                                var c = "<div class=\"item-commands\"><span id = 'onekeyKsboss'>传送到boss</span></div>";
                                messageClear();
                                messageAppend("boss已出现");
                                messageAppend(c);
                                $('#onekeyKsboss').on('click', function () {
                                    WG.kksBoss(data);
                                });
                            } else {
                                WG.kksBoss(data);
                            }
                        } else if (autoKsBoss == "关" || G.in_fight == true) {
                            var c = "<div class=\"item-commands\"><span id = 'onekeyKsboss'>传送到boss</span></div>";
                            messageClear();
                            messageAppend("<hiy>boss已出现,由于未开启自动传送,或者在战斗中,需要手动传送</hiy>");
                            messageAppend(c);
                            $('#onekeyKsboss').on('click', function () {
                                WG.kksBoss(data);
                            });
                        }
                    }
                }

            });
            WG.add_hook('text', function (data) {
                if (G.getitemShow) {
                    if (data.msg.indexOf("恭喜你得到") >= 0 ||
                        (data.msg.indexOf("获得") >= 0 &&
                            data.msg.indexOf("经验") == -1 &&
                            data.msg.indexOf("潜能") == -1 &&
                            data.msg.indexOf("提升") == -1) ||
                        data.msg.indexOf("你找到") == 0 ||
                        data.msg.indexOf("你从") == 0 ||
                        (data.msg.indexOf("得到") >= 0 &&
                            data.msg.indexOf("郭襄在得到倚天剑") == -1 &&
                            data.msg.indexOf("长白山得到剑谱") == -1)
                    ) {
                        messageAppend(data.msg);
                    }
                }
                // if (data.msg.indexOf("还没准备好") >= 0) {
                //     WG.auto_preform('stop');
                //     setTimeout(() => {
                //         WG.auto_preform();
                //     }, 200);
                // }
                if (data.msg.indexOf("说：") == -1) {
                    if (data.msg.indexOf("只能在战斗中使用。") >= 0 || data.msg.indexOf('这里不允许战斗') != -1 || data.msg.indexOf('没时间这么做') != -1) {
                        if (G.in_fight) {
                            G.in_fight = false;
                            WG.auto_preform("stop");
                            WG.clean_dps();

                        }
                    }
                    if (data.msg.indexOf("加油，加油！！") >= 0) {
                        if (G.in_fight == false) {
                            G.in_fight = true;
                            WG.auto_preform();
                        }
                    }
                    if (data.msg.indexOf("你的内力不够，无法使用") >= 0) {
                        // if (G.in_fight == false) {
                        //     G.in_fight = true;
                        // }
                        if (G.preform_timer != null) {
                            WG.auto_preform("stop");
                            messageAppend("内力不足,停止自动出招", 1, 0)
                        }
                    }
                }

                if (data.type == 'text') {
                    if (data.msg.indexOf(`${role}身上东西太多了`) >= 0 || data.msg.indexOf("你身上东西太多了") >= 0 || data.msg.indexOf("你拿不下那么多东西。") >= 0) {
                        WG.Send("tm 友情提示：请检查是否背包已满！");
                        messageAppend("友情提示：请检查是否背包已满！", 1);
                        if (bagFull == 1) {
                            Beep();
                        } else if (bagFull == 2) {
                            FakerTTS.playtts(`${role}，请检查是否背包已满！`);
                        }
                        if (WG.sm_state >= 0) {
                            WG.sm_state = -1;
                            $(".sm_button").text("师门(Q)");
                        }

                    }
                    if (data.msg.indexOf("长得") >= 0 && data.msg.indexOf("看起来") >= 0) {
                        let s = data.msg.split("\n")[0].split(" ");
                        let name = s[s.length - 1];
                        if (name.indexOf("<") >= 0) {
                            name = name.split("<")[0];
                        }
                        let t = new Date().getMilliseconds();
                        let shieldhtml = `<div class="item-commands"><span id="addshield${t}">屏蔽 ${name}</span></div>`
                        messageAppend(shieldhtml, 0, 0);
                        $(`#addshield${t}`).on('click', function () {
                            shield = GM_getValue('_shield', shield);
                            if (shield != "") {
                                shield = shield + "," + name;
                            } else {
                                shield = name;
                            }
                            GM_setValue('_shield', shield);
                            $('#shield').val(shield);
                            messageAppend("已屏蔽", 1, 1);
                        });
                    }

                    if (dpssakada == '开') {
                        if (/.*造成<.*>.*<\/.*>点.*/.test(data.msg)) {
                            let pdata = data.msg;
                            let a = pdata.split(/.*造成<wht>|.*造成<hir>|<\/wht>点|<\/hir>点/);
                            let b = a[2].split(/伤害|\(|</);
                            if (b[2] != '你') {
                                if (b[0] == '暴击') {//判断关键字
                                    //critical = critical + parseInt(a[1]);
                                    lastcri = parseInt(a[1]);

                                } else {
                                    // pfmdps = pfmdps + parseInt(a[1]);
                                    lastpfm = parseInt(a[1]);
                                }
                                dpslock = 1;
                                // messageAppend(`你造成了${addChineseUnit(pfmdps)}伤害,共计${pfmnum}次。`, 1, 1);
                            }
                        }
                        let dd = data.msg.split(/看起来充满活力，一点也不累。|似乎有些疲惫，但是仍然十分有活力。|看起来可能有些累了。|动作似乎开始有点不太灵光，但是仍然有条不紊。|已经一副头重脚轻的模样，正在勉力支撑著不倒下去。|看起来已经力不从心了。|已经陷入半昏迷状态，随时都可能摔倒晕去。|似乎十分疲惫，看来需要好好休息了。|气喘嘘嘘，看起来状况并不太好。|摇头晃脑、歪歪斜斜地站都站不稳，眼看就要倒在地上。/);
                        //console.log(dd);
                        if (dd.length >= 2) {
                            //console.log(data.msg)
                            if (dd[0].indexOf("你") < 0) {
                                if (lastcri > 0) {
                                    critical = critical + lastcri;
                                    criticalnum = criticalnum + 1;//暴击伤害和暴击次数增加
                                }
                                if (lastpfm > 0) {
                                    pfmdps = pfmdps + lastpfm;
                                    pfmnum = pfmnum + 1;
                                }
                            }

                            lastcri = 0;
                            lastpfm = 0;
                        }
                    }
                }

                // 获取id
                let match = data.msg.match(/看起来(.*)想杀死你！/) || data.msg.match(/你扑向(.*)/);
                if (Array.isArray(match) && match.length > 1) {
                    let name = match[1];
                    let room = roomData.find(room => room.name && room.name.includes(name));
                    if (room) {
                        G.fight_id = room.id;
                    }
                }


            });
            WG.add_hook('dialog', function (data) {
                if (data.dialog == 'jh') {
                    if (data.fbs) {
                        fb_path = data.fbs;
                    }
                }
            });
            WG.add_hook(['text', 'sc'], function (message) {
                if (funnycalc == '关') return;
                if (message.type === "text" && /你的最大内力增加了/.test(message.msg)) {
                    //if中已经判断了内力相关
                    let x = message.msg.replace(/[^0-9]/ig, "");
                    let item = G.score;
                    let max = item.max_mp;
                    let limit = item.limit_mp;
                    let t = (limit - max) / (x * 6);//时间/分钟
                    let tStr = t < 60 ? `${parseInt(t)}分钟` : `${parseInt(t / 60)}小时${parseInt(t % 60)}分钟`;
                    let html = `<hic class="remove_nl">你的最大内力从${max}到${limit}还需${tStr}。\n</hic>`;
                    messageAppend(html, 0, 1);
                } else if (message.type == 'sc' && message.id == G.id) {
                    if (message.max_mp != null && message.mp != null) {
                        G.score.max_mp = message.max_mp;
                        G.score.mp = message.mp;
                    }
                } else if (message.type == 'text') {
                    if (/你获得了(.*)点经验，(.*)点潜能/.test(message.msg)) {
                        let x = message.msg.match(/获得了(.*)点经验，(.*)点潜能/);
                        G.jy += parseInt(x[1]);
                        G.qn += parseInt(x[2]);
                        let mss = `<span class="remove_jy">共计获得了${G.jy}点经验和${G.qn}点潜能。\n</span>`;
                        function refresh_jy(mss) {
                            $(".remove_jy").remove();
                            $(".content-message pre").append(mss);
                            AutoScroll(".content-message");
                        }
                        setTimeout(() => refresh_jy(mss), 200);
                    }
                }
            });
            WG.add_hook("roles", function (data) {
                // console.log(data);
                // unsafeWindow.SS_ROLES = data.roles;
                function sendRoles() {
                    if (originWindow.source) {
                        originWindow.source.postMessage(data.roles, '*');
                    } else {
                        setTimeout(sendRoles, 1000);
                    }
                }
                sendRoles();

                setTimeout(() => {
                    let loginnum = getQueryVariable("login")
                    if (loginnum) {
                        let userList = $('#role_panel > ul > li.content > ul >li');
                        for (let uidx = 0; uidx < userList.length; uidx++) {
                            if (loginnum == uidx + 1) {
                                $(userList[uidx]).addClass("select");
                            } else {
                                $(userList[uidx]).removeClass("select");
                            }
                        }
                        $("li[command=SelectRole]").click()
                        return;
                    }
                }, 5000);

            });
        },
        configInit: function () {
            family = GM_getValue(roleid + "_family", family);
            automarry = GM_getValue(roleid + "_automarry", automarry);
            autoKsBoss = GM_getValue(roleid + "_autoKsBoss", autoKsBoss);
            ks_pfm = GM_getValue(roleid + "_ks_pfm", ks_pfm);
            ks_wait = GM_getValue(roleid + "_ks_wait", ks_wait);
            eqlist = GM_getValue(roleid + "_eqlist", eqlist);
            skilllist = GM_getValue(roleid + "_skilllist", skilllist);
            autoeq = GM_getValue(roleid + "_auto_eq", autoeq);
            if (family == null) {
                family = $('.role-list .select').text().substr(0, 2)
            }
            wudao_pfm = GM_getValue(roleid + "_wudao_pfm", wudao_pfm);
            sm_loser = GM_getValue(roleid + "_sm_loser", sm_loser);
            sm_any = GM_getValue(roleid + "_sm_any", sm_any);
            sm_price = GM_getValue(roleid + "_sm_price", sm_price);
            sm_getstore = GM_getValue(roleid + "_sm_getstore", sm_getstore);
            unauto_pfm = GM_getValue(roleid + "_unauto_pfm", unauto_pfm);
            auto_pfmswitch = GM_getValue(roleid + "_auto_pfmswitch", auto_pfmswitch);
            auto_pfm_mode = GM_getValue(roleid + "_auto_pfm_mode", auto_pfm_mode);
            auto_rewardgoto = GM_getValue(roleid + "_auto_rewardgoto", auto_rewardgoto);
            busy_info = GM_getValue(roleid + "_busy_info", busy_info);
            saveAddr = GM_getValue(roleid + "_saveAddr", saveAddr);
            auto_updateStore = GM_getValue(roleid + "_auto_updateStore", auto_updateStore);
            auto_relogin = GM_getValue(roleid + "_auto_relogin", auto_relogin);
            blacklist = GM_getValue(roleid + "_blacklist", blacklist);
            if (!blacklist instanceof Array) {
                blacklist = blacklist.split(",")
            }
            getitemShow = GM_getValue(roleid + "_getitemShow", getitemShow);
            if (getitemShow == "开") {
                G.getitemShow = true
            } else {
                G.getitemShow = false
            }
            zml = GM_getValue(roleid + "_zml", zml);
            zdy_item_store = GM_getValue(roleid + "_zdy_item_store", zdy_item_store);
            zdy_item_store2 = GM_getValue(roleid + "_zdy_item_store2", zdy_item_store2);
            zdy_item_lock = GM_getValue(roleid + "_zdy_item_lock", zdy_item_lock);
            zdy_item_drop = GM_getValue(roleid + "_zdy_item_drop", zdy_item_drop);
            zdy_item_fenjie = GM_getValue(roleid + "_zdy_item_fenjie", zdy_item_fenjie);
            if (zdy_item_store) {
                store_list = store_list.concat(zdy_item_store.split(","))
            }
            if (zdy_item_store2) {
                store_list = store_list.concat(zdy_item_store2.split(","))
            }
            if (zdy_item_lock) {
                lock_list = lock_list.concat(zdy_item_lock.split(","))
            }
            if (zdy_item_drop) {
                drop_list = drop_list.concat(zdy_item_drop.split(","))
            }
            if (zdy_item_fenjie) {
                fenjie_list = fenjie_list.concat(zdy_item_fenjie.split(","))
            }
            ztjk_item = GM_getValue(roleid + "_ztjk", ztjk_item);
            if (auto_pfmswitch == "开") {
                G.auto_preform = true
            }
            if (auto_pfm_mode == "开") {
                G.auto_pfm_mode = true
            }
            auto_command = GM_getValue(roleid + "_auto_command", auto_command);
            var unpfm = unauto_pfm.split(',');
            for (var pfmname of unpfm) {
                if (pfmname) blackpfm.push(pfmname)
            }
            welcome = GM_getValue(roleid + "_welcome", welcome);
            die_str = GM_getValue(roleid + "_die_str", die_str);
            shieldswitch = GM_getValue("_shieldswitch", shieldswitch);
            shield = GM_getValue("_shield", shield);
            shieldkey = GM_getValue("_shieldkey", shieldkey);
            statehml = GM_getValue(roleid + "_statehml", statehml);
            backimageurl = GM_getValue(roleid + "_backimageurl", backimageurl);
            loginhml = GM_getValue(roleid + "_loginhml", loginhml);
            timequestion = GM_getValue(roleid + "_timequestion", timequestion);
            silence = GM_getValue(roleid + "_silence", silence);
            dpssakada = GM_getValue(roleid + "_dpssakada", dpssakada);
            funnycalc = GM_getValue(roleid + "_funnycalc", funnycalc);
            auto_buylist = GM_getValue(roleid + "_auto_buylist", auto_buylist);
            auto_skillPaperSelllist = GM_getValue(roleid + "_auto_skillPaperSelllist", auto_skillPaperSelllist);
            zdyskilllist = GM_getValue(roleid + "_zdyskilllist", zdyskilllist);
            zdyskills = GM_getValue(roleid + "_zdyskills", zdyskills);
            bagFull = GM_getValue(roleid + "_bagFull", bagFull);
            // 通知推送开关、方式、Token、Url
            pushSwitch = GM_getValue("_pushSwitch", pushSwitch);
            pushType = GM_getValue("_pushType", pushType);
            pushToken = GM_getValue("_pushToken", pushToken);
            //pushUrl = GM_getValue("_pushUrl", pushUrl);
            color_select = GM_getValue("color_select", color_select);
            WG.zdy_btnListInit();

        }
    };

    var S = {
        serverUrl: "https://wsmud.ii74.com",
        GetJson: function (path, data) {
            let res = '';
            $.post(S.serverUrl + path, data, (data) => {
                res = data;
            });
            return res;
        },
        shareJson: function (usernaem, json) {
            $.post(S.serverUrl + "/sharejk", {
                username: usernaem,
                json: JSON.stringify(json)
            }, (res) => {
                if (res && res.code == 0) {
                    GM_setClipboard(res.shareid);
                    messageAppend("复制成功" + res.msg + ":" + res.shareid);
                } else {
                    messageAppend("失败了" + res.msg);
                }
            })
        },
        getShareJson: function (id, callback) {
            $.post(S.serverUrl + "/getjk", {
                shareid: id
            }, (res) => {
                if (res && res.code == 0) {
                    callback(res);
                } else {
                    messageAppend("失败了" + res.msg);
                }
            });
        },
        getUserConfig: function (id, callback) {
            $.get(S.serverUrl + "/User/Load?id=" + id, (res) => {
                if (res && res != "") {
                    callback(res);
                } else {
                    messageAppend("失败了");
                }
            });
        },
        uploadUserConfig: function (id, data, callback) {
            $.post(S.serverUrl + "/User/Backup", {
                id: id,
                data: JSON.stringify(data)
            }, (res) => {
                if (res && res == "true") {
                    callback(res);
                } else {
                    messageAppend("失败了,或配置已存在");
                }
            });
        }

    };
    var FakerTTS = {

        playtts: function (text) {
            try {
                var msg = new SpeechSynthesisUtterance(text);
                msg.lang = 'zh';
                msg.voice = speechSynthesis.getVoices().filter(function (voice) {
                    return voice.name == 'Whisper';
                })[0];
                speechSynthesis.speak(msg);
            } catch (e) {
                try {
                    android.speak(text);
                } catch (ex) {
                    console.log('这个真没有.')
                }

            }
        }
    };
    function Beep() {
        document.getElementById("beep-alert").play();
    };
    function Push(text) {
        if (text) {
            if (pushSwitch != '开' || pushType == null || pushToken == null) {
                messageAppend("通知功能未开启或设置不完整，请在 右键菜单-设置 中设置开启。", 1);
                return;
            }
            switch (String(pushType)) {
                //Server酱
                case "0":
                    $.post(`https://sctapi.ftqq.com/${pushToken}.send?title=${text}`);
                    break;
                //Bark iOS
                case "1":
                    $.post(`https://api.day.app/${pushToken}/武神传说/${encodeURIComponent(text)}`);
                    break;
                //PushPlus
                case "2":
                    var pushJosn = { "token": pushToken, "title": "武神传说", "content": text };
                    $.ajaxSetup({ contentType: "application/json; charset=utf-8" });
                    $.post(`http://www.pushplus.plus/send/`, JSON.stringify(pushJosn));
                    break;
                //飞书机器人
                case "3":
                    var pushJosn = { "msg_type": "text", "content": { "text": text } };
                    $.ajaxSetup({ contentType: "application/json; charset=utf-8" });
                    $.post(`https://open.feishu.cn/open-apis/bot/v2/hook/${pushToken}`, JSON.stringify(pushJosn));
                    break;
                //Qmsg私聊
                case "4":
                    $.post(`https://qmsg.zendee.cn/send/${pushToken}?msg=${text}`);
                    break;
                //Qmsg群聊
                case "5":
                    $.post(`https://qmsg.zendee.cn/group/${pushToken}?msg=${text}`);
                    break;
            }
        }
    };
    class MusicBox {
        constructor(options) {
            let defaults = {
                loop: false,
                musicText: '',
                autoplay: false,
                type: 'sine',
                duration: 2
            };
            this.arrFrequency = [262, 294, 330, 349, 392, 440, 494, 523, 587, 659, 698, 784, 880, 988, 1047, 1175, 1319, 1397, 1568, 1760, 1967];
            this.arrNotes = ['·1', '·2', '·3', '·4', '·5', '·6', '·7', '1', '2', '3', '4', '5', '6', '7', '1·', '2·', '3·', '4·', '5·', '6·', '7·'];
            this.opts = Object.assign(defaults, options);
            this.audioCtx = new (window.AudioContext || window.webkitAudioContext)();
            this.opts.autoplay && this.playMusic(this.opts.musicText, this.opts.autoplay)
        }
        createSound(freq) {
            let oscillator = this.audioCtx.createOscillator();
            let gainNode = this.audioCtx.createGain();
            oscillator.connect(gainNode);
            gainNode.connect(this.audioCtx.destination);
            oscillator.type = this.opts.type;
            oscillator.frequency.value = freq;
            gainNode.gain.setValueAtTime(0, this.audioCtx.currentTime);
            gainNode.gain.linearRampToValueAtTime(1, this.audioCtx.currentTime + 0.01);
            oscillator.start(this.audioCtx.currentTime);
            gainNode.gain.exponentialRampToValueAtTime(0.001, this.audioCtx.currentTime + this.opts.duration);
            oscillator.stop(this.audioCtx.currentTime + this.opts.duration)
        }
        createMusic(note) {
            let index = this.arrNotes.indexOf(note);
            if (index !== -1) {
                this.createSound(this.arrFrequency[index])
            }
        }
        pressBtn(i) {
            this.createSound(this.arrFrequency[i])
        }
        playMusic(musicText, speed = 2) {
            let i = 0,
                musicArr = musicText.split(' ');
            let timer = setInterval(() => {
                try {
                    let n = this.arrNotes.indexOf(musicArr[i]);
                    if (musicArr[i] !== '-' && musicArr[i] !== '0') {
                        this.pressBtn(n)
                    }
                    i++;
                    if (i >= musicArr.length) {
                        this.opts.loop ? i = 0 : clearInterval(timer)
                    }
                } catch (e) {
                    alert('请输入正确的乐谱！');
                    clearInterval(timer)
                }
            }, 1000 / speed);
            return timer
        }
    };
    var originWindow = {};
    $(document).ready(function () {
        $('head').append('<link href="https://s4.zstatic.net/ajax/libs/jquery-contextmenu/3.0.0-beta.2/jquery.contextMenu.min.css" rel="stylesheet">');
        $('head').append('<link href="https://s4.zstatic.net/ajax/libs/layer/2.3/skin/layer.css" rel="stylesheet">');
        $('head').append('<link href="https://s4.zstatic.net/ajax/libs/font-awesome/4.7.0/css/font-awesome.css" rel="stylesheet">');
        $('body').append(UI.codeInput);
        $("body").append(
            $(`<audio id="beep-alert" preload="auto"></audio>`).append(`<source src="https://cdn.jsdelivr.net/gh/mapleobserver/wsmud-script/plugins/complete.mp3" type="audio/mpeg">`)
        );

           

            setInterval(() => {
                var h = '';
                if (parseInt(Math.random() * 10) < 3) {
                    h = "<hir>【插件】有任何问题欢迎加入 武神传说-仙界 367657589 进行技术交流，脚本讨论。\n<hir>"
                } else if (parseInt(Math.random() * 10) < 10) {
                    h = "<hir>【插件】欢迎访问 https://emeisuqing.github.io/wsmud.old/ 苏轻 助你武神之路上更加轻松愉快。\n<hir>";
                }
                parseInt(Math.random() * 10) < 2 ? $('.channel pre').append(h) : console.log("");
                $(".channel")[0].scrollTop = 99999;
            }, 320 * 1000);



        KEY.init();
        WG.init();
        GI.init();
        unsafeWindow.WG = WG;
        unsafeWindow.T = T;
        unsafeWindow.L = L;
        unsafeWindow.G = G;
        unsafeWindow.messageClear = messageClear;
        unsafeWindow.messageAppend = messageAppend;
        unsafeWindow.send_cmd = send_cmd;
        unsafeWindow.roomData = roomData;
        unsafeWindow.MusicBox = MusicBox;
        unsafeWindow.FakerTTS = FakerTTS;
        unsafeWindow.Beep = Beep;
        unsafeWindow.Push = Push;
        unsafeWindow.WSStore = store;
        unsafeWindow.imgShow = imgShow;



        window.addEventListener("message", receiveMessage, false);
        function receiveMessage(event) {
            originWindow = event;
            var origin = event.origin;
            var data = event.data;
            if (String(data).indexOf("denglu") >= 0) {
                if (role != undefined) { return; }
                console.log(data);
                let userName = data.split(" ")[1];
                let userList = $('#role_panel > ul > li.content > ul >li');
                for (let user of userList) {
                    if (user.innerText.indexOf(userName) >= 0) {
                        $(user).addClass("select");
                    } else {
                        $(user).removeClass("select");
                    }
                }
                $("li[command=SelectRole]").click()
                return;
            }
            try {
                if (JSON.parse(data) instanceof Object) {
                    return;
                }
            } catch (error) {
                console.log("Run at message");
            }
            if (typeof data == 'string') {
                if (data === '挖矿' || data === '修炼') {
                    WG.zdwk();
                } else if (data === '日常') {
                    WG.SendCmd("$daily");
                } else if (data === '挂机') {
                    WG.SendCmd("stopstate");
                } else {
                    if (data.split("\n")[0].indexOf("//") >= 0) {
                        if (unsafeWindow && unsafeWindow.ToRaid) {
                            ToRaid.perform(data);
                        }
                    } else if (data.split("\n")[0].indexOf("#js") >= 0) {
                        var jscode = data.split("\n");
                        jscode.baoremove(0)
                        eval(jscode.join(""));
                    } else {
                        WG.SendCmd(data);
                    }
                }
            }
        }
        $('.room-name').on('click', (e) => {
            e.preventDefault();
            $('.container').contextMenu({
                x: 1,
                y: 1
            });
        });
        function makeTp(mp = 0) {

            var mptp = {
                "豪宅": "住房",
                "衙门": "扬州城-衙门正厅",
                "镖局": "扬州城-镖局正厅",
                "当铺": "扬州城-当铺",
                "擂台": "扬州城-擂台",
                "药铺": "扬州城-药铺",
                "书院": "扬州城-书院"
            }
            if (mp == 1) {
                mptp = {
                    "武当": "武当派-广场",
                    "少林": "少林派-广场",
                    "华山": "华山派-镇岳宫",
                    "峨眉": "峨眉派-金顶",
                    "逍遥": "逍遥派-青草坪",
                    "丐帮": "丐帮-树洞内部",
                    "武馆": "扬州城-扬州武馆",
                    "杀手楼": "杀手楼-大门"
                }
                let myDate = new Date();
                if (myDate.getHours() >= 17) {
                    mptp = {
                        "武当": "武当派-后山小院",
                        "少林": "少林派-方丈楼",
                        "华山": "华山派-客厅",
                        "峨眉": "峨眉派-清修洞",
                        "逍遥": "逍遥派-地下石室",
                        "丐帮": "丐帮-林间小屋",
                        "武馆": "扬州城-扬州武馆",
                        "杀手楼": "杀手楼-大门"
                    }
                }
            }
            var subItems = {};

            for (let item in mptp) {
                subItems[item] = { name: item, callback: function () { WG.go(mptp[item]); } }
            }
            if (mp == 0) {
                subItems['wmls'] = { name: "武庙疗伤", callback: function () { WG.go("扬州城-武庙"); WG.Send("liaoshang"); } }
            }
            var dfd = jQuery.Deferred();
            setTimeout(function () {
                dfd.resolve(subItems);
            }, 20);
            return dfd.promise();
        }

        function createSomeMenu() {
            return {
                items: {
                    "关闭自动": {
                        name: "关闭自动",
                        visible: function (key, opt) {
                            return timer != 0;
                        },
                        callback: function (key, opt) {
                            WG.timer_close();
                        },
                    },
                    "自动": {
                        name: "自动",
                        visible: function (key, opt) {
                            return timer == 0;
                        },
                        "items": {
                            "自动武道": {
                                name: "自动武道",
                                callback: function (key, opt) {
                                    WG.wudao_auto();
                                },
                            },
                            "自动小树林": {
                                name: "自动小树林",
                                callback: function (key, opt) {
                                    WG.grove_auto();
                                }
                            },
                            "自动整理并清包": {
                                name: "自动整理并清包",
                                callback: function (key, opt) {
                                    WG.sell_all();
                                }
                            },
                            "回收秘籍残页": {
                                name: "回收秘籍残页",
                                callback: function (key, opt) {
                                    WG.zxBuy();
                                }
                            },
                            "自动比试": {
                                name: "自动比试",
                                visible: function (key, opt) {
                                    return WG.fight_listener == undefined;
                                },
                                callback: function (key, opt) {
                                    WG.auto_fight();
                                },
                            },
                            "关闭比试": {
                                name: "关闭比试",
                                visible: function (key, opt) {
                                    return WG.fight_listener != undefined;
                                },
                                callback: function (key, opt) {
                                    WG.auto_fight();
                                },
                            },
                            "自动使用道具": {
                                name: "自动使用道具",
                                callback: function (key, opt) {
                                    WG.auto_useitem();
                                },
                            },
                            "自动研药": {
                                name: "自动研药",
                                callback: function (key, opt) {
                                    WG.auto_Development_medicine();
                                },
                            },
                            "一键日常": {
                                name: "一键日常",
                                callback: function (key, opt) {
                                    WG.oneKeyDaily();
                                },
                            },
                            "一键请安": {
                                name: "一键请安",
                                callback: function (key, opt) {
                                    WG.oneKeyQA();
                                },
                            },
                            "一键扫荡": {
                                name: "一键扫荡",
                                callback: function (key, opt) {
                                    WG.oneKeySD();
                                },
                            },

                            "一键当铺购买": {
                                name: "一键当铺购买",
                                callback: function (key, opt) {
                                    WG.tnBuy();
                                },
                            },
                        },
                    },
                    "换装设置": {
                        name: "换装设置",
                        callback: function (key, opt) {
                            WG.eqhelperui();
                        },
                    },
                    "换装": {
                        name: "换装",
                        items: WG.eqloader()
                    },
                    "自命令,自定监控": {
                        name: "自命令,自定监控",
                        callback: function (key, opt) {
                            WG.zmlztjk();
                        },
                    },
                    "手动喜宴": {
                        name: "手动喜宴",
                        callback: function (key, opt) {
                            console.log("当前自动状态:" + stopauto);
                            WG.xiyan();
                        },
                    },
                    "快捷传送": {
                        name: "常用地点",
                        "items": makeTp(0)
                    },
                    "门派传送": {
                        name: "门派传送",
                        "items": makeTp(1)
                    },
                    "打开仓库": {
                        name: "打开仓库",
                        callback: function (key, opt) {
                            if (WG.at("扬州城-钱庄")) {
                                WG.Send("store");
                            } else {
                                WG.go("扬州城-钱庄");
                            }
                        },
                    },
                    "切换菜单": {
                        name: "切换菜单",
                        callback: function (key, opt) {
                            let p = 'on'
                            if (inzdy_btn) {
                                p = 'off'
                            }
                            WG.zdy_btnshow(p);
                        },
                    },
                    "简单工具": {
                        name: "简单工具",
                        callback: function (key, opt) {
                            WG.calc();
                        },
                    },
                    "调试BOSS": {
                        name: "调试BOSS",
                        visible: false,
                        callback: function (key, opt) {
                            WG.kksBoss({
                                content: "听说呼符出现在逍遥派-地下石室一带。"
                            });
                        },
                    },
                    "流程菜单Raid.js": {
                        name: "流程菜单Raid.js",
                        callback: function (key, opt) {
                            if (unsafeWindow && unsafeWindow.ToRaid) {
                                unsafeWindow.ToRaid.menu();
                            } else {
                                messageAppend("插件未安装,请访问 https://greasyfork.org/zh-CN/scripts/375851-wsmud-raid 下载并安装");
                                window.open("https://greasyfork.org/zh-CN/scripts/375851-wsmud-raid ", '_blank').location;
                            }
                        }
                    },
                    "设置": {
                        name: "设置",
                        callback: function (key, opt) {
                            WG.setting();
                        },
                    },
                    "打开面板": {
                        name: "打开面板",
                        visible: function (key, opt) {
                            return $('.WG_log').css('display') == 'none';
                        },
                        callback: function (key, opt) {
                            WG.showhideborad();
                        },
                    },
                    "关闭面板": {
                        name: "关闭面板",
                        visible: function (key, opt) {
                            return $('.WG_log').css('display') != 'none';
                        },
                        callback: function (key, opt) {
                            WG.showhideborad();
                        },
                    }, "打开快捷操作栏": {
                        name: "打开快捷操作栏",
                        visible: function (key, opt) {
                            return $('.WG_button').css('display') == 'none';
                        },
                        callback: function (key, opt) {
                            WG.showhidebtn();
                        },
                    },
                    "关闭快捷操作栏": {
                        name: "关闭快捷操作栏",
                        visible: function (key, opt) {
                            return $('.WG_button').css('display') != 'none';
                        },
                        callback: function (key, opt) {
                            WG.showhidebtn();
                        },
                    }
                }
            }
        }
        $.contextMenu({
            selector: '.container',
            build: function ($trigger, e) {
                //从 trigger 中获取动态创建的菜单项及回调
                return createSomeMenu();
            }

        });
    });
})();

// ==UserScript==
// @name         wsmud_login1
// @namespace    com.wsmud
// @version      0.0.11
// @description  武神传说登录插件
// @author       sq
// @date         2020/08/26
// @modified     2020/11/07
// @license MIT
// @match        http://*.wsmud.com/*
// @match        http://*.wamud.com/*
// @match        http://mush.fun/*
// @require      https://cdn.staticfile.org/vue/2.6.11/vue.min.js
// @exclude      http://*.wsmud.com/news/*
// @exclude      http://*.wsmud.com/pay.html
// @homepage     https://greasyfork.org/zh-CN/scripts/443214
// @grant        unsafeWindow
// @grant        GM_addStyle
// @grant        GM_getValue
// @grant        GM_setValue
// @grant        GM_listValues
// @grant        GM_setClipboard
// @downloadURL https://update.greasyfork.org/scripts/443214/wsmud_login1.user.js
// @updateURL https://update.greasyfork.org/scripts/443214/wsmud_login1.meta.js
// ==/UserScript==

(function () {
    'use strict'
    class Myapi {
        constructor() {
            this.roles = this.getValue('roles')

        }
        set roles(value) {
            if (value instanceof Array) {
                value.sort((a, b) => a.sort - b.sort)
                value.forEach((item, index) => {
                    if (item.server) item.sort = index + 1
                    else item.sort = 9999
                })
                this._roles = value
            } else {
                this._roles = []
            }
            this.setValue('roles', this._roles)
        }
        get roles() { return this._roles }


        addStyle(css) {
            GM_addStyle(css)
        }

        cookie() {
            const cookies = document.cookie.split(';').reduce((accumulator, currentValue) => {
                const i = currentValue.indexOf('=')
                const name = currentValue.substr(0, i).trim()
                const value = currentValue.substr(i + 1)
                accumulator[name] = value
                return accumulator
            }, {})
            const setCookie = (name, value) => document.cookie = name + '=' + value
            const deleteCookie = name => document.cookie = name + '=; expires=Thu, 01 Jan 1970 00:00:01 GMT;'
            return new Proxy(cookies, {
                set: (target, name, value) => {
                    setCookie(name, value)
                    return Reflect.set(target, name, value)
                },
                deleteProperty: (target, name) => {
                    deleteCookie(name)
                    return Reflect.deleteProperty(target, name)
                },
            })
        }
        setValue(key, value) {
            localStorage.setItem(key, JSON.stringify(value))
        }
        getValue(key) {
            return JSON.parse(localStorage.getItem(key))
        }
        deleteValue(key) {
            localStorage.removeItem(key)
        }
    }
    $(document).ready(function () {

        var WG = unsafeWindow.WG;

        var myapi = Vue.observable(new Myapi())
        WG.add_hook('roles', function (data) {
            if (!(data.roles instanceof Array)) return
            data.roles.forEach(item => {
                const { id, name, title } = item
                const index = myapi.roles.findIndex(role => role.id === id)
                if (index === -1) {
                    myapi.roles.push({ id, name, title, sort: 9999 })
                } else {
                    myapi.roles[index].name = name
                    myapi.roles[index].title = title
                }
            })
            myapi.roles = myapi.roles.slice(0)
        })
        WG.add_hook('login', function (data) {
            const id = data.id
            if (myapi.id || !id) return
            myapi.id = id
            const index = myapi.roles.findIndex(role => role.id === id)
            myapi.name = myapi.roles[index].name
            const cookie = myapi.cookie()
            myapi.roles[index].u = cookie.u
            myapi.roles[index].p = cookie.p
            myapi.roles[index].s = cookie.s
            myapi.roles[index].server = ['一区', '二区', '三区', '四区', '测试'][cookie.s]
            myapi.roles = myapi.roles.slice(0)

        })

        const autoLoginId = myapi.getValue('auto-login-id')
        if (autoLoginId) {
            myapi.deleteValue('auto-login-id')
            WG.add_hook(['roles'], function () {
                setTimeout(() => $(`.role-item[roleid=${autoLoginId}]`).click(), 1000)
                setTimeout(() => $('.panel_item[command=SelectRole]').click(), 2000)
            })
            return
        }

        $('li.panel_item[command="SelectRole"]').after(`
<li class="panel_item" id="wsmud-login" style="color:orange;" @click.stop="show = true">
  <span class="glyphicon glyphicon-ok"></span> <span style="margin-left:0.5rem">[苏轻]一键登录</span>
  <div v-if="show" class="login-dialog-bg" @click.stop="show = false">
    <div class="login-dialog" @click.stop>
      <div class="login-dialog-title">[苏轻]一键登录</div>
      <transition-group class="login-dialog-rows" tag="div" name="login-animate-list">
        <div class="login-dialog-row" v-for="(role, index) in roles" :key="role.id" v-if="role.server">
          <span class="login-dialog-role" @click="login(role)">[{{ role.server }}] {{ role.name }}</span>
          <span class="glyphicon glyphicon-arrow-up login-dialog-up" @click="up(index)"></span>
          <span class="glyphicon glyphicon-arrow-down login-dialog-down" @click="down(index)"></span>
          <span class="glyphicon glyphicon-trash login-dialog-remove" @click="remove(index)"></span>
        </div>
      </transition-group>
    </div>
  </div>
</li>
`)

        new Vue({
            data: { show: false },
            computed: {
                roles() {
                    return myapi.roles
                },
            },
            mounted() {
                var urlParams = new URLSearchParams(window.location.search)

                var logintype = urlParams.get('type');
                if (logintype) {
                    var username = urlParams.get('username');
                    var password = urlParams.get('password');
                    var area = urlParams.get('area');
                    var name = urlParams.get('name');
                    if (username && password && area && name) {
                        var url = "/UserAPI/Login";
                        var data = "code=" + username + "&pwd=" + password;
                        $.ajax({
                            type: "POST",
                            url: url,
                            data: data,
                            success: function (data) {
                                console.log(data)
                                const cookie = myapi.cookie()
                                cookie.s = area

                                // 获取当前URL
                                var currentUrl = window.location.href;

                                // 去掉参数
                                var urlWithoutParams = currentUrl.split('?')[0];
                                window.location = urlWithoutParams + "?name=" + name;

                            },
                            error: function (data) {
                            }
                        });

                    }
                }



                var name = urlParams.get('name');
                if (name) {
                    for (let role of myapi.roles) {
                        if (role.name == name) {
                            this.login(role)
                        }
                    }
                }



            },
            methods: {
                login(role) {
                    const cookie = myapi.cookie()
                    cookie.u = role.u
                    cookie.p = role.p
                    cookie.s = role.s
                    myapi.setValue('auto-login-id', role.id)
                    if (window.android) {
                        android.reload()
                    } else {
                        window.location.reload()
                    }
                },
                up(index) {
                    myapi.roles[index].sort = index - 1;
                    myapi.roles = myapi.roles.slice(0);

                },
                down(index) {
                    myapi.roles[index].sort = index + 3;
                    myapi.roles = myapi.roles.slice(0);

                },
                remove(index) {
                    delete myapi.roles[index].server;
                    myapi.roles = myapi.roles.slice(0);
                    this.$forceUpdate();
                }
            },
            el: '#wsmud-login',
        })





        myapi.addStyle(`
.login-dialog-bg {
  display: block;
  position: absolute;
  width: 100%;
  height: 100%;
  left: 0;
  top: 0;
  z-index: 100;
  overflow-y: auto;
  background-color: #000000dd;
  cursor: default;
  user-select: none;
}
.login-dialog {
  display: block;
  position: absolute;
  left: 50%;
  top: 50%;
  z-index: 101;
  min-width: 300px;
  padding: 10px;
  transform: translate(-50%, -50%);
  border-radius: 10px;
  color: #999999;
  background-color: #080808;
  box-shadow: 0 0 5px #333333;
}
.login-dialog-title {
  color: #00f000;
  padding: 10px 0 10px 10px;
  text-shadow: 0 0 15px;
}
.login-dialog-rows {
  max-height: 230px;
  overflow: auto;
}
.login-dialog-row {
  cursor: pointer;
  padding: 10px;
  display: flex;
}
.login-dialog-role {
  flex: 1 0 auto;
}
.login-dialog-role:hover {
  color: #00ffff;
  text-shadow: 0 0 15px;
}
.login-dialog-up, .login-dialog-down, .login-dialog-remove {
  flex: 0 0 22px;
  margin-left: 5px;
}
.login-dialog-up:hover, .login-dialog-down:hover {
  color: #088000;
  text-shadow: 0 0 15px;
}
.login-dialog-remove:hover {
  color: #880000;
  text-shadow: 0 0 15px;
}
/* 图标 */
.glyphicon-arrow-up:before {
  content: "\\e093";
}
.glyphicon-arrow-down:before {
  content: "\\e094";
}
.glyphicon-trash:before {
  content: "\\e020";
}
/* 过渡动画效果 */
.login-animate-list-move {
  transition: transform 0.5s;
}
.login-animate-list-item {
  display: inline-block;
  margin-right: 10px;
}
.login-animate-list-enter-active, .login-animate-list-leave-active {
  transition: all 0.5s;
}
.login-animate-list-enter, .login-animate-list-leave-to {
  opacity: 0;
  transform: translateX(50px);
}
`)
    });


})();
// ==UserScript==
// @name            wsmud_Raid
// @namespace       cqv
// @version         2.4.64
// @date            23/12/2018
// @modified        1/10/2023
// @homepage        https://greasyfork.org/zh-CN/scripts/375851
// @description     武神传说 MUD
// @author          Bob.cn, 初心, 白三三
// @match           http://*.wsmud.com/*
// @match           http://*.wamud.com/*
// @run-at          document-end
// @require         https://s4.zstatic.net/ajax/libs/vue/2.2.2/vue.min.js
// @grant           unsafeWindow
// @grant           GM_getValue
// @grant           GM_setValue
// @grant           GM_deleteValue
// @grant           GM_listValues
// @grant           GM_setClipboard

// @downloadURL https://update.greasyfork.org/scripts/375851/wsmud_Raid.user.js
// @updateURL https://update.greasyfork.org/scripts/375851/wsmud_Raid.meta.js
// ==/UserScript==

(function () {

    'use strict';

    /***********************************************************************************\
        工具层
    \***********************************************************************************/

    //---------------------------------------------------------------------------
    //  Message Output
    //---------------------------------------------------------------------------

    var Message = {
        append: function (msg) {
            console.log(msg);
        },
        clean: function () { },
        cmdLog: function (title, cmd) {
            let msg = `&nbsp;&nbsp;<hic>${title}</hic>`
            if (cmd != null) {
                msg += `: ${cmd}`;
            }
            this.append(msg);
        }
    };

    function CopyObject(obj) {
        return JSON.parse(JSON.stringify(obj));
    }

    /**
     * @param {Array} list
     * @param {*} value
     * @param {Function} assert function(previous, current)
     */
    const SortInsert = function (list, value, assert) {
        let index = list.length;
        while (index >= 0) {
            if (index == 0) {
                list.splice(index, 0, value);
                break;
            }
            const previous = list[index - 1];
            if (assert(previous, value)) {
                list.splice(index, 0, value);
                break;
            }
            index -= 1;
        }
    };

    //---------------------------------------------------------------------------
    //  Source Split Helper
    //---------------------------------------------------------------------------

    const SourceCodeHelper = {
        split: function (source) {
            var cmds = source.split(/\s*\n+/g);
            var first = cmds[0];
            if (first != null && /\S/.test(first) == false) {
                cmds.splice(0, 1);
            }
            var last = cmds[cmds.length - 1];
            if (last != null && /\S/.test(last) == false) {
                cmds.splice(cmds.length - 1, 1);
            }
            return cmds;
        },
        appendHeader: function (header, text) {
            let result = `\n${text}`;
            result = result.replace(/(\n)/g, `$1${header}`);
            result = result.replace(/\n\s*\n/g, "\n");
            result = result.replace(/^\s*\n/, "");
            return result;
        }
    };

    //---------------------------------------------------------------------------
    //  Persistent Cache Interface
    //---------------------------------------------------------------------------

    class PersistentCache {
        constructor(save, getAll, remove) {
            this._save = save;
            this._getAll = getAll;
            this._remove = remove;
        }
        save(key, value) {
            this._save(key, value);
        }
        get(key) {
            return this.getAll()[key];
        }
        getAll() {
            return this._getAll();
        }
        remove(key) {
            this._remove(key);
        }
    }

    /***********************************************************************************\
        控制逻辑编译层
    \***********************************************************************************/

    //---------------------------------------------------------------------------
    //  Precompiler
    //---------------------------------------------------------------------------

    class PrecompileRule {
        constructor(handle, priority) {
            this._handle = handle;
            this.priority = priority;
        }
        handle(cmds) {
            return this._handle(cmds);
        }
    }

    class PrecompileRuleCenter extends PrecompileRule {
        constructor() {
            const handle = function (cmds) {
                var result = cmds;
                for (const rule of this._rules) {
                    result = rule.handle(result);
                }
                return result;
            };
            super(handle, -1);
            this._rules = [];
            this.instance = this;
        }
        static shared() {
            if (!this.instance) {
                this.instance = new PrecompileRuleCenter();
            }
            return this.instance;
        }
        addRule(rule) {
            SortInsert(this._rules, rule, (p, c) => {
                return p.priority >= c.priority;
            });
        }
    };

    class Precompiler {
        precompile(source) {
            var cmds = SourceCodeHelper.split(source);
            if (cmds.length <= 0) return cmds;

            var result = PrecompileRuleCenter.shared().handle(cmds);

            // console.log("<<<============================");
            // console.log("预编译最终代码:");
            // for (let k = 0; k < result.length; k++) {
            //     console.log(k + " " + result[k]);
            // }
            // console.log("============================>>>");
            return result;
        }
    }

    //---------------------------------------------------------------------------
    //  Compiler
    //---------------------------------------------------------------------------

    const ControlKeys = {
        while: "while",
        continue: "continue",
        break: "break",
        if: "if",
        elseif: "elseif",
        else: "else",
        exit: "exit",
    };

    class Compiler {
        constructor() {
            this._cc = "CC";
            this._pc = "PC";
            this._breakStacks = [];
        }

        compile(source) {
            if (source == null) return [];

            var precompiler = new Precompiler();
            var cmds = precompiler.precompile(source);

            var blockCmds = ["[if] true"];
            cmds.forEach(cmd => {
                blockCmds.push("  " + cmd);
            });
            var result = this._handleBlock(blockCmds, 0).cmds;
            result.push("%exit");

            // console.log("<<<============================");
            // console.log("编译最终代码:");
            // for (let k = 0; k < result.length; k++) {
            //     console.log(k + " " + result[k]);
            // }
            // console.log("============================>>>");
            return result;
        }

        /**
         * @param {string[]} cmds
         * @param {number} start block 首句在的 index
         * @param {number} loopStart 最邻近的 while 的首句索引
         */
        _handleBlock(cmds, start, loopStart) {
            var realLoopStart = loopStart;

            var result = [];
            var r = this._handleCondition(cmds[0]);
            var callback = function () { };
            var self = this;
            switch (r.type) {
                case ControlKeys.while:
                    this._breakStacks.push([]);
                    result.push(r.cmd);
                    result.push(null);
                    callback = function () {
                        result.push(`%${self._pc}=${start}`);
                        var truePC = start + 2;
                        var falsePC = result.length + start;
                        result[1] = `%${self._pc}=${self._cc}?${truePC}:${falsePC}`;
                        var breakStack = self._breakStacks.pop();
                        breakStack.forEach(index => {
                            result[index - start] = `%${self._pc}=${falsePC}`;
                        });
                    };
                    realLoopStart = start;
                    break;
                case ControlKeys.if:
                    result.push(r.cmd);
                    result.push(null);
                    callback = function () {
                        result.push("%pass");
                        var truePC = start + 2;
                        var falsePC = result.length + start;
                        result[1] = `%${self._pc}=${self._cc}?${truePC}:${falsePC}`;
                    };
                    break;
                case ControlKeys.elseif:
                    result.push(r.cmd);
                    result.push(null);
                    callback = function () {
                        result.push("%pass");
                        var truePC = start + 2;
                        var falsePC = result.length + start;
                        result[1] = `%${self._pc}=${self._cc}?${truePC}:${falsePC}`;
                    };
                    break;
                case ControlKeys.else:
                    result.push(null);
                    callback = function () {
                        var truePC = start + 1;
                        var falsePC = result.length + start;
                        result[0] = `%${self._pc}=${self._cc}?${falsePC}:${truePC}`;
                    };
                    break;
                case ControlKeys.continue:
                    result.push(`%${self._pc}=${loopStart}`);
                    return { type: "continue", cmds: result };
                case ControlKeys.break:
                    result.push(null);
                    var breakStack = this._breakStacks[this._breakStacks.length - 1];
                    breakStack.push(start);
                    return { type: "break", cmds: result };
                case ControlKeys.exit:
                    result.push("%exit");
                    return { type: "exit", cmds: result };
                default:
                    throw "未知的控制关键字: " + r.type;
            }

            var cmdsLength = cmds.length;
            var i = 1;
            while (i < cmdsLength) {
                var cmd = cmds[i];
                var header = /^\s*/g.exec(cmd)[0];
                var headerLength = header.length;
                if (cmd[headerLength] == "[") {
                    var blockCmds = [cmd];
                    var j = i + 1;
                    while (j < cmdsLength) {
                        var next = cmds[j];
                        if (next[headerLength] != " ") break;
                        blockCmds.push(next);
                        j += 1;
                    }
                    var lastCmdIndex = result.length - 1;
                    var blockStart = result.length + start;
                    var k = this._handleBlock(blockCmds, blockStart, realLoopStart);
                    k.cmds.forEach(cmd1 => {
                        result.push(cmd1);
                    });
                    if (k.type == "elseif") {
                        result[lastCmdIndex] = `%${this._pc}=${result.length + start - 1}`;
                    } else if (k.type == "else") {
                        result[lastCmdIndex] = `%${this._pc}=${result.length + start}`;
                    }
                    i = j;
                } else {
                    result.push(cmd.substring(headerLength));
                    i += 1;
                }
            }

            callback();
            return { type: r.type, cmds: result };
        }
        _handleCondition(condition) {
            var type = null;
            var cmd = null;
            var formats = [
                { type: ControlKeys.while, regexp: /^\s*\[while\]/g },
                { type: ControlKeys.if, regexp: /^\s*\[if\]/g },
                { type: ControlKeys.elseif, regexp: /^\s*\[else\s?if\]/g },
                { type: ControlKeys.else, regexp: /^\s*\[else\]/g },
                { type: ControlKeys.continue, regexp: /^\s*\[continue\]/g },
                { type: ControlKeys.break, regexp: /^\s*\[break\]/g },
                { type: ControlKeys.exit, regexp: /^\s*\[exit\]/g },
            ];
            for (const format of formats) {
                var r = format.regexp.exec(condition);
                if (r) {
                    type = format.type;
                    var exp = condition.substring(r[0].length);
                    cmd = `%${this._cc}=${exp}`
                    break;
                }
            }
            if (type == null) {
                throw "编译失败: " + condition;
            }
            return { type: type, cmd: cmd };
        }
    }

    /***********************************************************************************\
        预编译实现层
    \***********************************************************************************/

    const PrecompileRulePriority = {
        subflow: 100,
        call: 90,
        annatition: 80,
        compatible: 70,
        guard: 60,
        emptyLine: 50,

        // 层外使用
        high: 30,
        ordinary: 20,
        low: 10
    };

    //---------------------------------------------------------------------------
    //  Precompile Annatitions
    //---------------------------------------------------------------------------

    (function () {
        const handle = function (cmds) {
            var result = [];
            for (const cmd of cmds) {
                if (/^\s*\/\//.test(cmd)) continue;
                result.push(cmd);
            }
            return result;
        };
        const rule = new PrecompileRule(handle, PrecompileRulePriority.annatition);
        PrecompileRuleCenter.shared().addRule(rule);
    })();

    (function () {
        const handle = function (cmds) {
            var result = [];
            var ignore = false;
            for (const cmd of cmds) {
                if (/^\s*\/\*/.test(cmd)) {
                    ignore = true;
                    continue;
                }
                if (ignore && /\*\/\s*$/.test(cmd)) {
                    ignore = false;
                    continue;
                }
                if (!ignore) {
                    result.push(cmd);
                }
            }
            return result;
        };
        const rule = new PrecompileRule(handle, PrecompileRulePriority.annatition);
        PrecompileRuleCenter.shared().addRule(rule);
    })();

    //---------------------------------------------------------------------------
    //  Precompile Subflows
    //---------------------------------------------------------------------------

    (function () {
        const handle = function (cmds) {
            let result = [];
            let collecting = false;
            let subflowCmd = null;
            for (const cmd of cmds) {
                var r = /^(\s*)<===+\s*$/.exec(cmd);
                if (r != null) {
                    collecting = true;
                    subflowCmd = "<===";
                    continue;
                }
                if (collecting) {
                    var r2 = /^\s*=+==>\s*$/.exec(cmd);
                    if (r2 != null) {
                        collecting = false;
                        subflowCmd += "===>";
                        result.push(subflowCmd);
                    } else {
                        subflowCmd += `\n${cmd}`;
                    }
                    continue;
                }
                result.push(cmd);
            }
            return result;
        };
        const rule = new PrecompileRule(handle, PrecompileRulePriority.subflow);
        PrecompileRuleCenter.shared().addRule(rule);
    })();

    //---------------------------------------------------------------------------
    //  Precompile Guards
    //---------------------------------------------------------------------------

    (function () {
        const handle = function (cmds) {
            var result = [];
            // {headerLength: Number, cmds: [String]}
            var guards = [];
            var guarding = false;
            for (const cmd of cmds) {
                var r = /^(\s*)<---+/.exec(cmd);
                if (r != null) {
                    guarding = true;
                    const guard = {
                        headerLength: r[1].length,
                        cmds: []
                    }
                    guards.push(guard);
                    continue;
                }
                if (guarding) {
                    var r2 = /^\s*-+-->/.exec(cmd);
                    if (r2 == null) {
                        const guard = guards[guards.length - 1];
                        guard.cmds.push(cmd.substring(guard.headerLength));
                    } else {
                        guarding = false;
                    }
                    continue;
                }
                result.push(cmd);
                var r3 = /^(\s*)[^\[\s]/.exec(cmd);
                if (r3 != null) {
                    var header = r3[1];
                    var hasGuard = false;
                    for (let j = guards.length; j > 0; j--) {
                        const guard = guards[j - 1];
                        if (header.length < guard.headerLength) {
                            guards.pop();
                            continue;
                        }
                        if (!hasGuard) {
                            result.push(`${header}%guardStart`);
                            hasGuard = true;
                        }
                        guard.cmds.forEach(cmd1 => {
                            result.push(`${header}${cmd1}`);
                        });
                    }
                    if (hasGuard) result.push(`${header}%guardEnd`);
                }
            }
            return result;
        };
        const rule = new PrecompileRule(handle, PrecompileRulePriority.guard);
        PrecompileRuleCenter.shared().addRule(rule);
    })();

    //---------------------------------------------------------------------------
    //  Precompile Calls
    //---------------------------------------------------------------------------

    var __CallCounter = 0;
    var FlowStore = null; // PersistentCache

    // TODO: 尚不支持嵌套调用
    // @call 函数名 参数1,参数2,参数3,...
    (function () {
        const handle = function (cmds) {
            let result = [];
            cmds.forEach(cmd => {
                var r = /^(\s*)@call\s(\S+)(\s*(\S.*)+\s*|\s*)$/.exec(cmd);
                if (r == null) {
                    result.push(cmd);
                    return;
                }
                const paramsField = r[4];
                let args = "";
                if (paramsField != null && paramsField.length > 0) {
                    const params = paramsField.split(",");
                    for (let i = 0; i < params.length; i++) {
                        const param = params[i];
                        args += `($arg${i})=${param}\n`;
                    }
                }
                const flowName = r[2];
                let source = FlowStore.get(flowName);
                if (source == null) {
                    Message.append(`<ord>未找到调用的流程 ${flowName}</ord>`);
                    //throw `未找到调用的流程 ${flowName}`;
                }
                let callSource = `[if] true\n` + SourceCodeHelper.appendHeader("    ", `${args}\n${source}`);
                const callId = __CallCounter; __CallCounter += 1;
                callSource = callSource.replace(/\(\$([_a-z][a-zA-Z0-9_]*?)\)/g, `($__x${callId}_$1)`);
                callSource = callSource.replace(/\(([_a-z][a-zA-Z0-9_]*?)\)/g, `(__x${callId}_$1)`);
                const callCmds = SourceCodeHelper.split(callSource);
                const header = r[1];
                for (const callCmd of callCmds) {
                    if (/^\s*#/.test(callCmd)) continue;
                    result.push(`${header}${callCmd}`);
                }
            });
            return result;
        };
        const rule = new PrecompileRule(handle, PrecompileRulePriority.call);
        PrecompileRuleCenter.shared().addRule(rule);
    })();

    //---------------------------------------------------------------------------
    //  Precompile Empty Line
    //---------------------------------------------------------------------------

    (function () {
        const handle = function (cmds) {
            var result = [];
            for (const cmd of cmds) {
                if (!/\S+/.test(cmd)) continue;
                result.push(cmd);
            }
            return result;
        };
        const rule = new PrecompileRule(handle, PrecompileRulePriority.emptyLine);
        PrecompileRuleCenter.shared().addRule(rule);
    })();

    //---------------------------------------------------------------------------
    //  Precompile Raid 1.x.x
    //---------------------------------------------------------------------------

    (function addCompatibleGuardRule() {
        const handle = function (cmds) {
            var result = [];
            cmds.forEach(cmd => {
                var r = /^\s*#(\[.*)$/.exec(cmd);
                if (r == null) {
                    result.push(cmd);
                    return;
                }
                var c1 = `<---`;
                var c2 = r[1];
                var c3 = `--->`;
                result.push(c1, c2, c3);
            });
            return result;
        };
        const rule = new PrecompileRule(handle, PrecompileRulePriority.compatible);
        PrecompileRuleCenter.shared().addRule(rule);
    })();

    function CompatibleOperator(exp) {
        var result = exp;
        result = result.replace(/([^&])[&]([^&])/g, "$1&&$2");
        result = result.replace(/([^\|])[\|]([^\|])/g, "$1||$2");
        result = result.replace(/([^=<>!])[=]([^=])/g, "$1==$2");
        return result;
    }

    (function addCompatibleUntilRule() {
        const handle = function (cmds) {
            var result = [];
            cmds.forEach(cmd => {
                var r = /^(\s*)\[=(.+?)\](.*)$/.exec(cmd);
                if (r == null) {
                    result.push(cmd);
                    return;
                }
                var header = r[1];
                var condition = r[2];
                condition = CompatibleOperator(condition);
                var command = r[3];
                var c1 = `${header}@until ${condition}`;
                result.push(c1);
                if (!/\S/.test(command)) return;
                var c2 = `${header}${command}`;
                result.push(c2);
            });
            return result;
        };
        const rule = new PrecompileRule(handle, PrecompileRulePriority.compatible);
        PrecompileRuleCenter.shared().addRule(rule);
    })();

    (function addCompatibleIfRule() {
        const handle = function (cmds) {
            var result = [];
            cmds.forEach(cmd => {
                var r = /^(\s*)\[(.*?[=<>].*?|true|false)\](.*)$/i.exec(cmd);
                if (r == null) {
                    result.push(cmd);
                    return;
                }
                var command = r[3];
                if (!/\S/.test(command)) return;
                var header = r[1];
                var condition = r[2];
                condition = CompatibleOperator(condition);
                var c1 = `${header}[if] ${condition}`;
                var c2 = `${header}    ${command}`;
                result.push(c1, c2);
            });
            return result;
        };
        const rule = new PrecompileRule(handle, PrecompileRulePriority.compatible);
        PrecompileRuleCenter.shared().addRule(rule);
    })();

    (function addCompatibleNextRule() {
        const handle = function (cmds) {
            var result = [];
            cmds.forEach(cmd => {
                var r = /^(\s*)@next(.*)$/i.exec(cmd);
                if (r == null) {
                    result.push(cmd);
                    return;
                }
                var header = r[1];
                result.push(`${header}[continue]`);
            });
            return result;
        };
        const rule = new PrecompileRule(handle, PrecompileRulePriority.compatible);
        PrecompileRuleCenter.shared().addRule(rule);
    })();

    (function addCompatibleExitRule() {
        const handle = function (cmds) {
            var result = [];
            cmds.forEach(cmd => {
                var r = /^(\s*)@exit(.*)$/i.exec(cmd);
                if (r == null) {
                    result.push(cmd);
                    return;
                }
                var header = r[1];
                result.push(`${header}[break]`);
            });
            return result;
        };
        const rule = new PrecompileRule(handle, PrecompileRulePriority.compatible);
        PrecompileRuleCenter.shared().addRule(rule);
    })();

    /***********************************************************************************\
        代码执行器层
    \***********************************************************************************/

    //---------------------------------------------------------------------------
    //  Handle Condition
    //---------------------------------------------------------------------------

    var AssertLeftMarkHandlerCenter = {
        /**
         * @param {Function} handler function(leftMark)->{handle: Bool, value: string}
         */
        addHandler: function (handler) {
            this._leftMarkHandlers.push(handler);
        },
        getValue(leftMark) {
            for (let i = 0; i < this._leftMarkHandlers.length; i++) {
                const handler = this._leftMarkHandlers[i];
                var result = handler.handle(leftMark);
                if (!result.handle) continue;
                return result.value;
            }
            return leftMark;
        },
        _leftMarkHandlers: []
    };

    class AssertWrapper {
        /**
         * @param {Function} assert1 function(string)->Bool
         * @param {string} text
         */
        constructor(assert1) {
            var theSelf = this;
            this.assert = function () {
                return assert1(theSelf.text);
            };
        }
        setText(text) {
            this.text = text;
        }
    }

    class AssertHolder {
        /**
         * @param {Function} match function(expression)->Bool
         * @param {Function} getAssertWrapper function()->AssertWrapper
         */
        constructor(match, getAssertWrapper) {
            this.match = match;
            this._getAssertWrapper = getAssertWrapper;
        }
        getAssertWrapper() {
            return this._getAssertWrapper();
        }
    }

    var AssertHolderCenter = {
        /**
         * @param {AssertHolder} holder
         */
        addAssertHolder: function (holder) {
            this._assertHolders.push(holder);
        },
        /**
         * @param {string} expression
         * @returns {Function} assert: function()
         */
        get: function (expression) {
            var exp = expression.replace(/^\s*|\s*$/g, "");
            var theSelf = this;
            var relationIndex = exp.search(/&&|\|\|/g);
            if (relationIndex != -1) {
                var relation = exp.substring(relationIndex, relationIndex + 2);
                var left = exp.substring(0, relationIndex);
                var right = exp.substring(relationIndex + 2);
                var assert = function () {
                    var leftAssert = theSelf.get(left);
                    var rightAssert = theSelf.get(right);
                    switch (relation) {
                        case "&&":
                            return leftAssert() && rightAssert();
                        case "||":
                            return leftAssert() || rightAssert();
                    }
                };
                return assert;
            }
            var not = exp[0];
            if (not == "!") {
                var assert = function () {
                    return !theSelf.get(exp.substring(1))();
                }
                return assert;
            }
            for (let i = 0; i < this._assertHolders.length; i++) {
                const holder = this._assertHolders[i];
                if (holder.match(exp)) {
                    var wrapper = holder.getAssertWrapper();
                    wrapper.setText(exp);
                    return wrapper.assert;
                }
            }
            return null;
        },
        _assertHolders: []
    };

    (function addTureAssertHolder() {
        var match = function (text) {
            return text == "true";
        };
        var assert = function (text) {
            return true;
        };
        var holder = new AssertHolder(match, function () { return new AssertWrapper(assert); });
        AssertHolderCenter.addAssertHolder(holder);
    })();

    (function addFalseAssertHolder() {
        var match = function (text) {
            return text == "false";
        };
        var assert = function (text) {
            return false;
        };
        var holder = new AssertHolder(match, function () { return new AssertWrapper(assert); });
        AssertHolderCenter.addAssertHolder(holder);
    })();

    (function addPresetConfigAssertHolder() {
        var patt = new RegExp(">=?|<=?|!=|==?");
        var match = function (text) {
            return patt.test(text);
        };
        var assert = function (text) {
            let validText = text;
            validText = validText.replace(/<(\w+)>/g, "「$1」");
            validText = validText.replace(/<(\/\w+)>/g, "「¿$1」");
            var result = patt.exec(validText);
            var opt = result[0];
            var parts = validText.split(opt);
            var left = parts[0].replace(/^\s*|\s*$/g, "");
            var lvalue = AssertLeftMarkHandlerCenter.getValue(left);
            var rvalue = parts[1].replace(/^\s*|\s*$/g, "");;
            var lfloat = parseFloat(lvalue);
            var rfloat = parseFloat(rvalue);
            var byDigit = false;
            if (!isNaN(lfloat) && !isNaN(rfloat)) {
                lvalue = lfloat;
                rvalue = rfloat;
                byDigit = true;
            }
            switch (opt) {
                case "=":
                case "==":
                    if (byDigit) {
                        return Math.abs(lvalue - rvalue) < 0.001;
                    } else {
                        return lvalue == rvalue;
                    }
                case ">":
                    return lvalue > rvalue;
                case "<":
                    return lvalue < rvalue;
                case ">=":
                    return lvalue >= rvalue;
                case "<=":
                    return lvalue <= rvalue;
                case "!=":
                    if (byDigit) {
                        return Math.abs(lvalue - rvalue) > 0.001;
                    } else {
                        return lvalue != rvalue;
                    }
                default:
                    return false;
            }
        };
        var holder = new AssertHolder(match, function () { return new AssertWrapper(assert); });
        AssertHolderCenter.addAssertHolder(holder);
    })();

    //---------------------------------------------------------------------------
    //  Cmd Prehandler
    //---------------------------------------------------------------------------

    const CmdPrehandlerPriority = {
        ordinary: 50,
    };

    class CmdPrehandler {
        /**
         * @param {Function} handle function(performer: Performer, cmd: String) -> String
         * @param {Number} [priority]
         */
        constructor(handle, priority) {
            this._handle = handle;
            this.priority = priority ? priority : CmdPrehandlerPriority.ordinary;
        }
        handle(performer, cmd) {
            return this._handle(performer, cmd);
        }
    }

    class CmdPrehandleCenter extends CmdPrehandler {
        constructor() {
            const handle = function (performer, cmd) {
                var result = cmd;
                for (const handler of this._handlers) {
                    result = handler.handle(performer, result);
                }
                return result;
            };
            super(handle, -1);
            this._handlers = [];
            this.instance = this;
        }
        static shared() {
            if (!this.instance) {
                this.instance = new CmdPrehandleCenter();
            }
            return this.instance;
        }
        addHandler(handler) {
            SortInsert(this._handlers, handler, (p, c) => {
                return p.priority >= c.priority;
            });
        }
    }

    //---------------------------------------------------------------------------
    //  Cmd Executor
    //---------------------------------------------------------------------------

    const CmdExecutorPriority = {
        compiler: 90,

        // 层外使用
        high: 30,
        ordinary: 20,
        low: 10
    };

    class CmdExecutor {
        /**
         * @param {Function} appropriate function(cmd: String) -> Boolean
         * @param {Function} execute function(performer: Performer, cmd: String)
         * @param {Number} priority
         */
        constructor(appropriate, execute, priority) {
            this._appropriate = appropriate;
            this._execute = execute;
            this.priority = priority ? priority : CmdExecutorPriority.ordinary;
        }
        appropriate(cmd) {
            return this._appropriate(cmd);
        }
        execute(performer, cmd) {
            return this._execute(performer, cmd);
        }
    }

    var CmdExecuteCenter = {
        addExecutor: function (executor) {
            SortInsert(this._executors, executor, (p, c) => {
                return p.priority >= c.priority;
            });
        },
        execute: function (performer, cmd) {
            var valid = null;
            for (const executor of this._executors) {
                if (executor.appropriate(cmd)) {
                    valid = executor;
                    break;
                }
            }
            if (valid == null) {
                throw `无法处理此命令: ${cmd}`;
            }
            return valid.execute(performer, cmd);
        },
        _executors: []
    };

    //---------------------------------------------------------------------------
    //  Performer
    //---------------------------------------------------------------------------

    class Performer {
        /**
         * @param {String} source
         */
        constructor(name, source) {
            this._name = name;
            this._source = source;
            this._log = false;
            this._running = false;
            this._pausing = false;
        }

        name() {
            return this._name;
        }
        runing() {
            return this._running;
        }
        pausing() {
            return this._pausing;
        }
        log(value) {
            if (value == null) return this._log;
            if (/\/\/\s*~silent\s*\n/.test(this._source) == true) return this._log;
            this._log = value;
        }

        start(callback) {
            if (this._running) return;

            try {
                var compiler = new Compiler();
                var start = new Date().getTime();
                this._cmds = compiler.compile(this._source);
                var end = new Date().getTime();
                console.log(`编译总耗时: ${end - start} 毫秒`);
            } catch (err) {
                Message.append(`<ord>编译错误</ord>: ${err}`);
                return;
            }

            if (this._log) Message.append(`<hiy>开始执行，流程: ${this._name}...</hiy>`);
            this._running = true;
            this._pausing = false;

            this._callback = callback;

            this._pc = 0;
            this._cc = true;

            this._guarding = false;
            this._subflows = [];

            this._perform();
        }
        stop() {
            if (!this._running) return;
            this._running = false;
            for (const subflow of this._subflows) {
                subflow.stop();
            }
            if (this._log) Message.append(`<hiy>执行完毕，流程: ${this._name}。</hiy>`);
            if (this._callback) this._callback();
        }
        pause() {
            if (!this._running) return;
            if (this._log) Message.append(`<hiy>暂停执行，流程: ${this._name}...</hiy>`);
            this._pausing = true;
            for (const subflow of this._subflows) {
                subflow.pause();
            }
        }
        resume() {
            if (!this._running || !this._pausing) return;
            if (this._log) Message.append(`<hiy>恢复执行，流程: ${this._name}。</hiy>`);
            this._pausing = false;
            for (const subflow of this._subflows) {
                subflow.resume();
            }
            this._perform();
        }

        guarding() {
            return this._guarding;
        }
        timeSeries(timestamp) {
            if (timestamp != null) {
                if (!this.guarding()) this._systemCmdTimeSeries = timestamp;
                return;
            }
            return this._systemCmdTimeSeries;
        }

        async _perform() {
            if (!this._running || this._pausing) return;
            if (this._doing) return;

            var cmd = this._cmds[this._pc];
            // console.log(`>>> ${this._name}, ${this._pc}, ${this._cc}, ${cmd}`);
            this._pc += 1;

            try {
                this._doing = true;
                await CmdExecuteCenter.execute(this, cmd);
            } catch (err) {
                Message.append(`<ord>执行错误</ord>: ${err}`);
                this.stop();
                return;
            } finally {
                this._doing = false;
            }
            this._perform();
        }
    }

    // Compile Cmd Executor

    (function () {
        const appropriate = function (cmd) {
            return cmd == "%exit";
        };
        const execute = function (performer, cmd) {
            performer.stop();
        };
        const executor = new CmdExecutor(appropriate, execute, CmdExecutorPriority.compiler);
        CmdExecuteCenter.addExecutor(executor);
    })();

    (function () {
        const appropriate = function (cmd) {
            return cmd == "%pass";
        };
        const execute = function (performer, cmd) { };
        const executor = new CmdExecutor(appropriate, execute, CmdExecutorPriority.compiler);
        CmdExecuteCenter.addExecutor(executor);
    })();

    (function () {
        const appropriate = function (cmd) {
            return cmd.indexOf("%PC=CC") == 0;
        };
        const execute = function (performer, cmd) {
            performer._pc = eval(`performer._cc${cmd.substring(6)}`);
        };
        const executor = new CmdExecutor(appropriate, execute, CmdExecutorPriority.compiler);
        CmdExecuteCenter.addExecutor(executor);
    })();

    (function () {
        const appropriate = function (cmd) {
            return cmd.indexOf("%PC=") == 0;
        };
        const execute = function (performer, cmd) {
            performer._pc = eval(cmd.substring(4));
        };
        const executor = new CmdExecutor(appropriate, execute, CmdExecutorPriority.compiler);
        CmdExecuteCenter.addExecutor(executor);
    })();

    (function () {
        const appropriate = function (cmd) {
            return cmd.indexOf("%CC=") == 0;
        };
        const execute = function (performer, cmd) {
            const validCmd = CmdPrehandleCenter.shared().handle(performer, cmd);
            var assert = AssertHolderCenter.get(validCmd.substring(4));
            performer._cc = assert();
        };
        const executor = new CmdExecutor(appropriate, execute, CmdExecutorPriority.compiler);
        CmdExecuteCenter.addExecutor(executor);
    })();

    (function () {
        const appropriate = function (cmd) {
            return cmd == "%guardStart";
        };
        const execute = function (performer, cmd) {
            performer._guarding = true;
        };
        const executor = new CmdExecutor(appropriate, execute, CmdExecutorPriority.compiler);
        CmdExecuteCenter.addExecutor(executor);
    })();

    (function () {
        const appropriate = function (cmd) {
            return cmd == "%guardEnd";
        };
        const execute = function (performer, cmd) {
            performer._guarding = false;
        };
        const executor = new CmdExecutor(appropriate, execute, CmdExecutorPriority.compiler);
        CmdExecuteCenter.addExecutor(executor);
    })();

    (function () {
        const appropriate = function (cmd) {
            return /^<===[^爫]*===>$/.test(cmd);
        };
        const execute = function (performer, cmd) {
            const source = cmd.slice(4, -4);
            const p = new Performer("subflow", source);
            performer._subflows.push(p);
            p.start();
        };
        const executor = new CmdExecutor(appropriate, execute, CmdExecutorPriority.compiler);
        CmdExecuteCenter.addExecutor(executor);
    })();

    //---------------------------------------------------------------------------
    //  Variable
    //---------------------------------------------------------------------------

    function TryCalculate(expression) {
        if (/^[0-9\+\-\*\/% ]*$/g.test(expression)) {
            return eval(expression);
        }
        return expression;
    }

    var PersistentVariables = null; // PersistentCache

    function UpdateVariable(performer, name, exp) {
        if (/^_*[A-Z][a-zA-Z0-9_]*$/.test(name)) {
            PersistentVariables.save(name, TryCalculate(exp));
        } else if (/^_*[a-z][a-zA-Z0-9_]*$/.test(name)) {
            if (performer.tempParams == null) {
                performer.tempParams = {};
            }
            performer.tempParams[name] = TryCalculate(exp);
        }
    }

    (function () {
        var patt = /^\(\$([A-Za-z_][a-zA-Z0-9_]*?)\)\s*=\s*(.+)\s*/;
        const appropriate = function (cmd) {
            return patt.test(cmd);
        };
        const execute = function (performer, cmd) {
            const validCmd = CmdPrehandleCenter.shared().handle(performer, cmd);
            var result = patt.exec(validCmd);
            var name = result[1];
            var exp = result[2];
            UpdateVariable(performer, name, exp);
        };
        const executor = new CmdExecutor(appropriate, execute);
        CmdExecuteCenter.addExecutor(executor);
    })();

    var VariableStore = {
        register: function (getAll) {
            this._allGetAll.push(getAll);
        },
        getAll: function () {
            var result = {};
            for (const getAll of this._allGetAll) {
                const all = getAll();
                for (const key in all) {
                    if (!all.hasOwnProperty(key)) continue;
                    result[key] = all[key];
                }
            }
            return result;
        },
        _allGetAll: []
    };

    (function () {
        const _assignVariables = function (expression, params) {
            var placeholders = [];
            var patt = /\([:a-zA-Z0-9_]+?\)/g;
            var result = patt.exec(expression);
            while (result != null) {
                placeholders.push(result[0]);
                result = patt.exec(expression);
            }
            let assignedExp = expression;
            for (let i = 0; i < placeholders.length; i++) {
                const placeholder = placeholders[i];
                var key = placeholder.substring(1, placeholder.length - 1);
                var value = params[key];
                if (value == null) value = "null";
                assignedExp = assignedExp.replace(placeholder, value);
            }

            let placeholders2 = [];
            let patt2 = /\((:[a-zA-Z0-9_]+?)\s+([^\(\)\s][^\(\)]*?)\s*\)/g;
            let r2 = patt2.exec(assignedExp);
            while (r2 != null) {
                placeholders2.push({ value: r2[0], key: `${r2[1]} `, params: r2[2] });
                r2 = patt2.exec(assignedExp);
            }
            for (const p of placeholders2) {
                const func = params[p.key];
                let value = "null";
                if (func != null && typeof func == "function") {
                    value = func(p.params);
                }
                assignedExp = assignedExp.replace(p.value, value);
            }

            return assignedExp;
        };
        const assignVariables = function (expression, params) {
            let result = expression;
            while (true) {
                const assigned = _assignVariables(result, params);
                if (assigned == result) return result;
                result = assigned;
            }
        };
        const handle = function (performer, cmd) {
            let allParam = {};
            Object.assign(allParam, VariableStore.getAll(), performer.tempParams);
            const result = assignVariables(cmd, allParam);
            return result;
        };
        const handler = new CmdPrehandler(handle)
        CmdPrehandleCenter.shared().addHandler(handler);
    })();

    /***********************************************************************************\
        System Library
    \***********************************************************************************/

    class AtCmdExecutor extends CmdExecutor {
        constructor(key, execute, priority) {
            const appropriate = function (cmd) {
                return cmd.indexOf(`@${key}`) == 0;
            };
            const superExecute = function (performer, cmd) {
                const validCmd = CmdPrehandleCenter.shared().handle(performer, cmd);
                let param = /^\s*(.*)\s*$/.exec(validCmd.substring(key.length + 1))[1];
                if (param && param.length == 0) param = null;
                return execute(performer, param);
            };
            super(appropriate, superExecute, priority);
        }
    }

    (function () {
        const executor = new AtCmdExecutor("wait", function (performer, param) {
            if (performer.log()) Message.cmdLog(`等待 ${(param / 1000).toFixed(2)} 秒`);
            return new Promise(resolve => {
                setTimeout(() => resolve(), param);
            });
        });
        CmdExecuteCenter.addExecutor(executor);
    })();

    (function () {
        const executor = new AtCmdExecutor("await", function (performer, param) {
            function createWorker(f) {
                var blob = new Blob(['(function(){' + f.toString() + '})()']);
                var url = window.URL.createObjectURL(blob);
                var worker = new Worker(url);
                return worker;
            }
            return new Promise(resolve => {
                var wa = createWorker("setTimeout(() =>  postMessage('0'), "+param+")")
                wa.onmessage = function (event) {
                    // console.log(new Date,event.data);
                    wa.terminate();
                    resolve();
                };
            });
        });
        CmdExecuteCenter.addExecutor(executor);
    })();

    (function () {
        const executor = new AtCmdExecutor("debug", function (performer, param) {
            let text = param;
            if (text[0] == ">") {
                text = JSON.stringify(eval(text.substring(1)));
            }
            var message = `&nbsp;&nbsp;[debug]: <hiz>${text}</hiz>`;
            Message.append(message);
            // console.log(message);
        });
        CmdExecuteCenter.addExecutor(executor);
    })();

    (function () {
        const executor = new AtCmdExecutor("print", function (performer, param) {
            Message.append(param);
        });
        CmdExecuteCenter.addExecutor(executor);
    })();

    class UntilAtCmdExecutor extends CmdExecutor {
        constructor(key, assert, priority, tryAgain, timeout) {
            const appropriate = function (cmd) {
                return cmd.indexOf(`@${key}`) == 0;
            };
            const superExecute = function (performer, cmd) {
                const tryExecute = function (callback) {
                    const validCmd = CmdPrehandleCenter.shared().handle(performer, cmd);
                    let param = /^\s*(.*)\s*$/.exec(validCmd.substring(key.length + 1))[1];
                    if (param != null && param.length == 0) param = null;
                    const result = assert(performer, param);
                    if (result == true) {
                        if (timeout != null) {
                            setTimeout(_ => { callback(); }, timeout);
                        } else {
                            callback();
                        }
                    } else {
                        setTimeout(_ => { tryExecute(callback); }, tryAgain != null ? tryAgain : 500);
                    }
                };
                if (performer.log()) Message.cmdLog("等待，直至符合条件", cmd);
                return new Promise(resolve => {
                    tryExecute(resolve);
                });
            };
            super(appropriate, superExecute, priority);
            this._key = key;
            this._assert = assert;
        }
    }

    (function () {
        const executor = new UntilAtCmdExecutor("until", function (performer, param) {
            const assert = AssertHolderCenter.get(param);
            return assert();
        });
        CmdExecuteCenter.addExecutor(executor);
    })();

    (function () {
        const appropriate = function (cmd) {
            return cmd.indexOf("@js ") == 0;
        };
        const execute = function (performer, cmd) {
            const validCmd = CmdPrehandleCenter.shared().handle(performer, cmd);
            let exp = validCmd.substring(4);
            if (performer.log()) Message.cmdLog("调用 js", exp);
            const result = /^\(\$([A-Za-z_][a-zA-Z0-9_]*?)\)\s*=\s*/.exec(exp);
            if (result == null) {
                eval(exp);
                return;
            }
            const name = result[1];
            exp = exp.substring(result[0].length);
            UpdateVariable(performer, name, eval(exp));
        };
        const executor = new CmdExecutor(appropriate, execute);
        CmdExecuteCenter.addExecutor(executor);
    })();
    
     (function () {
        const appropriate = function (cmd) {
            return cmd.indexOf("@stop ") == 0;
        };
        const execute = function (performer, cmd) {
            const validCmd = CmdPrehandleCenter.shared().handle(performer, cmd);
            let exp = validCmd.substring(6);
            if (performer.log()) Message.cmdLog("停止流程", exp);
            const result = /^\(\$([A-Za-z_][a-zA-Z0-9_]*?)\)\s*=\s*/.exec(exp);
            if (result == null) {
                ManagedPerformerCenter.getAll().filter(x => x.name() == exp).forEach(x => x.stop())
                return;
            }
            const name = result[1];
            exp = exp.substring(result[0].length);
            UpdateVariable(performer, name, ManagedPerformerCenter.getAll().filter(x => x.name() == exp).forEach(x => x.stop()));
        };
        const executor = new CmdExecutor(appropriate, execute);
        CmdExecuteCenter.addExecutor(executor);
    })();

    /***********************************************************************************\
        Time Variables
    \***********************************************************************************/

    VariableStore.register(_ => {
        return {
            ":date": new Date().getDate(),
            ":day": new Date().getDay(),
            ":hour": new Date().getHours(),
            ":minute": new Date().getMinutes(),
            ":second": new Date().getSeconds()
        }
    });

    /***********************************************************************************\
        Compatible With wsmud_pluginss
    \***********************************************************************************/

    /**
     * @param {String} source
     * @param {Function} callback function(resolve)->void
     */
    function PerformerPromise(source, callback, log) {
        return new Promise(resolve => {
            const p = new Performer("", source);
            if (log) p.log(log);
            p.start(_ => {
                if (callback) {
                    callback(resolve);
                } else {
                    resolve();
                }
            });
        });
    }

    (function () {
        const appropriate = function (cmd) {
            return cmd.indexOf("$wait ") == 0;
        };
        const execute = function (performer, cmd) {
            return PerformerPromise(`@wait ${cmd.substring(6)}`, null, performer.log());
        };
        const executor = new CmdExecutor(appropriate, execute);
        CmdExecuteCenter.addExecutor(executor);
    })();

    /***********************************************************************************\
        User Config Param
    \***********************************************************************************/

    var __ConfigDomIdCounter = 0;
    function GetConfigDomId() {
        const id = __ConfigDomIdCounter;
        __ConfigDomIdCounter += 1;
        return `wsmud_raid_config_dom_id_${id}`;
    }

    var __ConfigPanelHtml = "";
    var __ConfigPanelInits = [];
    var __ConfigPanelActions = [];

    class HashCmdExecutor extends CmdExecutor {
        constructor(key, handle) {
            const appropriate = function (cmd) {
                return cmd.indexOf(`#${key}`) == 0;
            };
            const superHandle = function (performer, cmd) {
                const validCmd = CmdPrehandleCenter.shared().handle(performer, cmd);
                const param = validCmd.substring(this._key.length + 2);
                const result = handle(performer, cmd, param);
                if (result == null) return;
                if (result.html) __ConfigPanelHtml += result.html;
                if (result.init) __ConfigPanelInits.push(result.init);
                if (result.action) __ConfigPanelActions.push(result.action);
            };
            super(appropriate, superHandle);
            this._key = key;
        }
    }

    (function () {
        const executor = new HashCmdExecutor("input", function (performer, cmd, param) {
            const result = /^\(\$([a-zA-Z0-9_]+)\)\s?=\s?([^,]+?),(.*)\s*$/.exec(param);
            if (result == null) {
                throw `错误的格式: ${cmd}`;
            }
            const variableName = result[1];
            const desc = result[2];
            const defaultValue = result[3] == null ? "" : result[3];
            const id = GetConfigDomId();
            const html = `
            <p>
                <label for="${id}">&nbsp;* ${desc}:&nbsp;</label><input style='width:80px' id ="${id}" type="text">
            </p>`;
            const init = function () {
                $(`#${id}`).val(defaultValue);
            };
            const action = function () {
                let result = {};
                result[variableName] = $(`#${id}`).val();
                return result;
            };
            return { html: html, init: init, action: action };
        });
        CmdExecuteCenter.addExecutor(executor);
    })();

    (function () {
        const executor = new HashCmdExecutor("select", function (performer, cmd, param) {
            const result = /^\(\$([a-zA-Z0-9_]+)\)\s?=\s?([^,]+?),([^,]+?),([^,]+?)\s*$/.exec(param);
            if (result == null) {
                throw `错误的格式: ${cmd}`;
            }
            const variableName = result[1];
            const desc = result[2];
            const options = result[3].split("|");
            const defaultValue = result[4];
            const id = GetConfigDomId();
            let optionsHtml = "";
            options.forEach(option => {
                optionsHtml += `<option value="${option}">${option}</option>`;
            });
            const html = `
            <p>
                <label for="${id}">&nbsp;* ${desc}:&nbsp;</label><select style='width:80px' id="${id}">
                    ${optionsHtml}
                </select>
            </p>`;
            const init = function () {
                $(`#${id}`).val(defaultValue);
            };
            const action = function () {
                let result = {};
                result[variableName] = $(`#${id}`).val();
                return result;
            };
            return { html: html, init: init, action: action };
        });
        CmdExecuteCenter.addExecutor(executor);
    })();

    (function () {
        const appropriate = function (cmd) {
            return /^#config\s*$/.test(cmd);
        };
        const execute = function (performer, cmd) {
            return new Promise(resolve => {
                var index = layer.open({
                    type: 1,
                    skin: "layui-layer-rim", //加上边框
                    area: "350px",
                    title: "配置参数",
                    content: __ConfigPanelHtml,
                    offset: "auto",
                    shift: 2,
                    move: false,
                    closeBtn: 0,
                    success: function (layero, index) {
                        __ConfigPanelInits.forEach(init => { init(); });
                        for (const node of layero[0].children) {
                            if (node.className != "layui-layer-content") continue;
                            node.setAttribute("style", "max-height: 370px;color: rgb(0, 128, 0);");
                        }
                    },
                    end: function () {
                        __ConfigPanelHtml = "";
                        __ConfigPanelInits = [];
                        __ConfigPanelActions = [];
                    },
                    btn: ['运行流程', '取消'],
                    yes: function () {
                        __ConfigPanelActions.forEach(action => {
                            const params = action();
                            for (const key in params) {
                                if (!params.hasOwnProperty(key)) continue;
                                UpdateVariable(performer, key, params[key]);
                            }
                        });
                        layer.close(index);
                        resolve();
                    },
                    btn2: function () {
                        performer.stop();
                        resolve();
                    }
                });
            });
        };
        const executor = new CmdExecutor(appropriate, execute);
        CmdExecuteCenter.addExecutor(executor);
    })();

    /***********************************************************************************\
        WSMUD
    \***********************************************************************************/

    var WG = null;
    var messageAppend = null;
    var messageClear = null;
    var T = null;
    var L = null;

    Message.append = function (msg) {
        messageAppend(msg);
    };
    Message.clean = function () {
        messageClear();
    };

    const RoleState = {
        none: "发呆",
        liaoshang: "疗伤",
        dazuo: "打坐",
        wakuang: "挖矿",
        gongzuo: "工作",
        lianxi: "练习",
        xuexi: "学习",
        biguan: "闭关",
        lianyao: "炼药",
        lingwu: "领悟",
        dushu: "读书",
        juhun: "聚魂",
        tuiyan: "推演"
    };

    /**
     * @param {string} itemName
     * @param {Boolean} blurry
     * @param {string} [quality] white(w), green(g), blue(b), yellow(y), purple(p), orange(o), red(r)
     */
    function FindItem(list, itemName, blurry, quality, filterExp) {
        var pattStr = blurry ? itemName : "^" + itemName + "$";
        if (/<[a-zA-Z]{3}>.+<\/[a-zA-Z]{3}>/g.test(itemName)) {
            pattStr = "^" + itemName + "$";
        } else if (quality != null) {
            var map = {
                "white": "wht",
                "w": "wht",
                "green": "hig",
                "g": "hig",
                "blue": "hic",
                "b": "hic",
                "yellow": "hiy",
                "y": "hiy",
                "purple": "HIZ",
                "p": "HIZ",
                "orange": "hio",
                "o": "hio",
                "red": "ord",
                "r": "ord"
            };
            var tag = map[quality];
            if (tag != null) {
                if (blurry) {
                    pattStr = "<" + tag + ">.*" + itemName + ".*</" + tag + ">";
                } else {
                    pattStr = "<" + tag + ">" + itemName + "</" + tag + ">";
                }
            }
        }
        var patt = new RegExp(pattStr);
        for (const item of list) {
            if (patt.test(item.name) && !FilterCenter.filter(filterExp, item)) {
                return item;
            }
        }
        return null;
    }

    var Role = {
        id: null,
        name: null,
        grade: null,
        family: null,
        energy: 0,
        money: 0,

        hp: 0,
        maxHp: 0,
        mp: 0,
        maxMp: 0,

        status: {},
        equipments: [],
        items: {}, // {id: object}
        stores: {}, // {id: object}
        _weaponType: '',
        skills:{},
        profitInfo : null,
        kongfu: {
            quan: null,
            nei: null,
            zhao: null,
            qing: null,
            jian: null,
            dao: null,
            gun: null,
            zhang: null,
            bian: null,
            an: null
        },

        init: function () {
            WG.add_hook("login", function (data) {
                Role.id = data.id;
                Role.status = [];
                setTimeout(function () {
                    $("span[command=skills]").click();
                    setTimeout(_ => { $(".glyphicon-remove-circle").click(); }, 500);
                }, 2000); // 查看装备技能
                // if (GM_getValue(`###CodeTranslator@${Role.id}`, null) != "did") {
                //     CodeTranslator.run();
                //     GM_setValue(`###CodeTranslator@${Role.id}`, "did");
                // }
                UI.showToolbar();
                setTimeout(_ => { Server.getNotice(); }, 3000);
            });
            $("li[command=SelectRole]").on("click", function () {
                Role.name = $('.role-list .select').text().split(/\s+/).pop();
                //Role.grade = $('.role-list .select').text().split(/\s+/).slice(-2)[0];
            });
            Role._monitorHpMp();
            Role._monitorStatus();
            Role._monitorState();
            Role._monitorDeath();
            Role._monitorSkillCD();
            Role._monitorSkills();
            Role._monitorGains();
            Role._monitorItems();
            Role._monitorCombat();
            Role._monitorInfo();
            Role._monitorWeapon();
        },

        hasStatus: function (s) {
            var stamp = Role.status[s];
            if (stamp == null) return false;
            if (stamp < new Date().getTime()) return false;
            return true;
        },
        isFree: function () {
            return !Role.hasStatus("busy") && !Role.hasStatus("faint") && !Role.hasStatus("rash");
        },

        gains(from, to) {
            var theGains = Role._gains.slice();
            var start = -1;
            var end = -1;
            for (let i = 0; i < theGains.length; i++) {
                const gain = theGains[i];
                if (gain.timestamp >= from) { start = i; break; }
            }
            for (let j = theGains.length - 1; j >= 0; j--) {
                const gain = theGains[j];
                if (gain.timestamp <= to) { end = j; break; }
            }
            if (start == -1 || end == -1) return [];
            return theGains.slice(start, end + 1);
        },

        state: RoleState.none,

        wearing: function (eqId) {
            for (const eq of this.equipments) {
                if (eq != null && eq.id == eqId) return true;
            }
            return false;
        },

        getEqId: function (index) {
            const eq = this.equipments[index];
            if (eq == null) return null;
            return eq.id;
        },

        living: true,

        combating: false,

        rtime: false,

        shimen: function (callback) {
            var timestamp = new Date().getTime();
            Role._shimen(0, timestamp, callback);
        },

        atPath: function (p) {
            switch (arguments.length) {
                case 0:
                    return Room.path;
                case 1:
                    return p == Room.path;
            }
        },
        inRoom: function (n) {
            switch (arguments.length) {
                case 0:
                    return Room.name;
                case 1:
                    return n == Room.name;
            }
        },

        findItem: function (itemName, blurry, quality, filterExp) {
            return FindItem(Object.values(Role.items), itemName, blurry, quality, filterExp);
        },

        renew: function (callback) {
            const source = `
            stopstate;$to 扬州城-武庙
            @liaoshang
            [if] (:mpPer)<0.8
                @dazuo
                stopstate
            `;
            const p = new Performer("", source);
            p.start(callback);
        },

        cleanBag: function (callback) {
            WG.clean_all();
            if (callback) callback();
        },

        tidyBag: function (callback) {
            Role._tidyBag(0, callback);
        },

        hasCoolingSkill: function () {
            return Role._coolingSkills.length > 0;
        },
        coolingSkills: function () {
            var result = [];
            for (const mark of Role._coolingSkills) {
                result.push(mark.split("_")[0]);
            }
            return result;
        },
        coolingSkill: function (skill) {
            return this.coolingSkills().indexOf(skill) != -1
        },
        hasSkill: function (skill) {
            var combatStr = $('.combat-commands').html()
            if (combatStr.indexOf(skill) != -1) {
                return true;
            } else {
                return false;
            }
        },
        weapon: function () {
            return Role._weaponType
        },

        _renewHookIndex: null,
        _renewStatus: "resting",

        _coolingSkills: [],
        _gains: [], // [{timestamp: number, name: string, count: number, unit: string}]

        _shimen: function (counter, timestamp, callback) {
            if (counter == 0) {
                WG.SendCmd("stopstate");
                WG.sm_button();
            }
            var result = SystemTips.search("你先去休息|和本门毫无瓜葛|你没有", timestamp);
            if (result != null) { callback(); return; }
            setTimeout(function () { Role._shimen(counter + 1, timestamp, callback) }, 1000);
        },

        _tidyBag: function (counter, callback) {
            if (counter == 0) WG.sell_all();

            if (!WG.packup_listener) {
                window.setTimeout(callback, 1000);
                return;
            }
            if (counter > 10) {
                if (WG.packup_listener) WG.sell_all();
                callback();
                return;
            }
            window.setTimeout(function () { Role._tidyBag(counter + 1, callback); }, 1000);
        },

        _monitorHpMp: function () {
            WG.add_hook(["items", "sc", "itemadd"], function (data) {
                switch (data.type) {
                    case "items":
                        if (data.items == null) break;
                        for (var i = data.items.length - 1; i >= 0; i--) {
                            var item = data.items[i];
                            if (item.id == Role.id) {
                                Role.hp = item.hp;
                                Role.maxHp = item.max_hp;
                                Role.mp = item.mp;
                                Role.maxMp = item.max_mp;
                                break;
                            }
                        }
                        break;
                    case "itemadd":
                    case "sc":
                        if (data.id != Role.id) break;
                        if (data.hp != null) Role.hp = data.hp;
                        if (data.max_hp != null) Role.maxHp = data.max_hp;
                        if (data.mp != null) Role.mp = data.mp;
                        if (data.max_mp != null) Role.maxMp = data.max_mp;
                        break;
                }
            });
        },
        _monitorStatus: function () {
            WG.add_hook(["items", "status", "itemadd"], function (data) {
                switch (data.type) {
                    case "items":
                        if (data.items == null) break;
                        for (var i = data.items.length - 1; i >= 0; i--) {
                            var item = data.items[i];
                            if (item.id != Role.id) continue;
                            if (item.status == null) break;
                            Role.status = {};
                            var timestamp = new Date().getTime();
                            for (var j = item.status.length - 1; j >= 0; j--) {
                                var s = item.status[j];
                                Role.status[s.sid] = timestamp + s.duration - s.overtime;
                            }
                            break;
                        }
                        break;
                    case "status":
                        if (data.id != Role.id) break;
                        var timestamp1 = new Date().getTime();
                        if (data.action == "add") {
                            Role.status[data.sid] = timestamp1 + data.duration;
                        } else if (data.action == "remove") {
                            delete Role.status[data.sid];
                        }
                        break;
                    case "itemadd":
                        if (data.id != Role.id) break;
                        if (data.status == null) break;
                        Role.status = {};
                        var timestamp2 = new Date().getTime();
                        for (var k = data.status.length - 1; k >= 0; k--) {
                            var s1 = data.status[k];
                            Role.status[s1.sid] = timestamp2 + s1.duration - s1.overtime;
                        }
                        break;
                }
            });
        },
        _monitorState: function () {
            WG.add_hook("state", function (data) {
                var text = data.state;
                if (text == null) {
                    Role.state = RoleState.none;
                    return;
                }
                for (const key in RoleState) {
                    if (!RoleState.hasOwnProperty(key)) continue;
                    const keyword = RoleState[key];
                    if (text.indexOf(keyword) != -1) {
                        Role.state = keyword;
                        return;
                    }
                }
                Role.state = RoleState.none;
            });
        },
        _monitorDeath: function () {
            WG.add_hook("die", function (data) {
                if (data.relive == true) {
                    Role.living = true;
                } else {
                    Role.living = false;
                }
            });
        },
        _monitorInfo: function () {
            WG.add_hook("dialog", function (data) {
                if (data.dialog == "score" && data.id == Role.id) {
                    if (data.level != null) {
                        var dd = data.level.replace(/<\/?.+?>/g, "");
                        Role.grade = dd.replace(/ /g, "");
                    }
                    if (data.family != null) {
                        Role.family = data.family;
                    }
                    if (data.jingli != null) {
                        var dd = data.jingli.split("/");
                        Role.energy = dd[0];
                    }
                }
            });
        },
        _monitorItems: function () {
            WG.add_hook("dialog", function (data) {
                if (data.dialog == null) return;
                if (data.dialog == "pack") {
                    if (data.items != null) {
                        Role.items = {};
                        for (const item of data.items) {
                            if (item.id) Role.items[item.id] = item;
                        }
                    } else if (data.id != null) {
                        if (data.remove == null && data.count != null) {
                            Role.items[data.id] = data;
                            return;
                        } else if (data.remove != null) {
                            var item = Role.items[data.id];
                            if (item == null) return; // 从随从那里那回东西
                            if (item.count != null) {
                                item.count -= data.remove;
                            } else {
                                item.count = 0;
                            }
                            if (item.count == 0) delete Role.items[data.id];
                        }
                    }
                    if (data.eqs != null) {
                        Role.equipments = CopyObject(data.eqs);
                    } else if (data.uneq != null && data.id != null) {
                        let item = Role.equipments[data.uneq];
                        item.count = 1;
                        item.id = data.id;
                        Role.items[item.id] = item;
                        Role.equipments[data.uneq] = null;
                    } else if (data.eq != null && data.id != null) {
                        let item = Role.items[data.id];
                        Role.equipments[data.eq] = item;
                        delete Role.items[data.id];
                    }
                    if (data.money != null) {
                        Role.money = data.money;
                    }
                }
                if (data.dialog == "list") {
                    if (data.stores != null) {
                        Role.stores = {};
                        for (const item of data.stores) {
                            if (item.id) Role.stores[item.id] = item;
                        }
                    } else if (data.id != null && data.storeid != null && data.store != null) {
                        var item = Role.items[data.id];
                        var store = Role.stores[data.storeid];
                        if (item == null) {
                            item = Object.assign({}, store, { count: 0 });
                            item.id = data.id;
                            Role.items[item.id] = item;
                        }
                        if (store == null) {
                            store = Object.assign({}, item, { count: 0 });
                            Role.stores[store.id] = store;
                        }
                        item.count -= data.store;
                        store.count += data.store;
                        if (item.count <= 0) delete Role.items[data.id];
                        if (store.count <= 0) delete Role.stores[data.storeid];
                    }
                }
            });
        },
        _monitorGains: function () {
            WG.add_hook("dialog", function (data) {
                if (data.dialog != "pack" || data.id == null || data.name == null || data.unit == null || data.count == null || data.remove != null) return;
                var timestamp = new Date().getTime();
                // [{timestamp: number, name: string, count: number, unit: string}]
                var old = Role.items[data.id];
                var count = data.count;
                if (old != null && old.count != null) {
                    count -= old.count;
                }
                var gain = { timestamp: timestamp, name: data.name, count: count, unit: data.unit };
                Role._gains.push(gain);
            });
        },
        _monitorSkillCD: function () {
            WG.add_hook("dispfm", function (data) {
                var timestamp = Date.parse(new Date());
                var mark = data.id + "_" + timestamp;
                Role._coolingSkills.push(mark);
                window.setTimeout(function () {
                    var index = Role._coolingSkills.indexOf(mark);
                    if (index != -1) Role._coolingSkills.splice(index, 1);
                }, data.distime);
                if (data.rtime != null && data.rtime != 0) {
                    if (Role._rtimer != null) clearTimeout(Role._rtimer);
                    Role.rtime = true;
                    Role._rtimer = setTimeout(_ => {
                        Role.rtime = false;
                    }, data.rtime);
                }
            });
        },
        _monitorSkills: function () {
            var action = function (id, value, s_name) {
                switch (id) {
                    case "unarmed":
                        Role.kongfu.quan = value;Role.kongfu.quan_c = s_name; break;
                    case "force":
                        Role.kongfu.nei = value; Role.kongfu.nei_c = s_name; break;
                    case "parry":
                        Role.kongfu.zhao = value; Role.kongfu.zhao_c = s_name; break;
                    case "dodge":
                        Role.kongfu.qing = value; Role.kongfu.qing_c = s_name; break;
                    case "sword":
                        Role.kongfu.jian = value; Role.kongfu.jian_c = s_name; break;
                    case "blade":
                        Role.kongfu.dao = value; Role.kongfu.dao_c = s_name; break;
                    case "club":
                        Role.kongfu.gun = value; Role.kongfu.gun_c = s_name; break;
                    case "staff":
                        Role.kongfu.zhang = value; Role.kongfu.zhang_c = s_name; break;
                    case "whip":
                        Role.kongfu.bian = value; Role.kongfu.bian_c = s_name; break;
                    case "throwing":
                        Role.kongfu.an = value; Role.kongfu.an_c = s_name; break;
                    default:
                        break;
                }
            };
            WG.add_hook("dialog", function (data) {
                if (data.dialog == null || data.dialog != "skills") return;
                if (data.items != null) {
                    for (const item of data.items) {
                        var value = item.enable_skill ? item.enable_skill : null;
                        var s_name = "";
                        Role.skills = data.items;
                        for (const sklii_item of data.items) {
                            if (sklii_item.id == value) {
                                s_name = /<([^<>]*)>/.exec(sklii_item.name)[1]
                            }
                        }
                        action(item.id, value, s_name.toLocaleLowerCase());
                    }
                }
                if (data.id != null && data.enable != null) {
                    var value = data.enable;
                    if (value == false) value = "none";
                    var s_name = ""
                    for (const sklii_item of Role.skills) {
                        if (sklii_item.id == value) {
                            s_name = /<([^<>]*)>/.exec(sklii_item.name)[1]
                        }
                    }
                    action(data.id, value, s_name);
                }
            });
        },
        _monitorCombat: function () {
            WG.add_hook("combat", function (data) {
                if (data.start != null && data.start == 1) {
                    Role.combating = true;
                } else if (data.end != null && data.end == 1) {
                    Role.combating = false;
                }
            });
            WG.add_hook("text", function (data) {
                if (data.msg == null) return;
                if (data.msg.indexOf('只能在战斗中使用') != -1 || data.msg.indexOf('这里不允许战斗') != -1 || data.msg.indexOf('没时间这么做') != -1) {
                    Role.combating = false;
                }
                if (data.msg.indexOf('战斗中打坐，你找死吗？') != -1 || data.msg.indexOf('你正在战斗') != -1) {
                    Role.combating = true;
                }
            });

        },
        _monitorWeapon: function () {
            WG.add_hook("perform", function (data) {
                if (data.skills != null) {
                    if (JSON.stringify(data.skills).indexOf("sword") != -1) {
                        Role._weaponType = 'sword'
                    } else if (JSON.stringify(data.skills).indexOf("blade") != -1) {
                        Role._weaponType = 'blade'
                    } else {
                        Role._weaponType = ''
                    }
                }

            });

        }
    };

    var Room = {
        name: null,
        path: null,

        updateTimestamp: null,

        init: function () {
            this._monitorLocation();
            this._monitorItemsInRoom();
            this._monitorDeath();
        },
        getItem: function (id) {
            return this._itemsInRoom[id];
        },
        getItemId: function (name, blurry, living, filterExp) {
            for (const item of Object.values(this._itemsInRoom)) {
                if (blurry == true) {
                    if (item.name.indexOf(name) != -1) {
                        if (living == true && item.name.indexOf("的尸体") != -1) {
                            continue;
                        }
                        if (FilterCenter.filter(filterExp, item)) {
                            continue;
                        }
                        return item.id;
                    }
                } else {
                    if (item.name == name && !FilterCenter.filter(filterExp, item)) {
                        return item.id;
                    }
                }
            }
            return null;
        },
        /**
         * @param {{name: string, blurry: Boolean}[]} itemNameInfos
         * @returns {Boolean}
         */
        didKillItemsInRoom: function (itemNameInfos) {
            var deadItems = this._deadItemsInRoom.slice();
            for (const info of itemNameInfos) {
                var found = false;
                for (let j = 0; j < deadItems.length; j++) {
                    const deadItem = deadItems[j];
                    if (info.blurry == true) {
                        if (deadItem.name.indexOf(info.name) != -1) found = true;
                    } else {
                        if (deadItem.name == info.name) found = true;
                    }
                    if (found) {
                        deadItems.splice(j, 1);
                        break;
                    }
                }
                if (!found) return false;
            }
            return true;
        },

        _itemsInRoom: {},
        _deadItemsInRoom: [],

        _monitorLocation: function () {
            WG.add_hook("room", function (data) {
                Room.name = data.name;
                Room.path = data.path;
                Room.updateTimestamp = new Date().getTime();
                Room._itemsInRoom = {};
                Room._deadItemsInRoom = [];
            });
        },
        _monitorItemsInRoom: function () {
            WG.add_hook(["items", "itemadd", "itemremove", "sc", "status"], function (data) {
                switch (data.type) {
                    case "items":
                        if (data.items == null) break;
                        for (const item of data.items) {
                            if (item.name == null || item.id == null) continue;
                            Room._itemsInRoom[item.id] = item;
                        }
                        break;
                    case "itemadd":
                        if (data.name == null || data.id == null) break;
                        Room._itemsInRoom[data.id] = data;
                        break;
                    case "itemremove":
                        if (data.id == null) break;
                        delete Room._itemsInRoom[data.id];
                        break;
                    case "sc": {
                        if (data.id == null) break;
                        const item = Room._itemsInRoom[data.id];
                        if (item == null) break;
                        if (data.hp != null) item.hp = data.hp;
                        if (data.max_hp != null) item.max_hp = data.max_hp;
                        if (data.mp != null) item.mp = data.mp;
                        if (data.max_mp != null) item.max_mp = data.max_mp;
                        break;
                    }
                    case "status": {
                        if (data.action == null || data.id == null || data.sid == null) return;
                        const item = Room._itemsInRoom[data.id];
                        if (item == null) break;
                        if (data.action == "add") {
                            if (item.status == null) item.status = [];
                            item.status.push({ sid: data.sid, name: data.name, duration: data.duration, overtime: 0 });
                        } else if (data.action == "remove") {
                            for (let i = 0; i < item.status.length; i++) {
                                const s = item.status[i];
                                if (s.sid == data.sid) {
                                    item.status.splice(i, 1);
                                    break;
                                }
                            }
                        }
                        break;
                    }
                }
            });
        },
        _monitorDeath: function () {
            WG.add_hook("sc", function (data) {
                if (data.id == null || data.hp == null || data.hp != 0) return;
                for (const item of Object.values(Room._itemsInRoom)) {
                    if (item.id == data.id) {
                        Room._deadItemsInRoom.push(item);
                        return;
                    }
                }
            });
        }
    };

    class SystemTip {
        constructor(text) {
            this.timestamp = new Date().getTime();
            this.text = text;
        }
    }

    var SystemTips = {
        init: function () {
            this._monitorSystemTips();
        },
        search: function (regex, from) {
            var patt = new RegExp(regex);
            var tips = this._tips.slice();
            for (let index = tips.length - 1; index >= 0; index--) {
                const tip = tips[index];
                if (tip.timestamp < from) break;
                var result = patt.exec(tip.text);
                if (result) return result;
            }
            return null;
        },
        clean: function (to) {
            while (true) {
                if (this._tips.length <= 0) break;
                var tip = this._tips[0];
                if (tip.timestamp > to) break;
                this._tips.shift();
            }
        },
        rejectTimestamp: null,

        _monitorSystemTips: function () {
            var theSelf = this;
            WG.add_hook("text", function (data) {
                var tip = new SystemTip(data.msg);
                theSelf._push(tip);

                if (data.msg == "不要急，慢慢来。") {
                    theSelf.rejectTimestamp = new Date().getTime();
                }
            });
            WG.add_hook("item", function (data) {
                var desc = data.desc;
                if (desc == null) return;
                var tip = new SystemTip(desc);
                theSelf._push(tip);
            });
        },
        _push: function (tip) {
            if (this._tips.length >= this._maxCapacity) {
                this._tips.shift();
            }
            this._tips.push(tip);
        },
        _tips: [],
        _maxCapacity: 100,
    };
    class MsgTip {
        constructor(content, ch, name, uid) {
            this.timestamp = new Date().getTime();
            this.content = content;
            this.ch = ch;
            this.name = name;
            this.uid = uid;
        }
    }

    var MsgTips = {
        init: function () {
            this._monitorSystemTips();
        },
        search: function (regex, from) {
            var patt = new RegExp(regex);
            var tips = this._tips.slice();
            for (let index = tips.length - 1; index >= 0; index--) {
                const tip = tips[index];
                if (tip.timestamp < from) break;
                var result = patt.exec(tip.content);
                if (result) return result;
            }
            return null;
        },
        clean: function (to) {
            while (true) {
                if (this._tips.length <= 0) break;
                var tip = this._tips[0];
                if (tip.timestamp > to) break;
                this._tips.shift();
            }
        },
        rejectTimestamp: null,

        _monitorSystemTips: function () {
            var theSelf = this;
            WG.add_hook("msg", function (data) {
                // console.log(data)
                var tip = new MsgTip(data.content, data.ch, data.name, data.uid);
                theSelf._push(tip);
            });
        },
        _push: function (tip) {
            if (this._tips.length >= this._maxCapacity) {
                this._tips.shift();
            }
            this._tips.push(tip);
        },
        _tips: [],
        _maxCapacity: 100,
    };

    var DialogList = {
        init: function () {
            this._monitorDialogList();
        },
        timestamp: null,
        findItem: function (itemName, blurry, quality, filterExp) {
            return FindItem(this._list, itemName, blurry, quality, filterExp);
        },

        _list: [],
        _monitorDialogList: function () {
            const self = this;
            WG.add_hook("dialog", function (data) {
                let list = null;
                if (data.selllist != null) {
                    list = data.selllist;
                } else if (data.stores != null) {
                    list = data.stores;
                } else if (data.dialog == "pack2" && data.items != null) {
                    list = data.items;
                }
                if (list == null) return;
                self.timestamp = new Date().getTime();
                self._list = list;
            });
        },
    };

    var TaskList = {
        init: function () {
            this._monitorTasksList();
        },
        search: function (regex, from) {
            if (this._timestamp < from) return null;
            var patt = new RegExp(regex);
            for (const task of this._list) {
                const result = patt.exec(task);
                if (result) return result;
            }
            return null;
        },

        _timestamp: null,
        _list: [],
        _monitorTasksList: function () {
            const self = this;
            WG.add_hook("dialog", function (data) {
                if (data.dialog == null || data.dialog != "tasks" || data.items == null) return;
                let list = [];
                for (const item of data.items) {
                    list.push(item.desc);
                }
                self._timestamp = new Date().getTime();
                self._list = list;
            });
        }
    };

    var Xiangyang = {
        init: function () {
            this._monitorXiangyang();
        },
        search: function (regex, from) {
            if (this._timestamp < from) return null;
            var patt = new RegExp(regex);
            const result = patt.exec(this._desc);
            if (result) return result;
            return null;
        },

        _timestamp: null,
        _desc: '',
        _monitorXiangyang: function () {
            const self = this;
            WG.add_hook('dialog', function (data) {
                if (data.dialog == null || data.t != 'fam' || data.index != 8 || data.desc == null) return;
                self._timestamp = new Date().getTime();
                self._desc = data.desc;
            });
        }
    };

    /***********************************************************************************\
        Persistent Cache
    \***********************************************************************************/

    (function () {
        const FlowStoreKey = function () { return `flow_store@${Role.id}`; };
        const getMap = function () {
            let map = GM_getValue(FlowStoreKey(), null);
            if (map == null) {
                // 之前 FlowStoreKey 会错误地一只返回 flow_store@null
                map = GM_getValue("flow_store@null", {});
            }
            return map;
        };
        FlowStore = new PersistentCache((key, value) => {
            let map = getMap();
            map[key] = value;
            GM_setValue(FlowStoreKey(), map);
        }, _ => {
            return getMap();
        }, key => {
            let map = getMap();
            delete map[key];
            GM_setValue(FlowStoreKey(), map);
        });
        FlowStore.corver = function (value) {
            GM_setValue(FlowStoreKey(), value);
        };
    })();

    (function () {
        const PersistentVariablesKey = function () { return `global_params@${Role.id}`; };
        const getMap = function () {
            let map = GM_getValue(PersistentVariablesKey(), null);
            if (map == null) {
                // 之前 PersistentVariablesKey 会错误地一只返回 global_params@null
                map = GM_getValue("global_params@null", {});
            }
            return map;
        };
        PersistentVariables = new PersistentCache((key, value) => {
            let map = getMap();
            map[key] = value;
            GM_setValue(PersistentVariablesKey(), map);
        }, _ => {
            return getMap();
        }, key => {
            let map = getMap();
            delete map[key];
            GM_setValue(PersistentVariablesKey(), map);
        });
        VariableStore.register(_ => { return PersistentVariables.getAll(); });
    })();

    VariableStore.register(_ => {
        return {
            ":online": WG.online,
            ":id": Role.id,
            ":name": Role.name,
            ":grade": Role.grade,
            ":family": Role.family,
            ":energy": Role.energy,
            ":money": Role.money,
            ":hp": Role.hp,
            ":maxHp": Role.maxHp,
            ":hpPer": Role.hp / Role.maxHp,    // 0-1
            ":mp": Role.mp,
            ":maxMp": Role.maxMp,
            ":mpPer": Role.mp / Role.maxMp,    // 0-1
            ":living": Role.living,          // true/false
            ":state": Role.state,            // RoleState
            ":combating": Role.combating,    // true/false
            ":free": Role.isFree,
            ":gains": Role.profitInfo,

            ":room": Room.name,
            ":path": Room.path,

            ":eq0": Role.getEqId(0),
            ":eq1": Role.getEqId(1),
            ":eq2": Role.getEqId(2),
            ":eq3": Role.getEqId(3),
            ":eq4": Role.getEqId(4),
            ":eq5": Role.getEqId(5),
            ":eq6": Role.getEqId(6),
            ":eq7": Role.getEqId(7),
            ":eq8": Role.getEqId(8),
            ":eq9": Role.getEqId(9),
            ":eq10": Role.getEqId(10),

            ":kf_quan": Role.kongfu.quan,
            ":kf_nei": Role.kongfu.nei,
            ":kf_zhao": Role.kongfu.zhao,
            ":kf_qing": Role.kongfu.qing,
            ":kf_jian": Role.kongfu.jian,
            ":kf_dao": Role.kongfu.dao,
            ":kf_gun": Role.kongfu.gun,
            ":kf_zhang": Role.kongfu.zhang,
            ":kf_bian": Role.kongfu.bian,
            ":kf_an": Role.kongfu.an,

            ":kf_quan_c": Role.kongfu.quan_c,
            ":kf_nei_c": Role.kongfu.nei_c,
            ":kf_zhao_c": Role.kongfu.zhao_c,
            ":kf_qing_c": Role.kongfu.qing_c,
            ":kf_jian_c": Role.kongfu.jian_c,
            ":kf_dao_c": Role.kongfu.dao_c,
            ":kf_gun_c": Role.kongfu.gun_c,
            ":kf_zhang_c": Role.kongfu.zhang_c,
            ":kf_bian_c": Role.kongfu.bian_c,
            ":kf_an_c": Role.kongfu.an_c
        };
    });

    VariableStore.register(_ => {
        return {
            ":room ": function (param) {
                const parts = param.split(",");
                for (const part of parts) {
                    if (Room.name.indexOf(part) != -1) return true;
                }
                return false;
            },
            ":cd ": function (sid) {
                return Role.coolingSkill(sid);
            },
            ":status ": function (param) {
                const parts = param.split(",");
                if (parts.length > 1) {
                    const status = parts[0];
                    const id = parts[1];
                    const item = Room.getItem(id);
                    if (item == null || item.status == null) return false;
                    for (const s of item.status) {
                        if (s.sid == status) return true;
                    }
                    return false;
                }
                return Role.hasStatus(param);
            },
            ":hp ": function (id) {
                const item = Room.getItem(id);
                if (item != null) return item.hp;
                return -1;
            },
            ":weapon ": function (id) {
                return id == Role.weapon()
            },
            ":maxHp ": function (id) {
                const item = Room.getItem(id);
                if (item != null) return item.max_hp;
                return -1;
            },
            ":mp ": function (id) {
                const item = Room.getItem(id);
                if (item != null) return item.mp;
                return -1;
            },
            ":maxMp ": function (id) {
                const item = Room.getItem(id);
                if (item != null) return item.max_mp;
                return -1;
            },
            ":exist ": function (id) {
                if (id == null) return false;
                const item = Room.getItem(id);
                return item != null;
            },
            ":findName ": function (id) {
                if (id == null) return null;
                const item = Room.getItem(id);
                //if (item != null) return item.name.match(/.*\s([\u4e00-\u9fa5]+)/)[1];
                if (item != null) return item.name.replace(/<.+?>|&lt.*/g, '').split(' ').pop();
                //if (item != null) return item.name.replace(/<.+?>|&lt.*/g, '').match(/(\p{Script=Han}\s)*(\p{Script=Han}*)/u)[2]
                //if (item != null) return item.name.match(/(\p{Script=Han}\s)*(\p{Script=Han}*)/u)[2];
                return null;
            }
        };
    });

    /***********************************************************************************\
        WSMUD Cmd Prehandler And Handler
    \***********************************************************************************/

    //---------------------------------------------------------------------------
    //  WSMUD Raid 占位符
    //---------------------------------------------------------------------------

    const FilterCenter = {
        filter: function (filterExp, obj) {
            if (filterExp == null) {
                return false;
            }
            const exp = filterExp.substring(1, filterExp.length - 2);
            const yes = eval(`${exp}`);
            return yes;
        }
    }

    function ReplacePlaceholder(exp) {
        var patt = /\{([a-z]?)([^a-z%#]+?|<\w+>[^a-z%#]+?<\/\w+>)([a-z]?)(%?)(#?)\}\??(#[^#{}]*#)?/g;
        var placeholders = [];
        var result = patt.exec(exp);
        while (result != null) {
            placeholders.push({
                text: result[0],
                location: result[1] == "" ? null : result[1],
                name: result[2],
                blurry: result[4] != "%",
                quality: result[3] == "" ? null : result[3],
                type: result[5] != "#" ? "id" : "amount",
                filterExp: result[6]
            });
            result = patt.exec(exp);
        }
        const getValue = function (p) {
            let locationOrder = [];
            if (p.location == null) {
                locationOrder = p.quality == null ? ["r", "b", "d"] : ["b", "d"];
            } else {
                locationOrder = [p.location];
            }
            for (const location of locationOrder) {
                let value = null;
                switch (location) {
                    case "r":
                        value = Room.getItemId(p.name, p.blurry, false, p.filterExp);
                        break;
                    case "b": {
                        let item = Role.findItem(p.name, p.blurry, p.quality, p.filterExp);
                        if (item) {
                            value = p.type == "id" ? item.id : item.count;
                        }
                        break;
                    }
                    case "d": {
                        let item = DialogList.findItem(p.name, p.blurry, p.quality, p.filterExp);
                        if (item) {
                            value = p.type == "id" ? item.id : item.count;
                        }
                        break;
                    }
                }
                if (value != null) return value;
            }
            return null;
        };
        let realExp = exp;
        for (const p of placeholders) {
            let value = getValue(p);
            realExp = realExp.replace(p.text, value);
        }
        return realExp;
    }

    (function () {
        const handle = function (performer, cmd) {
            return ReplacePlaceholder(cmd);
        };
        const handler = new CmdPrehandler(handle)
        CmdPrehandleCenter.shared().addHandler(handler);
    })();

    (function () {
        const handle = function (cmds) {
            var result = [];
            var tempcmds = "";
            var inString = false;
            for (const cmd of cmds) {
                if (cmd.indexOf("`")==0 || inString){
                    var ccmd = cmd
                    if (cmd.indexOf("`")==0){
                        ccmd=cmd.substr(1);
                    }
                    if (cmd[cmd.length-1]=="`"){
                        ccmd=cmd.substr(0,cmd.length-1);
                    }
                    tempcmds = tempcmds +" "+ccmd
                    inString= true;
                }
                if(cmd[cmd.length-1]=="`"){
                    result[result.length-1] = result[result.length-1] +tempcmds
                    tempcmds = "";
                    inString = false;
                    continue;
                }
                if(inString){
                    continue;
                }
                const header = /^\s*/.exec(cmd)[0];
                let patt = /(\{[^\}]+\})([^\?]|$)/g;
                let r = patt.exec(cmd);
                let j = cmd.indexOf("@js")
                while (r != null && j == -1) {
                    result.push(`${header}@until ${r[1]}? != null`);
                    r = patt.exec(cmd);
                }
                result.push(cmd);
            }
            return result;
        };
        const rule = new PrecompileRule(handle, PrecompileRulePriority.low);
        PrecompileRuleCenter.shared().addRule(rule);
    })();

    //---------------------------------------------------------------------------
    //  WSMUD Raid 命令
    //---------------------------------------------------------------------------

    (function () {
        const executor = new CmdExecutor(cmd => {
            return cmd.indexOf("<-stopSSAuto") == 0 || cmd.indexOf("@stopSSAuto") == 0;
        }, (performer, _) => {
            if (performer.log()) Message.cmdLog("暂停自动婚宴和自动Boss", "目前手动终止流程不会自动恢复");
            WG.stopAllAuto();
        })
        CmdExecuteCenter.addExecutor(executor);
    })();

    (function () {
        const executor = new CmdExecutor(cmd => {
            return cmd.indexOf("stopSSAuto->") == 0 || cmd.indexOf("@recoverSSAuto") == 0;
        }, (performer, _) => {
            if (performer.log()) Message.cmdLog("恢复自动婚宴和自动Boss设置");
            WG.reSetAllAuto();
        })
        CmdExecuteCenter.addExecutor(executor);
    })();

    var __RecordGainsFrom = null;
    (function () {
        const executor = new CmdExecutor(cmd => {
            return cmd.indexOf("<-recordGains") == 0;
        }, (performer, _) => {
            if (performer.log()) Message.cmdLog("开始记录物品获取");
            __RecordGainsFrom = new Date().getTime();
        })
        CmdExecuteCenter.addExecutor(executor);
    })();

    (function () {
        const executor = new CmdExecutor(cmd => {
            return cmd.indexOf("recordGains->") == 0;
        }, (_, cmd) => {
            const gains = Role.gains(__RecordGainsFrom, new Date().getTime());
            var result = {};
            gains.forEach(gain => {
                var oldCount = 0;
                var old = result[gain.name];
                if (old) oldCount = old.count;
                result[gain.name] = { count: oldCount + gain.count, unit: gain.unit };
            });
            var content = "";
            if (cmd.indexOf("recordGains->silent") == -1) {
                Message.clean();
                Message.append("&nbsp;&nbsp;> 战利品列表如下：");
            }
            for (const name in result) {
                if (!result.hasOwnProperty(name)) continue;
                const gain = result[name];
                if (cmd.indexOf("recordGains->silent") == -1) {
                    Message.append("&nbsp;&nbsp;* " + name + " <wht>" + gain.count + gain.unit + "</wht>");
                }
                content += `&nbsp;&nbsp;* ${name} <wht>${gain.count}${gain.unit}</wht><br>`;
            }

            Role.profitInfo = content != "" ? content : null;

            if (cmd.indexOf("recordGains->nopopup") == 0 || cmd.indexOf("recordGains->silent") == 0) return;
            layer.open({
                type: 1,
                area: ["380px", "300px"],
                title: "战利品列表",
                content: content,
                offset: 'auto',
                shift: 2
            });
        })
        CmdExecuteCenter.addExecutor(executor);
    })();

    (function () {
        const executor = new AtCmdExecutor("toolbar", function (performer, param) {
            performer.timeSeries(new Date().getTime());
            $(`span[command=${param}]`).click();
            return new Promise(resolve => {
                setTimeout(_ => {
                    $(".glyphicon-remove-circle").click();
                    resolve();
                }, 500);
            });
        });
        CmdExecuteCenter.addExecutor(executor);
    })();

    (function () {
        const executor = new UntilAtCmdExecutor("liaoshang", function (performer, param) {
            if (Role.hp / Role.maxHp >= 1) {
                WG.SendCmd("stopstate");
                return true;
            }
            if (Role.state != RoleState.liaoshang) {
                WG.SendCmd("stopstate;liaoshang");
            }
            return false;
        }, null, 1000);
        CmdExecuteCenter.addExecutor(executor);
    })();

    (function () {
        const executor = new UntilAtCmdExecutor("dazuo", function (performer, param) {
            if (Role.mp / Role.maxMp > 0.99) {
                WG.SendCmd("stopstate");
                return true;
            }
            if (Role.state != RoleState.dazuo) {
                WG.SendCmd("stopstate;dazuo");
            }
            return false;
        }, null, 1000);
        CmdExecuteCenter.addExecutor(executor);
    })();

    (function () {
        const executor = new UntilAtCmdExecutor("eq", function (performer, param) {
            const eqIds = param.split(",");
            let cmds = [];
            eqIds.forEach(eqId => {
                if (!Role.wearing(eqId)) cmds.push(`eq ${eqId}`);
            });
            if (cmds.length > 0) {
                WG.SendCmd("stopstate;" + cmds.join(";"));
                return false;
            }
            return true;
        }, null, 1000);
        CmdExecuteCenter.addExecutor(executor);
    })();

    (function () {
        const executor = new UntilAtCmdExecutor("cd", function (performer, param) {
            if (param == null) {
                return !Role.hasCoolingSkill();
            }

            let validParam = param;
            let isBlack = false;
            if (validParam[0] == "^") {
                validParam = validParam.substring(1);
                isBlack = true;
            }
            const skills = validParam.split(",");
            if (isBlack) {
                for (const cooling of Role.coolingSkills()) {
                    if (skills.indexOf(cooling) == -1) {
                        return false;
                    }
                }
            } else {
                let coolings = Role.coolingSkills();
                for (const skill of skills) {
                    if (coolings.indexOf(skill) != -1) {
                        return false;
                    }
                }
            }
            return true;
        });
        CmdExecuteCenter.addExecutor(executor);
    })();

    class UntilSearchedAtCmdExecutor extends UntilAtCmdExecutor {
        constructor(key, search) {
            const assert = function (performer, param) {
                let placeholders = [];
                let patt = /\(\$[a-zA-Z0-9_]+?\)/g;
                let result = patt.exec(param);
                while (result != null) {
                    placeholders.push(result[0]);
                    result = patt.exec(param);
                }
                let regex = param;
                for (let i = 0; i < placeholders.length; i++) {
                    const placeholder = placeholders[i];
                    regex = regex.replace(placeholder, "(.+?)");
                }
                let result2 = search(regex, performer.timeSeries());
                if (result2 == null) {
                    return false;
                }
                for (let j = 0; j < placeholders.length; j++) {
                    const placeholder = placeholders[j];
                    let key = placeholder.substring(2, placeholder.length - 1);
                    let value = result2[j + 1];
                    if (value != null) {
                        UpdateVariable(performer, key, value);
                    }
                }
                return true;
            };
            super(key, assert);
        }
    }

    (function () {
        const executor = new UntilSearchedAtCmdExecutor("tip", (regex, from) => {
            return SystemTips.search(regex, from);
        });
        CmdExecuteCenter.addExecutor(executor);
    })();

    (function () {
        const executor = new UntilSearchedAtCmdExecutor("msgtip", (regex, from) => {
            return MsgTips.search(regex, from);
        });
        CmdExecuteCenter.addExecutor(executor);
    })();

    (function () {
        const executor = new UntilSearchedAtCmdExecutor("task", (regex, from) => {
            return TaskList.search(regex, from);
        });
        CmdExecuteCenter.addExecutor(executor);
    })();

    (function () {
        const executor = new UntilSearchedAtCmdExecutor("xy", (regex, from) => {
            return Xiangyang.search(regex, from);
        });
        CmdExecuteCenter.addExecutor(executor);
    })();

    (function () {
        const executor = new UntilAtCmdExecutor("kill", function (performer, param) {
            const parts = param.split(",");
            let infos = [];
            for (let i = 0; i < parts.length; i++) {
                const name = parts[i];
                let blurry = true;
                if (name.substring(name.length - 1) == "%") {
                    name = name.substring(0, name.length - 1);
                    blurry = false;
                }
                infos.push({ name: name, blurry: blurry });
            }
            const finish = Room.didKillItemsInRoom(infos);
            if (finish) {
                return true;
            } else {
                let cmd = "";
                infos.forEach(info => {
                    const itemId = Room.getItemId(info.name, info.blurry, true);
                    if (itemId != null) {
                        cmd += "kill " + itemId + ";";
                    }
                });
                WG.SendCmd(cmd);
                return false;
            }
        }, null, 1000, 1000);
        CmdExecuteCenter.addExecutor(executor);
    })();

    /* 等待，直到 dialog 打开，在打开 dialog 后调用，便于后续使用占位符 */
    (function () {
        const executor = new UntilAtCmdExecutor("dialog", function (performer, param) {
            return DialogList.timestamp > performer.timeSeries();
        });
        CmdExecuteCenter.addExecutor(executor);
    })();

    function UntilRoleFreePerformerPromise(callback, log) {
        return PerformerPromise("@until (:free) == true", callback, log);
    }

    (function () {
        const executor = new AtCmdExecutor("cleanBag", function (performer, param) {
            if (performer.log()) Message.cmdLog("清理包裹");
            return UntilRoleFreePerformerPromise(resolve => {
                WG.SendCmd("$cleanall");
                setTimeout(resolve, 1000);
            });
        });
        CmdExecuteCenter.addExecutor(executor);
    })();

    (function () {
        const executor = new AtCmdExecutor("tidyBag", function (performer, param) {
            if (performer.log()) Message.cmdLog("整理包裹");
            return UntilRoleFreePerformerPromise(resolve => {
                Role.tidyBag(_ => { setTimeout(resolve, 1000); });
            });
        });
        CmdExecuteCenter.addExecutor(executor);
    })();

    (function () {
        const executor = new AtCmdExecutor("shimen", function (performer, param) {
            if (performer.log()) Message.cmdLog("自动完成允许放弃的放弃师门");
            return UntilRoleFreePerformerPromise(resolve => {
                Role.shimen(_ => { setTimeout(resolve, 1000); });
            });
        });
        CmdExecuteCenter.addExecutor(executor);
    })();

    (function () {
        const executor = new AtCmdExecutor("renew", function (performer, param) {
            if (performer.log()) Message.cmdLog("恢复角色气血和内力");
            return UntilRoleFreePerformerPromise(resolve => {
                Role.renew(_ => { setTimeout(resolve, 1000); });
            });
        });
        CmdExecuteCenter.addExecutor(executor);
    })();

    (function () {
        const executor = new AtCmdExecutor("beep", function (performer, param) {
            Beep();
        });
        CmdExecuteCenter.addExecutor(executor);
    })();

    (function () {
        const executor = new AtCmdExecutor("push", function (performer, param) {
            Push(param);
        });
        CmdExecuteCenter.addExecutor(executor);
    })();

    //---------------------------------------------------------------------------
    //  Skill State Machine
    //---------------------------------------------------------------------------

    var SkillStateMachine = {
        perform: function (skill, force) {
            // if (!Role.hasSkill(skill)) return;
            const timestamp = new Date().getTime();
            this._perform(skill, force, timestamp);
        },
        _perform: function (skill, force, timestamp) {
            if (this._skillStack[skill] != null && this._skillStack[skill] > timestamp) return;
            const self = this;
            if ((!Role.isFree() && !force) || Role.coolingSkill(skill) || Role.rtime) {
                setTimeout(_ => {
                    self._perform(skill, force, timestamp);

                }, 200);
                return;
            }
            // if (!Role.hasSkill(skill)) {
            //     if( self._performNum < 10){
            //         setTimeout(_ => {
            //             self._perform(skill, force, timestamp);
            //         }, 200);
            //     }else{
            //         self._performNum = 0;
            //         return;
            //     }
            //     self._performNum = self._performNum + 1;
            //     return;
            // }
            this._skillStack[skill] = timestamp;
            WG.SendCmd(`perform ${skill}`);
            const timer = setInterval(_ => {
                if (Role.coolingSkill(skill) || Role.combating == false) {
                    clearInterval(timer);
                    if (self._skillStack[skill] != null && self._skillStack[skill] == timestamp) {
                        delete self._skillStack[skill];
                    }
                    return;
                }
                if (!Role.isFree() || Role.rtime) return;
                WG.SendCmd(`perform ${skill}`);
            }, 1000);
        },
        reset: function () {
            this._skillStack = {};
        },
        _skillStack: {},
        _performNum : 0
    }

    //---------------------------------------------------------------------------
    //  Send System Cmd
    //---------------------------------------------------------------------------

    var __systemCmdDelay = 1500;

    (function () {
        const executor = new AtCmdExecutor("cmdDelay", function (performer, param) {
            performer._cmdDelay = parseInt(param);
        });
        CmdExecuteCenter.addExecutor(executor);
    })();

    const UnpackSystemCmd = function (cmd) {
        let result = cmd;
        let patt = /([^;]+)\[(\d+?)\]/g;
        let r = patt.exec(cmd);
        while (r != null) {
            const packedCmd = r[1];
            const count = parseInt(r[2]);
            const temp = (new Array(count)).fill(packedCmd);
            const unpackedCmd = temp.join(";");
            result = result.replace(r[0], unpackedCmd);
            r = patt.exec(cmd);
        }
        return result;
    };

    (function () {
        function createWorker(f) {
            var blob = new Blob(['(function(){' + f.toString() + '})()']);
            var url = window.URL.createObjectURL(blob);
            var worker = new Worker(url);
            return worker;
        }
        const executor = new CmdExecutor(_ => {
            return true;
        }, (performer, cmd) => {
            let validCmd = CmdPrehandleCenter.shared().handle(performer, cmd);
            validCmd = UnpackSystemCmd(validCmd);
            return UntilRoleFreePerformerPromise(resolve => {
                const timestamp = new Date().getTime();
                let delay = 0;
                const fromReject = timestamp - SystemTips.rejectTimestamp;
                if (fromReject < 1500) {
                    // console.log(fromReject);
                    delay = fromReject;
                }
                var wa = createWorker("setTimeout(() =>  postMessage('0'), " + delay + ")")
                wa.onmessage = function (event) {
                    // console.log(new Date, event.data);
                    wa.terminate();
                    if (performer.log()) Message.cmdLog("执行系统命令", validCmd);
                    performer.timeSeries(timestamp);
                    performer.systemCmdTimestamp = timestamp;
                    WG.SendCmd(validCmd);
                    const cmdDelay = performer._cmdDelay == null ? __systemCmdDelay : performer._cmdDelay;
                    setTimeout(resolve, cmdDelay);
                };
            });
        }, CmdExecutorPriority.low);
        CmdExecuteCenter.addExecutor(executor);
    })();

    (function () {
        const executor = new AtCmdExecutor("force", function (performer, param) {
            return new Promise(resolve => {
                if (performer.log()) Message.cmdLog("强行执行系统命令", param);
                WG.SendCmd(param);
                const cmdDelay = performer._cmdDelay == null ? __systemCmdDelay : performer._cmdDelay;
                setTimeout(resolve, cmdDelay);
            });
        });
        CmdExecuteCenter.addExecutor(executor);
    })();

    (function () {
        const executor = new AtCmdExecutor("perform", function (performer, param) {
            const skills = param.split(",");
            for (const skill of skills) {
                SkillStateMachine.perform(skill, false);
            }
        });
        CmdExecuteCenter.addExecutor(executor);
    })();

    //---------------------------------------------------------------------------
    //  Manage Trigger
    //---------------------------------------------------------------------------

    (function () {
        const executor = new AtCmdExecutor("on", function (performer, param) {
            unsafeWindow.TriggerCenter.activate(param);
        });
        CmdExecuteCenter.addExecutor(executor);
    })();

    (function () {
        const executor = new AtCmdExecutor("off", function (performer, param) {
            unsafeWindow.TriggerCenter.deactivate(param);
        });
        CmdExecuteCenter.addExecutor(executor);
    })();

    /***********************************************************************************\
        Dungeons
    \***********************************************************************************/

    const GetDungeonFlow = function (name) {
        for (const d of Dungeons) {
            if (d.name == name) {
                return d.source;
            }
        }
        return null;
    };

    // params: name subtype
    const AutoDungeonName = function (params) {
        const parts = params.split(' ');
        const name = parts[0];
        const type = parts[1];
        let totalName = '';
        switch (type) {
            case '0':
                if (GetDungeonFlow(name)) {
                    return name;
                }
                totalName = `${name}(简单)`;
                if (GetDungeonFlow(totalName)) {
                    return totalName;
                }
                break;
            case '1':
                totalName = `${name}(困难)`;
                if (GetDungeonFlow(totalName) != null) {
                    return totalName;
                };
                break;
            case '2':
                totalName = `${name}(组队)`;
                if (GetDungeonFlow(totalName) != null) {
                    return totalName;
                };
                break;
            default:
                break;
        }
        return null;
    };

    (function () {
        const executor = new AtCmdExecutor("fb", function (performer, param) {
            const name = AutoDungeonName(param);
            if (name == null) {
                Message.append('暂不支持次副本哦，欢迎到论坛分享此副本流程。');
            } else {
                const source = GetDungeonSource(name);
                return new Promise(resolve => {
                    const p = new Performer(`自动副本-${name}`, source);
                    p.log(true);
                    p.start(_ => {
                        resolve();
                    });
                });
            }
        });
        CmdExecuteCenter.addExecutor(executor);
    })();

    function GetDungeonSource(name) {
        let source = GetDungeonFlow(name);
        if (source == null) {
            return null;
        }
        const result = `
[if] (_DungeonHpThreshold) == null
    ($_DungeonHpThreshold) = 50
[if] (_DungeonWaitSkillCD) == null
    ($_DungeonWaitSkillCD) = 打开
[if] (_DungeonBagCleanWay) == null
    ($_DungeonBagCleanWay) = 存仓及售卖
[if] (_DungeonRecordGains) == null
    ($_DungeonRecordGains) = 是
#select ($_DungeonHpThreshold) = 副本内疗伤，当气血低于百分比,100|90|80|70|60|50|40|30|20|10,(_DungeonHpThreshold)
#select ($_DungeonWaitSkillCD) = Boss战前等待技能冷却,打开|关闭,(_DungeonWaitSkillCD)
#select ($_DungeonBagCleanWay) = 背包清理方案,不清理|售卖|存仓及售卖,(_DungeonBagCleanWay)
#select ($_DungeonRecordGains) = 结束后显示收益统计,是|否,(_DungeonRecordGains)
#input ($_repeat) = 重复次数,1
#config
[if] (arg0) != null
    ($_DungeonHpThreshold) = (arg0)
[if] (arg1) != null
    ($_DungeonWaitSkillCD) = (arg1)
[if] (arg2) != null
    ($_DungeonBagCleanWay) = (arg2)
[if] (arg3) != null
    ($_repeat) = (arg3)
<-stopSSAuto
stopstate
<---
[if] (_DungeonHpThreshold) == null
    ($_DungeonHpThreshold) = 50
($hpPer) = (_DungeonHpThreshold)/100
[if] (:hpPer) < (hpPer)
    @liaoshang
--->
[if] (_DungeonRecordGains) == 是
    <-recordGains
($_i) = 0
[if] (_repeat) == null
    ($_repeat) = 1
[while] (_i) < (_repeat)
    @renew
    [if] (_DungeonBagCleanWay) == 售卖
        @cleanBag
    [else if] (_DungeonBagCleanWay) == 存仓及售卖
        @tidyBag
${SourceCodeHelper.appendHeader("    ", source)}
    cr;cr over
    ($_i) = (_i) + 1
[if] (_DungeonBagCleanWay) == 售卖
    @cleanBag
[else if] (_DungeonBagCleanWay) == 存仓及售卖
    @tidyBag
$to 住房-练功房;dazuo
[if] (_DungeonRecordGains) == 是
    recordGains->
stopSSAuto->`
        return result;
    }

    const Dungeons = [
        {
            name: "华山论剑",
            source: `
@print 👑 感谢 koyodakla、freesunny 对此副本代码提供的帮助。
jh fb 30 start1;cr huashan/lunjian/leitaixia
[if] (_DungeonWaitSkillCD) == 打开
    @cd
go up
@tip 恭喜你战胜了五绝
@wait 1000
jump bi
get all from {r五绝宝箱}`
        },
        {
            name: "光明顶(组队)",
            source: `
@print 👑 感谢 dtooboss 分享此副本代码。
jh fb 26 start3;cr mj/shanmen 2 0
go north;go west;go northwest
@kill 冷谦
go north
@kill 张中
go north
@kill 周颠
go north;go north
@kill 颜垣
go east
@kill 唐洋
go north
@kill 辛然
go west;go west
@kill 庄铮
go south
@kill 闻苍松
go east;go south
@kill 说不得,彭莹玉
[if] (_DungeonWaitSkillCD) == 打开
    @cd
go north[2]
@kill 韦一笑,殷天正
[if] (_DungeonWaitSkillCD) == 打开
    @cd
go north[2]
@kill 张无忌,杨逍,范遥`
        },
        {
            name: "光明顶",
            source: `
@print 👑 感谢 dtooboss 分享此副本代码。
jh fb 26 start1;cr mj/shanmen
go north;go west;go northwest
@kill 冷谦
go north
@kill 张中
go north
@kill 周颠
go north;go north
@kill 颜垣
go east
@kill 唐洋
go north
@kill 辛然
go west;go west
@kill 庄铮
go south
@kill 闻苍松
go east;go south
@kill 说不得,彭莹玉
[if] (_DungeonWaitSkillCD) == 打开
    @cd
go north[2]
@kill 韦一笑,殷天正
[if] (_DungeonWaitSkillCD) == 打开
    @cd
go north[2]
@kill 张无忌,杨逍,范遥`
        },
        {
            name: "燕子坞(困难)",
            source: `
jh fb 23 start2;cr murong/anbian 1 0
go east;go east
@kill 包不同
go east;go south;go east;go south;go south
@kill 王夫人
go north;go north;go west;go north
[if] (_DungeonWaitSkillCD) == 打开
    @cd
go east;go east;go east
@kill 慕容复
go west;go north
look pai;bai pai[3]
go north;search
[if] (_DungeonWaitSkillCD) == 打开
    @cd
go south
@kill 慕容博
go east
@kill 阿朱`
        },
        {
            name: "燕子坞(简单)",
            source: `
jh fb 23 start1;cr murong/anbian
go east;go east
@kill 包不同
go east;go south;go east;go south;go south
@kill 王夫人
go north;go north;go west;go north
[if] (_DungeonWaitSkillCD) == 打开
    @cd
go east;go east;go east
@kill 慕容复
go west;go north
look pai;bai pai[3]
go north;search
[if] (_DungeonWaitSkillCD) == 打开
    @cd
go south
@kill 慕容博
go east
@kill 阿朱`
        },
        {
            name: "燕子坞(偷书)",
            source: `
@print 👑 感谢 Airson 分享此副本代码。
jh fb 23 start1;cr murong/anbian
go east;go east
@kill 包不同
go east;go east;go east;go north
look pai;bai pai[3]
go north;search`
        },
        {
            name: "移花宫(困难)",
            source: `
jh fb 22 start2;cr huashan/yihua/shandao 1 0
go south[5]
go south[5]
go south[5]
@kill 花月奴
go south;go south
@kill 移花宫女弟子,移花宫女弟子
go south
@kill 移花宫女弟子,移花宫女弟子
[if] (_DungeonWaitSkillCD) == 打开
    @cd
go southeast
@kill 涟星
[if] {r邀月}? != null
    @kill 邀月
[if] {邀月的尸体}? == null
    [if] (_DungeonWaitSkillCD) == 打开
        @cd
go northwest;go southwest
[if] {r邀月}? != null
    @kill 邀月
[if] {b火折子g}? != null
    look hua
    @tip 你数了下大概有($number)朵花
    go southeast
    look bed;pushstart bed
    pushleft bed[(number)]
    @await 1000
    pushright bed[8]
    @await 1000
    go down;fire;go west
    @kill 花无缺
    look xia;open xia`
        },
        {
            name: "移花宫(简单)",
            source: `
jh fb 22 start1;cr huashan/yihua/shandao
go south[5]
go south[5]
go south[5]
@kill 花月奴
go south;go south
@kill 移花宫女弟子,移花宫女弟子
go south
@kill 移花宫女弟子,移花宫女弟子
[if] (_DungeonWaitSkillCD) == 打开
    @cd
go southeast
@kill 涟星
[if] (_DungeonWaitSkillCD) == 打开
    @cd
go northwest;go southwest
@kill 邀月
[if] {b火折子g}? != null
    look hua
    @tip 你数了下大概有($number)朵花
    go southeast
    look bed;pushstart bed
    pushleft bed[(number)]
    @await 1000
    pushright bed[8]
    @await 1000
    go down;fire;go west
    @kill 花无缺
    look xia;open xia`
        },
        {
            name: "冰火岛(困难)",
            source: `
@print 👑 感谢 WanJiaQi 分享此副本代码。
jh fb 21 start2;cr mj/bhd/haibian 1 0
go west
@kill 炎龙
go west
@kill 炎龙
go west
@kill 炎龙王
@liaoshang
go west;search
@tip 你找到了
go east[4];go north
@kill 白熊
go north
@kill 白熊
@liaoshang
go north;go west;zuan dong
[if] (_DungeonWaitSkillCD) == 打开
    @cd
@kill 张翠山
@kill 谢逊`
        },
        {
            name: "冰火岛(简单)",
            source: `
@print 👑 感谢 WanJiaQi 分享此副本代码。
jh fb 21 start1;cr mj/bhd/haibian 0 0
go west
@kill 炎龙
go west
@kill 炎龙
go west
@kill 炎龙王
@liaoshang
//go west;search
//@tip 你找到了
go east[3];go north
@kill 白熊
go north
@kill 白熊
@liaoshang
go north;go west;zuan dong
[if] (_DungeonWaitSkillCD) == 打开
    @cd
@kill 谢逊`
        },
        {
            name: "星宿海",
            source: `
jh fb 20 start1;cr xingxiu/xxh6
go northeast
@kill 星宿派
go north
@kill 星宿派
go northwest
@kill 星宿派
go southwest
@kill 星宿派
go south
@kill 星宿派
[if] (_DungeonWaitSkillCD) == 打开
    @cd
go north;go northeast;go north
@kill 丁春秋`
        },
        {
            name: "白驼山",
            source: `
jh fb 19 start1;cr baituo/damen
[if] (_DungeonWaitSkillCD) == 打开
    @cd
go north[4]
@kill 欧阳锋
[if] (_DungeonWaitSkillCD) == 打开
    @cd
go south
@kill 欧阳克,白衣少女
go south[2];go west[3]
@kill 毒蛇
go north
@kill 毒蛇
go north;go north
@kill 蟒蛇`
        },
        {
            name: "白驼山(组队)",
            source: `
jh fb 19 start3;cr baituo/damen 2 0
[if] (_DungeonWaitSkillCD) == 打开
    @cd
go north[4]
@kill 欧阳锋
[if] (_DungeonWaitSkillCD) == 打开
    @cd
go south
@kill 欧阳克,白衣少女
go south[2];go west[3]
@kill 毒蛇
go north
@kill 毒蛇
go north;go north
@kill 蟒蛇`
        },
        {
            name: "桃花岛(困难)",
            source: `
jh fb 18 start2;cr taohua/haitan 1 0
@until (:path) == taohua/haitan
@taohualin
@wait 1000
go south
@kill 陆乘风
go east;go east
@kill 曲灵风
[if] (_DungeonWaitSkillCD) == 打开
    @cd
go east;go east
@kill 黄药师
go west;go north
@kill 黄蓉`
        },
        {
            name: "桃花岛(简单)",
            source: `
jh fb 18 start1;cr taohua/haitan
@until (:path) == taohua/haitan
@taohualin
@wait 1000
go south
@kill 陆乘风
go east;go east
@kill 曲灵风
go east;go north
ok {黄蓉}
@zhoubotong
@kill 周伯通
look xia;search xia
go east[2]
go northwest;go southeast;go southeast;go northwest
go southwest;go northeast;go northeast;go southwest
@until (:path) == taohua/haitan
@taohualin
@wait 2000
go south;go east
go east;go east;go north
select {黄蓉};give1 {黄蓉}
@kill 黄蓉`
        },
        {
            name: "云梦沼泽(组队)",
            source: `
@print 👑 感谢 leiyulin 分享此副本代码。
jh fb 17 start3;cr cd/yunmeng/senlin 2 0
$wait 500
go east
@kill 巨鳄
go north
@kill 巨鳄,巨鳄
go east
@kill 巨鳄,巨鳄
go west;go north
@kill 巨鳄,巨鳄
look lu;kan lu;go north
@kill 火龙
go north
@kill 火龙
go north
@kill 火龙
[if] (_DungeonWaitSkillCD) == 打开
    @cd
go north
@kill 火龙王`
        },
        {
            name: "云梦沼泽",
            source: `
@print 👑 感谢 leiyulin 分享此副本代码。
jh fb 17 start1;cr cd/yunmeng/senlin
$wait 500
go east
@kill 巨鳄
go north
@kill 巨鳄,巨鳄
go east
@kill 巨鳄,巨鳄
go west;go north
@kill 巨鳄,巨鳄
look lu;kan lu;go north
@kill 火龙
go north
@kill 火龙
go north
@kill 火龙
[if] (_DungeonWaitSkillCD) == 打开
    @cd
go north
@kill 火龙王`
        },
        {
            name: "嵩山",
            source: `
jh fb 16 start1;cr wuyue/songshan/taishi
[if] (_DungeonWaitSkillCD) == 打开
    @cd
go north[2]
@kill 十三太保
[if] (_DungeonWaitSkillCD) == 打开
    @cd
go northup;go northeast;go northup[2]
@kill 十三太保,十三太保
[if] (_DungeonWaitSkillCD) == 打开
    @cd
go northup;go north
@kill 十三太保,十三太保,十三太保
[if] (_DungeonWaitSkillCD) == 打开
    @cd
go north
@kill 十三太保,十三太保,十三太保,十三太保
[if] (_DungeonWaitSkillCD) == 打开
    @cd
go north
@kill 左冷禅`
        },
        {
            name: "泰山",
            source: `
jh fb 15 start1;cr wuyue/taishan/daizong
go northup[2]
@kill 玉磬子
go northup[2]
@kill 玉音子
go northup[2]
go northup[2]
@kill 玉玑子`
        },
        {
            name: "衡山",
            source: `
jh fb 14 start1;cr wuyue/henshan/hengyang
go west;go north
@kill 嵩山弟子,嵩山弟子
go north;go north
@kill 费彬
@kill 史登达,丁勉
@kill 刘正风
go south[3];go west[2]
@kill 曲洋,曲非烟
go east[4];go southeast;go south;go east;go south
@kill 莫大`
        },
        {
            name: "青城山",
            source: `
@print 👑 感谢 矮大瓜 分享此副本代码。
jh fb 13 start1;cr wuyue/qingcheng/shanlu
go westup
@kill 青城派弟子,青城派弟子
go north
go northup
go eastup
@kill 青城派弟子,青城派弟子
go northup
@kill 洪人雄
go north[3]
@kill 于人豪
go north
@kill 侯人英,罗人杰
go south
go east
@kill 余人彦
[if] (_DungeonWaitSkillCD) == 打开
    @cd
go north
@kill 余沧海`
        },
        {
            name: "恒山",
            source: `
@print 👑 感谢 .min-A 分享此副本代码。
jh fb 12 start1;cr wuyue/hengshan/daziling
go northup;go northwest;go northwest;go northup;go northup
@kill 不戒和尚,仪琳,哑婆婆
go north;go north
@kill 定静师太,定闲师太,定仪师太

($path)=(:path)
[while] true
    <---
    @until (path)!=(:path)
    ($path)=(:path)
    ($guy) = {r采花大盗 田伯光}?
    [if] (guy) != null
        @kill 采花大盗 田伯光
    [if] {田伯光的尸体}? != null
        [break]
    --->
    go south
    go west
    go north
    go south
    go east
    go east
    go north
    go south
    go west
    go south
    go southdown
    go east
    go southeast
    go northup
    go southdown
    go southeast
    go southdown

    go northup
    go northwest
    go northup
    go southdown
    go northwest
    go northup
    go northup
    go north
    go north`
        },
        {
            name: "五毒教(组队)",
            source: `
@print 👑 感谢 矮大瓜 分享此副本代码。
jh fb 11 start3;cr cd/wudu/damen 2 0
@kill 五毒教徒,五毒教徒,五毒教徒,五毒教徒
go east
@kill 沙千里
go south
@kill 藏獒
go west
@kill 白髯老者
go east
go south
@kill 毒郎中
go north
go north
[if](_DungeonWaitSkillCD) == 打开
    @cd
go east
@kill 潘秀达,岑其斯,齐云敖
[if](_DungeonWaitSkillCD) == 打开
    @cd
go east
@kill 何红药
[if](_DungeonWaitSkillCD) == 打开
    @cd
go east
@kill 何铁手`
        },
        {
            name: "五毒教",
            source: `
@print 👑 感谢 矮大瓜 分享此副本代码。
jh fb 11 start1;cr cd/wudu/damen
@kill 五毒教徒,五毒教徒,五毒教徒,五毒教徒
go east
@kill 沙千里
go south
@kill 藏獒
go west
@kill 白髯老者
go east
go south
@kill 毒郎中
go north
go north
[if](_DungeonWaitSkillCD) == 打开
    @cd
go east
@kill 潘秀达,岑其斯,齐云敖
[if](_DungeonWaitSkillCD) == 打开
    @cd
go east
@kill 何红药
[if](_DungeonWaitSkillCD) == 打开
    @cd
go east
@kill 何铁手`
        },
        {
            name: "温府",
            desc: "温府(2k+闪避)",
            source: `
@print 👑 感谢 JiaQi Wan 分享此副本代码。
jh fb 10 start1;cr cd/wen/damen
look tree;climb tree;go north;go northeast
[while] true
    [if] (:path) != cd/wen/zoulang4
        go northeast
    [else]
        [break]
go north[2];go northwest;go north
look zhuang;tiao zhuang
@kill 温方义,温方山,温方施,温方南
[if] {r温家老大 温方达%}? != null
    @kill 温方达
@wait 2000
[if] (_DungeonWaitSkillCD) == 打开
    @cd
look zhuang;tiao zhuang
@until (:path) == cd/wen/xiaoyuan
@wait 500
[if] {r夏雪宜}? != null
    @kill 夏雪宜
go north
@kill 温仪`
        },
        {
            name: "关外",
            source: `
@print 👑 感谢 老实人 分享此副本代码。
jh fb 9 start1;cr bj/guanwai/damen
go northeast
@kill 金雕
go east
@kill 金雕
go southeast
@kill 金雕
go east
@kill 平四
go north
select {r胡斐}
ask {r胡斐} about 阎基
@tip 胡斐说道：阎基是我的杀父仇人($chat)
[if] (chat) == ，
        give {r胡斐} {b阎基的头颅}
        ask {r胡斐} about 胡家刀谱
[if] (_DungeonWaitSkillCD) == 打开
    @cd
@kill 胡斐
go south;go east
@kill 东北虎
go eastup
@kill 东北虎
go southup
@kill 东北虎
[if] (_DungeonWaitSkillCD) == 打开
    @cd
go eastup
@kill 黑熊
go westdown;go northdown;go west[2];go northwest
go west;go southwest;go west
give {r船夫} 10000 money
@until (:room)==关外-船厂(副本区域)
@wait 500
@kill 船夫
go south;go west[5];go north
@kill 江湖医生 阎基`
        },
        {
            name: "神龙教(组队)",
            source: `
jh fb 8 start3;cr bj/shenlong/haitan 2 0;go north
@kill 毒蛇,竹叶青
look bush;kan bush;go north
@kill 毒蛇,竹叶青
go north
@kill 神龙教弟子,神龙教弟子
go north
@kill 神龙教军师 陆高轩
go south;go east
@kill 神龙教青龙使 许雪亭
go east
@kill 神龙教女弟子,神龙教女弟子
go north[2]
@kill 神龙教弟子,神龙教弟子
[if] (_DungeonWaitSkillCD) == 打开
    @cd
go north
@kill 洪安通,张淡月,无根道长`
        },
        {
            name: "神龙教",
            source: `
jh fb 8 start1;cr bj/shenlong/haitan;go north
@kill 毒蛇,竹叶青
look bush;kan bush;go north
@kill 毒蛇,竹叶青
go north
@kill 神龙教弟子,神龙教弟子
go north
@kill 神龙教军师 陆高轩
go south;go east
@kill 神龙教青龙使 许雪亭
go east
@kill 神龙教女弟子,神龙教女弟子
go north[2]
@kill 神龙教弟子,神龙教弟子
[if] (_DungeonWaitSkillCD) == 打开
    @cd
go north
@kill 洪安通,张淡月,无根道长`
        },
        {
            name: "天地会",
            source: `
@print 👑 感谢 jicki 分享此副本代码，感谢 andyfos、mma1996 协助完成。
jh fb 7 start1;cr bj/tdh/hct
@kill 药铺伙计
@kill 天地会青木堂护法 徐天川
go west
@kill 关夫子 关安基
knock;knock;knock
go down
@until {r尸体}? != null
go west[5]
@until {r尸体}? != null
go north
@liaoshang
[if] (_DungeonWaitSkillCD) == 打开
    @cd
@kill 陈近南
go east
get {r一}?
@wait 500
get {r一}?
go west
go north
go east
@tip 拔刀相助，贫尼感激不尽。
@wait 1000
select {r神尼};cha {r神尼}
@wait 1000
@kill 独臂神尼`
        },
        {
            name: "鳌拜府",
            source: `
@print 👑 感谢 Jeaepan 分享此副本代码。
jh fb 6 start1;cr bj/ao/damen
@kill 官兵,官兵
go west
@kill 吴之荣
go north
@kill 厨师
go south;go west
@kill 家将,家将,女管家
[if] (_DungeonWaitSkillCD) == 打开
    @cd
go west
@kill 满洲第一勇士 鳌拜
go east;go north
look shu;open shu
@tip 发现扉页的($pos)下角被鳌拜写了一个大大的杀字
look hua
$wait 500
[if] (pos) == 左
    tleft hua
[if] (pos) == 右
    $wait 500
    tright hua
go north
select {r四十二章经g}?
get {r四十二章经g}?
go south;go south
($open) = 没开
look men;unlock men
@tip 你用一把钥匙($open)了牢房门|你不会撬锁
[if] (open) == 打开
    go south
    select {r庄允城}?
    ask {r庄允城}? about 吴之荣
    @kill 庄允城`
        },
        {
            name: "庄府",
            source: `
@print 👑 感谢 qwer68588 分享此副本代码。
jh fb 5 start1;cr bj/zhuang/xiaolu
go north
@kill 土匪
go north
look men;break men
go north
@kill 神龙教弟子,神龙教弟子
go north
@kill 神龙教弟子
@kill 神龙教小头目 章老三
go west
@kill 神龙教弟子
go east;go east
@kill 神龙教弟子`
        },
        {
            name: "兵营",
            source: `
@print 👑 感谢 qwer68588 分享此副本代码。
jh fb 4 start1;cr yz/by/damen
@kill 官兵,官兵
$wait 1000
@liaoshang
[if] (_DungeonWaitSkillCD) == 打开
    @cd
go south
@kill 官兵,官兵,官兵,武将,武将,史青山
$wait 1000
look men;open men
go south;search`
        },
        {
            name: "流氓巷(组队)",
            source: `
jh fb 2 start3;cr yz/lmw/xiangzi1 2 0
@kill 小流氓,小流氓
go east
@kill 流氓,流氓
go north
@kill 流氓头,流氓,流氓
go south;go east
@kill 流氓,流氓
go east
@kill 流氓头领`
        },
        {
            name: "流氓巷",
            source: `
jh fb 2 start1;cr yz/lmw/xiangzi1
@kill 小流氓,小流氓
go east
@kill 流氓,流氓
go north
@kill 流氓头,流氓,流氓
go south;go east
@kill 流氓,流氓
go east
@kill 流氓头领`
        },
        {
            name: "丽春院",
            source: `
jh fb 3 start1;cr yz/lcy/dating
@kill 韦春芳
go up
@kill 龟公
go west
@kill 史松
look tai;tui tai;go enter
@kill 茅十八`
        },
        {
            name: "财主家(困难)",
            source: `
jh fb 1 start2;cr yz/cuifu/caizhu 1 0
@kill 大狼狗,大狼狗
go north
@kill 管家,家丁,家丁
[if] (_DungeonWaitSkillCD) == 打开
    @cd
go north
@kill 财主 崔员外
($open) = 没开
look men;open men
@tip 你不会撬锁|钥匙($open)了秘门
[if] (open) == 打开
    go east
    ok {丫鬟}
    go west;go south;go south
    ok {丫鬟}?
    go north;go north;go west
    select {财主女儿 崔莺莺};ask {财主女儿 崔莺莺} about 东厢
[else]
    go west
@kill 财主女儿 崔莺莺
[if] (open) == 打开
    go east;go east;look gui;search gui`
        },
        {
            name: "财主家(简单)",
            source: `
jh fb 1 start1;cr yz/cuifu/caizhu
@kill 大狼狗,大狼狗
go north
@kill 管家,家丁,家丁
[if] (_DungeonWaitSkillCD) == 打开
    @cd
go north
@kill 财主 崔员外
($open) = 没开
look men;open men
@tip 你不会撬锁|钥匙($open)了秘门
[if] (open) == 打开
    go east
    ok {丫鬟}
    go west;go south;go south
    ok {丫鬟}?
    go north;go north;go west
    select {财主女儿 崔莺莺};ask {财主女儿 崔莺莺} about 东厢
[else]
    go west
@kill 财主女儿 崔莺莺
[if] (open) == 打开
    go east;go east;look gui;search gui` }
    ];

    /***********************************************************************************\
        Server
    \***********************************************************************************/

    const Server = {
        uploadConfig: function () {
            let all = {};
            let keys = GM_listValues();
            keys.forEach(key => {
                if (key != "roles") {
                    all[key] = GM_getValue(key);
                }
            });
            if (unsafeWindow.TriggerConfig != null) {
                const tConfig = unsafeWindow.TriggerConfig.get();
                all["@@@trigger"] = tConfig;
            }
            let value = JSON.stringify(all);
            Server._sync("uploadConfig", { id: Role.id, value: value }, pass => {
                GM_setClipboard(pass);
                alert(`wsmud_Raid 配置上传成功，该浏览器所有角色配置会在服务器保存 24 小时。\n配置获取码：${pass}，已复制到系统剪切板。`);
                Message.append(`<hiy>角色配置获取码：${pass}</hiy>`);
                Message.append(`<div class="item-commands"><span cmd = "@js prompt('请手动复制下面的数据','${pass}');" >
                                 我无法复制 </span></div>`);
            }, _ => {
                alert("wsmud_Raid 配置上传失败！");
            });
           
        },
        downloadConfig: function (pass) {
            Server._sync("downloadConfig", { pass: pass }, data => {
                let config = JSON.parse(data);
                for (const key in config) {
                    if (key == "@@@trigger") {
                        if (unsafeWindow.TriggerConfig != null) {
                            unsafeWindow.TriggerConfig.set(config[key]);
                        }
                        continue;
                    }
                    if (key != "roles") {
                        GM_setValue(key, config[key]);
                    }
                }
                alert("wsmud_Raid 配置下载成功！");
            }, _ => {
                alert("wsmud_Raid 配置下载失败！");
            });
        },
        uploadFlows: function () {
            const flows = FlowStore.getAll();
            const map = WorkflowConfig._rootList();
            const data = { map: map, flows: flows };
            const value = JSON.stringify(data);
            Server._sync("uploadFlows", { id: Role.id, value: value }, pass => {
                GM_setClipboard(pass);
                alert(`角色流程上传成功，该角色流程会在服务器保存 24 小时。\n角色流程获取码：${pass}，已复制到系统剪切板。`);
                Message.append(`<hiy>角色流程获取码：${pass}</hiy>`);
                Message.append(`<div class="item-commands"><span cmd = "@js prompt('请手动复制下面的数据','${pass}');" >
                                 我无法复制 </span></div>`);
            }, _ => {
                alert("角色流程上传失败！");
            });
        },
        downloadFlows: function (pass) {
            Server._sync("downloadFlows", { pass: pass }, value => {
                let data = JSON.parse(value);
                FlowStore.corver(data.flows);
                WorkflowConfig._rootList(data.map);
                // console.log(data);
                alert("拷贝角色流程成功！");
            }, _ => {
                alert("错误的角色流程获取码！");
            });
        },
        uploadTriggers: function () {
          
            const triggers = unsafeWindow.TriggerCenter.getAllData();
            const value = JSON.stringify(triggers);
            Server._sync("uploadTriggers", { id: Role.id, value: value }, pass => {
                GM_setClipboard(pass);
                alert(`角色触发器上传成功，该角色触发会在服务器保存 24 小时。\n角色触发器获取码：${pass}，已复制到系统剪切板。`);
                Message.append(`<hiy>角色触发获取码：${pass}</hiy>`);
                Message.append(`<div class="item-commands"><span cmd = "@js prompt('请手动复制下面的数据','${pass}');" >
                                    我无法复制 </span></div>`);
            }, _ => {
                alert("角色触发器上传失败！");
            });
            
         
        },
        downloadTriggers: function (pass) {
            Server._sync("downloadTriggers", { pass: pass }, value => {
                let data = JSON.parse(value);
                unsafeWindow.TriggerCenter.corver(data);
                // console.log(data);
                alert("拷贝角色触发器成功！");
            }, _ => {
                alert("错误的角色触发器获取码！");
            });
        },
        getNotice: function () {
            const noticeDataKey = "NoticeDataKey";
            const oldData = GM_getValue(noticeDataKey, { version: "0.0.0", type: "0", value: "欢迎使用 wsmud_Raid" });
            Server._async("notice", { version: oldData.version,id:Role.id }, data => {
                let validData = oldData;
                if (data.version > oldData.version) {
                    GM_setValue(noticeDataKey, data);
                    validData = data;
                }
                if (validData.type == "0") {
                    L.msg(`
                    <div>
                    <p><hig>Raid：</hig>${validData.value}</p>
                    <p style="text-align:center">(v-${GM_info.script.version})</p>
                    </div>`);
                } else {
                    const HideVersionNoticeKey = "HideVersionNoticeKey";
                    if (GM_getValue(HideVersionNoticeKey, null) == validData.version) {
                        return;
                    }
                    layer.open({
                        type: 1,
                        skin: "layui-layer-rim", //加上边框
                        area: ["380px"],
                        title: `wsmud_Raid 提示`,
                        content: validData.value,
                        offset: "auto",
                        shift: 2,
                        move: false,
                        closeBtn: 0,
                        btn: ['确认', '不再显示'],
                        yes: function (index) {
                            layer.close(index);
                        },
                        btn2: function () {
                            GM_setValue(HideVersionNoticeKey, validData.version);
                        }
                    });
                }
            });
        },

        shareFlowTrigger: function (username, password, type, data) {

            Server._getPhone((phoneNum) => {
                if (phoneNum == '') {
                    alert("请先绑定手机号！");
                    return;
                }else{
                    let value = data;
                    value["author"] = username;
                    const params = {
                        username: username,
                        password: password,
                        name: data.name,
                        phone: phoneNum,
                        type: type,
                        value: JSON.stringify(value)
                    };
                    // console.log(params);
                    Server._sync("uploadSingle", params, token => {
                        GM_setClipboard(token);
                        alert(`${type}分享成功，该${type}会在服务器保存 30 天\n每次下载会延长保存 始于下载时刻的 30 天\n分享码：${token}\n已复制到系统剪切板。`);
                        Message.append(`<hiy>${type}分享码：${token}</hiy>`);
                        Message.append(`<div class="item-commands"><span cmd = "@js prompt('请手动复制下面的数据','${token}');" >
                                         我无法复制 </span></div>`);
                    }, error => {
                        alert(error);
                    });
        }},()=>{
            alert("请先绑定手机号！");
        });
          
        },
        importFlow: function (token, target) {
            if (token.indexOf("·流程") == -1) {
                alert("错误的流程分享码！");
                return;
            }
            const params = { token: token };
            Server._sync("downloadSingle", params, data => {
                const flow = JSON.parse(data);
                const result = WorkflowConfig.createWorkflow(flow.name, flow.source, target);
                if (result == true) {
                    //alert(`导入流程 ${flow.name} 成功！`);
                    Message.append(`<hiy>导入流程 ${flow.name} 成功！</hiy>`);
                } else {
                    alert(result);
                }
            }, _ => {
                alert("错误的流程分享码！");
            });
        },
        importTrigger: function (token) {
            if (token.indexOf("·触发") == -1) {
                alert("错误的触发器分享码！");
                return;
            }
            const params = { token: token };
            Server._sync("downloadSingle", params, data => {
                const trigger = JSON.parse(data);
                const result = unsafeWindow.TriggerCenter.create(trigger.name, trigger.event, trigger.conditions, trigger.source, trigger.active);
                if (result == true) {
                    //alert(`导入触发器 ${trigger.name} 成功！`);
                    Message.append(`<hiy>导入触发器 ${trigger.name} 成功！</hiy>`);
                } else {
                    alert(result);
                }
            }, _ => {
                alert("错误的触发器分享码！");
            });
        },

        _address: "wsmud.ii74.com/S",
        _async(uri, params, success, fail) {
            this._get(true, uri, params, success, fail);
        },
        _sync(uri, params, success, fail) {
            this._get(false, uri, params, success, fail);
        },
        _get(async, uri, params, success, fail) {
            $.ajax({
                type: "post",
                url: `https://${Server._address}/${uri}`,
                data: params,
                async: async,
                success: function (data) {
                    if (data.code == 200) {
                        if (success != null) success(data.data);
                    } else {
                        let error = data.code;
                        if (data.data != null) error = data.data;
                        if (fail != null) fail(error);
                    }
                },
                dataType: "json"
            });
        },
        _getPhone(success,fail){
            $.ajax({
                type: "post",
                url: `/UserAPI/GetPhone`,
                async: true,
                xhrFields: {
                    withCredentials: true
                },
                success :function(data){
                    if(data){
                        //去掉*
                        data = data.replace(/\"/g,"");
                        if(success != null) success(data);
                    }else{
                        fail(data);
                    }
                }
            });
        }
    };

    /***********************************************************************************\
        UI
    \***********************************************************************************/

    //---------------------------------------------------------------------------
    //  兼容 1.x.x
    //---------------------------------------------------------------------------

    var CmdGroupManager = {
        /**
         * @returns {{ id: number, name: string }[]}
         */
        getAll: function () {
            var result = [];
            GM_listValues().map(function (key) {
                if (key.indexOf(CmdGroupManager._prefix) == 0) {
                    var id = CmdGroupManager._id(key);
                    var name = CmdGroupManager.getName(id);
                    result.push({ id: id, name: name });
                }
            });
            return result;
        },
        getName: function (id) {
            var value = GM_getValue(this._key(id));
            if (value == null) return null;
            var obj = JSON.parse(value);
            return obj.name;
        },
        getCmdsText: function (id) {
            var value = GM_getValue(this._key(id));
            if (value == null) return "";
            var obj = JSON.parse(value);
            var cmdsStr = obj.cmdsStr;
            return cmdsStr;
        },
        /**
         * @returns {string[]}
         */
        getCmds: function (id) {
            var text = this.getCmdsText(id);
            var cmds = text.split(/^\s*|\s*\n+\s*/g);
            var first = cmds[0];
            if (first != null && first.length == 0) {
                cmds.splice(0, 1);
            }
            var last = cmds[cmds.length - 1];
            if (last != null && last.length == 0) {
                cmds.splice(cmds.length - 1, 1);
            }
            return cmds;
        },
        createCmdGroup: function (name, cmdsStr) {
            var id = new Date().getTime();
            return this.updateCmdGroup(id, name, cmdsStr);
        },
        updateCmdGroup: function (id, name, cmdsStr) {
            if (name == null || !/\S+/g.test(name)) {
                alert("命令组想要一个名字...");
                return false;
            }
            if (cmdsStr == null || !/\S+/g.test(cmdsStr)) {
                alert("命令组不想没有任何内容...");
                return false;
            }
            // 存储格式
            var value = {
                name: name,
                cmdsStr: cmdsStr
            };
            GM_setValue(this._key(id), JSON.stringify(value));
            return true;
        },
        removeCmdGroup: function (id) {
            GM_deleteValue(this._key(id));
        },

        _prefix: "@cmdgroup",
        _key: function (id) {
            return this._prefix + id;
        },
        _id: function (key) {
            return parseInt(key.substring(this._prefix.length));
        }
    };

    var WorkflowConfigManager = {
        /**
         * @returns {{ id: number, name: string }[]}
         */
        getAll: function () {
            var result = [];
            GM_listValues().map(function (key) {
                if (WorkflowConfigManager._isMyKey(key)) {
                    var id = WorkflowConfigManager._id(key);
                    var name = WorkflowConfigManager.getName(id);
                    result.push({ id: id, name: name });
                }
            });
            return result;
        },
        getName: function (id) {
            var value = GM_getValue(this._key(id));
            if (value == null) return null;
            var obj = JSON.parse(value);
            return obj.name;
        },
        /**
         * @returns {{ id: number, repeat: number }[]}
         */
        getCmdGroupInfos: function (id) {
            var value = GM_getValue(this._key(id));
            if (value == null) return null;
            var obj = JSON.parse(value);
            return obj.infos;
        },
        /**
         * @returns {Workflow}
         */
        getWorkflow: function (id) {
            var cmdGroupInfos = this.getCmdGroupInfos(id);
            var items = [];
            for (const info of cmdGroupInfos) {
                var name = CmdGroupManager.getName(info.id);
                var cmds = CmdGroupManager.getCmds(info.id);
                var commandWorkflow = new CommandWorkflow(name, cmds, info.repeat);
                items.push(commandWorkflow);
            }
            var workflow = new Workflow(this.getName(id), items, 1);
            return workflow;
        },
        /**
         * @param {string} name
         * @param {{ id: string, repeat: number }[]} cmdGroupInfos
         */
        createWorkflowConfig: function (name, cmdGroupInfos) {
            var id = new Date().getTime();
            return this.updateWorkflowConfig(id, name, cmdGroupInfos);
        },
        /**
         * @param {number} id
         * @param {string} name
         * @param {{ id: string, repeat: number }[]} cmdGroupInfos
         */
        updateWorkflowConfig: function (id, name, cmdGroupInfos) {
            if (name == null || !/\S+/g.test(name)) {
                alert("工作流想要一个名字...");
                return false;
            }
            if (cmdGroupInfos == null || cmdGroupInfos.length <= 0) {
                alert("工作流不想没有任何内容...");
                return false;
            }
            // 存储格式
            var value = {
                name: name,
                infos: cmdGroupInfos
            };
            GM_setValue(this._key(id), JSON.stringify(value));
            return true;
        },
        removeWorkflowConfig: function (id) {
            GM_deleteValue(this._key(id));
        },

        _prefix: "workflow@",
        _isMyKey: function (key) {
            return key.indexOf(this._prefix + Role.id) == 0;
        },
        _key: function (id) {
            return this._prefix + Role.id + id;
        },
        _id: function (key) {
            return parseInt(key.substring((this._prefix + Role.id).length));
        }
    };

    const CodeTranslator = {
        run: function () {
            const oldFinder1 = this._getFinder("原命令组");
            if (oldFinder1) {
                WorkflowConfig.removeFinder(oldFinder1);
            }
            WorkflowConfig.createFinder("原命令组");
            const oldFinder2 = this._getFinder("原工作流程");
            if (oldFinder2) {
                WorkflowConfig.removeFinder(oldFinder2);
            }
            WorkflowConfig.createFinder("原工作流程");

            let allCmdGroup = CmdGroupManager.getAll();
            let allWorkflow = WorkflowConfigManager.getAll();
            const result = this._newSingleName(allCmdGroup, allWorkflow);
            allCmdGroup = result.group;
            allWorkflow = result.flow;

            allCmdGroup.forEach(g => {
                const cmdsText = CmdGroupManager.getCmdsText(g.id);
                const header = "    ";
                const cmdsTextHasHeader = this._appendHeader(header, cmdsText);
                const source = `($_i) = 0\n[while] (_i) < (arg0)\n${cmdsTextHasHeader}\n${header}($_i) = (_i) + 1`;
                WorkflowConfig.createWorkflow(g.name, source, "原命令组");
            });

            allWorkflow.forEach(f => {
                const infos = WorkflowConfigManager.getCmdGroupInfos(f.id);
                let source = "";
                infos.forEach(info => {
                    let cmdGroupName = null;
                    for (const cmdGroup of allCmdGroup) {
                        if (cmdGroup.id == info.id) {
                            cmdGroupName = cmdGroup.name;
                            break;
                        }
                    }
                    source += `@call ${cmdGroupName} ${info.repeat}\n`;
                });
                WorkflowConfig.createWorkflow(f.name, source, "原工作流程");
            });
        },
        _newSingleName: function (cmdGroups, workflows) {
            let allCmdGroup = this._singleName(cmdGroups);
            let allWorkflow = this._singleName(workflows);
            allCmdGroup.forEach(cmdGroup => {
                const name = cmdGroup.name;
                for (const flow of allWorkflow) {
                    if (flow.name == name) {
                        cmdGroup.name = `芫${name}`;
                        break;
                    }
                }
            });
            return { group: allCmdGroup, flow: allWorkflow };
        },
        _singleName: function (list) {
            for (const item of list) {
                item.name = item.name.replace(/[^_a-zA-Z0-9\u4e00-\u9fa5]/g, "");
            }
            for (let i = 0; i < list.length; i++) {
                const item = list[i];
                let name = item.name;
                let number = 1;
                for (let j = i + 1; j < list.length; j++) {
                    const item1 = list[j];
                    if (item1.name == name) {
                        item1.name = `${name}_${number}`;
                        number += 1;
                    }
                }
            }
            return list;
        },
        _getFinder: function (name) {
            let list = WorkflowConfig._rootList();
            const index = WorkflowConfig._findFinder(name, list);
            if (index == null) return null;
            return list[index];
        },
        _appendHeader: function (header, text) {
            let result = `\n${text}`;
            result = result.replace(/(\n)/g, `$1${header}`);
            result = result.replace(/\n\s*\n/g, "\n");
            result = result.replace(/^\s*\n/, "");
            // console.log(result);
            return result;
        }
    };

    //---------------------------------------------------------------------------
    //  2.1.x UI
    //---------------------------------------------------------------------------

    var WorkflowConfig = {
        rootFinderName: "根文件夹",
        rootFinderSortWay: function (value) {
            const key = "__WorkflowRootFinderSortWay";
            if (value == null) {
                return GM_getValue(key, "nameAsc");
            }
            GM_setValue(key, value);
        },
        finderList: function (finderName) {
            let result = [];
            if (finderName == this.rootFinderName) {
                result = this._rootList();
            } else {
                const list = this._rootList();
                const index = this._findFinder(finderName, list);
                if (index != null) {
                    const finder = list[index];
                    result = finder.flows;
                }
            }
            result.forEach(item => {
                if (item.type == "flow") {
                    item.finder = finderName;
                }
            });
            switch (this.rootFinderSortWay()) {
                case "updateDesc":
                    result.reverse();
                    break;
                case "nameAsc":
                    result.sort(function (a, b) {
                        return a.name.localeCompare(b.name);
                    });
                    break;
                case "nameDesc":
                    result.sort(function (a, b) {
                        return b.name.localeCompare(a.name);
                    });
                    break;
                case "updateAsc":
                default:
                    break;
            }
            return result;
        },
        createFinder: function (name, flows) {
            const result = this._checkName(null, name, true);
            if (result != true) return result;

            let list = this._rootList();
            const finder = { name: name, type: "finder", flows: flows ? flows : [] };
            list.push(finder);
            this._rootList(list);
            return true;
        },
        modifyFinder: function (finder, newName) {
            const result = this._checkName(finder.name, newName, true);
            if (result != true) return result;

            if (finder.name == newName) return true;

            this.removeFinder(finder);
            return this.createFinder(newName, finder.flows);
        },
        removeFinder: function (finder) {
            let list = this._rootList();
            const index = this._findFinder(finder.name, list);
            if (index == null) return;

            list.splice(index, 1);
            this._rootList(list);

            for (const flow of finder.flows) {
                FlowStore.remove(flow.name);
            }
        },
        createWorkflow: function (name, source, finderName) {
            const result = this._checkName(null, name, false);
            if (result != true) return result;

            const flow = { name: name, type: "flow" };
            let list = this._rootList();
            let success = false;
            if (finderName == this.rootFinderName) {
                list.push(flow);
                success = true;
            } else {
                const index = this._findFinder(finderName, list);
                if (index != null) {
                    const finder = list[index];
                    finder.flows.push(flow);
                    success = true;
                }
            }
            if (success) {
                FlowStore.save(name, source);
                this._rootList(list);
                return true;
            } else {
                return `未找到名为"${finderName}"的文件夹。`;
            }
        },
        modifyWorkflow: function (flow, newName, newSource, newFinderName) {
            const result = this._checkName(flow.name, newName, false);
            if (result != true) return result;

            if (flow.name != newName || flow.finder != newFinderName) {
                this.removeWorkflow(flow);
                return this.createWorkflow(newName, newSource, newFinderName);
            } else if (FlowStore.get(flow.name) != newSource) {
                FlowStore.save(flow.name, newSource);
            }
            return true;
        },
        removeWorkflow: function (flow) {
            let list = this._rootList();
            if (flow.finder == this.rootFinderName) {
                for (let i = 0; i < list.length; i++) {
                    const item = list[i];
                    if (item.type == "flow" && item.name == flow.name) {
                        list.splice(i, 1);
                        break;
                    }
                }
            } else {
                const index = this._findFinder(flow.finder, list);
                if (index != null) {
                    const finder = list[index];
                    const flows = finder.flows;
                    for (let k = 0; k < flows.length; k++) {
                        const flow1 = flows[k];
                        if (flow1.name == flow.name) {
                            flows.splice(k, 1);
                            break;
                        }
                    }
                }
            }
            this._rootList(list);

            FlowStore.remove(flow.name);
        },
        getFinderNames: function () {
            let result = [this.rootFinderName];
            let list = this._rootList();
            list.forEach(item => {
                if (item.type == "finder") {
                    result.push(item.name);
                }
            });
            return result;
        },
        _rootList: function (list) {
            const key = `WorkflowConfig_${Role.id}`;
            if (list != null) {
                GM_setValue(key, list);
            }
            return GM_getValue(key, []);
        },
        _checkName: function (oldName, name, isFinder) {
            if (name == oldName) return true;
            const itemName = isFinder ? "文件夹" : "工作流程";
            if (!/\S+/.test(name)) return `${itemName}的名称不能为空。`;
            if (name.indexOf(this.rootFinderName) != -1) return `${itemName}的名称中不能包含"${this.rootFinderName}"。`;
            if (!/^[_a-zA-Z0-9\u4e00-\u9fa5]+$/.test(name)) return `${itemName}的名称只能使用中文、英文和数字字符。`;
            let list = this._rootList();
            const type = isFinder ? "finder" : "flow";
            for (const item of list) {
                if (item.type == type && item.name == name) {
                    return `已经存在此名称的${itemName}。`;
                }
                if (item.type == "finder" && !isFinder) {
                    for (const flow of item.flows) {
                        if (flow.name == name) {
                            return `已经存在此名称的${itemName}。`;
                        }
                    }
                }
            }
            return true;
        },
        _findFinder: function (name, list) {
            for (let i = 0; i < list.length; i++) {
                const item = list[i];
                if (item.type == "finder" && item.name == name) {
                    return i;
                }
            }
            return null;
        }
    };

    var ManagedPerformerCenter = {
        start: function (name, source, log, callback) {
            const p = new Performer(name, source);
            p.log(log != null ? log : true);
            const key = `key${this._counter}`;
            this._counter += 1;
            this._performers[key] = p;
            p.start(_ => {
                delete ManagedPerformerCenter._performers[key];
                if (ManagedPerformerCenter.getAll().length == 0) {
                    $("#workflows-button").css("border-color", "inherit");
                }
                if (callback) callback();
            });
            $("#workflows-button").css("border-color", "#00FF00");
        },
        getAll: function () {
            return Object.values(this._performers);
        },
        _counter: 0,
        _performers: {}
    };

    const UI = {
        showToolbar: function () {
            if (!UI._toolbarHidden) return;
            UI._toolbarHidden = false;
            var raidToolbar = `
            <style>
                .raid-item{
                    display: inline-block;
                    border: solid 1px gray;
                    color: gray;
                    background-color: black;
                    text-align: center;
                    cursor: pointer;
                    border-radius: 0.25em;
                    //min-width: 2.5em;
                    margin-right: 0em;
                    //margin-left: 0.4em;
                    position: relative;
                    padding-left: 0.3em;
                    padding-right: 0.3em;
                    line-height: 28px;
                }
            </style>
            <div id="raidToolbar">
                <div class="raidToolbar" style="width:calc(100% - 40px);margin:5px 0 5px 0">
                    <span class="raid-item hideRaidToolbar" style="width:10px">\<</span>
                    <span class="raid-item forum">🐟 <hiy>咸鱼</hiy></span>
                    <span class="raid-item shortcut">🍯 <hiz>捷径</hiz></span>
                    <span class="raid-item trigger">🍟 <hio>触发</hio></span>
                    <span class="raid-item customFlow" id="workflows-button">🥗 <hig>流程</hig></span>
                    <span class="raid-item moreRaid">🍺 <hic>副本</hic></span>
                    <!--<span class="raid-item hideRaidToolbar" style="float:right;"><wht>测试</wht></span>-->
                </div>
            </div>`
            $(".WG_log").before(raidToolbar);
            $(".customFlow").on('click', UI.workflows);
            $(".trigger").on('click', UI.trigger);
            $(".forum").on('click', UI.forum);
            $(".shortcut").on('click', UI.shortcut);
            $(".moreRaid").on('click', UI.dungeons);
            $(".hideRaidToolbar").on('click', UI.hideToolbar);
        },
        hideToolbar: function () {
            var toolbar = document.getElementById("raidToolbar");
            if (toolbar != null) {
                toolbar.parentNode.removeChild(toolbar);
                L.msg("单击右键，选择流程菜单可恢复显示。");
            }
            UI._toolbarHidden = true;
        },

        trigger: function () {
            if (unsafeWindow.TriggerUI == null) {
                const content = `
                <span class = "zdy-item install-trigger" style="width:120px"> 前往安装 </span>
                `;
                UI._appendHtml("🍟 <hio>触发器</hio>", content);
                $(".install-trigger").on('click', function () {
                    window.open("https://greasyfork.org/zh-CN/scripts/378984", '_blank').location;
                });
            } else {
                unsafeWindow.TriggerUI.triggerHome();
            }
        },
        forum: function () {
            var content = `
            <span class = "zdy-item xianyu-xyjq" style="width:120px"> 🤌 襄阳捐钱 </span>
            <span class = "zdy-item xianyu-ksyb" style="width:120px"> 🦆 快速运镖 </span>
            <span class="zdy-item xianyu-sdyt" style="width:120px"> 🐉 扫荡妖塔</span>
            <span class="zdy-item xianyu-mghyj" style="width:120px"> 🍟 门贡换元晶</span>
            <br><br>
            <span class="zdy-item xianyu-xybm" style="width:120px"> 🐘 襄阳报名</span>
            <span class="zdy-item xianyu-ltbm" style="width:120px"> 🏆 擂台报名</span>
            <span class="zdy-item xianyu-cbt" style="width:120px"> 💎 藏宝图</span>
            <span class = "zdy-item xianyu-setting" style="width:120px"> 🔧 参数设置 </span>
            <br><br>
            <hr style="background-color: gray; height: 1px; width: calc(100% - 4em); border: none;"><br>
            <span class = "zdy-item about-script" style="width:120px"> 🦶 <wht>脚本教程</wht> </span>
            <!--<span class = "zdy-item about-flow" style="width:120px"> <wht>流程讨论</wht> </span>-->
            <!--<span class = "zdy-item about-trigger" style="width:120px"> <wht>触发器讨论</wht> </span>-->
            <span class = "zdy-item about-bug" style="width:120px"> 🐞 <wht>Bug 提交</wht> </span>
            <!--<br><br>-->
            <!--<hr style="background-color: gray; height: 1px; width: calc(100% - 4em); border: none;"><br>-->
            <span class = "zdy-item about-yaofang" style="width:120px"> 💊 药方清单 </span>
            <span class = "zdy-item suqingHome" style="width:120px"> 🍿 <hig>苏</hig><hio>轻</hio><hiy>工</hiy><wht>具</wht><hic>包</hic> </span>`;
            // UI._appendHtml("🍱 <hiy>江湖客栈</hiy>", content);
            UI._appendHtml("🐟 <hiy>一键咸鱼</hiy>", content);
            $(".xianyu-xyjq").on("click", function () {
                DungeonsShortcuts.xianyu_xyjq();
            });
            $(".xianyu-ksyb").on("click", function () {
                DungeonsShortcuts.xianyu_ksyb();
            });
            $(".xianyu-sdyt").on("click", function () {
                DungeonsShortcuts.xianyu_sdyt();
            });
            $(".xianyu-mghyj").on("click", function () {
                DungeonsShortcuts.xianyu_mghyj();
            });
            $(".xianyu-cbt").on("click", function () {
                DungeonsShortcuts.cangbaotu();
            });
            $(".xianyu-xybm").on("click", function () {
                DungeonsShortcuts.xianyu_xybm();
            });
            $(".xianyu-ltbm").on("click", function () {
                DungeonsShortcuts.xianyu_ltbm();
            });
            $(".xianyu-setting").on("click", function () {
                DungeonsShortcuts.xianyu_setting();
            });
            $(".about-script").on('click', function () {
                window.open("https://www.yuque.com/wsmud/doc", '_blank').location;
            });
            $(".about-bug").on('click', function () {
                window.open("https://www.yuque.com/wsmud/doc/gr9gyy", '_blank').location;
            });
            $(".about-yaofang").on('click', function () {
                window.open("https://emeisuqing.github.io/wsmud.old/", '_blank').location;
            });
            $(".suqingHome").on('click', function () {
                window.open("https://emeisuqing.github.io/wsmud/", '_blank').location;
            });
        },
        shortcut: function () {
            var content = `
            <span class = "zdy-item outMaze" style="width:120px"> 走出桃花林 </span>
            <span class = "zdy-item zhoubotong" style="width:120px"> 找到周伯通 </span>
            <span class = "zdy-item cihang" style="width:120px"> 慈航七重门 </span>
            <span class = "zdy-item zhanshendian" style="width:120px"> 战神殿解谜 </span>
            <span class = "zdy-item guzongmen" style="width:120px"> 古宗门寻路 </span>
            <span class = "zdy-item cangbaotu" style="width:120px"> 藏宝图寻宝 </span>
            <span class = "zdy-item uploadConfig" style="width:120px"> 上传本地配置 </span>
            <span class = "zdy-item downloadConfig" style="width:120px"> 下载云端配置 </span>
            <span class = "zdy-item uploadFlows" style="width:120px"> 分享角色流程 </span>
            <span class = "zdy-item downloadFlows" style="width:120px"> 拷贝角色流程 </span>
            <span class = "zdy-item uploadTriggers" style="width:120px"> 分享角色触发 </span>
            <span class = "zdy-item downloadTriggers" style="width:120px"> 拷贝角色触发 </span>
            <span class = "zdy-item importFlow" style="width:120px"> 导入流程 </span>
            <span class = "zdy-item importTrigger" style="width:120px"> 导入触发器 </span>
            <!--<span class = "zdy-item translateCode" style="width:120px"> 流程转换修复 </span>-->
            <span class = "zdy-item raidVersion" style="width:120px"> 🏹 ${GM_info.script.version} </span>`
            UI._appendHtml("🍯 <hiz>捷径</hiz>", content);

            $(".outMaze").on('click', function () {
                WG.SendCmd('stopstate');
                THIsland.outMaze();
            });
            $(".zhoubotong").on('click', function () {
                WG.SendCmd('stopstate');
                THIsland.zhoubotong();
            });
            $(".cihang").on('click', function () {
                WG.SendCmd('stopstate');
                DungeonsShortcuts.cihang();
            });
            $(".zhanshendian").on('click', function () {
                WG.SendCmd('stopstate');
                DungeonsShortcuts.zhanshendian();
            });
            $(".guzongmen").on('click', function () {
                WG.SendCmd('stopstate');
                DungeonsShortcuts.guzongmen();
            });
            $(".cangbaotu").on('click', function () {
                WG.SendCmd('stopstate');
                DungeonsShortcuts.cangbaotu();
            });
            $(".uploadConfig").on('click', _ => {
                Server.uploadConfig();
            });
            $(".downloadConfig").on('click', _ => {
                layer.confirm('下载成功将会完全覆盖该浏览器所有角色配置！', {
                    title: "<red>! 警告</red>",
                    btn: ['那还是算了', '好的继续'],
                    shift: 2,
                }, function (index) {
                    layer.close(index);
                }, function () {
                    layer.prompt({ title: '输入配置获取码', formType: 0, shift: 2 }, function (pass, index) {
                        layer.close(index);
                        Server.downloadConfig(pass);
                    });
                });
            });
            $(".uploadFlows").on('click', _ => {
                Server.uploadFlows();
            });
            $(".downloadFlows").on('click', _ => {
                layer.confirm('拷贝成功将会完全覆盖原有角色流程！', {
                    title: "<red>! 警告</red>",
                    btn: ['那还是算了', '好的继续'],
                    shift: 2,
                }, function (index) {
                    layer.close(index);
                }, function () {
                    layer.prompt({ title: '输入角色流程获取码', formType: 0, shift: 2 }, function (pass, index) {
                        layer.close(index);
                        Server.downloadFlows(pass);
                    });
                });
            });
            $(".uploadTriggers").on('click', _ => {
                Server.uploadTriggers();
            });
            $(".downloadTriggers").on('click', _ => {
                layer.confirm('拷贝成功将会完全覆盖原有角色触发器！', {
                    title: "<red>! 警告</red>",
                    btn: ['那还是算了', '好的继续'],
                    shift: 2,
                }, function (index) {
                    layer.close(index);
                }, function () {
                    layer.prompt({ title: '输入角色触发获取码', formType: 0, shift: 2 }, function (pass, index) {
                        layer.close(index);
                        Server.downloadTriggers(pass);
                    });
                });
            });

            $(".importFlow").on('click', _ => {
                let allFinder = WorkflowConfig.getFinderNames().join("|");
                let source = `
                #input ($token)=分享码,
                #select ($target)=目标文件夹,${allFinder},${WorkflowConfig.rootFinderName}
                #config
                @js Server.importFlow("(token)", "(target)");
                `
                const p = new Performer("导入流程", source);
                p.log(false);
                p.start();
            });

            $(".importTrigger").on('click', _ => {
                let source = `
                #input ($token)=分享码,
                #config
                @js Server.importTrigger("(token)");
                `
                const p = new Performer("导入触发器", source);
                p.log(false);
                p.start();
            });

            $(".translateCode").on('click', _ => {
                layer.prompt({ title: '客栈->流程讨论，阅读使用说明后操作', formType: 0, shift: 2 }, function (pass, index) {
                    if (pass == "我确认开始转换") {
                        layer.close(index);
                        CodeTranslator.run();
                    }
                });
            });

            $(".raidVersion").on('click', _ => {
                Server.getNotice();
            });
        },
        dungeons: function () {
            UI._appendHtml("🍺 <hic>自动副本</hic>", "");
            const model = UI._dungeonsContentModel();
            UI._mountableDiv().appendChild(model.$el);
        },

        workflows: function () {
            if (ManagedPerformerCenter.getAll().length == 0) {
                UI.workflowsHome();
            } else {
                UI.runningFlows();
            }
        },
        workflowsHome: function () {
            // const leftText = `
            // <select style='width:80px' id="workflows-sort">
            //     <option value="updateAsc">更新时间升序</option>
            //     <option value="updateDesc">更新时间降序</option>
            //     <option value="nameAsc">名称升序</option>
            //     <option value="nameDesc">名称降序</option>
            // </select>
            // `
            const leftText = `<wht>运行中</wht>`;
            const rightText = `
            <select style='width:80px' id="workflows-opts">
                <option value="none">选择操作</option>
                <option value="createFinder">新建文件夹</option>
                <option value="createFlow">新建流程</option>
            </select>`
            // const getMoreFlows = function() {
            //     window.open("http://wsmud.bobcn.me:4567/category/2", '_blank').location;
            // };
            UI._appendHtml("🥗 <hig>工作流程</hig>", "", rightText, null, leftText, UI.runningFlows);
            $('#workflows-opts').val("none");
            $("#workflows-opts").change(function () {
                switch ($('#workflows-opts').val()) {
                    case "createFinder":
                        UI.createFinder();
                        break;
                    case "createFlow":
                        UI.createWorkflow(WorkflowConfig.rootFinderName);
                        break;
                    case "none":
                    default:
                        break;
                };
            });
            // $('#workflows-sort').val(WorkflowConfig.rootFinderSortWay());
            // $("#workflows-sort").change(function () {
            //     WorkflowConfig.rootFinderSortWay($('#workflows-sort').val());
            //     UI.workflows();
            // });
            const model = UI._workflowContentModel(WorkflowConfig.finderList(WorkflowConfig.rootFinderName));
            UI._mountableDiv().appendChild(model.$el);
        },
        runningFlows: function () {
            UI._appendHtml("🥗 <hig>运行中流程</hig>", "", null, null, UI._backTitle, UI.workflowsHome);
            const model = UI._runningFlowsContentModel();
            UI._mountableDiv().appendChild(model.$el);
        },
        createFinder: function () {
            const content = `
            <div style="margin: 0 2em 5px 2em;text-align:center;width:calc(100% - 4em)">
                <label for="create-finder-name"> 名称:</label><input id ="create-finder-name" style='width:120px' type="text"  name="create-finder-name" value="">
            </div>`;
            const save = function () {
                const name = $("#create-finder-name").val();
                const result = WorkflowConfig.createFinder(name);
                if (result == true) {
                    UI.workflowsHome();
                } else {
                    alert(result);
                }
            };
            UI._appendHtml("🥗 <hig>新建文件夹</hig>", content, "<wht>保存</wht>", save, UI._backTitle, UI.workflowsHome);
        },
        modifyFinder: function (finder) {
            const content = `
            <div style="margin: 0 2em 5px 2em;text-align:center;width:calc(100% - 4em)">
                <label for="modify-finder-name"> 名称:</label><input id ="modify-finder-name" style='width:120px' type="text"  name="modify-finder-name" value="">
            </div>`;
            const remove = function () {
                var verify = confirm("删除文件夹将删除其中的所有流程，确认删除吗？");
                if (verify) {
                    WorkflowConfig.removeFinder(finder);
                    UI.workflowsHome();
                }
            };
            const back = function () {
                const name = $("#modify-finder-name").val();
                const result = WorkflowConfig.modifyFinder(finder, name);
                if (result != true) {
                    alert(result);
                    return;
                }
                UI.workflowsHome();
            };
            UI._appendHtml("🥗 <hig>修改文件夹</hig>", content, "删除", remove, UI._backSaveTitle, back);
            $('#modify-finder-name').val(finder.name);
        },
        openFinder: function (finderName) {
            if (finderName == WorkflowConfig.rootFinderName) {
                UI.workflowsHome();
                return;
            }
            const list = WorkflowConfig.finderList(finderName);
            UI._appendHtml(`<wht>📂 ${finderName}</wht>`, "", null, null, UI._backTitle, UI.workflowsHome);
            const model = UI._workflowContentModel(list);
            UI._mountableDiv().appendChild(model.$el);
        },
        createWorkflow: function (finderName) {
            const content = `
            <div style="margin: 0 2em 5px 2em;text-align:left;width:calc(100% - 4em)">
                <label for="create-flow-name"> 名称:</label><input id ="create-flow-name" style='width:120px' type="text"  name="create-flow-name" value="">
            </div>
            <textarea class = "settingbox hide" style = "height:5rem;display:inline-block;font-size:0.8em;width:calc(100% - 4em)" id = "create-flow-source"></textarea>`;
            const save = function () {
                const name = $("#create-flow-name").val();
                const source = $("#create-flow-source").val();
                const result = WorkflowConfig.createWorkflow(name, source, finderName);
                if (result == true) {
                    UI.workflowsHome();
                } else {
                    alert(result);
                }
            };
            UI._appendHtml("🥗 <hig>新建流程</hig>", content, "<wht>保存</wht>", save, UI._backTitle, UI.workflowsHome);
        },
        modifyWorkflow: function (flow) {
            let options = "";
            WorkflowConfig.getFinderNames().forEach(finderName => {
                options += `<option value="${finderName}">${finderName}</option>`;
            });
            const content = `
            <div style="margin: 0 2em 5px 2em;text-align:left;width:calc(100% - 4em)">
                <label for="modify-flow-name"> 名称:</label><input id ="modify-flow-name" style='width:120px' type="text"  name="modify-flow-name" value="">
                <label for="modify-flow-finder">移动至</label><select id="modify-flow-finder">
                    ${options}
                </select>
            </div>
            <textarea class = "settingbox hide" style = "height:5rem;display:inline-block;font-size:0.8em;width:calc(100% - 4em)" id = "modify-flow-source"></textarea>
            <span class="raid-item shareFlow">分享此流程</span>`;
            const remove = function () {
                var verify = confirm("确认删除此工作流程吗？");
                if (verify) {
                    WorkflowConfig.removeWorkflow(flow);
                    UI.workflowsHome();
                }
            };
            const back = function () {
                const name = $("#modify-flow-name").val();
                const source = $("#modify-flow-source").val();
                const finderName = $("#modify-flow-finder").val();
                const result = WorkflowConfig.modifyWorkflow(flow, name, source, finderName);
                if (result != true) {
                    alert(result);
                    return;
                }
                UI.openFinder(finderName);
            };
            UI._appendHtml("🥗 <hig>修改流程</hig>", content, "删除", remove, UI._backSaveTitle, back);
            $("#modify-flow-name").val(flow.name);
            $("#modify-flow-source").val(FlowStore.get(flow.name));
            $("#modify-flow-finder").val(flow.finder);
            $(".shareFlow").on('click', function () {
                const data = {
                    name: $("#modify-flow-name").val(),
                    source: $("#modify-flow-source").val()
                };
                UI._share("流程", data);
            });
        },

        _toolbarHidden: true,
        _backTitle: "<wht>< 返回</wht>",
        _backSaveTitle: "<wht>< 保存&返回</wht>",

        _appendHtml(title, content, rightText, rightAction, leftText, leftAction) {
            var realLeftText = leftText == null ? "" : leftText;
            var realRightText = rightText == null ? "" : rightText;
            var html = `
            <div class = "item-commands" style="text-align:center">
                <div style="margin-top:0.5em">
                    <div style="width:8em;float:left;text-align:left;padding:0px 0px 0px 2em;height:1.23em" id="wsmud_raid_left">${realLeftText}</div>
                    <div style="width:calc(100% - 16em);float:left;height:1.23em">${title}</div>
                    <div style="width:8em;float:left;text-align:right;padding:0px 2em 0px 0px;height:1.23em" id="wsmud_raid_right">${realRightText}</div>
                </div>
                <br><br>
                ${content}
            </div>`;
            Message.clean();
            Message.append(html);
            $("#wsmud_raid_left").on('click', function () {
                if (leftAction) leftAction();
            });
            $("#wsmud_raid_right").on('click', function () {
                if (rightAction) rightAction();
            });
        },
        _mountableDiv: function () {
            var wg_log = document.getElementsByClassName("WG_log")[0];
            var pre = wg_log.getElementsByTagName("pre")[0];
            var div = pre.getElementsByTagName("div")[0];
            return div;
        },
        _workflowContentModel: function (items) {
            const contentModel = new Vue({
                el: '#WorkflowsContentModel',
                methods: {
                    createSpan: function (createElement, item) {
                        let style = {
                            width: "120px",
                            "background-color": "#12e4a0",
                            border: "solid 1px rgb(107, 255, 70)",
                            color: "#000dd4"
                        };
                        if (item.type == "finder") {
                            style = {
                                width: "120px",
                                "background-color": "#0359c3",
                                border: "solid 1px rgb(107, 203, 255)",
                                color: "white"
                            };
                        }
                        var properties = {
                            attrs: { class: "zdy-item" },
                            style: style
                        };
                        var play = function () {
                            if (item.type == "finder") {
                                UI.openFinder(item.name);
                            } else {
                                ManagedPerformerCenter.start(item.name, FlowStore.get(item.name));
                            }
                        };
                        var edit = function () {
                            if (item.type == "finder") {
                                UI.modifyFinder(item);
                            } else {
                                UI.modifyWorkflow(item);
                            }
                        };
                        const leftProperties = {
                            style: {
                                width: "30px",
                                float: "left",
                                "background-color": "#ffffff4f",
                                "border-radius": "4px"
                            },
                            on: { click: edit }
                        };
                        var leftNode = createElement("div", leftProperties, "⚙");
                        var mainProperties = {
                            attrs: { class: "breakText" },
                            style: { width: "85px", float: "right" },
                            on: { click: play }
                        };
                        const title = item.type == "finder" ? item.name : `▶️${item.name}`;
                        const mainNode = createElement("div", mainProperties, title);
                        return createElement("span", properties, [leftNode, mainNode]);
                    },
                },
                render: function (createElement) {
                    var self = this;
                    let flows = [];
                    let finders = [];
                    items.forEach(item => {
                        if (item.type == "finder") finders.push(self.createSpan(createElement, item));
                        if (item.type == "flow") flows.push(self.createSpan(createElement, item));
                    });
                    let nodes = [];
                    if (flows.length > 0) nodes.push(flows);
                    if (finders.length > 0) {
                        nodes.push(createElement("hr", { style: { "background-color": "gray", height: "1px", width: "calc(100% - 4em)", border: "none" } }));
                        nodes.push(finders);
                    }
                    const style = createElement("style", ".breakText {word-break:keep-all;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;}");
                    nodes.push(style);
                    return createElement(
                        "div",
                        { attrs: { class: "item-commands" } },
                        nodes
                    );
                }
            });
            return contentModel;
        },
        _dungeonsContentModel: function () {
            const contentModel = new Vue({
                el: '#DungeonsContentModel',
                methods: {
                    getItems: function () {
                        return Dungeons;
                    },
                    createSpan: function (createElement, item) {
                        var properties = {
                            attrs: { class: "zdy-item" },
                            style: { width: "120px" },
                            on: {
                                click: function () {
                                    ManagedPerformerCenter.start(`自动副本-${item.name}`, GetDungeonSource(item.name));
                                }
                            },
                        };
                        return createElement('span', properties, item.desc != null ? item.desc : item.name);
                    },
                },
                render: function (createElement) {
                    var items = this.getItems();
                    var theSelf = this;
                    var spans = items.map(function (item) {
                        return theSelf.createSpan(createElement, item);
                    });
                    return createElement(
                        "div",
                        { attrs: { class: "item-commands" } },
                        spans
                    );
                }
            });
            return contentModel;
        },
        _runningFlowsContentModel: function () {
            const contentModel = new Vue({
                el: '#WorkflowsContentModel',
                methods: {
                    createSpan: function (createElement, flow) {
                        let style = {
                            width: "120px",
                            "background-color": "#05b77d",
                            border: "solid 1px rgb(107, 255, 70)",
                            color: "white"
                        };
                        var properties = {
                            attrs: { class: "zdy-item" },
                            style: style
                        };
                        var stop = function () {
                            flow.stop();
                        };
                        var pause = function () {
                            if (flow.pausing()) {
                                flow.resume();
                            } else {
                                flow.pause();
                            }
                            UI.runningFlows();
                            if (flow.pausing()) {
                                Message.append(`<hiy>暂停执行，流程: ${flow.name()}...</hiy>`);
                            } else {
                                Message.append(`<hiy>恢复执行，流程: ${flow.name()}。</hiy>`);
                            }
                        };
                        const leftProperties = {
                            style: {
                                width: "30px",
                                float: "left",
                                "background-color": "#ffffff4f",
                                "border-radius": "4px"
                            },
                            on: { click: pause }
                        };
                        var leftNode = createElement("div", leftProperties, flow.pausing() ? "▶️" : "⏸");
                        var mainProperties = {
                            attrs: { class: "breakText" },
                            style: { width: "85px", float: "right" },
                            on: { click: stop }
                        };
                        const mainNode = createElement("div", mainProperties, `⏹${flow.name()}`);
                        return createElement("span", properties, [leftNode, mainNode]);
                    },
                },
                render: function (createElement) {
                    var items = ManagedPerformerCenter.getAll();
                    var theSelf = this;
                    var spans = items.map(function (item) {
                        return theSelf.createSpan(createElement, item);
                    });
                    const style = createElement("style", ".breakText {word-break:keep-all;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;}");
                    spans.push(style);
                    return createElement(
                        "div",
                        { attrs: { class: "item-commands" } },
                        spans
                    );
                }
            });
            return contentModel;
        },

        _shareData: null,
        /**
         * @param {String} type 流程  触发
         * @param {Object} value
         */
        _share: function (type, value) {
            UI._shareData = value;
            let source = `
            [if] (__FormUserName) == null
                (__FormUserName) = (:name)
            #input ($__FormUserName)=当前角色名,(:name)
            #config
            ($__FormUserName)=(:name)
            ($password)=233
            @js Server.shareFlowTrigger("(__FormUserName)", "(password)", "${type}", UI._shareData);
            `
            const p = new Performer(`分享${type}`, source);
            p.log(false);
            p.start();
        }
    }

    /***********************************************************************************\
        TaoHua Island
    \***********************************************************************************/

    // 暂时保留给桃花岛解密用
    class AncientCmdExecuter {
        constructor(cmds, willStartExecute, didFinishExecute, willPerformCmd, didPerformCmd, interval) {
            this.cmds = cmds;
            this.willStartExecute = willStartExecute;
            this.didFinishExecute = didFinishExecute;
            this.willPerformCmd = willPerformCmd;
            this.didPerformCmd = didPerformCmd;
            this.interval = interval ? interval : 1000;
        }
        execute() {
            if (this.isWorking) return;
            this.isWorking = true;
            if (this.willStartExecute) this.willStartExecute();
            this._performCmd(0);
        }
        _performCmd(index) {
            if (index >= this.cmds.length) { this._finishExecute(); return; }
            if (!Role.isFree()) { this._delayPerformCmd(index); return; }
            var cmd = this.cmds[index];
            if (this.willPerformCmd) {
                var lastCmd = null;
                if (index > 0) lastCmd = this.cmds[index - 1];
                var valid = this.willPerformCmd(lastCmd, cmd);
                if (!valid) { this._delayPerformCmd(index); return; }
                cmd = valid;
            }
            // @开头，虚命令，不真正执行
            if (cmd.indexOf("@") == -1 && cmd.indexOf("kill?") == -1) WG.SendCmd(cmd);
            if (this.didPerformCmd) this.didPerformCmd(cmd);
            // [exit] 保留命令，立即退出执行器
            if (cmd.indexOf("[exit]") != -1) {
                this._finishExecute();
                return;
            }
            this._delayPerformCmd(index + 1);
        }
        _delayPerformCmd(index) {
            var executer = this;
            window.setTimeout(function () {
                executer._performCmd(index);
            }, executer.interval);
        }
        _finishExecute() {
            this.isWorking = false;
            WG.remove_hook(AncientCmdExecuter._hookIndex);
            if (this.didFinishExecute) this.didFinishExecute();
        }
    }

    const THIsland = {
        outMaze: function (callback) {
            if (!Role.atPath("taohua/haitan")) {
                Message.append("只有在 桃花岛的海滩 才能使用此虫洞。");
                return;
            }

            var cmds = [
                "go south",
                "@look 1",
                "@look 5"
            ];
            var willStartExecute = function () {
                THIsland._monitorMaze();
            };
            var didFinishExecute = function () {
                THIsland._cancelMonitorMaze();
                if (callback) callback();
            };
            var willPerformCmd = function (lastCmd, cmd) {
                if (cmd == "@look 1") {
                    if (THIsland._goCenterCmd) {
                        return THIsland._goCenterCmd;
                    } else {
                        return null;
                    }
                }
                if (cmd == "@look 5") {
                    if (THIsland._decodedMaze) {
                        return THIsland._outMazeCmd();
                    } else {
                        return null;
                    }
                }
                return cmd;
            };
            var executer = new AncientCmdExecuter(
                cmds,
                willStartExecute,
                didFinishExecute,
                willPerformCmd,
                undefined,
                1000
            );
            executer.execute();
        },
        zhoubotong: function (callback) {
            if (!Role.atPath("taohua/wofang")) {
                Message.append("只有在 蓉儿的卧室 才能使用此虫洞。");
                return;
            }

            var cmds = [
                "go south;go west;go west;go west;go north;go north;go north",
                "go west;go east;go west;go east;go west",
                "go south",
                "@look 1",
                "@look 5",
                "@go 2",
                "@go 3",
                "@go 4",
                "@go 6",
                "@go 7",
                "@go 8",
                "@end"
            ];
            var willStartExecute = function () {
                THIsland._monitorMaze();
                THIsland._exitsHookIndex = WG.add_hook("exits", function (data) {
                    if (THIsland._lastCoord == undefined || THIsland._lastCoord == [0, 0]) return;
                    if (Object.keys(data.items).length != 4) return;
                    for (var key in data.items) {
                        if (data.items[key] != "桃花林") return;
                    }
                    var normalExistMap = [
                        [["north", "northeast", "east"], ["east", "north", "south"], ["east", "south", "southeast"],],
                        [["east", "north", "west"], [], ["west", "east", "south"],],
                        [["west", "northwest", "north"], ["west", "south", "north"], ["west", "southwest", "south"],]
                    ];
                    var x = THIsland._lastCoord[0] + 1;
                    var y = THIsland._lastCoord[1] + 1;
                    var normalExists = normalExistMap[x][y];
                    for (var key2 in data.items) {
                        if (normalExists.indexOf(key2) != -1) continue;
                        THIsland._goCave = "go " + key2;
                        return;
                    }
                });
            };
            var didFinishExecute = function () {
                THIsland._lastCoord = undefined;
                THIsland._lastGo = undefined;
                THIsland._goCave = undefined;
                THIsland._cancelMonitorMaze();
                WG.remove_hook(THIsland._exitsHookIndex);
                if (callback) callback();
            };
            var willPerformCmd = function (lastCmd, cmd) {
                if (THIsland._goCave) return THIsland._goCave + ";go west;[exit]";

                var number = 0;
                switch (cmd) {
                    case "@look 1":
                        if (THIsland._goCenterCmd) {
                            return THIsland._goCenterCmd;
                        } else {
                            return null;
                        }
                        break;
                    case "@look 5":
                        if (!THIsland._decodedMaze) return null;
                        break;
                    case "@go 2":
                        THIsland._lastCoord = THIsland._mazeCoords[2];
                        THIsland._lastGo = THIsland._mazePath(THIsland._lastCoord);
                        return THIsland._lastGo;
                    case "@go 3": number = 3; break;
                    case "@go 4": number = 4; break;
                    case "@go 6": number = 6; break;
                    case "@go 7": number = 7; break;
                    case "@go 8": number = 8; break;
                }
                if (number != 0) {
                    var back = THIsland._mazeBackPath(THIsland._lastGo);
                    THIsland._lastCoord = THIsland._mazeCoords[number];
                    THIsland._lastGo = THIsland._mazePath(THIsland._lastCoord);
                    return back + ";" + THIsland._lastGo;
                }
                return cmd;
            };
            var executer = new AncientCmdExecuter(
                cmds,
                willStartExecute,
                didFinishExecute,
                willPerformCmd,
                undefined,
                1000
            );
            executer.execute();
        },

        _outMazeCmd: function () {
            var cmd = "";
            for (var i = 2; i <= 9; i++) {
                var coord = THIsland._mazeCoords[i];
                var go = THIsland._mazePath(coord);
                if (i == 9) {
                    cmd += go + ";" + go;
                } else {
                    cmd += go + ";" + THIsland._mazeBackPath(go) + ";";
                }
            }
            cmd += ";go south";
            return cmd;
        },
        _mazePath: function (coord) {
            var pathMap = [
                ["go southwest", "go west", "go northwest"],
                ["go south", "", "go north"],
                ["go southeast", "go east", "go northeast"]
            ];
            var x = coord[0] + 1;
            var y = coord[1] + 1;
            return pathMap[x][y];
        },
        _mazeBackPath: function (path) {
            var backMap = {
                "": "",
                "go southwest": "go northeast",
                "go west": "go east",
                "go northwest": "go southeast",
                "go south": "go north",
                "go north": "go south",
                "go southeast": "go northwest",
                "go east": "go west",
                "go northeast": "go southwest"
            };
            return backMap[path];
        },
        _monitorMaze: function () {
            THIsland._mazeCoords = [
                [2, 2], // unused
                [2, 2],
                [2, 2],
                [2, 2],
                [2, 2],
                [0, 0],
                [2, 2],
                [2, 2],
                [2, 2],
                [2, 2]
            ];
            THIsland._atFirst = false;
            THIsland._goCenterCmd = undefined;
            THIsland._decodedMaze = false;

            var index1 = WG.add_hook(["room", "exits"], function (data) {
                if (THIsland._goCenterCmd != undefined) return;

                if (data.type == "room") {
                    if (data.desc == undefined) return;
                    var patt = new RegExp("四周栽了大概有一棵桃树");
                    var result = patt.exec(data.desc);
                    if (result) THIsland._atFirst = true;
                } else if (data.type == "exits") {
                    if (data.items == undefined) return;
                    if (THIsland._atFirst) {
                        if (data.items.north && data.items.south) {
                            if (data.items.west) {
                                THIsland._mazeCoords[1] = [1, 0];
                                THIsland._goCenterCmd = "go west";
                            } else {
                                THIsland._mazeCoords[1] = [-1, 0];
                                THIsland._goCenterCmd = "go east";
                            }
                        } else if (data.items.west && data.items.east) {
                            if (data.items.north) {
                                THIsland._mazeCoords[1] = [0, -1];
                                THIsland._goCenterCmd = "go north";
                            } else {
                                THIsland._mazeCoords[1] = [0, 1];
                                THIsland._goCenterCmd = "go south";
                            }
                        }
                    }
                }
            });
            var index2 = WG.add_hook("room", function (data) {
                if (THIsland._decodedMaze) return;

                if (data.desc == undefined) return;
                var patt = new RegExp("能看到东南方向大概有.(?=棵桃树)");
                var count = patt.exec(data.desc);
                if (!count) return;
                var text = count.toString();
                switch (text.substring(text.length - 1)) {
                    case "二": THIsland._mazeCoords[2] = [1, -1]; break;
                    case "四": THIsland._mazeCoords[4] = [1, -1]; break;
                    case "六": THIsland._mazeCoords[6] = [1, -1]; break;
                    case "八": THIsland._mazeCoords[8] = [1, -1]; break;
                }

                THIsland._mazeCoords[9] = [-THIsland._mazeCoords[1][0], -THIsland._mazeCoords[1][1]];
                while (true) {
                    if (THIsland._mazeCoords[2][0] != 2) {
                        THIsland._mazeCoords[8] = [-THIsland._mazeCoords[2][0], -THIsland._mazeCoords[2][1]];
                    }
                    if (THIsland._mazeCoords[8][0] != 2) {
                        if (THIsland._mazeCoords[8][0] == THIsland._mazeCoords[1][0]) {
                            THIsland._mazeCoords[6] = [THIsland._mazeCoords[8][0], -THIsland._mazeCoords[8][1]];
                        } else {
                            THIsland._mazeCoords[6] = [-THIsland._mazeCoords[8][0], THIsland._mazeCoords[8][1]];
                        }
                    }
                    if (THIsland._mazeCoords[6][0] != 2) {
                        THIsland._mazeCoords[4] = [-THIsland._mazeCoords[6][0], -THIsland._mazeCoords[6][1]];
                    }
                    if (THIsland._mazeCoords[4][0] != 2) {
                        if (THIsland._mazeCoords[4][0] == THIsland._mazeCoords[9][0]) {
                            THIsland._mazeCoords[2] = [THIsland._mazeCoords[4][0], -THIsland._mazeCoords[4][1]];
                        } else {
                            THIsland._mazeCoords[2] = [-THIsland._mazeCoords[4][0], THIsland._mazeCoords[4][1]];
                        }
                    }
                    if (THIsland._mazeCoords[2][0] != 2 &&
                        THIsland._mazeCoords[4][0] != 2 &&
                        THIsland._mazeCoords[6][0] != 2 &&
                        THIsland._mazeCoords[8][0] != 2) {
                        break;
                    }
                }
                if (THIsland._mazeCoords[8][0] == THIsland._mazeCoords[4][0]) {
                    THIsland._mazeCoords[3] = [THIsland._mazeCoords[8][0], 0];
                } else {
                    THIsland._mazeCoords[3] = [0, THIsland._mazeCoords[8][1]];
                }
                THIsland._mazeCoords[7] = [-THIsland._mazeCoords[3][0], -THIsland._mazeCoords[3][1]];

                THIsland._decodedMaze = true;
            });
            THIsland._mazeHookIndexes = [index1, index2];
        },
        _cancelMonitorMaze: function () {
            for (var i = THIsland._mazeHookIndexes.length - 1; i >= 0; i--) {
                var index = THIsland._mazeHookIndexes[i];
                WG.remove_hook(index);
            }
        },
    };

    //---------------------------------------------------------------------------

    /* @taohualin 走出桃花林 */
    (function () {
        const executor = new AtCmdExecutor("taohualin", function (performer, param) {
            return new Promise(resolve => {
                THIsland.outMaze(resolve);
            });
        });
        CmdExecuteCenter.addExecutor(executor);
    })();

    /* @zhoubotong 找到周伯通 */
    (function () {
        const executor = new AtCmdExecutor("zhoubotong", function (performer, param) {
            return new Promise(resolve => {
                THIsland.zhoubotong(resolve);
            });
        });
        CmdExecuteCenter.addExecutor(executor);
    })();

    const DungeonsShortcuts = {
        xianyu_xyjq: function() {
            let source = `
[if] (:room 副本区域,忧愁谷)==true || (:state)==推演 || (:state)==领悟
  @print <ord>当前状态无法进行一键咸鱼，自动停止！</ord>
  [exit]
@print 🐟 一键咸鱼 => <hic>襄阳捐钱</hic>
@cmdDelay 500
stopstate;jh fam 8 start
@await 500
[if] (:room)==襄阳城-广场
  juanxian {r郭靖}?;juanxian2 {r郭靖}?
@print 已完成：襄阳捐钱
$zdwk
            `
            const p = new Performer("襄阳捐钱", source);
            p.log(false);
            p.start();
        },
        xianyu_xybm: function () {
            let source = `
[if] (:room 副本区域,忧愁谷)==true || (:state)==推演 || (:state)==领悟
  @print <ord>当前状态无法进行一键咸鱼，自动停止！</ord>
  [exit]
@print 🐟 一键咸鱼 => <hic>襄阳报名</hic>
@cmdDelay 500
stopstate;jh fam 8 start
@await 500
[if] (:room)==襄阳城-广场
  baoming {r郭靖}?
  @tip 你可以去($xyBM)附近查看敌情|这位($xyBM)已经报名了。|才可以再次($xyOver)襄阳守城|最近没($xyNone)战事
  [if] (xyBM) != null
    @print 襄阳已报名，请选择守门位置：
    @js Message.append('<div class="item-commands"><span cmd="$wait 350;jh fam 8 start;go north;go north;go north;go north;go north;">⬆️ 守北门</span><span cmd="$wait 350;jh fam 8 start;go south;go south;go south;go south;go south;">⬇️ 守南门</span><span cmd="$wait 350;jh fam 8 start;go east;go east;go east;go east;go east;">➡️ 守东门</span><span cmd="$wait 350;jh fam 8 start;go west;go west;go west;go west;go west;">⬅️ 守西门</span></div>')
  [else if] (xyNone) != null
    @print 襄阳尚未开启。
    $zdwk
  [else if] (xyOver) != null
    @print 襄阳已经完成。
    $zdwk
  [else]
    $zdwk
            `
            const p = new Performer("襄阳报名", source);
            p.log(false);
            p.start();
        },
        xianyu_ksyb: function () {
            let source = `
[if] (:room 副本区域,忧愁谷)==true || (:state)==推演 || (:state)==领悟
  @print <ord>当前状态无法进行一键咸鱼，自动停止！</ord>
  [exit]
@print 🐟 一键咸鱼 => <hic>快速运镖</hic>
@cmdDelay 500
stopstate
$to 扬州城-镖局正厅
ksyb {r林震南}
@tip 最近暂时($done)委托，你先休息下吧|你需要支付($charges)黄金的雇佣费用|只有总镖头才($can)雇佣镖师|如果你不能把镖银($escort)送到|你不是($escort)运镖吗
[if] (charges)!=null
  <-recordGains
  task yunbiao {r林震南} qkstart
  @await 11000
  @tidyBag
  recordGains->nopopup
[else if] (can)!=null
  tm 运镖环数不到200环，无法快速运镖。
[else if] (escort)!=null
  tm 当前有未完成的运镖任务，无法快速运镖。
$zdwk 
            `
            const p = new Performer("快速运镖", source);
            p.log(false);
            p.start();
        },
        xianyu_sdyt: function () {
            let source = `
[if] (:room 副本区域,忧愁谷)==true || (:state)==推演 || (:state)==领悟
  @print <ord>当前状态无法进行一键咸鱼，自动停止！</ord>
  [exit]
@print 🐟 一键咸鱼 => <hic>扫荡妖塔</hic>
@print <hic>如果想自己静默式调用扫荡妖塔功能，请先设定变量扫荡次数 <hiy>SDYTnum</hiy> 和 单次消耗精力上限 <hiy>SDYTjlsx</hiy> 的值。</hic>
[if] (SDYTjlsx) == 0 || (SDYTjlsx) == null || (SDYTjlsx) == undefined
  @js ($SDYTjlsx) = prompt("请输入单次消耗精力上限，超过后将自动停止：", "85");
[if] (SDYTnum) == 0 || (SDYTnum) == null || (SDYTnum) == undefined
  @js ($SDYTnum) = prompt("请输入本轮扫荡次数，注意：单次消耗精力达到上限后将自动停止。","5")
($sdyt_num) = (SDYTnum)
//($SDYTnum) = null
[if] (sdyt_num) == 0 || (sdyt_num) == null || (sdyt_num) == undefined
  @print <ord>扫荡次数为0，取消扫荡。</ord>
  [exit]
@print <hiy>计划扫荡(sdyt_num)次妖塔。</hiy>
stopstate
[if] (:room) != 古大陆-墓园
  $goyt
  @await 1500
[if] (:room) != 古大陆-墓园
  @print <ord>无法前往古大陆，请重试或确定当前角色是否已解锁古大陆。</ord>
  $zdwk
  [exit]
[if] {b扫荡符#}? < (sdyt_num) || {b扫荡符}? == null
  shop 0 (sdyt_num)
($num) = 0
@cmdDelay 500
($ytWeek) = null
[while] (num) < (sdyt_num)
  ss muyuan
  @tip 你即将消耗一个扫荡符，($jl_yt)精力快速完成一次弑妖塔|你即将消耗($jl_yt)精力快速完成一次弑妖塔|你尚未($ytJS)弑妖塔|你已达到($ytWeek)上限
  [if] (ytJS) != null
    @print <hiy>妖塔未解锁，无法扫荡。</hiy>
    [break]
  [if] (ytWeek) != null
    @print <hiy>妖塔扫荡已达到本周上限。</hiy>
    [break]
  [if] (jl_yt) > (SDYTjlsx) && (jl_yt) != null
    @print <ord>单次扫荡精力超过(SDYTjlsx)，自动停止。</ord>
    [break]
  [else]
    saodang muyuan
    @tip 你消耗一个扫荡符|精力快速完成弑妖塔|你的($lack)不够|你已达到($ytWeek)上限
    [if] (ytWeek) != null
      @print <hiy>妖塔扫荡已达到本周上限。</hiy>
      [break]
    [if] (lack) != null
      @print <ord>(lack)不足，自动停止扫荡妖塔。</ord>
      [break]
  ($num) = (num) + 1
@await 1000
$zdwk
            `
            const p = new Performer("扫荡妖塔", source);
            p.log(false);
            p.start();
        },
        xianyu_mghyj: function () {
            let source = `
[if] (:room 副本区域,忧愁谷)==true || (:state)==推演 || (:state)==领悟
  @print <ord>当前状态无法进行一键咸鱼，自动停止！</ord>
  [exit]
@print 🐟 一键咸鱼 => <hic>门贡换元晶</hic>
@cmdDelay 500
stopstate
($hqName) = 门派后勤管理员
[if] (:family) == 武当派
  ($hqMap) = 武当派-石阶
[else if] (:family) == 少林派
  ($hqMap) = 少林派-山门殿
[else if] (:family) == 华山派
  ($hqMap) = 华山派-练武场
[else if] (:family) == 峨眉派
  ($hqMap) = 峨眉派-走廊
[else if] (:family) == 逍遥派
  ($hqMap) = 逍遥派-林间小道
[else if] (:family) == 丐帮
  ($hqMap) = 丐帮-暗道
[else if] (:family) == 杀手楼
  ($hqMap) = 杀手楼-休息室
[else]
  ($hqMap) = 扬州城-扬州武馆
  ($hqName) = 武馆后勤
[while] (:room) != (hqMap)
  $to (hqMap)
  [if] (:family) == 丐帮
    @await 300
    go east
  @await 500
[if] {r(hqName)}? == null
  @print 后勤失踪，请稍后再试。
[else]
  ask1 {r(hqName)}?
  @dialog
  buy 1 {d元晶o}? from {r(hqName)}?
  @tip 你从门派后勤管理员购买了|这里没有($mgYJ)多的|你没有那么多的($mgGJ)功绩
  [if] (mgGJ) != null
    @print 门贡不足，无法购买。
  [else if] (mgYJ) != null
    @print 元晶已售空，无法购买。
  [else]
    @print 已购买一个<hio>元晶</hio>。
$zdwk
            `
            const p = new Performer("门贡换元晶", source);
            p.log(false);
            p.start();
        },
        xianyu_ltbm: function () {
            let source = `
[if] (:room 副本区域,忧愁谷)==true || (:state)==推演 || (:state)==领悟
  @print <ord>当前状态无法进行一键咸鱼，自动停止！</ord>
  [exit]
@print 🐟 一键咸鱼 => <hic>擂台报名</hic>
@cmdDelay 500
stopstate;$to 扬州城-擂台
@await 500
select {r擂台比武报名}?
askbiwu {r擂台比武报名}?
@tip 你使用当前装备和技能($ltBM)参加比武|你已经报名参加比武，($ltGX)更新你的技能和装备|你已报名或更新状态，请勿连续报名。
[if] (ltGX) != null
  biwu record ok
$zdwk
            `
            const p = new Performer("擂台报名", source);
            p.log(false);
            p.start();
        },
        xianyu_setting: function () {
            let source = `
[(SDYTjlsx)==null]($SDYTjlsx)=85
[(SDYTnum)==null]($SDYTnum)=5
@print 🐟 一键咸鱼 => <hic>参数设置</hic>
#input ($SDYTjlsx)=<hiz>一键设置各种常用流程（陆续更新添加）参数</hiz><br/>&nbsp*&nbsp<ord>🐉 扫荡妖塔</ord> 参数<br/>&nbsp*&nbsp妖塔单次消耗精力上限,(SDYTjlsx)
#input ($SDYTnum)=每轮妖塔扫荡次数,(SDYTnum)
#config
@print 已完成参数设置
            `
            const p = new Performer("参数设置", source);
            p.log(false);
            p.start();
        },
        cangbaotu: function () {
            let source = `
[if] (:room 副本区域,忧愁谷)==true || (:state)==推演 || (:state)==领悟
    @print <ord>当前状态无法进行一键咸鱼，自动停止！</ord>
    [exit]
@print 🐟 一键咸鱼 => <hic>藏宝图</hic>
[if] {b藏宝图}? == null
    tm 背包中无藏宝图，取消本次寻宝。
    [exit]
@cmdDelay 500
stopstate
@toolbar jh
@toolbar pack
($money1) = (:money)
($ebony1) = {b玄晶#}?
($number)=1
($cbt_n) = 0
@stopSSAuto
<-recordGains
[while] {b藏宝图}? != null
    <---
    ($pos)=null
    use {b藏宝图}?
    @tip 发现上面的图案所绘的方位似乎($pos)。|你找到了
    [if] (pos) == 就在你这里
        use {b藏宝图}?
        ($cbt_n) = (cbt_n) + 1
        [continue]
    [else if] (pos) == null
        [continue]
    --->
    jh fam (number) start
    [if] (pos) != 离你所在的位置挺远的
        // 武当
        [if] (number)=1
            [if] (pos) == 在你的北方
                go north
                go south;go west;go northup;go north;go east
            [else if] (pos) == 在你的西方
                go west
                go west
            [else]
                go west;go northup
                go north
                go west
                go northup
                go northup
                go northup
                [while] (pos) == 在你的北方
                    go north
        // 少林
        [else if] (number)=2
            [if] (pos) == 在你的北方
                go north
                go north
                go northup
                go southdown;go northwest;go northeast
                [while] (pos) == 在你的北方
                    go north
            [else if] (pos) == 在你的西北方向
                go north;go west
                go east;go north;go northwest
                go northeast;go north;go west
                go east;go north;go west
                go east;go north;go west
            [else]
                go north;go east
                go west;go north;go northeast
                go northwest;go north;go east
                go west;go north;go east
        // 华山
        [else if] (number)=3
            [if] (pos) == 在你的北方
                go westup;go north;go east
                go west;go north;go east
            [else if] (pos) == 在你的西北方向
                go westup;go north
                go north
                go north
            [else if] (pos) == 在你的西方
                go westup
                go west
            [else if] (pos) == 在你东方
                go eastup
            [else if] (pos) == 在你的东南方向
                go eastup;go southup
                jumpdown
                go southup
                go south
                go east
            [else]
                go westup
                go south
                go southup
                go southup
                break bi;go enter
                go westup
                go westup
                jumpup
        // 峨眉
        [else if] (number)=4
            go west;go south;go west
            [if] (pos) == 在你东方
                go east
                go east
                go east
            [else if] (pos) == 在你的西方
                go west
            [else if] (pos) == 在你的南方
                go south
                go south
            [else if] (pos) == 在你的北方
                go north
                go north
            [else if] (pos) == 在你的东北方向
                go east;go north
                go east
                go northup
                go east
            [else]
                go east;go south
                go north;go east;go south
        // 逍遥
        [else if] (number)=5
            [if] (pos) == 在你东方
                go east
            [else if] (pos) == 在你的西方
                go west
            [else if] (pos) == 在你的南方
                go south
                go south
            [else if] (pos) == 在你的北方
                go north
                go north
            [else if] (pos) == 在你的东北方向
                go east;go north
            [else if] (pos) == 在你的东南方向
                go east;go south
                go south
            [else if] (pos) == 在你的西南方向
                go west;go south
            [else]
                go down
                go down
        // 丐帮
        [else]
            [if] (pos) == 在你东方
                go down;go east;go east;go east;go up
                go down;go east;go east;go up
            [else if] (pos) == 在你的南方
                go down
            [else]
                go down;go east
                go east
                go east
                go east
                go east
    [else if] (number)<6
        ($number) = (number) + 1
    [else]
        ($number)=1
//结束后自动挖矿或者闭关
@await 1000
@tidyBag
@wait 2000
$zdwk
recordGains->nopopup
@recoverSSAuto
@toolbar pack
($money2) = (:money)
@js ($income_m) = parseInt(((money2) - (money1))/10000)
($ebony2) = {b玄晶#}?
[if] (ebony1) != null
    ($income_e) = (ebony2) - (ebony1)
[else]
    ($income_e) = (ebony2)
tm 挖宝 (cbt_n) 次，收益 (income_e)个玄晶，(income_m) 两黄金
@print 挖宝 (cbt_n) 次，收益 <hiy>(income_e)</hiy> 个玄晶，<hiy>(income_m)</hiy> 两黄金
            `
            const p = new Performer("藏宝图寻宝", source);
            p.log(false);
            p.start();
        },
        cihang: function () {
            let source = `
[if] (:room 慈航静斋) == false
    @print <hiy>请先进入慈航副本再运行。</hiy>
    [exit]
[else]
    [if] (:room) != 慈航静斋-山门(副本区域) && (:room) != 慈航静斋-帝踏峰(副本区域)
        @print <hiy>请在山门或帝踏峰运行。</hiy>
        [exit]
($go) = 'east','west','south','north'
($qiku) = '老','病','死','爱别离','怨憎会','求不得'
($num1) = 0
[if] (:room) == 慈航静斋-山门(副本区域)
    go south
[else if] (:room) == 慈航静斋-帝踏峰(副本区域)
    go south[2]
@print <hiy>开始自动寻路，寻路期间请勿点击地图……</hiy>
@cmdDelay 500
[while] (num1) < 6
    @js ($ku) = [(qiku)][(num1)]
    ($num2) = 0
    [while] true
        [if] (map) != null && (retry) == true
            (map)
            @await 500
        @js ($fx) = [(go)][(num2)]
        [if] (fx) == null
            @print <hiy>自动寻路失败，请回到山门重新运行！</hiy>
            [exit]
        go (fx)
        [if] (:room) == 慈航静斋-七重门(副本区域)
            @js ($ku_now) = $(".room_desc").text().match("，是名([^%]+)苦。")[1]
            [if] (ku) != (ku_now)
                [while] true
                    go west
                    [if] (:room) == 慈航静斋-七重门(副本区域)
                        @js ($dir_gc) = $("text:contains('广场')").attr("dir")
                    [if] (dir_gc) == south
                        go south
                    @await 200
                    [if] (:room) == 慈航静斋-山门(副本区域)
                        [break]
                    [else if] (:room) == 慈航静斋-广场(副本区域)
                        @print <hiy>已走出七重门！</hiy>
                        [exit]
                go south
                ($num2) = (num2) + 1
                ($retry) = true
            [else]
                [if] (map) == null
                    ($map) = go (fx)
                [else]
                    ($map) = (map);go (fx)
                ($retry) = false
                [break]
        [else if] (:room) == 慈航静斋-广场(副本区域)
            @print <hiy>已走出七重门！</hiy>
            [exit]
    ($num1) = (num1) + 1
go south
[if] (:room) == 慈航静斋-广场(副本区域)
    @print <hiy>已走出七重门！</hiy>
            `
            const p = new Performer("慈航七重门", source);
            p.log(false);
            p.start();
        },
        zhanshendian: function () {
            let source = `
[if] (:room 战神殿) == false
    @print <hiy>请先进入战神殿副本再运行。</hiy>
    [exit]
[if] (:room) != 战神殿-左雁翼(副本区域)
    @print <hiy>请先手动向左走到左雁翼。</hiy>
@until (:room) == 战神殿-左雁翼(副本区域)
look shi
@tip 和外面星空星宿位置一一对应，($star_0)，($star_1)，($star_2)，($star_3)，($star_4)，($star_5)，($star_6)，($star_7)这些星宿依次闪烁
($stars) = "(star_0)","(star_1)","(star_2)","(star_3)","(star_4)","(star_5)","(star_6)","(star_7)"
($dirs) = {"star":"角亢室","dir":1,"eswn":"东北↗︎","go":"northeast"},{"star":"氏房心","dir":0,"eswn":"东→","go":"east"},{"star":"尾箕轸","dir":2,"eswn":"东南↘︎","go":"southeast"},{"star":"井鬼参","dir":4,"eswn":"西南↙︎","go":"southwest"},{"star":"柳星张翼","dir":3,"eswn":"南↓","go":"south"},{"star":"奎娄斗牛","dir":6,"eswn":"西北↖︎","go":"northwest"},{"star":"胃昴毕觜","dir":5,"eswn":"西←","go":"west"},{"star":"女虚危壁","dir":7,"eswn":"北↑","go":"north"}
@cmdDelay 100
($num_1) = 0
[while] (num_1) < 8
    @js ($star) = [(stars)][(num_1)]
    ($num_2) = 0
    [while] (num_2) < 28
        ($dir) = null
        @js ($dir) = var d=[(dirs)];var s=d[(num_2)]["star"].indexOf("(star)");if(s>=0){d[(num_2)]["dir"]}
        [if] (dir) != null
            [break]
        ($num_2) = (num_2) + 1
    push (dir)
    ($num_1) = (num_1) + 1
look shi
@tip 殿顶的星图依旧，却仅剩一颗($last)宿星孤零零的闪烁着
($num_3) = 0
[while] (num_3) < 28
    ($dir_l) = null
    ($go_l) = null
    @js ($dir_l) = var d=[(dirs)];var s=d[(num_3)]["star"].indexOf("(last)");if(s>=0){d[(num_3)]["eswn"]}
    @js ($go_l) = var d=[(dirs)];var s=d[(num_3)]["star"].indexOf("(last)");if(s>=0){d[(num_3)]["go"]}
    [if] (dir_l) != null && (go_l) != null
        [break]
    ($num_3) = (num_3) + 1
@print <hiy>(last)宿，最后一个方位是【(dir_l)】</hiy>
tm (last)宿，最后一个方位是【(dir_l)】60秒倒计时已开始，请抓紧开打。
@print <ord>打完右雁翼最后一波守卫后会自动进秘道【(go_l)】</ord>
@until (:room) == 战神殿-右雁翼(副本区域) || (:room 副本区域) == false
@until (:combating) == true || (:room 副本区域) == false
@until (:combating) == false || (:room 副本区域) == false
[if] (:room 副本区域) == false
    [exit]
[while] (:room) == 战神殿-右雁翼(副本区域) && (:living) == true
    go (go_l);$wait 100
            `
            const p = new Performer("战神殿解谜", source);
            p.log(false);
            p.start();
        },
        guzongmen: function () {
            let source = `
@print <hiy>如果寻路一直失败，请检查设置中<ord>【切换房间时不清空上房间信息】</ord>是否开启。</hiy>
[if] (:room 副本区域,忧愁谷) == true
    @print <ord>当前处于副本中，无法寻路！</ord>
    [exit]
@cmdDelay 500
stopstate
jh fam 9 start
go enter
go up
@tip 打败我，你就($pass)上去|聚魂成功|踏过长生门|你已堪破生死|古老的大陆寻找真相|你连($pass)都没聚合|你想($pass)为神吗
[if] (pass) != null
    @print <ord>不符合前往古大陆要求，流程终止。</ord>
    [exit]
ggdl {r疯癫的老头}
go north[3]
go north[3]
look shi
tiao1 shi;tiao1 shi;tiao2 shi
@until (:room) == 古大陆-断山
@js ($ylfx) = $(".room_desc").text().match(/[东南西北]，/g)
@js ($ylfx) = var f="(ylfx)";f.replace(/，/g,"")
@js ($ylfx) = var f="(ylfx)";f.replace(/东/g,"west")
@js ($ylfx) = var f="(ylfx)";f.replace(/西/g,"east")
@js ($ylfx) = var f="(ylfx)";f.replace(/南/g,"north")
@js ($ylfx) = var f="(ylfx)";f.replace(/北/g,"south")
@js ($ylfx) = var f="(ylfx)";f.replace(/,/g,"','")
@js ($ylfx) = var f=['(ylfx)'];f.reverse()
@js ($ylfx) = var f="(ylfx)";f.replace(/,/g,"','")
@js ($ylfx) = "'"+"(ylfx)"+"'"
@js ($fl) = [(ylfx)].length
go down
go south[3]
go south[2]
go west
($go) = 'east','west','south','north'
($num) = 0
[while] (num) < 4
    @await 500
    @js $(".content-message pre").html("");
    @await 500
    @js ($fx1) = [(go)][(num)]
    go (fx1)
    @js ($lost) = $(".content-message").text().match("你似乎迷路了")
    [if] (lost) != null
        go south[3]
        go south[3]
        go west
        ($num) = (num) + 1
    [else]
        [break]
[if] (fl) == 5
    ($num) = 0
    [while] (num) < 5
        @js ($fx) = [(ylfx)][(num)]
        go (fx)
        ($num) = (num) + 1
[else if] (fl) == 4
    @js ($fx2) = [(ylfx)][0]
    @js ($fx3) = [(ylfx)][1]
    @js ($fx4) = [(ylfx)][2]
    @js ($fx5) = [(ylfx)][3]
    ($lxjh) = {"lx":"go (fx2);go (fx3);go (fx4);go (fx5);go (fx5)"},{"lx":"go (fx2);go (fx3);go (fx4);go (fx4);go (fx5)"},{"lx":"go (fx2);go (fx3);go (fx3);go (fx4);go (fx5)"},{"lx":"go (fx2);go (fx2);go (fx3);go (fx4);go (fx5)"}
[else if] (fl) == 3
    @js ($fx2) = [(ylfx)][0]
    @js ($fx3) = [(ylfx)][1]
    @js ($fx4) = [(ylfx)][2]
    ($lxjh) = {"lx":"go (fx2);go (fx3);go (fx4);go (fx4);go (fx4)"},{"lx":"go (fx2);go (fx3);go (fx3);go (fx3);go (fx4)"},{"lx":"go (fx2);go (fx2);go (fx2);go (fx3);go (fx4)"},{"lx":"go (fx2);go (fx3);go (fx3);go (fx4);go (fx4)"},{"lx":"go (fx2);go (fx2);go (fx3);go (fx4);go (fx4)"},{"lx":"go (fx2);go (fx2);go (fx3);go (fx3);go (fx4)"}
[else if] (fl) == 2
    @js ($fx2) = [(ylfx)][0]
    @js ($fx3) = [(ylfx)][1]
    ($lxjh) = {"lx":"go (fx2);go (fx3);go (fx3);go (fx3);go (fx3)"},{"lx":"go (fx2);go (fx2);go (fx3);go (fx3);go (fx3)"},{"lx":"go (fx2);go (fx2);go (fx2);go (fx3);go (fx3)"},{"lx":"go (fx2);go (fx2);go (fx2);go (fx2);go (fx3)"}
[else if] (fl) == 1
    @js ($fx2) = [(ylfx)][0]
    ($lxjh) = {"lx":"go (fx2);go (fx2);go (fx2);go (fx2);go (fx2)"}
[if] (fl) < 5
    @js ($fxlen) = [(lxjh)].length
    ($num) = 0
    [while] (num) < (fxlen)
        @js ($map) = var f=[(lxjh)];f[(num)]["lx"]
        (map)
        [if] (:room) != 古大陆-药林
            [while] (:room) != 古大陆-平原
                go south
                @await 350
            go north;go west
            go (fx1)
            ($num) = (num) + 1
        [else]
            [break]
tiao bush
[if] (:room) == 古大陆-山脚
    @print <ord>古宗门自动寻路已完成！</ord>
[else]
    @print <ord>寻路失败，请重新运行或换个时间。</ord>
            `
            const p = new Performer("古宗门寻路", source);
            p.log(false);
            p.start();
        },
    };

    /***********************************************************************************\
        Ready
    \***********************************************************************************/

    const ToRaid = {
        menu: UI.showToolbar,

        perform: function (content, name, log) {
            const realName = name ? name : "第三方调用";
            ManagedPerformerCenter.start(realName, content, log);
        },

        existAutoDungeon: function (params) {
            return AutoDungeonName(params) != null;
        },

        shareTrigger: function (triggerData) {
            UI._share("触发", triggerData);
        }
    };

    $(document).ready(function () {
        __init__();
        if (WG == undefined || WG == null) {
            setTimeout(__init__, 300);
        }
    });

    function __init__() {
        WG = unsafeWindow.WG;
        if (WG == undefined || WG == null) {
            setTimeout(() => { __init__() }, 300);
            return;
        }
        messageAppend = unsafeWindow.messageAppend;
        messageClear = unsafeWindow.messageClear;
        T = unsafeWindow.T;
        L = unsafeWindow.L;

        unsafeWindow.ToRaid = ToRaid;
        unsafeWindow.Role = Role;

        Role.init();
        Room.init();
        SystemTips.init();
        MsgTips.init();
        DialogList.init();
        TaskList.init();
        Xiangyang.init();
    }
})();

// ==UserScript==
// @name            wsmud_Trigger
// @namespace       cqv3
// @version         0.0.46
// @date            03/03/2019
// @modified        08/09/2022
// @homepage        https://greasyfork.org/zh-CN/scripts/378984
// @description     武神传说 MUD
// @author          Bob.cn, 初心, 白三三
// @match           http://*.wsmud.com/*
// @match           http://*.wamud.com/*
// @run-at          document-end
// @require         https://s4.zstatic.net/ajax/libs/vue/2.2.2/vue.min.js
// @grant           unsafeWindow
// @grant           GM_getValue
// @grant           GM_setValue
// @grant           GM_deleteValue
// @grant           GM_listValues
// @grant           GM_setClipboard
// ==/UserScript==

(function () {
    'use strict';

    function CopyObject(obj) {
        return JSON.parse(JSON.stringify(obj));
    }
    function is_match(src, input) {
        if (src.length == 0 && input.length == 0) {
            return true;
        }
        if (src[0] == "*" && src.length == 1) {
            return true;
        }
        if (src.length == 0 || input.length == 0) {
            return false;
        }
        if (src[0] == "?") {
            return is_match(src.substring(1), input.substring(1));
        } else
            if (src[0] == "*") {
                return is_match(src.substring(1), input) || is_match(src.substring(1), input.substring(1)) || is_match(src, input.substring(1));
            } else
                if (src[0] == input[0]) {
                    return is_match(src.substring(1), input.substring(1));
                } else {
                    return false;
                }

    }

    /***********************************************************************************\
        Notification Center
    \***********************************************************************************/

    class Notification {
        constructor(name, params) {
            this.name = name;
            this.params = params;
        }
    }

    class NotificationObserver {
        constructor(targetName, action) {
            this.targetName = targetName;
            this.action = action;
        }
    }

    const NotificationCenter = {
        observe: function (notificationName, action) {
            const index = this._getOberverIndex();
            const observer = new NotificationObserver(notificationName, action);
            this._observers[index] = observer;
            return index;
        },
        removeOberver: function (index) {
            delete this._observers[index];
        },
        /**
         * @param {Notification} notification
         */
        post: function (notification) {
            for (const key in this._observers) {
                if (!this._observers.hasOwnProperty(key)) continue;
                const observer = this._observers[key];
                if (observer.targetName != notification.name) continue;
                observer.action(notification.params);
            }
        },

        _observerCounter: 0,
        _observers: {},
        _getOberverIndex: function () {
            const index = this._observerCounter;
            this._observerCounter += 1;
            return index;
        }
    };

    /***********************************************************************************\
        Monitor Center
    \***********************************************************************************/

    class Monitor {
        constructor(run) {
            this.run = run;
        }
    }

    const MonitorCenter = {
        addMonitor: function (monitor) {
            this._monitors.push(monitor);
        },
        run: function () {
            for (const monitor of this._monitors) {
                monitor.run();
            }
        },

        _monitors: []
    };

    /***********************************************************************************\
        Trigger Template And Trigger
    \***********************************************************************************/

    //---------------------------------------------------------------------------
    //  Trigger Template
    //---------------------------------------------------------------------------

    const EqualAssert = function (lh, rh) {
        return lh == rh;
    };

    const ContainAssert = function (lh, rh) {
        if (/^\s*\*?\s*$/.test(lh)) return true;
        const list = lh.split("|");
        return list.indexOf(rh) != -1;
    };
    const ContainReverseAssert = function (lh, rh) {
        console.log(lh, rh);
        if (/^\s*\*?\s*$/.test(lh)) return true;
        const list = lh.split("|");
        return list.indexOf(rh) == -1;
    };

    const KeyAssert = function (lh, rh) {
        if (/^\s*\*?\s*$/.test(lh)) return true;
        const list = lh.split("|");
        for (const key of list) {
            if (rh.indexOf(key) != -1) return true;
        }
        return false;
    };

    class Filter {
        constructor(name, type, defaultValue, assert) {
            this.name = name;
            this.type = type;
            this.defaultValue = defaultValue;
            this.assert = assert == null ? EqualAssert : assert;
        }
        description(value) {
            if (value != null) {
                this._desc = value;
                return;
            }
            return this._desc == null ? this.name : this._desc;
        }
    }

    class SelectFilter extends Filter {
        constructor(name, options, defaultNumber, assert) {
            const defaultValue = options[defaultNumber];
            super(name, "select", defaultValue, assert);
            this.options = options;
        }
    }

    const InputFilterFormat = {
        number: "数字",
        text: "文本"
    };

    class InputFilter extends Filter {
        /**
         * @param {String} name
         * @param {InputFilterFormat} format
         * @param {*} defaultValue
         */
        constructor(name, format, defaultValue, assert) {
            super(name, "input", defaultValue, assert);
            this.format = format;
        }
    }

    class TriggerTemplate {
        constructor(event, filters, introdution) {
            this.event = event;
            this.filters = filters;
            this.introdution = `${introdution}\n// 如需更多信息，可以到论坛触发器版块发帖。`;
        }
        getFilter(name) {
            for (const filter of this.filters) {
                if (filter.name == name) return filter;
            }
            return null;
        }
    }

    const TriggerTemplateCenter = {
        add: function (template) {
            this._templates[template.event] = template;
        },
        getAll: function () {
            return Object.values(this._templates);
        },
        get: function (event) {
            return this._templates[event];
        },

        _templates: {},
    };

    //---------------------------------------------------------------------------
    //  Trigger
    //---------------------------------------------------------------------------

    class Trigger {
        constructor(name, template, conditions, source) {
            this.name = name;
            this.template = template;
            this.conditions = conditions;
            this.source = source;
            this._action = function (params) {
                let realParams = CopyObject(params);
                for (const key in conditions) {
                    if (!conditions.hasOwnProperty(key)) continue;
                    const filter = template.getFilter(key);
                    const fromUser = conditions[key];
                    const fromGame = params[key];
                    if (!filter.assert(fromUser, fromGame)) return;
                    delete realParams[key];
                }
                let realSource = source;
                for (const key in realParams) {
                    realSource = `($${key}) = ${realParams[key]}\n${realSource}`;
                }
                if (/\/\/\s*~silent\s*\n/.test(source) == false) {
                    realSource = `@print 💡<hio>触发=>${name}</hio>\n${realSource}`;
                }
                ToRaid.perform(realSource, name, false);
            };
            this._observerIndex = null;
        }

        event() { return this.template.event; }
        active() { return this._observerIndex != null; }

        _activate() {
            if (this._observerIndex != null) return;
            if (this.template == null) return;
            this._observerIndex = NotificationCenter.observe(this.template.event, this._action);
        }
        _deactivate() {
            if (this._observerIndex == null) return;
            NotificationCenter.removeOberver(this._observerIndex);
            this._observerIndex = null;
        }
    }

    class TriggerData {
        constructor(name, event, conditions, source, active) {
            this.name = name;
            this.event = event;
            this.conditions = conditions;
            this.source = source;
            this.active = active;
        }
    }

    const TriggerCenter = {
        run: function () {
            const allData = GM_getValue(this._saveKey(), {});
            for (const name in allData) {
                this._loadTrigger(name);
            }
        },
        reload: function () {
            for (const name in this._triggers) {
                if (!this._triggers.hasOwnProperty(name)) continue;
                const trigger = this._triggers[name];
                trigger._deactivate();
                delete this._triggers[name];
            }
            this.run();
        },

        // for upload and download
        getAllData: function () {
            return GM_getValue(this._saveKey(), {});
        },
        corver: function (triggerDatas) {
            for (const old of this.getAll()) {
                this.remove(old.name);
            }
            for (const name in triggerDatas) {
                const trigger = triggerDatas[name];
                this.create(trigger.name, trigger.event, trigger.conditions, trigger.source, trigger.active);
            }
        },

        getAll: function () {
            return Object.values(this._triggers);
        },
        create: function (name, event, conditions, source, active) {
            const checkResult = this._checkName(name);
            if (checkResult != true) return checkResult;

            const theActive = active == null ? false : active;
            const data = new TriggerData(name, event, conditions, source, theActive);
            this._updateData(data);

            this._loadTrigger(name);
            return true;
        },
        modify: function (originalName, name, conditions, source) {
            const trigger = this._triggers[originalName];
            if (trigger == null) return "修改不存在的触发器？";

            const event = trigger.event();
            if (originalName == name) {
                const data = new TriggerData(name, event, conditions, source, trigger.active());
                this._updateData(data);
                this._reloadTrigger(name);
                return true;
            }

            const result = this.create(name, event, conditions, source);
            if (result == true) {
                this.remove(originalName);
                this._loadTrigger(name);
            }
            return result;
        },
        remove: function (name) {
            const trigger = this._triggers[name];
            if (trigger == null) return;

            trigger._deactivate();
            delete this._triggers[name];
            let allData = GM_getValue(this._saveKey(), {});
            delete allData[name];
            GM_setValue(this._saveKey(), allData);
        },

        activate: function (name) {

            for (let x in this._triggers) {
                if (is_match(name, x)) {
                    const trigger = this._triggers[x];
                    if (trigger == null) continue;
                    if (trigger.active()) continue;
                    trigger._activate();
                    let data = this._getData(x);
                    data.active = true;
                    this._updateData(data);
                }

            }

        },
        deactivate: function (name) {
            for (let x in this._triggers) {
                if (is_match(name, x)) {
                    const trigger = this._triggers[x];
                    if (trigger == null) continue;
                    if (!trigger.active()) continue;
                    trigger._deactivate();
                    let data = this._getData(x);
                    data.active = false;
                    this._updateData(data);
                }

            }

        },
        _triggers: {},

        _saveKey: function () {
            return `${Role.id}@triggers`;
        },
        _reloadTrigger: function (name) {
            const oldTrigger = this._triggers[name];
            if (oldTrigger != null) {
                oldTrigger._deactivate();
            }
            this._loadTrigger(name);
        },
        _loadTrigger: function (name) {
            const data = this._getData(name);
            if (data == null) return;
            // patch new trigger
            if (data['event'] === '新聊天信息' && data['conditions']['忽略发言人'] === undefined) {
                data['conditions']['忽略发言人'] = ''
            }
            const trigger = this._toTrigger(data);
            this._triggers[name] = trigger;
            if (data.active) {
                trigger._activate();
            }
        },
        _getData: function (name) {
            let allData = GM_getValue(this._saveKey(), {});
            const data = allData[name];
            return data;
        },
        _updateData: function (data) {
            let allData = GM_getValue(this._saveKey(), {});
            allData[data.name] = data;
            GM_setValue(this._saveKey(), allData);
        },
        _toTrigger: function (data) {
            const template = TriggerTemplateCenter.get(data.event);
            const trigger = new Trigger(data.name, template, data.conditions, data.source);
            return trigger;
        },
        _checkName: function (name) {
            if (this._triggers[name] != null) return "无法修改名称，已经存在同名触发器！";
            if (!/\S+/.test(name)) return "触发器的名称不能为空。";
            if (!/^[_a-zA-Z0-9\u4e00-\u9fa5]+$/.test(name)) return "触发器的名称只能使用中文、英文和数字字符。";
            return true;
        }
    };

    /***********************************************************************************\
        WSMUD
    \***********************************************************************************/

    var WG = null;
    var messageAppend = null;
    var messageClear = null;
    var ToRaid = null;
    var Role = null;


    //---------------------------------------------------------------------------
    //  status
    //---------------------------------------------------------------------------

    (function () {
        const type = new SelectFilter("改变类型", ["新增", "移除", "层数刷新"], 0);
        const value = new InputFilter("BuffId", InputFilterFormat.text, "weapon", ContainAssert);
        const target = new SelectFilter("触发对象", ["自己", "他人"], 0);
        let filters = [type, value, target];
        const intro = `// Buff状态改变触发器
// 触发对象id：(id)
// buff的sid：(sid)
// buff层数：(count)
// duration持续时间：(duration)`;
        const t = new TriggerTemplate("Buff状态改变", filters, intro);
        TriggerTemplateCenter.add(t);

        const run = function () {
            const post = function (data, sid, type) {
                let params = {
                    "改变类型": type,
                    "BuffId": sid,
                    "触发对象": data.id == Role.id ? "自己" : "他人"
                };
                params["id"] = data.id;
                params["sid"] = sid;
                params["count"] = 0;
                params["duration"] = 0;
                if (data.count != null) params["count"] = data.count;
                if (data.duration != null) params["duration"] = data.duration;
                const n = new Notification("Buff状态改变", params);
                NotificationCenter.post(n);
            };
            WG.add_hook("status", data => {
                if (data.action == null || data.id == null || data.sid == null) return;
                const types = {
                    "add": "新增",
                    "remove": "移除",
                    "refresh": "层数刷新"
                };
                const type = types[data.action];
                if (type == null) return;
                if (data.sid instanceof Array) {
                    for (const s of data.sid) {
                        post(data, s, type);
                    }
                } else {
                    post(data, data.sid, type);
                }
            });
        };
        const monitor = new Monitor(run);
        MonitorCenter.addMonitor(monitor);
    })();

    //---------------------------------------------------------------------------
    //  msg
    //---------------------------------------------------------------------------

    (function () {
        const channel = new SelectFilter(
            "频道",
            ["全部", "世界", "队伍", "门派", "全区", "帮派", "谣言", "系统"],
            0,
            function (fromUser, fromGame) {
                if (fromUser == "全部") return true;
                return fromUser == fromGame;
            }
        );
        const talker = new InputFilter("发言人", InputFilterFormat.text, "", ContainAssert);
        const pass_talker = new InputFilter("忽略发言人", InputFilterFormat.text, "", ContainReverseAssert);
        const key = new InputFilter("关键字", InputFilterFormat.text, "", KeyAssert);
        let filters = [channel, talker, pass_talker, key];
        const intro = `// 新聊天信息触发器
// 聊天信息内容：(content)
// 发言人：(name)
// 发言人id：(id)
// 频道：(channel)`;
        const t = new TriggerTemplate("新聊天信息", filters, intro);
        TriggerTemplateCenter.add(t);

        const run = function () {
            WG.add_hook("msg", data => {
                if (data.ch == null || data.content == null) return;
                const types = {
                    "chat": "世界",
                    "tm": "队伍",
                    "fam": "门派",
                    "es": "全区",
                    "pty": "帮派",
                    "rumor": "谣言",
                    "sys": "系统"
                };
                const channel = types[data.ch];
                if (channel == null) return;
                const name = data.name == null ? "无" : data.name;
                const id = data.uid == null ? null : data.uid;
                const datacontent = data.content.replace(/\n/g, "")
                let params = {
                    "频道": channel,
                    "发言人": name,
                    "关键字": data.content,
                    "忽略发言人": name
                };
                params["content"] = datacontent;
                params["name"] = name;
                params["id"] = id;
                params["channel"] = channel;
                const n = new Notification("新聊天信息", params);
                NotificationCenter.post(n);
            });
        };
        const monitor = new Monitor(run);
        MonitorCenter.addMonitor(monitor);
    })();

    //---------------------------------------------------------------------------
    //  item add
    //---------------------------------------------------------------------------

    (function () {
        const name = new InputFilter("人物名称", InputFilterFormat.text, "", KeyAssert);
        name.description("人名关键字");
        let filters = [name];
        const intro = `// 人物刷新触发器
// 刷新人物id：(id)
// 刷新人物名称：(name)`;
        const t = new TriggerTemplate("人物刷新", filters, intro);
        TriggerTemplateCenter.add(t);

        const run = function () {
            WG.add_hook("itemadd", data => {
                if (data.name == null || data.id == null) return;
                let params = {
                    "人物名称": data.name,
                };
                params["id"] = data.id;
                params["name"] = data.name;
                const n = new Notification("人物刷新", params);
                NotificationCenter.post(n);
            });
        };
        const monitor = new Monitor(run);
        MonitorCenter.addMonitor(monitor);
    })();

    //---------------------------------------------------------------------------
    //  dialog pack
    //---------------------------------------------------------------------------

    (function () {
        const name = new InputFilter("名称关键字", InputFilterFormat.text, "", KeyAssert);
        let filters = [name];
        const intro = `// 物品拾取触发器
// 拾取物品id：(id)
// 拾取物品名称：(name)
// 拾取物品数量：(count)
// 物品品质：(quality)  值：白、绿、蓝、黄、紫、橙、红、未知`;
        const t = new TriggerTemplate("物品拾取", filters, intro);
        TriggerTemplateCenter.add(t);

        const run = function () {
            WG.add_hook("dialog", function (data) {
                if (data.dialog != "pack" || data.id == null || data.name == null || data.count == null || data.remove != null) return;
                let params = {
                    "名称关键字": data.name,
                };
                params["id"] = data.id;
                params["name"] = data.name;
                params["count"] = data.count;
                let quality = "未知";
                const tag = /<\w{3}>/.exec(data.name)[0];
                const tagMap = {
                    "<wht>": "白",
                    "<hig>": "绿",
                    "<hic>": "蓝",
                    "<hiy>": "黄",
                    "<HIZ>": "紫",
                    "<hio>": "橙",
                    "<ord>": "红"
                }
                quality = tagMap[tag];
                params["quality"] = quality;
                const n = new Notification("物品拾取", params);
                NotificationCenter.post(n);
            });
        };
        const monitor = new Monitor(run);
        MonitorCenter.addMonitor(monitor);
    })();

    //---------------------------------------------------------------------------
    //  text
    //---------------------------------------------------------------------------

    (function () {
        const name = new InputFilter("关键字", InputFilterFormat.text, "", KeyAssert);
        let filters = [name];
        const intro = `// 新提示信息触发器
// 提示信息：(text)`;
        const t = new TriggerTemplate("新提示信息", filters, intro);
        TriggerTemplateCenter.add(t);

        const run = function () {
            WG.add_hook("text", data => {
                if (data.msg == null) return;
                let params = {
                    "关键字": data.msg,
                };
                params["text"] = data.msg;
                const n = new Notification("新提示信息", params);
                NotificationCenter.post(n);
            });
        };
        const monitor = new Monitor(run);
        MonitorCenter.addMonitor(monitor);
    })();

    //---------------------------------------------------------------------------
    //  combat
    //---------------------------------------------------------------------------

    (function () {
        const type = new SelectFilter("类型", ["进入战斗", "脱离战斗"], 0);
        let filters = [type];
        const intro = "// 战斗状态切换触发器";
        const t = new TriggerTemplate("战斗状态切换", filters, intro);
        TriggerTemplateCenter.add(t);

        const run = function () {
            WG.add_hook("combat", data => {
                let params = null;
                if (data.start != null && data.start == 1) {
                    params = { "类型": "进入战斗" };
                } else if (data.end != null && data.end == 1) {
                    params = { "类型": "脱离战斗" };
                }
                const n = new Notification("战斗状态切换", params);
                NotificationCenter.post(n);
            });
            WG.add_hook("text", function (data) {
                if (data.msg == null) return;
                if (data.msg.indexOf('只能在战斗中使用') != -1 || data.msg.indexOf('这里不允许战斗') != -1 || data.msg.indexOf('没时间这么做') != -1) {
                    const params = { "类型": "脱离战斗" };
                    const n = new Notification("战斗状态切换", params);
                    NotificationCenter.post(n);
                }
            });
        };
        const monitor = new Monitor(run);
        MonitorCenter.addMonitor(monitor);
    })();

    //---------------------------------------------------------------------------
    //  combat
    //---------------------------------------------------------------------------

    (function () {
        const type = new SelectFilter("类型", ["已经死亡", "已经复活"], 0);
        let filters = [type];
        const intro = "// 死亡状态改变触发器";
        const t = new TriggerTemplate("死亡状态改变", filters, intro);
        TriggerTemplateCenter.add(t);

        const run = function () {
            WG.add_hook("die", data => {
                const value = data.relive == null ? "已经死亡" : "已经复活";
                let params = {
                    "类型": value
                };
                const n = new Notification("死亡状态改变", params);
                NotificationCenter.post(n);
            });
        };
        const monitor = new Monitor(run);
        MonitorCenter.addMonitor(monitor);
    })();

    //---------------------------------------------------------------------------
    //  time
    //---------------------------------------------------------------------------

    (function () {
        const hours = [
            0, 1, 2, 3, 4, 5, 6, 7, 8, 9,
            10, 11, 12, 13, 14, 15, 16, 17, 18, 19,
            20, 21, 22, 23
        ];
        const minutes = [
            0, 1, 2, 3, 4, 5, 6, 7, 8, 9,
            10, 11, 12, 13, 14, 15, 16, 17, 18, 19,
            20, 21, 22, 23, 24, 25, 26, 27, 28, 29,
            30, 31, 32, 33, 34, 35, 36, 37, 38, 39,
            40, 41, 42, 43, 44, 45, 46, 47, 48, 49,
            50, 51, 52, 53, 54, 55, 56, 57, 58, 59
        ];
        const hour = new SelectFilter("时", hours, 0, EqualAssert);
        const minute = new SelectFilter("分", minutes, 0, EqualAssert);
        const second = new SelectFilter("秒", minutes, 0, EqualAssert);
        let filters = [hour, minute, second];
        const intro = "// 时辰已到触发器";
        const t = new TriggerTemplate("时辰已到", filters, intro);
        TriggerTemplateCenter.add(t);

        const run = function () {
            function timer() {
                const date = new Date();
                const params = {
                    "时": date.getHours(),
                    "分": date.getMinutes(),
                    "秒": date.getSeconds()
                };
                const n = new Notification("时辰已到", params);
                NotificationCenter.post(n);

                const nowTime = Date.now();
                const nextTime = parseInt((nowTime + 1e3) / 1e3) * 1e3 + 1;

                setTimeout(() => {
                    timer();
                }, nextTime - nowTime);
            }
            timer();
        };
        const monitor = new Monitor(run);
        MonitorCenter.addMonitor(monitor);
    })();

    //---------------------------------------------------------------------------
    //  dispfm
    //---------------------------------------------------------------------------

    (function () {
        const sid = new InputFilter("技能id", InputFilterFormat.text, "", ContainAssert);
        let filters = [sid];
        const intro = `// 技能释放触发器
// 技能id：(id)
// 出招时间：(rtime)
// 冷却时间：(distime)`;
        const t = new TriggerTemplate("技能释放", filters, intro);
        TriggerTemplateCenter.add(t);

        const sid1 = new InputFilter("技能id", InputFilterFormat.text, "", ContainAssert);
        let filters1 = [sid1];
        const intro1 = `// 技能冷却结束触发器
// 技能id：(id)`;
        const t1 = new TriggerTemplate("技能冷却结束", filters1, intro1);
        TriggerTemplateCenter.add(t1);

        const run = function () {
            WG.add_hook("dispfm", data => {
                if (data.id == null || data.distime == null || data.rtime == null) return;
                let params = {
                    "技能id": data.id
                };
                params["id"] = data.id;
                params["rtime"] = data.rtime;
                params["distime"] = data.distime;
                const n = new Notification("技能释放", params);
                NotificationCenter.post(n);

                setTimeout(_ => {
                    let params = {
                        "技能id": data.id
                    };
                    params["id"] = data.id;
                    const n = new Notification("技能冷却结束", params);
                    NotificationCenter.post(n);
                }, data.distime);
            });
        };
        const monitor = new Monitor(run);
        MonitorCenter.addMonitor(monitor);
    })();

    //---------------------------------------------------------------------------
    //  hp mp
    //---------------------------------------------------------------------------

    var RoomItems = {};

    (function () {
        const name = new InputFilter("人名关键字", InputFilterFormat.text, "", KeyAssert);
        const type = new SelectFilter("类型", ["气血", "内力"], 0, EqualAssert);
        const compare = new SelectFilter("当", ["低于", "高于"], 0, EqualAssert);
        const valueType = new SelectFilter("值类型", ["百分比", "数值"], 0, EqualAssert);
        const value = new InputFilter("值", InputFilterFormat.number, 0, function (fromUser, fromGame) {
            const parts = fromGame.split(";");
            const oldvalue = parseFloat(parts[0]);
            const newvalue = parseFloat(parts[1]);
            if (oldvalue >= fromUser && newvalue < fromUser) return true;
            if (oldvalue <= fromUser && newvalue > fromUser) return true;
            return false;
        });
        let filters = [name, type, compare, valueType, value];
        const intro = `// 气血内力改变触发器
// 人物id：(id)
// 人物当前气血：(hp)
// 人物最大气血：(maxHp)
// 人物当前内力：(mp)
// 人物最大内力：(maxMp)`;
        const t = new TriggerTemplate("气血内力改变", filters, intro);
        TriggerTemplateCenter.add(t);

        const run = function () {
            WG.add_hook("items", data => {
                if (data.items == null) return;
                RoomItems = {};
                for (const item of data.items) {
                    RoomItems[item.id] = CopyObject(item);
                }
            });
            WG.add_hook("itemadd", data => {
                RoomItems[data.id] = CopyObject(data);
            });
            const decorate = function (params, item) {
                params["id"] = item.id;
                params["hp"] = item.hp;
                params["maxHp"] = item.max_hp;
                params["mp"] = item.mp;
                params["maxMp"] = item.max_mp;
            };
            WG.add_hook("sc", data => {
                if (data.id == null) return;
                let item = RoomItems[data.id];
                if (item == null) return;
                if (data.hp != null) {
                    let compare = "低于";
                    if (data.hp > item.hp) compare = "高于";
                    const oldValue = item.hp;
                    const oldPer = (item.hp / item.max_hp * 100).toFixed(2);
                    item.hp = data.hp;
                    if (item.max_hp < item.hp) item.max_hp = item.hp;
                    if (data.max_hp != null) item.max_hp = data.max_hp;
                    const newValue = item.hp;
                    const newPer = (item.hp / item.max_hp * 100).toFixed(2);
                    let params1 = {
                        "人名关键字": item.name,
                        "类型": "气血",
                        "当": compare,
                        "值类型": "百分比",
                        "值": `${oldPer};${newPer}`
                    };
                    decorate(params1, item);
                    const n1 = new Notification("气血内力改变", params1);
                    NotificationCenter.post(n1);
                    let params2 = {
                        "人名关键字": item.name,
                        "类型": "气血",
                        "当": compare,
                        "值类型": "数值",
                        "值": `${oldValue};${newValue}`
                    };
                    decorate(params2, item);
                    const n2 = new Notification("气血内力改变", params2);
                    NotificationCenter.post(n2);
                }
                if (data.mp != null) {
                    let compare = "低于";
                    if (data.mp > item.mp) compare = "高于";
                    const oldValue = item.mp;
                    const oldPer = (item.mp / item.max_mp * 100).toFixed(2);
                    item.mp = data.mp;
                    if (item.max_mp < item.mp) item.max_mp = item.mp;
                    if (data.max_mp != null) item.max_mp = data.max_mp;
                    const newValue = item.mp;
                    const newPer = (item.mp / item.max_mp * 100).toFixed(2);
                    let params1 = {
                        "人名关键字": item.name,
                        "类型": "内力",
                        "当": compare,
                        "值类型": "百分比",
                        "值": `${oldPer};${newPer}`
                    };
                    decorate(params1, item);
                    const n1 = new Notification("气血内力改变", params1);
                    NotificationCenter.post(n1);
                    let params2 = {
                        "人名关键字": item.name,
                        "类型": "内力",
                        "当": compare,
                        "值类型": "数值",
                        "值": `${oldValue};${newValue}`
                    };
                    decorate(params2, item);
                    const n2 = new Notification("气血内力改变", params2);
                    NotificationCenter.post(n2);
                }
            });
        };
        const monitor = new Monitor(run);
        MonitorCenter.addMonitor(monitor);
    })();

    //---------------------------------------------------------------------------
    //  damage
    //---------------------------------------------------------------------------

    (function () {
        const name = new InputFilter("人名关键字", InputFilterFormat.text, "", KeyAssert);
        const valueType = new SelectFilter("值类型", ["百分比", "数值"], 0, EqualAssert);
        const value = new InputFilter("值", InputFilterFormat.number, 0, (fromUser, fromGame) => {
            const parts = fromGame.split(";");
            const oldvalue = parseFloat(parts[0]);
            const newvalue = parseFloat(parts[1]);
            if (oldvalue <= fromUser && newvalue > fromUser) return true;
            return false;
        });
        let filters = [name, valueType, value];
        const intro = `// 伤害已满触发器
// 备注：限制条件-值 不支持多条件
// 人物id：(id)
// 人物名称：(name)
// 伤害数值：(value)
// 伤害百分比：(percent)`;
        const t = new TriggerTemplate("伤害已满", filters, intro);
        TriggerTemplateCenter.add(t);

        const run = function () {
            const decorate = function (params, item, value, percent) {
                params["id"] = item.id;
                params["name"] = item.name;
                params["value"] = value;
                params["percent"] = percent;
            };
            WG.add_hook("sc", data => {
                if (data.id == null || data.damage == null) return;
                let item = RoomItems[data.id];
                if (item == null || item.id == null || item.name == null || item.max_hp == null) return;
                // 获取之前保存的伤害和伤害百分比
                const oldValue = item._damage == null ? 0 : item._damage;
                const oldPer = item._damagePer == null ? 0 : item._damagePer;
                const value = data.damage;
                const percent = (data.damage / item.max_hp * 100).toFixed(2);
                // 保存伤害和伤害百分比
                item._damage = value;
                item._damagePer = percent;
                let params1 = {
                    "人名关键字": item.name,
                    "值类型": "百分比",
                    "值": `${oldPer};${percent}`
                };
                decorate(params1, item, value, percent);
                const n1 = new Notification("伤害已满", params1);
                NotificationCenter.post(n1);
                let params2 = {
                    "人名关键字": item.name,
                    "值类型": "数值",
                    "值": `${oldValue};${value}`
                };
                decorate(params2, item, value, percent);
                const n2 = new Notification("伤害已满", params2);
                NotificationCenter.post(n2);
            });
        };
        const monitor = new Monitor(run);
        MonitorCenter.addMonitor(monitor);
    })();

    /***********************************************************************************\
        UI
    \***********************************************************************************/

    const Message = {
        append: function (msg) {
            messageAppend(msg);
        },
        clean: function () {
            messageClear();
        },
    };

    const UI = {
        triggerHome: function () {
            const content = `
            <style>.breakText {word-break:keep-all;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;}</style>
            <span class="zdy-item" style="width:120px" v-for="t in triggers" :style="activeStyle(t)">
                <div style="width: 30px; float: left; background-color: rgba(255, 255, 255, 0.31); border-radius: 4px;" v-on:click="editTrigger(t)">⚙</div>
                <div class="breakText" style="width: 85px; float: right;" v-on:click="switchStatus(t)">{{ t.name }}</div>
            </span>
            `;
            const rightText = "<span v-on:click='createTrigger()'><wht>新建</wht></span>";
            UI._appendHtml("🍟 <hio>触发器</hio>", content, rightText);
            new Vue({
                el: '#app',
                data: {
                    triggers: TriggerCenter.getAll()
                },
                methods: {
                    switchStatus: function (t) {
                        if (t.active()) {
                            TriggerCenter.deactivate(t.name);
                        } else {
                            TriggerCenter.activate(t.name);
                        }
                        UI.triggerHome();
                    },
                    editTrigger: UI.editTrigger,
                    activeStyle: function (t) {
                        if (t.active()) {
                            return {
                                "background-color": "#a0e6e0",
                                "border": "1px solid #7284ff",
                                "color": "#001bff"
                            };
                        } else {
                            return { };
                        }
                    },
                    createTrigger: UI.selectTriggerTemplate
                }
            });
        },
        selectTriggerTemplate: function () {
            const content = `
            <span class="zdy-item" style="width:120px" v-for="t in templates" v-on:click="select(t)">{{ t.event }}</span>
            `;
            const leftText = "<span v-on:click='back()'>< 返回</span>";
            UI._appendHtml("<wht>选择触发事件</wht>", content, null, leftText);
            new Vue({
                el: '#app',
                data: {
                    templates: TriggerTemplateCenter.getAll()
                },
                methods: {
                    select: UI.createTrigger,
                    back: UI.triggerHome
                }
            });
        },
        createTrigger: function (template) {
            UI._updateTrigger(template);
        },
        editTrigger: function (trigger) {
            UI._updateTrigger(trigger.template, trigger);
        },
        _updateTrigger: function (template, trigger) {
            const content = `
            <div style="margin:0 2em 0 2em">
                <div style="float:left;width:120px">
                    <span class="zdy-item" style="width:90px" v-for="f in filters">
                    <p style="margin:0"><wht>{{ f.description() }}</wht></p>
                    <input v-if="f.type=='input'" style="width:80%" v-model="conditions[f.name]">
                    <select v-if="f.type=='select'" v-model="conditions[f.name]">
                        <option v-for="opt in f.options" :value="opt">{{ opt }}</option>
                    </select>
                    </span>
                </div>
                <div style="float:right;width:calc(100% - 125px)">
                    <textarea class = "settingbox hide" style = "height:10rem;display:inline-block;font-size:0.8em;width:100%" v-model="source"></textarea>
                    <span class="raid-item shareTrigger" v-if="canShared" v-on:click="share()">分享此触发器</span>
                </div>
            </div>
            `;
            const title = `<input style='width:110px' type="text" placeholder="输入触发器名称" v-model="name">`;
            let rightText = "<span v-on:click='save'><wht>保存</wht></span>";
            if (trigger) {
                rightText = "<span v-on:click='remove'>删除</span>"
            }
            let leftText = "<span v-on:click='back'>< 返回</span>";
            if (trigger) {
                leftText = "<span v-on:click='saveback'>< 保存&返回</span>"
            }
            UI._appendHtml(title, content, rightText, leftText);
            let conditions = {};
            if (trigger != null) {
                conditions = trigger.conditions;
            } else {
                for (const f of template.filters) {
                    conditions[f.name] = f.defaultValue;
                }
            }
            let source = template.introdution;
            if (trigger != null) source = trigger.source;
            new Vue({
                el: '#app',
                data: {
                    filters: template.filters,
                    name: trigger ? trigger.name : "",
                    conditions: conditions,
                    source: source,
                    canShared: trigger != null
                },
                methods: {
                    save: function () {
                        const result = TriggerCenter.create(this.name, template.event, this.conditions, this.source);
                        if (result == true) {
                            UI.triggerHome();
                        } else {
                            alert(result);
                        }
                    },
                    remove: function () {
                        const verify = confirm("确认删除此触发器吗？");
                        if (verify) {
                            TriggerCenter.remove(trigger.name);
                            UI.triggerHome();
                        }
                    },
                    back: function () {
                        UI.selectTriggerTemplate();
                    },
                    saveback: function () {
                        const result = TriggerCenter.modify(trigger.name, this.name, this.conditions, this.source);
                        if (result == true) {
                            UI.triggerHome();
                        } else {
                            alert(result);
                        }
                    },

                    share: function () {
                        ToRaid.shareTrigger(TriggerCenter._getData(trigger.name));
                    }
                }
            })
        },

        _appendHtml: function (title, content, rightText, leftText) {
            var realLeftText = leftText == null ? "" : leftText;
            var realRightText = rightText == null ? "" : rightText;
            var html = `
            <div class = "item-commands" style="text-align:center" id="app">
                <div style="margin-top:0.5em">
                    <div style="width:8em;float:left;text-align:left;padding:0px 0px 0px 2em;height:1.23em" id="wsmud_raid_left">${realLeftText}</div>
                    <div style="width:calc(100% - 16em);float:left;height:1.23em">${title}</div>
                    <div style="width:8em;float:left;text-align:right;padding:0px 2em 0px 0px;height:1.23em" id="wsmud_raid_right">${realRightText}</div>
                </div>
                <br><br>
                ${content}
            </div>`;
            Message.clean();
            Message.append(html);
        },
    };

    /***********************************************************************************\
        Trigger Config
    \***********************************************************************************/

    const TriggerConfig = {
        get: function () {
            let all = {};
            let keys = GM_listValues();
            keys.forEach(key => {
                if (key != "roles") {
                    all[key] = GM_getValue(key);
                }
            });
            return all;
        },
        set: function (config) {
            for (const key in config) {
                GM_setValue(key, config[key]);
            }
            TriggerCenter.reload();
        }
    };

    /***********************************************************************************\
        Ready
    \***********************************************************************************/

    let Running = false;

    $(document).ready(function () {
        __init__();
        if (WG == undefined || WG == null || ToRaid == undefined || ToRaid == null) {
            setTimeout(__init__, 300);
        }
    });

    function __init__() {
        WG = unsafeWindow.WG;

        messageAppend = unsafeWindow.messageAppend;
        messageClear = unsafeWindow.messageClear;
        ToRaid = unsafeWindow.ToRaid;

        if (WG == undefined || WG == null || ToRaid == undefined || ToRaid == null) {
            setTimeout(() => { __init__() }, 300);
            return;
        }
        Role = unsafeWindow.Role;

        unsafeWindow.TriggerUI = UI;
        unsafeWindow.TriggerConfig = TriggerConfig;
        unsafeWindow.TriggerCenter = TriggerCenter;

        WG.add_hook("login", function (data) {
            if (Running) return;
            Running = true;

            TriggerCenter.run();
            MonitorCenter.run();
        });
    }
})();
