const noUiSlider = require('nouislider');
const SettingFloaterConfig = require('../config/SettingFloaterConfig.json');

var SettingFloater = (function (){
    function init(allConfig,CurrentConfig,eventCallBack){
        var CurrentConfigSetting = CurrentConfig.settings;
        var settingFloaterContent = $('.setting-floater-content');

        //初始化下拉选择框
        var titleStr = ""
        Object.keys(allConfig).forEach((item)=>{
            titleStr += `<option value="${item}">${item}</option>`;
        });
        titleStr = `<div class="setting-floater-content-title">
            <select style="width:162px">
                ${titleStr}
            </select>
        </div>`;
        settingFloaterContent.append(titleStr);
        var $select = settingFloaterContent.children(".setting-floater-content-title").children("select")
        $select.val(CurrentConfig.preset);
        $select.change(function (e){
            var $this =  $(this);
            var key = $this.val();
            if (!!eventCallBack) {
                eventCallBack(
                    {
                        key:key,
                        value:{settings:allConfig[key],preset:key},
                        type:"all"
                    });
            }
            Object.keys(allConfig[key]).forEach(item=>{
                var $content = $("#"+item).children(".content");
                if ($content.length === 0) {
                    return;
                }
                var $checkbox = $content.children(".checkbox");
                var value = allConfig[key][item];
                if ($checkbox.length === 0) {
                    $content.children(".noUi-target")[0].noUiSlider.set(value);
                    $content.next().text(value);
                } else {
                    $checkbox.children().children("input[type=checkbox]").prop("checked",value);
                }
            });
            e.stopPropagation();
        });
        
        Object.keys(SettingFloaterConfig).forEach((item)=>{
            var innerStr = "";
            Object.keys(SettingFloaterConfig[item]).forEach((n)=>{
                if (SettingFloaterConfig[item][n].type === "checkbox") {
                    innerStr += `<div id="${n}" class="clearfix">
                        <div class="label ellipsis-text" title="${n}">${n}</div>
                        <div class="content">
                            <div class="checkbox">
                                <label>
                                    <input class="inverted" type="checkbox" />
                                    <input type="hidden" />
                                    <span class="text"></span>
                                </label>
                            </div>
                        </div>
                    </div>`;
                } else {
                    innerStr += `<div id="${n}" class="clearfix">
                        <div class="label ellipsis-text" title="${n}">${n}</div>
                        <div class="content">
                            <div class="slider-xs"></div>
                        </div>
                        <div class="value" >
                        </div>
                    </div>`;
                }
            });
            var str = `<div>
                <div class="setting-floater-content-header" >${item}<span class="triangle_right"></span></div>
                <div class="setting-floater-content-body">
                    ${innerStr}
                </div>
            </div>`
            settingFloaterContent.append(str);

            Object.keys(SettingFloaterConfig[item]).forEach((n)=>{
                var option = SettingFloaterConfig[item][n]
                if (option.type ==="checkbox") {
                    var $checkbox = $("#"+n).find("input[type=checkbox]");
                    $checkbox.prop("checked",CurrentConfigSetting[n]);
                    $checkbox.change(function (){
                        if (!!eventCallBack) {
                            eventCallBack({
                                key:n,
                                value:$(this).prop("checked"),
                                type:"single"
                            });
                        }
                    });
                } else {
                    var $slider = $("#"+n).children(".content").children(".slider-xs");
                    var slider = $slider[0];
                    noUiSlider.create(slider, {
                        start: CurrentConfigSetting[n],
                        animate: true,
                        step: option.step,
                        range: {
                            min: option.min,
                            max: option.max
                        }
                    });

                    $slider.parent().next().text(CurrentConfigSetting[n]);
            
                    slider.noUiSlider.on('slide', function( values, handle ){
                        $(this.target).parent().next().text(Number(values[handle]).toFixed(0))
                        if (!!eventCallBack) {
                            eventCallBack({
                                key:n,
                                value:Number(values[handle]).toFixed(0),
                                type:"single"
                            })
                        }
                    });
                }
            });
        });
        $(".setting-floater-content-header").click(function (){
            var $this = $(this);
            $this.next().slideToggle("fast");
            $this.children(".triangle_right").toggleClass("rotate90deg");
        });

        var textDivStr = `<div>
            <input class="form-control" name="text" placeholder="设置文本" type="text" style="width: 224px;">
            <button class="btn" type="button" style="width: 80px;" id="textBtn">设置</button>
        </div>`;
        settingFloaterContent.append(textDivStr);

        var $textBtn = $("#textBtn");
        $textBtn.prev().val(CurrentConfig.text)
        $textBtn.click(function (){
            if (!!eventCallBack) {
                eventCallBack({
                    key:"text",
                    value:$(this).prev().val(),
                    type:"text"
                })
            }
        });

        var closeDivStr = `<div>
            <button class="btn" type="button" style="width: 150px;margin-right:4px" id="clearBtn">清屏</button>
            <button class="btn" type="button" style="width: 150px;" id="closeBtn">退出</button>
        </div>`;
        settingFloaterContent.append(closeDivStr);

        $("#clearBtn").click(function (){
            if (!!eventCallBack) {
                eventCallBack({
                    key:"",
                    value:"",
                    type:"clear"
                })
            }
        });

        $("#closeBtn").click(function (){
            if (!!eventCallBack) {
                eventCallBack({
                    key:"",
                    value:"",
                    type:"close"
                })
            }
        });

        $(".setting-floater>.shrink-btn").click(function (){
            $(".setting-floater").toggleClass("shrink");
        });
    }
    return {init:init};
})();

module.exports = SettingFloater;

