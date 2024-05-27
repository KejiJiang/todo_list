// 1. 使用Express开发一个HTTP服务器，实现5个API：获取todo列表、获取单个todo详情、新增单个todo、删除单个todo、更新单个todo
// 2. 所有接口使用MySQL或者MongoDB实现数据持久化（使用node-mysql或node-mongo连接数据库）
// 3. Postman中添加上述5个API的测试，并添加到一个Collection中

const express = require('express');
const mysql = require('mysql');
var bodyParser = require('body-parser');
const crypto = require('crypto');
const redis = require('redis');
const axios = require('axios');
const SessionStorage = require('node-sessionstorage').sessionStorage;


const connection = mysql.createConnection({
  host: '127.0.0.1',
  port: '3306',
  user: 'root',
  password: 'yoursqlsecret',
  database: 'todo'
})

connection.connect(err => {
  if (err) {
    console.error('failed to connect to database, error: ', err)
    process.exit(1)
  }
})

const app = express()
app.use(express.json())
app.use(express.static("./"))
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

const redisClient = redis.createClient(6379, '127.0.0.1',)
redisClient.on('error', err => {
  console.log(err)
})

//登录功能
app.get('/login', function (req, res) {
  const thisaccount = req.query.account
  const thispassword = req.query.password
  const sql1 = "SELECT * FROM user_tbl WHERE user_name='" + thisaccount + "' AND user_key='" + thispassword + "';"
  var newname = '';
  for (var i = 0; i < thisaccount.length; i++) {
    var o = String(thisaccount[i]);
    newname += String.fromCharCode(o.charCodeAt() + 49);
  }
  connection.query(sql1, (err, result) => {
    if (result.length == 0) {
      res.status(500).json("用户名或密码错误")
    }
    else {//查到该记录，登陆成功
      res.status(200).json({ account: thisaccount })
    }
  })
})

//发送验证码功能
app.get('/getvcode', function (req, res) {
  var vnew = ""
  for (var i = 0; i < 4; i++) {
    var num = Math.round(Math.random() * 9);
    vnew += num;
  }
  console.log(vnew);
  redisClient.set('vcodenow', vnew, redis.print);
  setTimeout(() => {
    redisClient.del('vcodenow')
  }, 300000);
  return res.status(200).json(vnew);
})

//注册
app.post('/register', function (req, res) {
  const newphone = req.body.phone
  const newkey = req.body.password
  var vcode = req.body.vcode
  var vnow;
  redisClient.get('vcodenow', function (err, key) {
    vnow = key;
    if (vnow === null) {
      return res.status(500).json("验证码失效")
    } else if (vnow != vcode) {
      return res.status(500).json("验证码错误")
    }
    var newname = '';
    for (var i = 0; i < newphone.length; i++) {
      var o = String(newphone[i]);
      newname += String.fromCharCode(o.charCodeAt() + 49);
    }
    const sql1 = "INSERT INTO user_tbl ( user_name,user_key ) VALUES ( '" + newphone + "', '" + newkey + "');"
    const sql2 = "CREATE TABLE `" + newname + "_tbl`(`todo_id` INT UNSIGNED AUTO_INCREMENT,`todo_thing` VARCHAR(100) NOT NULL,`todo_status` VARCHAR(50) NOT NULL,`submission_date` DATE,PRIMARY KEY (`todo_id`))ENGINE=InnoDB DEFAULT CHARSET=utf8;"
    const sql3 = "use todo;"
    connection.query(sql3, (err, result) => {
      if (err) {
        return res.status(500).json("创建用户失败")
      }
    })
    connection.query(sql2, (err, result) => {
      if (err) {
        console.log(sql2);
        return res.status(500).json("用户已注册")
      }
    })
    connection.query(sql1, (err, result) => {
      if (err) {
        return res.status(500).json("创建用户失败")
      }
      res.status(200).json({
        status: 'success',
        data:newphone,
      })
    })
  });
})

// 获取todo列表
app.get('/get', function (req, res) {
  var info = req.query.session;
  var newname = '';
  for (var i = 0; i < info.length; i++) {
    var o = String(info[i]);
    newname += String.fromCharCode(o.charCodeAt() + 49);
  }
  const sql = 'select * from ' + newname + '_tbl ORDER BY submission_date ASC'
  connection.query(sql, (err, result) => {
    if (err) {
      return res.status(500).json({ msg: err })
    }
    res.setHeader('Content-Type', 'text/html; charset=utf-8')
    res.status(200).json(result);
  })
})

// 获取单个todo详情
app.get('/GET/todolist/:id', function (req, res) {
  var thing = req.query.thing;
  if (!thing) {
    return res.status(400).json("输入事项不能为空");
  }
  const sql = 'SELECT * FROM todo_tbl WHERE todo_thing=' + "'" + thing + "';"
  connection.query(sql, (err, result) => {
    if (err) {
      return res.status(500).json("数据库内部错误");
    }
    if (result.length <= 0) {
      return res.status(500).json("查询不到该数据");
    } else {
      res.status(200).json(result);
    }
  })
})

// 新增单个todo
app.post('/POST/todolist', function (req, res) {
  var thing = req.body.thing;
  var time = req.body.time;
  var info = req.body.session;
  var newname = '';
  for (var i = 0; i < info.length; i++) {
    var o = String(info[i]);
    newname += String.fromCharCode(o.charCodeAt() + 49);
  }
  if (!thing) {
    return res.status(400).json("输入不能为空");
  }
  if (!time) {
    return res.status(400).json("时间不能为空");
  }
  const sql = 'INSERT INTO ' + newname + '_tbl (todo_thing,todo_status,submission_date) VALUES ("' + thing + '","undone","' + time + '");'
  connection.query(sql, (err, result) => {
    if (err) {
      return res.status(500).json({ msg: err })
    }
    res.status(201).json({ id: result.insertId, thing: result.thing, time: result.time })
  })
})


// 更新单个todo
app.put('/PUT/todolist', function (req, res) {
  var id = req.body.id;
  var thing = req.body.thing;
  var date = req.body.date;
  var info=req.body.session;
  var newname = '';
  for (var i = 0; i < info.length; i++) {
    var o = String(info[i]);
    newname += String.fromCharCode(o.charCodeAt() + 49);
  }
  if (!id) {
    return res.status(400).json("内部id置空");
  }
  if (!thing) {
    return res.status(400).json("不能修改为空");
  }
  let sql = "UPDATE "+newname+"_tbl SET todo_thing=" + "'" + thing + "'" + " WHERE todo_id=" + id;
  connection.query(sql, (err, result) => {
    if (err) {
      return res.status(500).json("数据库内部错误！");
    }
    res.status(201).json({ id: id, thing: thing, date: date });
  })
})


//完成todo事项
app.put('/finish/todolist', function (req, res) {
  var info=req.body.session
  var id = req.body.id
  var newname = '';
  for (var i = 0; i < info.length; i++) {
    var o = String(info[i]);
    newname += String.fromCharCode(o.charCodeAt() + 49);
  }
  if (!id) {
    return res.status(400).json({ msg: "invalid parameters" })
  }
  let sql = 'UPDATE '+newname+'_tbl SET todo_status="done" WHERE todo_id=' + id + ';';

  connection.query(sql, (err, result) => {
    if (err) {
      return res.status(500).json({ msg: err })
    }
    res.status(201).end()
  })
})

// 删除单个todo
app.delete('/DELETE/todolist', function (req, res) {
  var info=req.body.session
  var id = req.body.id
  var newname = '';
  for (var i = 0; i < info.length; i++) {
    var o = String(info[i]);
    newname += String.fromCharCode(o.charCodeAt() + 49);
  }
  if (!id) {
    return res.status(400).json({ msg: "invalid parameters" })
  }
  const sql = 'DELETE FROM '+newname+'_tbl WHERE todo_id=' + id + ';'
  connection.query(sql, (err, result) => {
    if (err) {
      res.status(500).send({ msg: err })
    } else {
      res.status(204).end();
    }
  })
})


// 删除所有todo
app.delete('/DELETEALL', function (req, res) {
  var info=req.body.session
  var newname = '';
  for (var i = 0; i < info.length; i++) {
    var o = String(info[i]);
    newname += String.fromCharCode(o.charCodeAt() + 49);
  }
  const sql = 'truncate table '+newname+'_tbl;'
  connection.query(sql, (err, result) => {
    if (err) {
      res.status(500).send({ msg: err })
    } else {
      res.status(204).json({ id: result.insertId, thing: result.thing, time: result.time })
    }
  })
})


const server = app.listen(8888, 'localhost', function () {
  const host = server.address().address
  const port = server.address().port
  console.log("Running server at http://%s:%s", host, port)
})