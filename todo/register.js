//const { json } = require("body-parser");
//const { response } = require("express");

var vc;
function register() {
    var phone = document.getElementById('r1');
    var vcode = document.getElementById('r2');
    var password = document.getElementById('r3');
    var repassword = document.getElementById('r4');
    if (phone.value === '') {
        alert('输入不能为空');
        return
    }
    if (vcode.value === '') {
        alert('验证码不能为空');
        return
    }
    if (vcode.value === vc) {
        alert('验证码错误');
        return
    }
    if (password.value === "") {
        alert("密码不能为空");
        return
    }
    if (password.length < 6) {
        alert("密码必须等于或大于6个字符");
        return
    }
    if (password.value !== repassword.value) {
        alert('两次密码输入不同')
        return
    }
    $.ajax({
        url: "http://127.0.0.1:8888/register",
        type: "POST",
        dataTypes: "json",
        data: {
            "phone": phone.value,
            "vcode": vcode.value,
            "password": password.value,
        },
        success: function (res) {
            alert("注册成功");
            window.location.href = "login.html";
        },
        error: function (res) {
            console.log(res);
            alert(res.responseText);
        }
    })
}
var isPhone = 1;
function getCode() {
    var phone = $('#r1').val();
    checkPhone(); //验证手机号码
    if (isPhone) {
        resetCode(); //倒计时
        $('#phone').focus();
        //请求后台获取数据
        $.ajax({
            url: "http://127.0.0.1:8888/getvcode",
            type: "GET",
            dataTypes: "json",
            data: {},
            success: function (res) {
                setTimeout(() => {
                    alert("发送验证码成功");
                }, 100);
            },
            error: function (err) {
                alert("发送验证码失败");
            }
        })
    }
}

//验证手机号码
function checkPhone() {
    var phone = $('#r1').val();
    var pattern = /^1(3[0-9]|4[01456879]|5[0-35-9]|6[2567]|7[0-8]|8[0-9]|9[0-35-9])\d{8}$/;
    isPhone = 1;
    if (phone == '') {
        alert('请输入手机号码');
        isPhone = 0;
        return;
    }
    if (!pattern.test(phone)) {
        alert('请输入正确的手机号码');
        isPhone = 0;
        return;
    }
}

//倒计时
function resetCode() {
    $('#r6').hide();
    $('#r6_1_second').html('60');
    $('#r6_1').show();
    var second = 60;
    var timer = null;
    timer = setInterval(function () {
        second -= 1;
        if (second > 0) {
            $('#r6_1_second').html(second);
        } else {
            clearInterval(timer);
            $('#r6').show();
            $('#r6_1').hide();
        }
    }, 1000);
}