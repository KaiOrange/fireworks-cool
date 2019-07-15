// 影藏模式包括Cool模式和Flicker模式
function isHiddenMode(){
	return isCoolMode() || isFlickerMode(); 
}

function isCoolMode(){
	return $("html").hasClass("cool-mode"); 
}

function isFlickerMode(){
	return $("html").hasClass("flicker-mode"); 
}

module.exports = {
    isHiddenMode,
    isCoolMode,
    isFlickerMode
}