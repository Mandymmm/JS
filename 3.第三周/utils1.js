/*
 * 字符串中有一个方法:trim/trimLeft/trimRight,它的意思是去除字符串的首尾空格,但是此方法不兼容,如果让你去写,如何处理兼容
 */

String.prototype.myTrim = function myTrim() {
    if ('trim' in String.prototype) {
        return this.trim();
    }
    return this.replace(/^ +| +$/g, '');
};


var utils = function () {

    /**
     * [likeArray 类数组转化为数组]
     * @param  {[object]} list [要转化的类数组]
     * @return [Array]        [转化后的新数组]
     */
    function likeArray(list) {
        try { // 方案一
            return [].slice.call(list, 0); // 不兼容（ie8- 元素集合和节点集合） 利用call方法改变slice中的this
        } catch (e) { // 方案二 兼容写法
            var arr = [];
            for (var i = 0; i < list.length; i++) { // 将类数组中的每一项 取出来依次放到 arr这个数组里面
                arr.push(list[i]);
            }
            return arr;
        }
    }

    /**
     * [toJson 将JSON字符串转换为JSON对象]
     * @return [object] [JSON对象]
     */
    function toJson(jsonStr) {
        return "JSON" in window ? JSON.parse(jsonStr) : eval('(' + jsonStr + ')');
    }

    /**
     *   获取document文档的一些盒模型样式属性值 获取或设置
     * @param attr 设置属性 （只有一个参数是获取）
     * @param val  设置的属性值
     * @returns {val}
     */
    function win(attr, val) {
        if (typeof val === 'undefined') { // 如果第二个参数没传就是获取值
            return document.documentElement[attr] || document.body[attr];
        }
        // 否则就是 设置值
        document.documentElement[attr] = val;
        document.body[attr] = val;
    }


    /*
     * 思想：在自身偏移的基础上+父级参照物的偏移和边框 => 如果没有到body，再把父级参照物当做当前自身，依然累加父级参照物的父级参照物的边框和偏移...
     * IE8: 在标准的IE8浏览器中，元素距离父级参照物的偏移 ： 当前元素外边框开始 到父级参照物的外边框，
     *      而其他的浏览器都是到父级参照物的内边框，也就是IE8下，获取的偏移已经包含了父级参照物的边框了
     * */

    /*
     * navigator.userAgent 获取浏览器的版本信息 得到的是一个字符串
     * */

    /**
     * offset : 模拟JQ中的offset方法，获取当前元素的距离body的上偏移和左偏移
     * @param curEle 当前元素
     * @returns {{left: (number|Number), top: (Number|number)}}
     */
    function offset(curEle) {
        var l = curEle.offsetLeft,
            t = curEle.offsetTop,
            p = curEle.offsetParent;
        while (p) {
            if (navigator.userAgent.indexOf('MSIE 8.0') === -1) { //IE8下不需要额外的去加边框,只有非IE8浏览器才需要加边框

                l += p.clientLeft;
                l += p.clientTop;
            }
            l += p.offsetLeft;
            t += p.offsetTop;
            p = p.offsetParent;
        }
        return {left: l, top: t}
    }


    /**
     * getCss：获取当前元素所有经过浏览器计算的样式(兼容全部的浏览器)
     * @param curEle 当前要操作的元素
     * @param attr 当前要获取的样式属性名（传的是字符串-> 比如 'padding'）
     * @return 获取的样式属性值
     */
    /*
     * 1.获取的结果去掉单位：(JQ是没有去单位的)
     *    ->只有“数字+单位”这种情况才进行处理，对于没有单位的或者是复合样式值的再或者是英文单词这种值，都不需要进行处理
     * 2.处理透明度 的正则：
     *    ->数字部分的规则：0-100之间 整数或小数
     *      -> 0-100 :0-99 | 100
     *        -> 0-99: /((\d)|([1-9]\d))(\.\d+)?/
     *   reg=/^alpha\(opacity=(((\d)|([1-9]\d))(\.\d+)?)|100\)$/;
     * */
    function getCss(curEle, attr) {
        var result = null,
            reg = null;
        if ('getComputedStyle' in window) {
            result = window.getComputedStyle(curEle, null)[attr];// window.getComputedStyle得到的是一个对象数据类型 只能用[attr]的方式来获取变量attr的属性值，而不能用.attr 因为传递进来的参数是字符串的格式 而不是传的变量
        } else {
            //->如果我们的attr传递的是opacity说明我们想获取元素的透明度，但是在IE低版本浏览器中，通过opacity获取不到，我们需要通过filter来获取，然而我们通过滤镜filter获取的结果和opacity获取的结果还是不一样的：alpha(opacity=30) / 0.3
            if (attr === 'opacity') {
                result = curEle.currentStyle['filter'];
                reg = /^alpha\(opacity=(.+)\)$/;//只捕获 等号和 ) 之间的字符
                result = reg.test(result) ? (reg.exec(result)[1] )/ 100 : 1;
            }
            result = curEle.currentStyle[attr];
        }
        //->把获取的结果去掉单位 => 方便后续的数学运算
        reg = /^-?(\d|([1-9]\d+))(\.\d+)?(px|em|rem|pt)?$/;

        return reg.test(result) ? parseFloat(result) : result;
    }


    /*
     * Error：
     *   ReferenceError 引用错误
     *   TypeError  类型错误
     *   SyntaxError  语法错误
     *   RangeError  范围错误 超出范围
     *   ...
     * */

    /**
     * setCss：设置元素某一个样式属性的值 (原理：设置当前元素的行内样式)
     * @param curEle 当前要操作的元素
     * @param attr  当前要设置的属性名
     * @param value
     */
    function setCss(curEle, attr, value) {
        //->当传递的实参不符合规范的时候，我们进行容错处理或者给予相关的默认值
        if (arguments.length < 3) { //如果传递的参数不是3个 则不符合规范 直接返回
            // throw new Error('参数不合法'); // 创建一个Error的实例  异常抛出
            return;
        }
        //->对于opacity的处理
        if (attr === 'opacity') {
            curEle['style']['opacity'] = value;
            curEle['style']['filter'] = 'alpha(opacity=' + value * 100 + ')';
            return;
        }

        //->对于float的处理
        if (attr === 'float') {
            curEle['style']['cssFloat'] = value; // 老版本 ff
            curEle['style']['styleFloat'] = value; // ie 低版本
            return;
        }

        //->对于某些样式属性，如果你传递的值没有加单位，我们可以自动给补充单位(px)，但是不是所有的都需要补充，例如：border、float、zIndex、opacity... margin不补，但是可以给marginLeft补充单位
        var reg = /^(width|height|((margin|padding)?(top|left|right|bottom))|fontsize)$/i;
        if (reg.test(attr)) {
            //-> 传递这些属性也不一定要加单位，主要看用户是否传递单位了，没有传再加单位
            //-> 使用isNaN检测是否为有效数字，是有效数字说明没加单位，需要加
            if (!isNaN(value)) {
                value = value + 'px';
            }
        }
        curEle['style'][attr] = value;
    }


    /**
     * setGroupCss：批量设置元素的css样式
     * @param curEle 当前要操作的元素
     * @param options  当前要设置的样式属性集合(对象) {top:xxx,left:xxx}
     * 原理：获取传递的属性集合，然后进行遍历循环，调取setCss方法依次设置即可
     */
    function setGroupCss(curEle, options) {
        if (typeof options !== 'object') return;
        for (var attr in options) {
            if (options.hasOwnProperty(attr)) {
                setCss(curEle, attr, options[attr]);
            }
        }
    }


    /**
     * css：把getCss/setCss/setGroupCss进行汇总，可以实现设置、摄取和批量设置的功能 => JQ中的css方法也是这样处理的
     */
    function css() {
        var len = arguments.length,
            curEle = arguments[0],
            attr = null,
            options = null,
            value = null;
        if (len === 3) {
            attr = arguments[1];
            value = arguments[2];
            setCss(curEle, attr, value);
            return;
        }
        if (len === 2 && typeof arguments[1] === 'object') {
            options = arguments[1];
            setGroupCss(curEle, options);
            return;
        }
        attr = arguments[1];
        return getCss(curEle, attr);
    }


    /*
     * 使用字面量方式创建的正则，在两个斜杠之间包含起来的都是元字符，没有字符串拼接或者变量这一说
     *
     * 现在的需求：把strClass变量存储的值作为正则的一部分，这种情况下只能使用实例创建的方式
     *       new RegExp('[元字符部分]',[修饰符部分])  --> new RegExp('(^|\\s+)'+strClass+'(\\s+|$)','i')
     *     ===> 使用实例创建方式创建的正则，当遇到\xxx的情况的时候，都需要在\之前再加一个\  --> 如果不加的话，默认出现的斜杠仅仅被作为了无意义的字符串，再加一个斜杠，才相当于让其变为转义字符
     * */

    /*
     * 检测当前循环的这个标签对应的样式类名是否包含我们传递进来的这个样式类名，包含当前元素就是我们想要的，反之则不是
     *      ->strClass:'w1'
     *      ->curName.indexOf(strClass)>-1： 这样检测不行，indexOf是只要包含这些字符即可，例如：当前元素的样式类名是'w11'，我们传递进来的是'w1'，按照原理应该属于不匹配的，但是使用indexOf检测的结果说明是属于符合的
     * */

    /**
     * getByClass：处理getElementsByClassName的兼容性，通过样式类名来获取一组元素(元素集合 => HTMLCollection)
     * 1.我们只要把样式类名一传，会在当前区域中进行查找，把拥有这个样式类名的元素都获取到(元素可能拥有多个样式类，只要其中包含我们的这个，就属于我们想要获取的)
     * 2.getElementsByClassName('w1 w2') 这句话的意思是需要同时拥有w1和w2样式类名的元素才符合我们的要求，传递参数的顺序以及元素本身样式类名的顺序不受到影响
     * 3.如果没有找到符合的，返回的是空数组
     *
     * @param strClass [string] 需要操作的样式类名，例如：'w1' 'w2 w1' ...
     * @param context [HTML Object] 获取的上下文，获取元素的一个范围，不写默认是document 即在整个文档中进行获取
     */
    function getByClass(strClass, context) {
        // if (typeof context === 'undefined') context = document;
        context = context || document;// 设置默认值
        if ('getElementsByClassName' in document) {
            //->标准浏览器下：直接使用内置的实现
            return likeArray(context.getElementsByClassName(strClass));//->此时返回的是类数组 要转化为数组
        }
        //->ie6-8：自己写代码实现
        var ary = [],
            allNode = context.getElementsByTagName('*');
        for (var i = 0, len = allNode.length; i < len; i++) {
            var curNode = allNode[i],
                curName = curNode.className;//->每一次循环，当前标签所有的样式类名，例如：'w2 w1 w3'
            //->检测当前循环的这个标签对应的样式类名是否包含我们传递进来的这个样式类名，包含当前元素就是我们想要的，反之则不是
            var reg = new RegExp('(^|\\s+)' + strClass + '(\\s+|$)');// 正则也可以这样写：reg = new RegExp('\\b' + curClass + '\\b');
            if (reg.test(curName)) {
                ary.push(curNode)
            }
        }
        return ary;
    }


    /*
     * 传递的strClass包含多个样式类名
     *
     * 处理多个： 首先把传递进来的样式(多个)拆成一个个的，然后一个个的依次去和元素的样式类名比较，看是否包含；第一个去比较发现包含，则继续验证第二个... 直到都包含，说明当前的元素就是我们想要的，只要有一个不包含就不是想要的
     * */

    //法一：
    function getByClass(strClass, context) {
        context = context || document;// 设置默认值
        if ('getElementsByClassName' in document) {
            return likeArray(context.getElementsByClassName(strClass));//->此时返回的是类数组 要转化为数组
        }
        //->ie6-8：自己写代码实现
        // strClass:'w1 w3'  ->元素：'w1 w3 w2'   ->元素：'w1 w2'
        var allNode = likeArray(context.getElementsByTagName('*')),
            classList = strClass.replace(/^ +| +$/g, '').split(/ +/g);
        for (var i = 0; i < classList.length; i++) {
            var curClass = classList[i];

            for (var j = 0; j < allNode.length; j++) {
                var curNode = allNode[j],
                    curName = curNode.className,
                    reg = new RegExp('\\b' + curClass + '\\b');
                if (!reg.test(curName)) {
                    allNode.splice(j, 1);
                    j--;
                }
            }
        }
        return allNode;
    }


    //法二：
    function getByClass(strClass,context) {
        context = context || document;
        if ('getElementsByClassName' in document) {
            return likeArray(context.getElementsByClassName(strClass));//->得到的是类数组 转化为数组
        }
        //IE6-8
        var ary=[],
            allNode = context.getElementsByTagName('*');
        for (var i=0,len=allNode.length;i<len;i++) {
            var cur = allNode[i],
                curName = cur.className;//-> 每一次循环当前标签的所有的样式类名，例如：'w2 w1 w3'
            //->检测当前循环的这个标签对应的样式类名中是否包含我们传递进来的这个样式类名，包含当前元素就是我们想要的，反之则不是
            var reg=new RegExp('(^| +)'+strClass+'( +|$)');
            if (reg.test(curName)) {
                ary.push(cur);
            }
        }
        return ary;
    }

    /*
     *
     * 1.先获取所有的元素子节点
     *   -> 思路：先获取当前容器下的所有子节点，然后循环进行筛选，筛选出nodeType===1的，这些就是元素子节点，把这些存放在一个数组容器中
     * 2.如果传递了标签名，再进行二次过滤
     *   -> 思路：如果传递了tagName，我们循环上一步获取到的元素子节点，找到标签名和传递进来的tagName相同的那一项，然后存储起来（也可以找到不同的，把不一样的去掉）
     * */

    /**
     * children：获取当前容器(元素)所有的元素子节点(在所有的子代元素中进行筛选)，
     *          而且可以指定具体的标签名：假设传递了一个叫做div的标签名，就是先获取所有的子代元素标签，然后再把叫做div的筛选出来 => JQ的children也是这个意思，只是不仅仅支持标签名的筛选，还可以支持样式类名等更复杂的筛选
     *
     * @parameter
     *      curEle：当前需要操作的元素(容器)
     *      tagName：[string] 进行二次筛选的标签名
     *
     * @return
     *      [array] 获取到的元素集合
     *
     */
    function children(curEle, tagName) {
        var allNodes = curEle.childNodes,
            elementAry = [];
        for (var i = 0; i < allNodes.length; i++) {
            var curNode = allNodes[i];
            if (curNode.nodeType === 1) {//->证明它是元素了
                var curNodeTag = curNode.tagName.toUpperCase();
                if (typeof tagName !== 'undefined') {
                    tagName = tagName.toUpperCase();
                    if (curNodeTag === tagName) {
                        elementAry[elementAry.length] = curNode;
                        continue;
                    }
                }
                elementAry[elementAry.length] = curNode;
            }
        }
        return elementAry;
    }


    /**
     * hasClass：验证当前元素的样式类名中是否包含传递的这个样式类
     * @param curEle 当前需要操作的元素
     * @param strClass [string]需要检测的样式类名
     * @return
     *      true / false
     */
    function hasClass(curEle, strClass) {
        return new RegExp('\\b' + strClass + '\\b').test(curEle.className);
    }


    /*
     * 去除传递样式类名的首尾空格并且以空格为分隔符分成数组的每一项   '  w1   w2  '->'w1','w2'
     *
     * 在增加之前，首先判断新增加的样式类名是否已经存在，不存在再增加，存在就不增加了 => 需要把传递进来的多个样式类名拆分成一个个的，然后一个个的判断增加
     * */

    /**
     * addClass：给元素增加样式类名
     *
     * @parameter
     *      curEle：当前需要操作的元素
     *      strClass：[string]需要增加的样式类名 'w1'、'w1 w2' ...
     */
    function addClass(curEle, strClass) {
        var classList = strClass.myTrim().split(/ +/);
        for (var i = 0, len = classList.length; i < len; i++) {
            var curClass = classList[i];
            !hasClass(curEle, curClass) ? curEle.className += ' ' + strClass : null;
        }
        curEle.className = curEle.className.myTrim().replace(/ +/g, ' ');// 仅仅是为了保证元素的样式类集合规范一些：首尾空格去掉，类名中间只需要一个空格隔开即可
    }


    /**
     * removeClass：给元素删除样式类名
     *
     * @parameter
     *      curEle：当前需要操作的元素
     *      strClass：[string]需要移除的样式类名 'w1'、'w1 w2' ...
     */
    function removeClass(curEle, strClass) {
        var classList = strClass.myTrim().split(/ +/);
        for (var i = 0, len = classList.length; i < len; i++) {
            var curClass = classList[i],
                reg = new RegExp('\\b' + curClass + '\\b', 'g');//->当前元素原有的样式类名中可能出现样式名重复的情况，所以我们的替换需要全局匹配替换
            if (hasClass(curEle, curClass)) {
                curEle.className = curEle.className.replace(reg, '');
            }
        }
        curEle.className = curEle.className.myTrim().replace(/ +/g, ' ');// 仅仅是为了保证元素的样式类集合规范一些：首尾空格去掉，类名中间只需要一个空格隔开即可
    }


    /**
     * toggleClass：如果当前的样式类名在元素中存在我们就移除，不存在就增加
     *
     * @parameter
     *      curEle：当前需要操作的元素
     *      strClass：[string]样式类名 'w1'、'w1 w2' ...
     */
    function toggleClass(curEle, strClass) {
        var classList = strClass.myTrim().split(/ +/);
        for (var i = 0, len = classList.length; i < len; i++) {
            var curClass = classList[i];
            hasClass(curEle, curClass) ? removeClass(curEle, curClass) : addClass(curEle, curClass);
        }
    }


    /**
     * prev：获取上一个哥哥元素节点
     * @parameter
     *      curEle：当前需要操作的元素
     * @return
     *      存在返回哥哥元素节点，不存在返回null
     */
    function prev(curEle) {
        if ('previousElementSibling' in curEle) {
            return curEle.previousElementSibling;
        }
        var p = curEle.previousSibling;
        while (p && p.nodeType !== 1) {
            p = p.previousSibling
        }
        return p;
    }


    /**
     * prevAll：获取所有的哥哥元素节点
     * @parameter
     *      curEle：当前需要操作的元素
     * @return
     *      数组集合
     */
    function prevAll(curEle) {
        var ary = [],
            p = prev(curEle);
        while (p) {
            ary.unshift(p);
            p = prev(p);
        }
        return ary;
    }


    /**
     * next：获取下一个弟弟元素节点
     * @parameter
     *      curEle：当前需要操作的元素
     * @return
     *      存在返回弟弟元素节点，不存在返回null
     */
    function next(curEle) {
        if ('nextElementSibling' in curEle) {
            return curEle.nextElementSibling;
        }
        var n = curEle.nextSibling;
        while (n && n.nodeType !== 1) {
            n = n.nextSibling
        }
        return n;
    }


    /**
     * nextAll：获取所有的弟弟元素节点
     * @parameter
     *      curEle：当前需要操作的元素
     * @return
     *      数组集合
     */
    function nextAll(curEle) {
        var ary = [],
            n = next(curEle);
        while (n) {
            ary.push(n);
            n = next(n);
        }
        return ary;
    }


    /**
     * siblings：获取所有的兄弟元素节点
     *
     * @parameter
     *      curEle：当前需要操作的元素
     * @return
     *      数组集合
     */
    function siblings(curEle) {
        return prevAll(curEle).concat(nextAll(curEle));
    }


    /**
     * index：获取当前元素的索引
     *
     * @parameter
     *      curEle：当前需要操作的元素
     * @return
     *      元素索引(数字)
     */
    function index(curEle) {
        return prevAll(curEle).length;//->有几个哥哥元素节点索引就是几
    }


    /**
     * firstChild：获取容器中的第一个子元素
     *
     * @parameter
     *      curEle：当前需要操作的元素
     * @return
     *      第一个子元素或者null
     */
    function firstChild(curEle) {
        if ('firstElementChild' in curEle) {
            return curEle.firstElementChild;
        }
        var first = curEle.firstChild;
        while (first && first.nodeType !== 1) {
            first = first.nextSibling;
        }
        return first;
    }


    /**
     * prepend：把新的元素添加到指定容器开始位置  和原生JS中的appendChild相反
     *
     * @parameter
     *      newEle： 新增加的元素
     *      container： 指定的容器
     */
    function prepend(newEle, container) {
        var first = firstChild(container);
        if (first) {
            container.insertBefore(newEle, first);
            return;
        }
        container.appendChild(newEle);
    }


    /**
     * insertAfter：把新元素添加到老元素的后面，JQ中有这个方法，JQ中还有一个方法insertBefore：添加到老元素的前面，等价于JS中的insertBefore
     * @param newEle 新增的元素
     * @param oldEle 原有的元素
     */
    function insertAfter(newEle, oldEle) {
        var n = next(oldEle),
            p = oldEle.parentNode;
        if (n) {
            p.insertBefore(newEle, n);
            return;
        }
        p.appendChild(newEle);
    }


    return {
        likeArray: likeArray,// JQ中没有
        toJson: toJson,
        win: win,
        offset: offset,
        css: css,
        getByClass: getByClass,// JQ中没有
        children: children,
        hasClass: hasClass,
        addClass: addClass,
        removeClass: removeClass,
        toggleClass: toggleClass,
        prev: prev,
        prevAll: prevAll,
        next: next,
        nextAll: nextAll,
        siblings: siblings,
        index: index
    }


}
();




