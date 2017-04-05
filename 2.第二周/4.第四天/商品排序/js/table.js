/*
 * 1.绑定数据：把JSON中的数据获取到，然后展示在页面当中
 *   ->发送ajax请求
 *       ->创建ajax对象
 *       ->打开一个请求的URL地址(我们暂时使用 同步：数据没有获取完成，其余的事情都做不了)
 *       ->监听ajax状态改变
 *       ->发送请求
 *   ->解析数据然后动态创建DOM元素，把内容增加到页面中
 *   ->
 * */

//1.获取数据
var productData = null;
var xhr = new XMLHttpRequest;//不兼容ie6及更低版本
xhr.open('get', 'json/product.json', false);
xhr.onreadystatechange = function () {
    if (xhr.readyState === 4 && xhr.status === 200) {
        productData = utils.toJSON(xhr.responseText);//->从服务器上获取到数据了，一般我们获取到的结果都是JSON格式的字符串
        console.log(productData);
    }
}
xhr.send(null);

//2.数据绑定
//-> 字符串拼接
//-> 动态创建DOM元素(文档碎片)
//     ===>DOM的回流：当页面中的DOM结构发生改变(增删改查或者挪位置)都会让浏览器重新的计算DOM结构，这样性能消耗很大，所以项目中应该尽量减少DOM的回流
//     ===>重绘：
//-> 模板引擎(EJS、kTemplate...)
//-> ES6中提供的模板字符串

var frg = document.createDocumentFragment();//->创建一个文档碎片
for (var i = 0, len = productData.length; i < len; i++) {
    var cur = productData[i];
    var oLi = document.createElement('li');
    //当前元素里面的详细内容没必要使用动态创建的方式，直接字符串拼接会更省事
    var str = '';
    str += '<a href="#">';
    str += '<img src="' + cur.img + '" alt="">';
    str += '<span class="title">' + cur.title + '</span>';
    str += '<span class="price">' + cur.price + '</span>';
    str += '</a>';
    oLi.innerHTML = str;
    /*自定义属性编程思想：凡是后期需要使用当前元素的一些信息值的时候，我们都可以先把这些值放在自定义属性上进行存储，以后如果有需要直接从当前元素的自定义属性上获取即可  命名一般“data-xxx=xxx”*/
    oLi.setAttribute('data-price', cur.price);//设置自定义属性 存储现在不显示的信息 后面使用直接获取当前元素的自定义属性即可
    oLi.setAttribute('data-hot', cur.hot);
    oLi.setAttribute('data-time', cur.time);

    frg.appendChild(oLi);//->每一次循环结束都把创建的li放在文档碎片中，不要直接的追加到页面中，减少DOM的回流
}

var productBox = document.getElementById('product'),
    productItem = productBox.getElementsByTagName('ul')[0];//->需要通过索引获取唯一的一个，这才是我们想要的那个ul
productItem.appendChild(frg);
product.appendChild(productItem);
frg = null;


//3.排序
//->先获取所有的a，然后利用循环分别绑定点击事件
var controlBox = document.getElementById('control'),
    controlLink = controlBox.getElementsByTagName('a');
for (var j = 0, len2 = controlLink.length; j < len2; j++) {
    var curA=controlLink[j];
    curA['data-attr'] = j === 0 ? 'data-time' : (j === 1 ? 'data-price' : 'data-hot');//-> 通过索引来计算根据哪一个字段进行排序(所谓的字段就是当前li存储的自定义属性)，计算好的(知道根据哪个字段排了)值再存在当前点击的a的一个自定义属性'data-attr'里面 --- 如果是0就按time排序，如果是1就按price排序，如果是2就按hot排序
    curA['data-flag']=-1;//->排序标识：-1降序  1升序
    curA.onclick = function () {
        //this->点击的这个a
        //sortTable();//->如果这样执行 那么sortTable方法中的this是window，因为方法执行时前面没有点
        sortTable.call(/*点击的这个a*/this);//->利用call方法，将sortTable方法中的this改变为指向当前点击的这个a
    }
}


function sortTable() {
    //->如果执行这个方法，让方法中的this变为点击的这个a，那么所需要的内容完全可以通过当前点击的a(this)的自定义属性来获取，这样就不需要一个个参数传递了
    //->现在this是当前点击的a
    var _this=this;//->缓存一下 因为下面sort方法中的this是window，想要让this指向的是当前点击的a，又不能用this，就用一个变量把this存一下
    _this['data-flag']*=-1;

    var productList = utils.convertAry(productItem.getElementsByTagName('li'));//获取当前所有的li，然后把其转化为数组，这样就可以使用sort进行排序了

    productList.sort(function (a, b) {
        //->sort这个方法中的this是window
        // 因为time字段比较的时候："2017-03-15" "2017-03-13" => 需要去掉里面的-，然后比较数字
        //又因为上面已经根据索引计算好排序依据的字段，并且存储在了每一个a的自定义属性'data-attr'里，所以现在对每一个字段都进行去掉里面的-的处理，即不管是不是time字段都进行replace(/-/g, '')
        var aNum=a.getAttribute(_this['data-attr']).replace(/-/g,''),
            bNum=b.getAttribute(_this['data-attr']).replace(/-/g,'');
        return (aNum - bNum)*_this['data-flag'];


        /*var aNum = null,
            bNum = null;

        switch (index) {
            case 0:
                aNum = a.getAttribute('data-time').replace(/-/g, '');
                bNum = b.getAttribute('data-time').replace(/-/g, '');
                break;
            case 1:
                aNum = a.getAttribute('data-price');
                bNum = b.getAttribute('data-price');
                break;
            case 2:
                aNum = a.getAttribute('data-hot');
                bNum = b.getAttribute('data-hot');
                break;
        }*/
    });


    //->把排好的结果重新的绑定在页面中(DOM映射)
    var frg=document.createDocumentFragment();
    for(var i=0,len=productList.length;i<len;i++){
        frg.appendChild(productList[i]);
    }
    productItem.appendChild(frg);
    frg=null;


    //->点击当前a的时候：让其他的a 的flag变为初始值-1，这样下一次再点击的时候才是仍然从升序开始，同时还需要控制箭头
    var iList=_this.getElementsByTagName('i'),
        iUp=iList[0],
        iDown=iList[1];
    if (_this['data-flag'] === -1) {
        iDown.className='down bg';
        iUp.className='up';
    }else {
        iDown.className='down';
        iUp.className='up bg';
    }


    for (var j=0;j<controlLink.length;j++){
        var otherA=controlLink[j];
        if (otherA !== _this){
            otherA['data-flag']=-1;
            var otherI=otherA.getElementsByTagName('i');
            otherI[0].className='up';
            otherI[1].className='down';
        }
    }

}




















