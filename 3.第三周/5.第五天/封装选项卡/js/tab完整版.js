/**
 * changeTab：封装的一个简单版本的选项卡操作库，以后只要把对应的容器传递给这个方法，就可以让这个容器中实现选项卡切换的效果
 * @parameter
 *      box：当前需要实现选项卡效果的容器
 *      previousIndex：默认选中也页卡对应的索引，不传递的话，默认为0
 *
 *
 * 使用此方法需要保证选项卡的主体机构一致
 * <div class='box'>
 *     <ul>
 *         <li class='select'></li>
 *         <li></li>
 *         ...
 *     </ul>
 *     <div class='content select'></div>
 *     <div class='content'></div>
 *     <div class='content'></div>
 *     ...
 * </div>
 *
 */
function changeTab(box, preIndex) {
    var firstItem = utils.firstChild(box),
        itemList = utils.children(firstItem, 'li'),
        contentList = utils.getByClass('content', box);

    //->在HTML结构中，我们不用加select样式，统一在js中根据初始值进行设置即可（不管HTML中是否设置了选中样式，都是按照传递进来的索引作为唯一标准）
    preIndex = preIndex || 0;
    for (var i = 0; i < itemList.length; i++) {
        var curLi = itemList[i],
            curDiv = contentList[i];
        if (i === preIndex) {
            utils.addClass(curLi, 'select');
            utils.addClass(curDiv, 'select');
        } else {
            utils.removeClass(curLi, 'select');
            utils.removeClass(curDiv, 'select');
        }
    }

    //->绑定点击事件，当点击li的时候，实现选项卡的切换
    for (var j = 0; j < itemList.length; j++) {
        itemList[j]['data-index'] = j;
        itemList[j].onclick = function () {
            //->移除上一次的
            utils.removeClass(itemList[preIndex], 'select');
            utils.removeClass(contentList[preIndex], 'select');
            //->选中当前点击的
            var dataIndex = this['data-index'];
            utils.addClass(itemList[dataIndex], 'select');
            utils.addClass(contentList[dataIndex], 'select');
            //->更新更新上一次选中的索引：当前点击的是下一次点击的上一次
            preIndex = dataIndex;
        }
    }
}

//->调用实现即可
// changeTab(document.getElementById('box1'));
// changeTab(document.getElementById('box2'),2);


var boxList = utils.getByClass('box');
for (var i = 0; i < boxList.length; i++) {
    changeTab(boxList[i]);
}











/*
 * 点击的时候怎么实现：
 *   思想一：
 *       先清空所有li和div的的选中样式，然后再让当前点击的有选中样式
 *   思想二：
 *       每一次点击结束都记住当前点击的是哪一个，下一次再点击的时候，把上一次记住的那个清除选中样式，再让当前点击的有选中的样式(同样别忘记记录最新点击的是哪一个，方便下一次点击的时候清除)
 *   思想三：
 *       让当前点击的有选中样式，让其兄弟们移除选中样式；div的操作也可以这样处理
 *
 * */

