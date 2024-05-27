var count=0;
function login() {
    var account = document.getElementById('ii11');
    var password = document.getElementById('ii22');
    if (account.value === '') {
        alert('输入不能为空');
        return
    }
    if (password.value === '') {
        alert('密码不能为空');
        return
    }
    //从后端传入count（密码输入错误次数）
    if (count >= 5) {
        count=0;
        showpicture();
    }

    if (document.getElementById("text").style.display == "none") {
        var val = document.getElementById("text").value;
        var num = show_num.join("");
        if (val === '') {
            alert('请输入验证码！');
        } else if (val === num) {
            $.ajax({
                url: "http://127.0.0.1:8888/login",
                type: "GET",
                dataTypes: "json",
                data: {
                    "account": account.value,
                    "password": password.value,
                },
                success: function (res) {
                    window.location.href = "todo.html";
                    var info = document.getElementById('input1');
                    info = res.account;
                    console.log(res);
                },
                error: function (res) {
                    count++;
                    alert(res.responseText);
                }
            })
            document.getElementById(".input-val").val('');
            draw(show_num);

        } else {
            alert('验证码错误！');
            document.getElementById("text").value = '';
            draw(show_num);
        }
    }
    else {
        $.ajax({
            url: "http://127.0.0.1:8888/login",
            type: "GET",
            dataTypes: "json",
            data: {
                "account": account.value,
                "password": password.value,
            },
            success: function (res) {
                window.location.href = "todo.html";
                sessionStorage.setItem('uid', res.account);
            },
            error: function (res) {
                count++;
                alert(res.responseText);
            }
        })
    }
}
var show_num = [];
draw(show_num);

function dj() {
    draw(show_num);
}
function draw(show_num) {
    var canvas_width = document.getElementById('canvas').clientWidth;
    var canvas_height = document.getElementById('canvas').clientHeight;
    var canvas = document.getElementById("canvas"); //获取到canvas的对象，演员
    var context = canvas.getContext("2d"); //获取到canvas画图的环境，演员表演的舞台
    canvas.width = canvas_width;
    canvas.height = canvas_height;
    var sCode =
        "A,B,C,E,F,G,H,J,K,L,M,N,P,Q,R,S,T,W,X,Y,Z,1,2,3,4,5,6,7,8,9,0,q,w,e,r,t,y,u,i,o,p,a,s,d,f,g,h,j,k,l,z,x,c,v,b,n,m";
    var aCode = sCode.split(",");
    var aLength = aCode.length; //获取到数组的长度

    for (var i = 0; i <= 3; i++) {
        var j = Math.floor(Math.random() * aLength); //获取到随机的索引值
        var deg = Math.random() * 30 * Math.PI / 180; //产生0~30之间的随机弧度
        var txt = aCode[j]; //得到随机的一个内容
        show_num[i] = txt;
        var x = 10 + i * 20; //文字在canvas上的x坐标
        var y = 20 + Math.random() * 8; //文字在canvas上的y坐标
        context.font = "bold 23px 微软雅黑";

        context.translate(x, y);
        context.rotate(deg);

        context.fillStyle = randomColor();
        context.fillText(txt, 0, 0);

        context.rotate(-deg);
        context.translate(-x, -y);
    }
    for (var i = 0; i <= 5; i++) { //验证码上显示线条
        context.strokeStyle = randomColor();
        context.beginPath();
        context.moveTo(Math.random() * canvas_width, Math.random() * canvas_height);
        context.lineTo(Math.random() * canvas_width, Math.random() * canvas_height);
        context.stroke();
    }
    for (var i = 0; i <= 30; i++) { //验证码上显示小点
        context.strokeStyle = randomColor();
        context.beginPath();
        var x = Math.random() * canvas_width;
        var y = Math.random() * canvas_height;
        context.moveTo(x, y);
        context.lineTo(x + 1, y + 1);
        context.stroke();
    }
}

function randomColor() { //得到随机的颜色值
    var r = Math.floor(Math.random() * 256);
    var g = Math.floor(Math.random() * 256);
    var b = Math.floor(Math.random() * 256);
    return "rgb(" + r + "," + g + "," + b + ")";
}
function showpicture() {
    // 将注册按钮与登录按钮由top300到top380
    document.getElementById("ii33").style.top = "380px";
    document.getElementById("ii44").style.top = "380px";
    document.getElementById("text").style.display = "inline"
    document.getElementById("canvas").style.display = "inline"
}
