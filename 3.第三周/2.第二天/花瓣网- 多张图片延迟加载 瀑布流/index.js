(function () {

    var oUls = document.getElementsByTagName('ul');
    var oUlArr = utils.likeArray(oUls); // 将ul集合转化为数组
    var container = document.getElementById('container');
    var oImgs = container.getElementsByTagName('img');// 获取到所有 container的图片
    var winHeight = utils.win('clientHeight');
    var data;
    //请求数据
    var xhr = new XMLHttpRequest;
    xhr.open('get', 'data.txt?_=' + Math.random(), false);//避免缓存数据 通过随机数 会每次都发送一个新的请求 问号?后面是查询字符串  有些时候后台会根据问号后面查询字符串参数 做处理 判断
    xhr.onreadystatechange = function () {
        if (this.readyState === 4 && /^2\d{2}$/.test(this.status)) { // 200 201 202 都代表请求成功 通过正则匹配 只要是2开头的三位数 都是请求ok
            data = utils.toJson(this.responseText);
            // console.log(data);
            data && data.length ? bindData() : null; // 先确保有数据再执行数据绑定
        }
    }
    xhr.send(null);


    function bindData() {
        for (var i = 0; i < 50; i++) {
            var ind = Math.round(Math.random() * 7);// 获取0-7(因为data.txt里的数据只有8个)之间的随机整数 作为获取数据的索引
            var curData = data[ind];
            var oLi = document.createElement('li');// 创建 li
            var oa = document.createElement('a');// 创建 a
            oa.href = 'javascript:;';
            oa.innerHTML = '采集';
            oLi.appendChild(oa);
            var oImg = document.createElement('img');// 创建 img
            oImg.style.height = Math.round(Math.random() * (350 - 200) + 200) + 'px';// 给图片设置随机高 200px-350px
            oImg.setAttribute('data-real', curData.src);// 将图片资源的路径绑定到每一个img标签的html属性上
            oLi.appendChild(oImg);
            var op = document.createElement('p');// 创建 p
            op.innerHTML = curData['title'];
            oLi.appendChild(op);
            //排序
            oUlArr.sort(function (a, b) {
                return a.offsetHeight - b.offsetHeight;
            });
            // 排完序后 集合中的第一个是高度最小的
            // 将当前这一轮创建好的 li img 放到排序后 第一项 也就是高度最小的那个ul里
            oUlArr[0].appendChild(oLi);
        }
        delayImgs();
    }


    window.onscroll = function () {
        delayImgs();
        var wScrollHeight = utils.win('scrollHeight');
        var sTop = utils.win('scrollTop');
        //当滚动条快到底部时 继续绑定数据  【项目中 应该是再次发送ajax请求 向后台继续请求数据 一直到后台没有数据】
        if (winHeight + sTop >= wScrollHeight - 1000) {
            bindData();// 理论上应该是重新发送请求 但是现在让它重新绑定数据
        }
    }
    // 延迟加载图片
    function delayImgs() {
        for (var i = 0; i < oImgs.length; i++) {
            checkImg(oImgs[i]);// 遍历每一个图片 检测是否符合加载标准
        }
    }

    // 检测图片
    function checkImg(img) {
        if (img.flag) return;
        var winH = utils.win('clientHeight');
        var sTop = utils.win('scrollTop');
        var imgHeight = img.offsetHeight;// 获取当前图片的自身高度
        var imgTop = utils.offset(img).top;// 获取图片的上偏移
        if (winH + sTop >= imgHeight + imgTop) {
            var imgSrc = img.getAttribute('data-real');
            // 检测资源有效性
            var Img = document.createElement('img');
            Img.src = imgSrc;
            Img.onload = function () { // 如果临时创建的图片加载成功了 就触发onload事件  而临时图片赋的是要用的图片资源路径 所以如果它加载成功了 就说明图片资源有效 可以在页面中加载
                img.src = imgSrc;
                Img = null;// 创建的临时图片用完清空
                fadeImg(img);
                img.flag = true;// 已经加载过的标记为true
            };
        }
    }

    //图片渐变
    function fadeImg(img) {
        var timer = setInterval(function () {
            var op = utils.getCss(img, 'opacity');
            if (op >= 1) {
                clearInterval(timer);
                return;
            }
            op += 0.1;
            utils.setCss(img, 'opacity', op);
        }, 100);
    }

})();

