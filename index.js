const http = require('http');  
const { v4: uuidv4 } = require('uuid');
const errHandle = require('./errorHandle')
const todos = [
    {
        "title":"今天要工作",
        "id": uuidv4()
    },
    {
        "title":"今天要寫程式",
        "id": uuidv4()
    }
];

const requestListener = (req, res) => {
    const headers = {
        'Access-Control-Allow-Headers': 'Content-Type,   Authorization, Content-Length, X-Requested-With',
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'PATCH, POST, GET,OPTIONS,DELETE',
        'Content-Type': 'application/json'
     }

    let body = "";
    let num = 0;
    req.on('data', chunk=>{
        body+=chunk;
        num+=1;
    })
    if(req.url=="/todos" && req.method == "GET"){
        res.writeHead(200, headers);
        res.write(JSON.stringify({
            "status" : "success",
            "data" : todos,
        }));
        res.end();
    }else if(req.url.startsWith("/todos/") && req.method == "GET"){
        // 取得單筆
        const id = req.url.split("/").pop();
        const index = todos.findIndex(element => element.id == id)
        if(index!==-1){
            res.writeHead(200, headers);
            res.write(JSON.stringify({
                "status" : "success",
                "data" : todos[index],
            }));
            res.end();  
        }else{
            errHandle(res);
        }                
    }else if(req.url=="/todos" && req.method == "POST"){
        //整個資料接收完，就開始跑 try, catch
        req.on('end',()=>{
            try{
                const title = JSON.parse(body).title;
                if(title !== undefined){
                    const todo = {
                        "title": title,
                        "id": uuidv4()
                    };
                    todos.push(todo);
                    res.writeHead(200, headers);
                    res.write(JSON.stringify({
                        "status" : "success",
                        "data" : todos,
                    }));
                    res.end();                    
                }else{
                    errHandle(res)
                }
            }
            catch(error){
                errHandle(res)
            }
        })
    }else if(req.url=="/todos" && req.method == "DELETE"){
        todos.length = 0; //清掉內容
        res.writeHead(200, headers);
        res.write(JSON.stringify({
            "status" : "success",
            "data" : todos,
            "delete": "yes"
        }));
        res.end();                           
    }else if(req.url.startsWith("/todos/") && req.method == "DELETE"){
        // 刪除單筆
        const id = req.url.split("/").pop();
        const index = todos.findIndex(element => element.id == id)
        if(index!==-1){
            todos.splice(index,1)
            res.writeHead(200, headers);
            res.write(JSON.stringify({
                "status" : "success",
                "data" : todos,
            }));
            res.end();  
        }else{
            errHandle(res);
        }                
    }else if(req.url.startsWith("/todos/") && req.method == "PATCH"){
        // 編輯
        req.on('end', ()=>{
            try{
                const todo = JSON.parse(body).title;
                const id = req.url.split('/').pop();
                const index = todos.findIndex(element => element.id==id)
                if(todo !== undefined && index !== -1){
                    todos[index].title = todo;
                    res.writeHead(200, headers);
                    res.write(JSON.stringify({
                        "status" : "success",
                        "data" : todos
                    }));
                    res.end();   
                }else{
                    errHandle(res);
                }
            }catch{
                errHandle(res);
            }
        })
              
    }else if(req.method == "OPTIONS"){
        res.writeHead(200, headers);
        res.end();
    }else{
        res.writeHead(404, headers);
        res.write(JSON.stringify({
            "status" : "false",
            "message" : "無此網站路由",
        }));
        res.end();     
    }
    
}

//把 server on 起來， 將函式監聽器 requestListener 帶入
const server = http.createServer(requestListener);  
server.listen(3000);   //監聽 port 號