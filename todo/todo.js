function adds(id) {
    var thing = document.getElementById('i1');
    var timeinput = document.getElementById('i12');
    var time = Date.parse(timeinput.value);
    var dates = timestampToTime(time);
    var ul1 = document.getElementById('u1');
    //先判断输入不能为空
    if (thing.value === '') {
        alert('输入不能为空');
        return
    }
    if (timeinput.value === '') {
        alert('时间不能为空');
        return
    }
    var li = document.createElement('li');//新建一个<li>
    li.id = 'li' + id;
    //往li里添加内容
    li.innerHTML = '<span>' + dates + '</span>&nbsp;&nbsp;&nbsp;&nbsp;' + '<span>' + thing.value + '</span>&nbsp;&nbsp;&nbsp;&nbsp;' +
        '<span><button class="b2" onclick="finish(' + id + ',' + "'" + dates + "'" + ',' + "'" + thing.value + "'" +
        ')">完成</button>&nbsp;&nbsp;&nbsp;&nbsp;<button class="b3" onclick="change(' + id + ',' + "'" + dates + "'" +
        ')">修改</button>&nbsp;&nbsp;&nbsp;&nbsp;<button class="b1" onclick="dele(' + id + ')">删除</button></span>';
    //判断后加入到ul1里面去
    ul1.appendChild(li);

    //输入完后将输入框的内容清空
    thing.value = '';
    return
}

//POST请求，添加一个todo事项，增
function add() {
    var thing = document.getElementById('i1');
    var timeinput = document.getElementById('i12');
    var storage=window.sessionStorage.getItem("uid");
    //POST请求
    $.ajax({
        url: "http://127.0.0.1:8888/POST/todolist",
        type: "POST",
        dataTypes: "json",
        data: {
            "thing": thing.value,
            "time": timeinput.value,
            "session":storage,
        },
        success: function (res) {
            adds(res.id);
            setTimeout(() => {
                alert("添加成功");
            }, 500);
        },
        error: function (err) {
            alert(err.responseText);
        }
    })
};



function gets(id, thing, status, time) {
    var ul1 = document.getElementById('u1');
    var ul2 = document.getElementById('u2');
    var times = Date.parse(time);
    var dates = timestampToTime(times);
    if (status === "undone") {
        var li = document.createElement('li');//新建一个<li>
        li.id = 'li' + id;
        //往li里添加内容
        li.innerHTML = '<span>' + dates + '</span>&nbsp;&nbsp;&nbsp;&nbsp;' + '<span>' + thing + '</span>&nbsp;&nbsp;&nbsp;&nbsp;' +
            '<span><button class="b2" onclick="finish(' + id + ',' + "'" + dates + "'" + ',' + "'" + thing + "'" +
            ')">完成</button>&nbsp;&nbsp;&nbsp;&nbsp;<button class="b3" onclick="change(' + id + ',' + "'" + dates + "'" +
            ')">修改</button>&nbsp;&nbsp;&nbsp;&nbsp;<button class="b1" onclick="dele(' + id + ')">删除</button></span>';
        ul1.appendChild(li);

        return
    } else {
        var li = document.createElement('li');//新建一个<li>
        li.id = 'li' + id;
        //往li里添加内容
        li.innerHTML = '<span>' + dates + '</span>&nbsp&nbsp&nbsp&nbsp' + '<span>' + thing + '</span>&nbsp&nbsp&nbsp&nbsp' +
            '<span><button class="b3" onclick="change(' + id + ',' + "'" + dates + "'" +
            ')">修改</button>&nbsp;&nbsp;&nbsp;&nbsp<button class="b1" onclick="dele(' + id + ')">删除</button></span>';
        ul2.appendChild(li);

        return
    }
}

//GET请求，获得todo列表
function get() {
    var ul1 = document.getElementById('u1');
    var ul2 = document.getElementById('u2');
    ul1.innerHTML = ("");
    ul2.innerHTML = ("");
    var storage=window.sessionStorage.getItem("uid");
    //获取列表get请求
    $.ajax({
        url: "http://127.0.0.1:8888/get",
        type: "GET",
        dataTypes: "json",
        data:{
            "session":storage,
        },
        success: function (res) {
            var obj = JSON.parse(res);//把返回的json字符串转化为对象
            for (var i = 0; i < obj.length; i++) {
                gets(obj[i].todo_id, obj[i].todo_thing, obj[i].todo_status, obj[i].submission_date);
            }
            setTimeout(() => {
                alert("获取成功");
            }, 500);
        },
        error: function (err) {
            console.log(err.responseText);
        }
    })
}


function deles(id) {
    var li = document.getElementById('li' + id);
    var ul1 = document.getElementById('u1');
    var ul2 = document.getElementById('u2');
    if (li.parentNode == ul1) {
        ul1.removeChild(li);
    } else {
        ul2.removeChild(li);
    }
}



//DELETE请求，删除某个特定事项
function dele(id) {
    var msg = "确定删除这个事项吗？";
    var storage=window.sessionStorage.getItem("uid");
    if (confirm(msg) == true) {
        //删除请求
        $.ajax({
            url: "http://127.0.0.1:8888/DELETE/todolist",
            type: "delete",
            dataTypes: "json",
            data: {
                "id": id,
                "session":storage,
            },
            success: function () {
                deles(id);
                setTimeout(() => {
                    alert("删除成功");
                }, 500);
            },
            error: function (err) {
                console.log(err.responseText);
            }
        })
    } else {
        return;
    }
};

//DELETE请求，删除所有todo事项
function deleall() {
    var ul1 = document.getElementById('u1');
    var ul2 = document.getElementById('u2');
    var storage=window.sessionStorage.getItem("uid");
    var msg = "您确定删除所有任务吗？"
    if (confirm(msg) == true) {
        $.ajax({
            url: "http://127.0.0.1:8888/DELETEALL",
            type: "delete",
            dataTypes: "json",
            data: {
                "session":storage,
            },
            success: function () {
                ul1.innerHTML = ('');
                ul2.innerHTML = ('');
                setTimeout(() => {
                    alert("删除成功");
                }, 500);
            },
            error: function (err) {
                console.log(err.responseText);
            }
        })
    } else {
        return
    }
}



function finishs(id, time, thing) {
    var ul1 = document.getElementById('u1');
    var ul2 = document.getElementById('u2');
    var li = document.getElementById('li' + id);
    ul1.removeChild(li);
    //删除完成那个按钮
    li.innerHTML = '<span>' + time + '</span>&nbsp&nbsp&nbsp&nbsp' + '<span>' + thing + '</span>&nbsp&nbsp&nbsp&nbsp' +
        '<span><button class="b3" onclick="change(' + id + ',' + "'" + time + "'" + 
        ')">修改</button>&nbsp;&nbsp;&nbsp;&nbsp;<button class="b1" onclick="dele(' + id + ')">删除</button></span>';
    ul2.appendChild(li);
}

//PUT请求，完成todo事项
function finish(id, time, thing) {
    var storage=window.sessionStorage.getItem("uid");
    $.ajax({
        url: "http://127.0.0.1:8888/finish/todolist",
        type: "PUT",
        dataTypes: "json",
        data: {
            "id": id,
            "session":storage,
        },
        success: function (res) {
            finishs(id, time, thing);
        },
        error: function (err) {
            console.log(err.responseText);
        }
    })
}

function sureinput(id, date) {
    var input = document.getElementById('text' + id);
    var text = input.value;
    changes(id, text, date);
}

function cancelinput(id, date) {
    var li = document.getElementById('li' + id);
    for (var i = 0; i < 6; i++) {
        li.removeChild(li.lastChild);
    }
}


function change(id, date) {
    var li = document.getElementById('li' + id);
    var btn = document.getElementById('cancel' + id);
    if (li.lastChild == btn) {
        return
    } else {
        var text = document.createElement('input');
        text.id = 'text' + id;
        text.style = "border-radius: 5px;"
        li.innerHTML += '<br>';
        li.appendChild(text);
        li.innerHTML += "&nbsp;&nbsp;&nbsp;&nbsp;<button class=" + '"' + "b4" + '"' + " id='sure" + id + "'" +
            " onclick=sureinput(" + id + ",'" + date + "'" + ")>确定</button>" + "&nbsp;&nbsp;&nbsp;&nbsp;<button class=" +
            '"' + "b5" + '"' + " id='cancel" + id + "'" + " onclick=cancelinput(" + id + ",'" + date + "'" + ")>取消</button>";
    }
}

//PUT请求，修改todo事项
function changes(id, thing, dates) {
    var storage=window.sessionStorage.getItem("uid");
    $.ajax({
        url: "http://127.0.0.1:8888/PUT/todolist",
        type: "PUT",
        dataTypes: "json",
        data: {
            "id": id,
            "thing": thing,
            "date": dates,
            "session":storage,
        },
        success: function (res) {
            var li = document.getElementById('li' + res.id);
            var ul1 = document.getElementById('u1');
            var date = res.date;
            var text = res.thing;
            if (li.parentNode === ul1) {
                li.innerHTML = '<span>' + date + '</span>&nbsp;&nbsp;&nbsp;&nbsp;' + '<span>' + text + 
                '</span>&nbsp;&nbsp;&nbsp;&nbsp;' + '<span><button class="b2" onclick="finish(' + id + ',' + "'" + date + "'" + 
                ',' + "'" + text + "'" +')">完成</button>&nbsp;&nbsp;&nbsp;&nbsp;<button class="b3" onclick="change(' + id + ',' + 
                "'" + date + "'" + ')">修改</button>&nbsp;&nbsp;&nbsp;&nbsp;<button class="b1" onclick="dele(' + id + 
                ')">删除</button></span>';
            } else {
                li.innerHTML = '<span>' + date + '</span>&nbsp&nbsp&nbsp&nbsp' + '<span>' + text + '</span>&nbsp&nbsp&nbsp&nbsp' +
                    '<span><button class="b3" onclick="change(' + id + ',' + "'" + date + "'" + 
                    ')">修改</button>&nbsp;&nbsp;&nbsp;&nbsp<button class="b1" onclick="dele(' + id + ')">删除</button></span>';
            }
        },
        error: function (err) {
            alert(err.responseText);
        }
    })
}


function find(id) {
    var li = document.getElementById('li' + id);
    var text=document.getElementById('i11');
    text.value='';
    li.style = "background:rgb(255,255,0)";
    setTimeout(() => {
        li.style = "background:none";
    }, 5000);
}

function search() {
    var input = document.getElementById("i11");
    var text = input.value;
    $.ajax({
        url: "http://127.0.0.1:8888/GET/todolist/:id",
        type: "GET",
        dataTypes: "json",
        data: {
            "thing": text,
        },
        success: function (res) {
            for (var i = 0; i < res.length; i++) {
                find(res[i].todo_id);
            }
        },
        error: function (err) {
            alert(err.responseText);
        }
    })
}


function timestampToTime(timestamp) {
    var date = new Date(timestamp);//时间戳为10位需*1000，时间戳为13位的话不需乘1000
    var Y = date.getFullYear() + '-';
    var M = (date.getMonth() + 1 < 10 ? '0' + (date.getMonth() + 1) : date.getMonth() + 1) + '-';
    var D = date.getDate();
    return Y + M + D;
}
