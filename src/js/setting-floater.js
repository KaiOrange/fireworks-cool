const noUiSlider = require('nouislider');

var SettingFloater = (function (){
    var SettingFloaterConfig = {
        "Fireworks":{
            "fworkSpeed":{"min":1,"max":10,"step":1},
            "fworkAccel":{"min":0,"max":50,"step":1},
            "showShockwave":{"type":"checkbox"},
            "showTarget":{"type":"checkbox"}
        },
        "Particles":{
            "partCount":{"min":0,"max":500,"step":1},
            "partSpeed":{"min":1,"max":100,"step":1},
            "partSpeedVariance":{"min":0,"max":50,"step":1},
            "partWind":{"min":0,"max":100,"step":1},
            "partFriction":{"min":0,"max":50,"step":1},
            "partGravity":{"min":-20,"max":20,"step":1},
            "flickerDensity":{"min":0,"max":50,"step":1}
        },
        "Color":{
            "hueMin":{"min":0,"max":360,"step":1},
            "hueMax":{"min":1,"max":360,"step":1},
            "hueVariance":{"min":0,"max":180,"step":1}
        },
        "Other":{
            "lineWidth":{"min":1,"max":20,"step":1},
            "clearAlpha":{"min":0,"max":100,"step":1}
        }
    };
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
                <div class="setting-floater-content-header" >${item}</div>
                <div class="setting-floater-content-body">
                    ${innerStr}
                </div>
            </div>`
            settingFloaterContent.append(str);

            Object.keys(SettingFloaterConfig[item]).forEach((n)=>{
                var option = SettingFloaterConfig[item][n]
                if (option.type ==="checkbox") {
                    var $checkbox = $("#"+n).find("input[type=checkbox]");
                    $checkbox.prop("checked",true);
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
            $(this).next().slideToggle("fast");
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
            <button class="btn" type="button" style="width: 100%;" id="closeBtn">关闭</button>
        </div>`;
        settingFloaterContent.append(closeDivStr);
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

