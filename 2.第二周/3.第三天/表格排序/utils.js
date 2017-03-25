//类数组转化为数组
var utils={
    listToArray:function (list) {
        try{
            return [].slice.call(list,0);//如果兼容就用这个方法
        }catch (e){ //如果不兼容 执行下面的方法
            var arr=[];
            for(var i=0;i<list.length;i++){
                arr.push(list[i]);
            }
            return arr;
        }
    }
}
