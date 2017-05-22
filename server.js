//创建express应用
var express = require('express');
var sha1 = require("sha1");
var bodyParser = require('body-parser')
var path = require('path');
var fs = require('fs');
var datapath = "./data/answers2.json";


//分离初始化模块
var weibo = require('./init').weibo;
var wechat = require('./init').wechat;

var app = express();

app.use(express.static('static'));
app.use(bodyParser.json())
//注册引擎
app.set('view engine','html');
app.set('views',path.resolve('views'));
app.engine('html',require('ejs').__express);


//处理验签
app.get('/weibo', weibo);
app.get('/wechat',wechat);

//返回主页
app.get('/index',function(req,res){
    res.render('index');
})
//处理接口

app.get('/api/answer',function(req,res){
    var content = getRandomContent();
    res.send(content);
})
// app.get('/api/answer',function(req,res){
//     // app.post('/users',function(req,res){
//     //接收请求体保存到文件
//     // var user = req.body;
//     var answer = req.query.message;
//     var answers = require(datapath);
//     // user.id = Number(users[users.length-1].id) + 1;
//     answers.push({
//         answer:answer
//     });
//     //保存文件/写文件   异步的方法writeFile
//     fs.writeFile(datapath,JSON.stringify(answers),function(err){
//         res.send('写入完成');
//     });
// })
// app.get('/api/show',function(req,res){
//     // app.post('/users',function(req,res){
//     //接收请求体保存到文件
//     // var user = req.body;
//     // var answer = req.query.message;
//     var answers = require(datapath);
//     answers.reverse();
//     // user.id = Number(users[users.length-1].id) + 1;
//     // answers.push({
//     //     answer:answer
//     // });
//     // //保存文件/写文件   异步的方法writeFile
//     // fs.writeFile(datapath,JSON.stringify(answers),function(err){
//         res.json(answers);
//     // });
// })
//微博自动回复
app.post('/weibo',function(req,res){

    var obj = {
        "result":true,
        "sender_id":req.body.receiver_id,
        "receiver_id":req.body.sender_id,
        "type":"text",
        "data":encodeURI(JSON.stringify({
            "text":getRandomContent()
        }))
    };
    // console.log(obj);

    res.json(obj);
})
//微信自动回复
app.post('/wechat',function(req,res){
    var _da;
    req.on("data",function(data){
        /*微信服务器传过来的是xml格式的，是buffer类型，因为js本身只有字符串数据类型，所以需要通过toString把xml转换为字符串*/
        _da = data.toString("utf-8");

    });
    req.on("end",function(){
        //console.log("end");
        var ToUserName = getXMLNodeValue('ToUserName',_da);
        var FromUserName = getXMLNodeValue('FromUserName',_da);
        var CreateTime = getXMLNodeValue('CreateTime',_da);
        var MsgType = getXMLNodeValue('MsgType',_da);
        console.log(MsgType);
        // var Content = getXMLNodeValue('Content',_da);
        var Content = getRandomContent();

        var MsgId = getXMLNodeValue('MsgId',_da); 
        var xml = '<xml><ToUserName>'+FromUserName+'</ToUserName><FromUserName>'+ToUserName+'</FromUserName><CreateTime>'+CreateTime+'</CreateTime><MsgType>'+MsgType+'</MsgType><Content>'+Content+'</Content></xml>';
        res.send(xml);
    });

	function getXMLNodeValue(node_name,xml){
	    var tmp = xml.split("<"+node_name+">");
	    var _tmp = tmp[1].split("</"+node_name+">");
	    return _tmp[0];
	}
})


app.listen(process.env.PORT || 5050)
app.on("error",function(e){
	console.log(e);
})
function getRandomContent(){
    var a = require(datapath);
    // var b = [];
    // while (a.length > 0) {
    //     var index = parseInt(Math.random() * (a.length - 1));
    //     b.push(a[index]);
    //     a.splice(index, 1);
    // }
    // a = b;
    var len = a.length;
    // console.log(answers.length);

    var content = a[parseInt(Math.random()*len)];
    console.log(content);
    return content.answer;
}