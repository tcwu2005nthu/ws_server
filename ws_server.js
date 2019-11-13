const fs = require('fs');
const config = require('./config');
const webSocketServer = new (require('ws')).Server({ port: config.port, host: config.host });
var currentMode;
let webSockets = {}; // userID: webSocket
const authKey = "9527"
var testGo = false;
var auth = false;
let strMessage = "";

var enableWl = false;
var disableWl = false;
var createDB = true;
var modifyDB = false;
var modifyDBTwo = false;
var deleteDB = false;
var createDBInval = false;
var modifyDBInval = false;
var deleteDBInval = false;

var heartBeat = false;
var reset = 0;

var g_webSocket=null;

/* Main() */
var parameter = 0;
console.log(process.argv);
var myArgs = process.argv.slice(2);
//check avaliable of unit test in following switch-case
switch (myArgs[0]) {
  case '1':
  	parameter=1;
    break;
/*  
  case '2':
    parameter=2;
    break;
  case '3':
    parameter=3;
    break; 
*/
  default:
    console.log('Usage : node ws_server.js [parameter]');
    console.log('  1-99 : stressed api unit-test');
    console.log('  101-199 : out-of-bounds api unit-test');
    process.exit();
}

function sleep(milliseconds) {
    var start = new Date().getTime();
    for (var i = 0; i < 1e7; i++) {
        if ((new Date().getTime() - start) > milliseconds) {
            break;
        }
    }
}

function heartBeat(webSocket) {
    var objHeart = {
        job_id: "1011",
        action: "hbt"
    };
    json = JSON.stringify(objHeart);
    webSocket.send(json);
}
var hbt_offset=0;
function TestOne(strMessage){
    var objHeart = {
        job_id: "1000001"+hbt_offset,
        action: "hbt"
    };
    var hbtJson = JSON.stringify(objHeart);


    if (strMessage.action === "auth") {
        if (strMessage.param.key === authKey) {
            console.log("Auth OK,auth_key=" + strMessage.param.key);              
            console.log("json="+hbtJson);
            g_webSocket.send(hbtJson);
        }
    } else if (strMessage.result === "success" || strMessage.result === "failure") {
          console.log("strMessage.result=" + JSON.stringify(strMessage));    
            json = JSON.stringify(objHeart);
            g_webSocket.send(hbtJson);
   }
   hbt_offset++;
   sleep(1);
}
function autoTest(parameter,strMessage){
    switch (parameter) {
      case 1:
      	TestOne(strMessage);
        break;
/*     case 2:
            TestTwo();
            break;          */
      default:
        console.log('autoTest item('+ parameter +')error');
    }
}

// client connect with ip
webSocketServer.on('connection', (webSocket, req) => {
  if(parameter===0)
  	return ;

  if(parameter >=1 || parameter <=199){
    console.log('parameter='+parameter);
    g_webSocket=webSocket;
    webSocket.on('message', (message) => {
      strMessage = JSON.parse(message);
      autoTest(parameter,strMessage);
	});
	return ;
  }

  //decprecated
  const userIP = req.connection.remoteAddress.replace(/(^\D*)/g, '');
  console.log('connected');
  
  if (config.client.some(item => item.ip === userIP)) {
    webSockets[userIP] = webSocket;
    console.log('connected: ' + userIP + ' in ' + Object.getOwnPropertyNames(webSockets));
  } else {
    console.log('Invalid IP connected');
  }
    
  webSocket.on('message', (message) => {

      fs.appendFile('log.txt', message + '\n', function (err) {
          if (err) throw err;
      })

      console.log("origin message type is " + typeof (message));

      strMessage = JSON.parse(message);

      if (strMessage.action === "auth") {
          if (strMessage.param.key === authKey) {
              console.log("Auth success, the auth key is " + strMessage.param.key);              
              var objHeart = {
                  job_id: "1008",
                  action: "hbt"
              };
              json = JSON.stringify(objHeart);
              //console.log(json);
              webSocket.send(json);
          }
      }
      else if (strMessage.result === "success" || strMessage.result === "failure") {
          console.log("WOW" + message);            

          //formal code

          if (disableWl) {
              var objDisable = {
                  job_id: "1003",
                  action: "switch_mode",
                  param: {
                      mode: "disable"
                  }
              };
              json = JSON.stringify(objDisable);
              //console.log(json);
              webSocket.send(json);
    
              disableWl = false;
              enableWl = true;
              reset += 1;
              sleep(3000);
          }
          else if (enableWl) {
              var objEnable = {
                  job_id: "1004",
                  action: "switch_mode",
                  param: {
                      mode: "enable"
                  }
              };
              json = JSON.stringify(objEnable);
              //console.log(json);
              webSocket.send(json);
    
              enableWl = false;
              createDB = true;
              reset += 1;
              sleep(3000);
          }
          else if (createDB){
              var objCreateDb = {
                  job_id: "1005",
                  action: "database",
                  req_code: "0",
                  param: {
                      filename: "C:\\Users\\Developer\\Desktop\\testdir\\npp.7.7.1.Installer.x64.exe",
                      hash_value: "606c73be58f9386ea62cf325b87a24eae16e97da2a4f754584c287ad3567f1e92a46672c5c9c7ee19bbfe405bfad9db657694b4852f66e13e83f4f57ec3ac920"
                  }
              };
              json = JSON.stringify(objCreateDb);
              //console.log(json);
              webSocket.send(json);
              createDB = false;
              modifyDB = true;
              sleep(50);
          }
          else if (modifyDB) {
              var objModifyDb = {
                  job_id: "1006",
                  action: "database",
                  req_code: "4",
                  param: {
                      filename: "C:\\Users\\Developer\\Desktop\\testdir\\npp.7.7.1.Installer.x64.exe",
                      hash_value: "606c83be58f9386ea62cf325b87a24eae16e97da2a4f754584c287ad3567f1e92a46672c5c9c7ee19bbfe405bfad9db657694b4852f66e13e83f4f57ec3ac920"
                  }
              };
              json = JSON.stringify(objModifyDb);
              //console.log(json);
              webSocket.send(json);
              modifyDB = false;
              deleteDB = true;
              sleep(50);
          }
          else if (deleteDB) {
              var objDeleteDb = {
                  job_id: "1007",
                  action: "database",
                  req_code: "3",                  
                  param: {
                      filename: "C:\\Users\\Developer\\Desktop\\testdir\\npp.7.7.1.Installer.x64.exe",
                      //filename: "npp.7.7.1.Installer.x64.exe",
                      hash_value: "606c83be58f9386ea62cf325b87a24eae16e97da2a4f754584c287ad3567f1e92a46672c5c9c7ee19bbfe405bfad9db657694b4852f66e13e83f4f57ec3ac920"
                  }
              };
              json = JSON.stringify(objDeleteDb);
              //console.log(json);
              webSocket.send(json);
              deleteDB = false;
              createDBInval = true;
              sleep(50);
          }
          else if (createDBInval) {
              var objCreateDbInval = {
                  job_id: "2001",
                  action: "database",
                  req_code: "0",
                  param: {
                      filename: "\"C:\\Users\\Developer\\Desktop\\testdir\\npp.7.7.1.Installer.x64.exe\"",
                      hash_value: "606c73be58f9386ea62cf325b87a24eae16e97da2a4f754584c287ad3567f1e92a46672c5c9c7ee19bbfe405bfad9db657694b4852f66e13e83f4f57ec3ac920"
                  }
              };
              json = JSON.stringify(objCreateDbInval);
              //console.log(json);
              webSocket.send(json);
              createDBInval = false;
              modifyDBInval = true;
              sleep(50);
          }
          else if (modifyDBInval) {
              var objModifyDbInval = {
                  job_id: "2002",
                  action: "database",
                  req_code: "4",
                  param: {
                      filename: "\"C:\\Users\\Developer\\Desktop\\testdir\\npp.7.7.1.Installer.x64.exe\"",
                      hash_value: "606c83be58f9386ea62cf325b87a24eae16e97da2a4f754584c287ad3567f1e92a46672c5c9c7ee19bbfe405bfad9db657694b4852f66e13e83f4f57ec3ac920"
                  }
              };
              json = JSON.stringify(objModifyDbInval);
              //console.log(json);
              webSocket.send(json);
              modifyDBInval = false;
              deleteDBInval = true;
              sleep(50);
          }
          else if (deleteDBInval) {
              var objDeleteDbInval = {
                  job_id: "2003",
                  action: "database",
                  req_code: "3",
                  param: {
                      filename: "\"C:\\Users\\Developer\\Desktop\\testdir\\npp.7.7.1.Installer.x64.exe\"",
                      //filename: "npp.7.7.1.Installer.x64.exe",
                      hash_value: "606c83be58f9386ea62cf325b87a24eae16e97da2a4f754584c287ad3567f1e92a46672c5c9c7ee19bbfe405bfad9db657694b4852f66e13e83f4f57ec3ac920"
                  }
              };
              json = JSON.stringify(objDeleteDbInval);
              //console.log(json);
              webSocket.send(json);
              deleteDBInval = false;
              heartBeat = true;
              sleep(50);
          }
          if (heartBeat) {
              var objHeart = {
                  job_id: "1008",
                  action: "hbt"
              };
              json = JSON.stringify(objHeart);
              //console.log(json);
              webSocket.send(json);
              heartBeat = false;
              createDB = true;
              //disableWl = true;
              reset += 1;
              sleep(50);
          }
              
      }
      else if (strMessage.action === "log") {
          console.log("hahahahaha  " + strMessage.param[0].filename);
          console.log("hahahahaha  " + strMessage.timestamp);
      }
      else {
          console.log("c8c8c8c");
      }
});

  webSocket.on('close',  () => {
    console.log(`${userIP} offline`);
    delete webSockets[userIP];
  });
});

