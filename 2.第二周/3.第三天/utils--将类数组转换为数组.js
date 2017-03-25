var utils={
    // listToArray 实现将类数组转换为数组
    listToArray:function (likeAry) {
        var ary=[];
        try{
            ary=Array.prototype.slice.call(likeAry);
        }catch (e){
            for(var i=0;i<likeAry.length;i++){
                ary.push(likeAry[i]);
            }
        }
        return ary;
    }
};
