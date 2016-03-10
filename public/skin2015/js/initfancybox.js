/**
 * Created by haner on 16/3/9.
 */
define(['jquery','fancybox'],function($){
    /**
     * 为富文本编辑框初始化图片预览
     */
    var selector = $('.active-con a');
    selector.length && selector.each(function(index,obj){
        if(/(.jpg|.png|.gif|.jpeg)$/ig.test(obj.href)) $(obj).fancybox();
    });
});