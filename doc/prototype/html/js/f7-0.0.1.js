/*!
 * F7 JavaScript Library Beta
 * http://www.imF7.com
 *
 * Copyright (c) 2010 F7
 *
 * Date: 2010-03
 * Revision: 0001
 */
(function(){
var window = F7 = this;
// 返回单个对象或者对象数组
//=========================  节点类  =========================
function F$(){
 var elements = [];
 for(var i=0; i<arguments.length; i++){
   var elem = arguments[i];
   // 如果参数是字符串，那就假设他是ID，返回其节点对象
   if(typeof elem == "string"){
     elem = document.getElementById(elem);
   }
   // 一个参数则直接返回节点对象
   if(arguments.length == 1){
     return elem;
   }
   // 多个参数将节点对象添加至数组
   elements.push(elem);
 }
 return elements;
};
F7.F$ = F$;
// ****************************************
// 批量获取class命名节点
function getElementsByClassName(className, tag, parent){
  parent = parent || document;
  if(!(parent = F$(parent))){return false;}
  // 查找所有匹配标签
  var allTags = (tag == "*" && parent.all) ? parent.all : parent.getElementsByTagName(tag);
  var classElements = [];
  
  // 创建一个正则表达是来判断className的正确性
  className = className.replace(/\-/g, "\\-");
  var regex = new RegExp("(^|\\s)" + className + "(\\s|$)");
  var elenemt;
  // 检查每个元素
  for(var i=0; i<allTags.length; i++){
    elem = allTags[i];
    if(regex.test(elem.className)){
      classElements.push(elem);
    }
  }
  return classElements;
};
F7.getElementsByClassName = getElementsByClassName;
// ****************************************
// 返回下一个非空格、换行、注释的节点
function nextElem(elem){
  var nextE = elem.parentNode.nextSibling;
  if(nextE.nodeName == "#text" || nextE.nadeName == "#comment"){nextE = nextE.nextSibling};
  return nextE;
}
F7.nextElem = nextElem;
// **********************************
// 元素开关等操作
element={
  show: function(elem, means){
    var means = means||"none";// 这个是给未来动画显隐留下的接口
    F$(elem).style.display = "block";
  },
  hide: function(elem, means){
    var means = means||"none";
    F$(elem).style.display = "none";
  },
  del: function(elem){
    if(F$(elem)){F$(elem).parentNode.removeChild(F$(elem))};
  }
}
F7.element = element;
// **********************************
// insertAfter(newElem,targetElem);
// 将newElem 作为targetElem 的兄弟节点插入到txtName 节点之后
function insertAfter(newElem, targetElem){
  var parentElem = targetElem.parentNode;
  if(parentElem.lastChild == targetElem){
    parentElem.appendChild(newElem);
  }else{
    parentElem.insertBefore(newElem,targetElem.nextSibling);
  }
}
F7.insertAfter = insertAfter;
// **********************************

// 设置透明度 setOpacity(elem,40)
function setOpacity(elem,num){
  var elem = F$(elem);
  //if(elem.filters){
  if("\v"=="v"){
    setStyle(elem, {filter:"alpha(opacity="+ num +")"});
  }else{
    setStyle(elem, {opacity:num/100});
  }
}
F7.setOpacity = setOpacity;
// **********************************

//=========================  获取页面相关信息  =========================
// 获取元素相对于这个页面的x和y坐标。
function pageX(elem){
  return elem.offsetParent?(elem.offsetLeft+pageX(elem.offsetParent)):elem.offsetLeft;
}
function pageY(elem){
  return elem.offsetParent?(elem.offsetTop+pageY(elem.offsetParent)):elem.offsetTop;
}
F7.pageX = pageX;
F7.pageY = pageY;
// **********************************
// 获取元素相对于父元素的x和y坐标。
function parentX(elem){
  return elem.parentNode==elem.offsetParent?elem.offsetLeft:pageX(elem)-pageX(elem.parentNode);
}
function parentY(elem){
  return elem.parentNode==elem.offsetParent?elem.offsetTop:pageY(elem)-pageY(elem.parentNode);
}
F7.parentX = parentX;
F7.parentY = parentY;
// **********************************
// 获取鼠标光标相对于视窗的位置。
function getBrowserX(e){
  e=e||window.event;
  var _left = document.documentElement.scrollLeft||document.body.scrollLeft;
  var de = e.pageX-_left||e.clientX;
  return de;
}
function getBrowserY(e){
  e=e||window.event;
  var _top = document.documentElement.scrollTop||document.body.scrollTop;
  var de = e.pageY-_top||e.clientY;
  return de;
}
F7.getBrowserX = getBrowserX;
F7.getBrowserY = getBrowserY;
// **********************************
// 获取鼠标光标相对于整个页面的位置。
function getX(e){
  e=e||window.event;
  var _left = document.documentElement.scrollLeft||document.body.scrollLeft;
  return e.pageX||e.clientX+_left;
}
function getY(e){
  e=e||window.event;
  var _top = document.documentElement.scrollTop||document.body.scrollTop;
  return e.pageY||e.clientY+_top;
}
F7.getX = getX;
F7.getY = getY;
// **********************************
// 获取鼠标光标相对于当前元素的位置。
function getElementX(e){
  return (e&&e.layerX)||window.event.offsetX;
}
function getElementY(e){
  return (e&&e.layerY)||window.event.offsetY;
}
F7.getElementX = getElementX;
F7.getElementY = getElementY;
// **********************************
// 获取滚动条的位置
function scroll_left(){
  var de=document.documentElement;
  return self.pageXOffset||(de && de.scrollLeft)||document.body.scrollLeft;
}
function scroll_top(){
  var de=document.documentElement;
  return self.pageYOffset||(de && de.scrollTop)||document.body.scrollTop;
}
F7.scroll_left = scroll_left;
F7.scroll_top = scroll_top;
// **********************************
// 获取页面的高度和宽度
function getPageHeight(){
  var de=document.documentElement;
  return document.body.scrollHeight||(de&&de.scrollHeight);
}
function getPageWidth(){
  var de=document.documentElement;
  return document.body.scrollWidth||(de&&de.scrollWidth);
}
F7.getPageHeight = getPageHeight;
F7.getPageWidth = getPageWidth;
// **********************************
// 获取视口的高度和宽度。
function windowHeight() {
  var de = document.documentElement;
  return self.innerHeight||(de && de.offsetHeight)||document.body.offsetHeight;
}
function windowWidth() {
  var de = document.documentElement;
  return self.innerWidth||( de && de.offsetWidth )||document.body.offsetWidth;
}
F7.windowHeight = windowHeight;
F7.windowWidth = windowWidth;
// **********************************
// 获取元素可能，完整的高度和宽度    ***************** 此函数慎用，需进一步考证
function getFullHeight(elem){
  if(getStyle(elem,"display")!="none"){
    return parseInt(getStyle(elem,"height"))||elem.offsetHeight;
  }else{
    var old=resetCss(elem,{display:"block",visibility:"hidden",position:"absolute"});
    var h=elem.clientHeight||parseInt(getStyle(elem,"height"));
    setStyle(elem,old);
    return h;
  }
}
function getFullWidth(elem){
  if(getStyle(elem,"display")!="none"){
    return parseInt(getStyle(elem,"width"))||elem.offsetWidth;
  }else{
    var old=resetCss(elem,{display:"block",visibility:"hidden",position:"absolute"});
    var w=elem.clientWidth||parseInt(getStyle(elem,"width"));
    setStyle(elem,old);
    return w;
  }
}
F7.getFullHeight = getFullHeight;
F7.getFullWidth = getFullWidth;
// **********************************

// 获取页面卷动的距离
function getPageTop(){
  var de=document.documentElement;
  return document.body.scrollTop||(de&&de.scrollTop);
}
F7.getPageTop = getPageTop;
// **********************************
// 获取地址栏URL参数
function requestUrl(item){
  var svalue = location.search.match(new RegExp("[\?\&]" + item + "=([^\&]*)(\&?)","i"));
  return svalue ? svalue[1] : svalue;
}
F7.requestUrl = requestUrl;

//=========================  class类  =========================
// 获取外部CSS的属性 返回属性值  getStyle(box,"width")
function getStyle(elem, name){
  if(elem.style[name]!='')return elem.style[name];
  if(!!window.ActiveXObject)return elem.currentStyle[name];
  return document.defaultView.getComputedStyle(elem,"")
  .getPropertyValue(name.replace(/([A-Z])/g,"-$1").toLowerCase());
}
F7.getStyle = getStyle;
// 设置CSS属性 setStyle(elem, {height:"250px", width:"300px"})
function setStyle(elem, prop){
  for(var i in prop){
    elem.style[i]=prop[i];
  }
}
F7.setStyle = setStyle;
// 设置css，并返回原有的css  引用方式同上
function resetCss(elem, prop){
  var old={};
  for(var i in prop){
    old[i]=elem.style[i];
    elem.style[i]=prop[i];
  }
  return old;
}
F7.resetCss = resetCss;
// **********************************

//=========================  事件类  =========================
// 事件加载器
function addEvent(elem, type, listener){
  if(!(elem = F$(elem))){return false;}
  if(elem.addEventListener){
    // W3C的方法
    //alert("zhe")
    elem.addEventListener(type, listener, false);
    return true;
  }else if(elem.attachEvent){
    // MSIE的方法
    elem['e'+type+listener] = listener;
    elem[type+listener] = function(){
      elem['e'+type+listener](window.event);
    }
    elem.attachEvent("on"+type, elem[type+listener]);
    return true;
  }
  // 若两种方法都不具备则返回false
  return false;
};
F7.addEvent = addEvent;
// ****************************************
// 事件移除器
function removeEvent(elem, type, listener){
  if(!(elem = F$(elem))){return false;}
  if(elem.removeEventListener){
    // W3C的方法
    elem.removeEventListener(type, listener, false);
    return true;
  }else if(elem.detachEvent){
    // MSIE的方法
    elem.detachEvent("on"+type, node[type+listener]);
    elem[type+listener] = null;
    return true;
  }
  // 若两种方法都不具备则返回false
  return false;
};
F7.removeEvent = removeEvent;
// ****************************************

//=========================  存储类  =========================
// cookie 2.0 代码
function setCookie(name, value, expires, path, domain){
//name cookie的名称
//value cookie的值
//expires cookie存活的时间[可选项：无值代表页面关闭生命到期]，以毫秒为单位 支持 '1000'  1000  100*1000 三种格式（计算时不能用引号包含）[可以为其他目录进行赋值]
//path cookie的可访问范围，例设置为"/test/"或"text/"或"/text" 都代表test目录下的所有文件及子目录都可访问到cookie
//domain cookie的访问域，path的延伸，如设置为 "web600.net" 那么"bbs.web600.net"/"www.web600.net"等二级子域名都可以访问到该cookie[只能为自己域赋值]
//完整引用实例：
//添加：setCookie('userName','qqqqqq',1000*60,'/test/','china.com')
//读取：getCookie('userName')
//删除：clearCookie('userName')
  if( expires && isNaN(expires)===false ){expires=new Date(new Date().getTime()+expires)};
  document.cookie=name+"="+escape(value)+((expires)?"; expires="+expires.toGMTString():"")+((path)?"; path="+path:"; path=/")+((domain)?";domain="+domain:"");
};
function getCookie(name){
  var arr=document.cookie.match(new RegExp("(^| )"+name+"=([^;]*)(;|$)"));
  if(arr!=null){
    return unescape( arr[2] );
  }
    return null;
};
function clearCookie(name, path, domain){
  if(this.get( name )){
    document.cookie=name+"="+((path)?"; path="+path:"; path=/")+((domain)?"; domain="+domain:"")+";expires=Fri, 02-Jan-1970 00:00:00 GMT";
  }
};
F7.setCookie = setCookie;
F7.getCookie = getCookie;
F7.clearCookie = clearCookie;
// **********************************

//=========================  读取引用类  =========================
// 加载XML文件并返回XML文档节点
function loadXmlFile(xmlFile, b){
  var xmlDom = null;
  var b = b || false;
  if (window.ActiveXObject){
    xmlDom = new ActiveXObject("Microsoft.XMLDOM");
    xmlDom.async = b;
    //xmlDom.loadXML(xmlFile);//如果用的是XML字符串
    xmlDom.load(xmlFile);//如果用的是xml文件。
  }else if (document.implementation && document.implementation.createDocument){
    var xmlhttp = new window.XMLHttpRequest();
    xmlhttp.open("GET", xmlFile, false);
    xmlhttp.send(null);
    xmlDom = xmlhttp.responseXML;
  }else{
    xmlDom = null;
  }
  return xmlDom;
}
F7.loadXmlFile = loadXmlFile;
// **********************************
// 检测图片是否加载完成 完成返回true，否则返回false，同时支持回调函数
function picOnload(elem, _f){
  if(window.ActiveXObject){
    elem.onreadystatechange = function(){
      if(elem.readyState=="complete"){
        if(_f)_f();// 回调函数
        return true;
      }else{return false;}
    }
  }else{
    elem.onload = function () {
      if (elem.complete == true){
        if(_f)_f();// 回调函数
        return true;
      }else{return false;}
    }
  }
}
F7.picOnload = picOnload;
// **********************************


})();