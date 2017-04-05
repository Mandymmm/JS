/*
 * utils[v1.0]:常用的方法类库，包含DOM和数组对象等操作
 *   - convertAry
 *   - 里面都有哪些方法的目录
 * */
var utils = (function () {
    /*
     * convertAry：Convert an array to an array
     * @parameter:
     *   likeAry[Object]:Array class
     * @return:
     *   ary[Array]:Convert completed array
     * By Mmm on 2017/03/25/ 12:52
     * */
    //->Array.prototype.slice.call(likeAry)  如果类数组是DOM集合，在ie6-8低版本浏览器中不支持这种办法，执行会报错 => 对于不支持的我们自己写循环处理
    function convertAry(likeAry) {
        var ary = [];
        try { //->尝试执行
            ary = Array.prototype.slice.call(likeAry);
        } catch (e) { //->如果有错误 捕获到
            // e.message 存储错误信息
            for (var i = 0, len = likeAry.length; i < len; i++) {
                ary[ary.length] = likeAry[i];
            }
        } finally {
            //不管是否报错 最后都会执行这里面的代码 一般不用
        }
        return ary;
    }

    /*
     * toJSON:把JSON格式的字符串转化为JSON格式的对象(解决了ie6-7下不兼容JSON的问题)
     * @parameter:
     *   str[string]:需要转换的JSON字符串
     * @return:
     *   obj[Object]:转换完成的JSON对象
     * By Mmm on 2017/03/25/ 17:07
     * */
    function toJSON(str) {
        return 'JSON' in window ? JSON.parse(str) : eval('(' + str + ')');
    }


    return {
        convertAry: convertAry,
        toJSON: toJSON
    }
})();

// utils.convertAry();