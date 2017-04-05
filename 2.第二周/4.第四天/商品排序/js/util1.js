
var utils=(function () {

    //->类数组转化为数组
    function convertAry(likeAry) {
        var ary=[];
        try {
            ary=Array.prototype.slice.call(likeAry);
        }catch (e) {
            for (var i=0,len=likeAry.length;i<len;i++){
                ary[ary.length]=likeAry[i];
            }
        }
        return ary;
    }


    //->把JSON格式的字符串转化为JSON格式的对象
    function toJSON(str) {
        return 'JSON' in window ? JSON.parse(str) : eval('('+str+')');
    }



    return {
        convertAry:convertAry,
        toJSON:toJSON
    }

})();