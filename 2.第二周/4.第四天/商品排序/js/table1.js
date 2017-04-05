//获取数据
var productData = null;
var xhr = new XMLHttpRequest;
xhr.open('get', 'json/product.json', false);
xhr.onreadystatechange = function () {
    if (xhr.readyState === 4 && xhr.status === 200) {
        productData = utils.toJSON(xhr.responseText);
    }
};
xhr.send(null);

//数据绑定
var frg = document.createDocumentFragment();
for (var i = 0, len = productData.length; i < len; i++) {
    var cur = productData[i];
    var oLi = document.createElement('li');
    var str = '';
    str += '<a href="#">';
    str += '<img src="' + cur.img + '" alt=""/>';
    str += '<span class="title">' + cur.title + '</span>';
    str += '<span class="price">￥' + cur.price + '</span>';
    str += '</a>';
    oLi.innerHTML = str;
    oLi.setAttribute('data-price', cur.price);
    oLi.setAttribute('data-hot', cur.hot);
    oLi.setAttribute('data-time', cur.time);
    frg.appendChild(oLi);
}
var productBox = document.getElementById('product'),
    productItem = productBox.getElementsByTagName('ul')[0];
productItem.appendChild(frg);
productBox.appendChild(productItem);
frg = null;

//排序
var controlBox = document.getElementById('control'),
    controlLink = controlBox.getElementsByTagName('a');
for (var j = 0, len2 = controlLink.length; j < len2; j++) {
    var curA = controlLink[j];
    curA['data-attr'] = j === 0 ? 'data-time' : (j === 1 ? 'data-price' : 'data-hot');
    curA['data-flag'] = -1;
    curA.onclick = function () {
        sortTable.call(this);
    }
}


function sortTable() {
    var _this = this;
    _this['data-flag'] *= -1;
    var productList = utils.convertAry(productItem.getElementsByTagName('li'));
    productList.sort(function (a, b) {
        var aNum = a.getAttribute(_this['data-attr']).replace(/-/g, ''),
            bNum = b.getAttribute(_this['data-attr']).replace(/-/g, '');
        return (aNum - bNum) * _this['data-flag'];
    });


    var frg = document.createDocumentFragment();
    for (var i = 0, len = productList.length; i < len; i++) {
        frg.appendChild(productList[i]);
    }
    productItem.appendChild(frg);
    frg = null;


    var iList = _this.getElementsByTagName('i'),
        iUp = iList[0],
        iDown = iList[1];
    if (_this['data-flag'] === -1) {
        iDown.className = 'down bg';
        iUp.className = 'up';
    } else {
        iDown.className = 'down';
        iUp.className = 'up bg';
    }


    for (var j = 0; j < controlLink.length; j++) {
        var otherA = controlLink[j];
        if (otherA !== _this) {
            otherA['data-flag'] = -1;
            var otherI = otherA.getElementsByTagName('i');
            otherI[0].className = 'up';
            otherI[1].className = 'down';
        }
    }


}

