
const ipc = require('electron').ipcRenderer;
require('../css/reset.css');
require('../../node_modules/nouislider/distribute/nouislider.min.css');
require('../css/style.css');
require('./prefixfree.min.js');

const SettingFloater = require('./setting-floater.js');
const Fireworks = require('./fireworks.js');
const Utils = require('./utils.js');
const GuiPresets = require('../config/GuiPresets.json');

function closeApp(){
	$("body").fadeOut("fast",function (){
		ipc.send('app-quit');
	});
}

function debounce(fn, delay) {
	// 维护一个 timer
	let timer = null;
  
	return function() {
		// 通过 ‘this’ 和 ‘arguments’ 获取函数的作用域和变量
		let context = this;
		let args = arguments;
	
		clearTimeout(timer);
		timer = setTimeout(function() {
			fn.apply(context, args);
		}, delay);
	}
}
	
ipc.send('get-text-main')
ipc.on('get-text-reply', function (event, arg) {
	let text = "";
	if (!!arg.texts && arg.texts.length > 0) {
		text = arg.texts[0];
	}
	setTimeout(function () {
		$("#center-block").text(text).fadeIn("fast");
		setTimeout(function () {
			if (!Utils.isHiddenMode()) {//如果这个时候还没有进入隐藏模式的话 那么就退出程序
				closeApp()
			}
		}, 3000);
	}, 3000)
	
	var fworks = new Fireworks();
	var bodyEl = $("body");
	fworks.init(bodyEl.width(), bodyEl.height());
	
	var preset = "Default";
	var currentObj = GuiPresets[preset];
	if (!!arg && !!arg.settings && Object.keys(arg.settings).length !== 0) {
		currentObj = Object.assign({},currentObj,arg.settings||{});
		preset = arg.preset || preset;
	} else {
		ipc.send('setting-change-all',{settings:currentObj,preset:"Default"});
	}
	Object.keys(currentObj).map((item)=>{
		fworks[item] = currentObj[item];
	})

	var eventCallBack = debounce(function (obj){
		if (obj.type === "single") {
			ipc.send('setting-change',{
				key:obj.key,
				value:obj.value
			});
			fworks[obj.key] = obj.value;
		} else if (obj.type === "all"){
			Object.keys(obj.value.settings).forEach((item)=>{
				fworks[item] = obj.value.settings[item];
			});
			ipc.send('setting-change-all',obj.value);
		} else if (obj.type === "text"){
			ipc.send('set-text',obj.value);
			$("#center-block").text(obj.value);
		} else if (obj.type === "clear"){
			fworks.clear();
		} else if ( obj.type === "close" ) {
			closeApp();
		}
	},100);
	SettingFloater.init(GuiPresets,{settings:currentObj,preset:preset,text:!!arg.texts?(arg.texts[0]||""):""},eventCallBack);//初始化settingFloater
	fworks.autoFires();
})

var Mousetrap = require('mousetrap');
var bindMousetrapEvent = function (){
	$("html").addClass("hidden-mode");
	ipc.send('goto-hidden-mode');
}

Mousetrap.bind('c o o l', bindMousetrapEvent);