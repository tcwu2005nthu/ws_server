const fs = require('fs');
const utf8 = require('utf8');
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

var test101 = 0;
var testCntUni = 0;

var heartBeat = false;
var reset = 0;

var g_webSocket = null;

var obj = {
    job_id: "1005",
    action: "database",
    req_code: "0",
    param: {
        filename: "C:\\Users\\Developer\\Desktop\\testdir\\npp.7.7.1.Installer.x64.exe",
        hash_value: "606c73be58f9386ea62cf325b87a24eae16e97da2a4f754584c287ad3567f1e92a46672c5c9c7ee19bbfe405bfad9db657694b4852f66e13e83f4f57ec3ac920"
    }
};


/* Main() */
var parameter = 0;
console.log(process.argv);
var myArgs = process.argv.slice(2);
//check avaliable of unit test in following switch-case
switch (myArgs[0]) {
  case '1':
  case '2':
  case '3':
  case '11':
  case '12':
  case '4':
  case '5':
    parameter=parseInt(myArgs[0]);
    break;
  case '101':
    parameter = parseInt(myArgs[0]);
    break;
  case '102':
    parameter = parseInt(myArgs[0]);
    break;
  case '103':
    parameter = parseInt(myArgs[0]);
    break;
  case '104':
    parameter = parseInt(myArgs[0]);
    break;
  case '105':
    parameter = parseInt(myArgs[0]);
    break;
  case '106':
    parameter = parseInt(myArgs[0]);
    break;
  case '107':
    parameter = parseInt(myArgs[0]);
    break;
  case '108':
    parameter = parseInt(myArgs[0]);
    break;
  case '109':
    parameter = parseInt(myArgs[0]);
    break;
  case '110':
    parameter = parseInt(myArgs[0]);
    break;
  case '111':
    parameter = parseInt(myArgs[0]);
    break;
  case '112':
    parameter = parseInt(myArgs[0]);
    break;
  case '113':
    parameter = parseInt(myArgs[0]);
    break;
  case '114':
    parameter = parseInt(myArgs[0]);
    break;
  case '115':
    parameter = parseInt(myArgs[0]);
    break;
  case '116':
    parameter = parseInt(myArgs[0]);
    break;
  case '117':
    parameter = parseInt(myArgs[0]);
    break;
  case '118':
    parameter = parseInt(myArgs[0]);
    break;
  case '119':
    parameter = parseInt(myArgs[0]);
    break;
  case '120':
    parameter = parseInt(myArgs[0]);
    break;
  default:
    console.log('Usage : node ws_server.js [parameter]');
    console.log('  1-99 : stressed api unit-test');
    console.log('  101-199 : out-of-bounds api unit-test');
    console.log('  node ws_server.js 1 : hbt 1Million stress');
    console.log('  node ws_server.js 2 : hbt endless(overnight) stress');    
    console.log('  node ws_server.js 3 : createdb 1Million stress');    
    console.log('  node ws_server.js 4 : createdb and deletedb 1Million stress ');    
    console.log('  node ws_server.js 5 : createdb and updatedb and deletedb 1Million stress ');    
    console.log('  node ws_server.js 11 : disable wl 1Millon stress ');    
    console.log('  node ws_server.js 12 : enable and disable wl 1Millon stress');
    console.log('  node ws_server.js 101 : DB operation combination-test (create, update, and delete) with negative hash value');
    console.log('  node ws_server.js 102 : DB operation unit-test create with negative hash value');
    console.log('  node ws_server.js 103 : DB operation unit-test update with negative hash value');
    console.log('  node ws_server.js 104 : DB operation unit-test delete with negative hash value');
    console.log('  node ws_server.js 105 : File path contains chinese charactors combination-test');
    console.log('  node ws_server.js 106 : File path contains chinese charactors unit-test - create');
    console.log('  node ws_server.js 107 : File path contains chinese charactors unit-test - update');
    console.log('  node ws_server.js 108 : File path contains chinese charactors unit-test - delete');
    console.log('  node ws_server.js 109 : Transfer illegal file path value unit-test - create');
    console.log('  node ws_server.js 110 : Transfer illegal file path value unit-test - update');
    console.log('  node ws_server.js 111 : Transfer illegal file path value unit-test - delete');
    console.log('  node ws_server.js 112 : Transfer illegal file path value (with chinese charactors) unit-test - create');
    console.log('  node ws_server.js 113 : Transfer illegal file path value (with chinese charactors) unit-test - update');
    console.log('  node ws_server.js 114 : Transfer illegal file path value (with chinese charactors) unit-test - delete');
    console.log('  node ws_server.js 115 : json without jobid');
    console.log('  node ws_server.js 116 : json without action');
    console.log('  node ws_server.js 117 : json without req_code');
    console.log('  node ws_server.js 118 : json without filepath');
    console.log('  node ws_server.js 119 : json exceed 260 bytes');
    console.log('  node ws_server.js 120 : Arbitrary and illegal action string');

    EXIT();
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
function EXIT(){
    process.exit();
}
var hbt_offset=0;
function TestOne(strMessage){
    var objHeart = {
        job_id: +"1000001"+hbt_offset,
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
   if(hbt_offset>100000)
        EXIT();
}
function TestTwo(strMessage){
    var objHeart = {
        job_id: +"1000001"+hbt_offset,
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
   //Endless stress test
   //if(hbt_offset>10000)
   //        EXIT();
}
var t3cnt=0 //reserve for test3,4,5
function TestThree(strMessage){ //db stress
    var obj = {
        job_id: +"3000"+t3cnt,  
        action: "database",
        req_code: "0",
        param: {
            filename: "C:\\Users\\Developer\\Desktop\\testdir\\npp.7.7.1.Installer.x64.exe",
            hash_value: "606c73be58f9386ea62cf325b87a24eae16e97da2a4f754584c287ad3567f1e92a46672c5c9c7ee19bbfe405bfad9db657694b4852f66e13e83f4f57ec3ac920"
        }
    };
    var ResponseJson = JSON.stringify(obj);

    if (strMessage.action === "auth") {
        if (strMessage.param.key === authKey) {
            console.log("Auth OK,auth_key=" + strMessage.param.key);              
            console.log("json="+ResponseJson);
            g_webSocket.send(ResponseJson);
        }
    } else if (strMessage.result === "success" || strMessage.result === "failure") {
            console.log("strMessage.result=" + JSON.stringify(strMessage));    
            g_webSocket.send(ResponseJson);
   }
   sleep(1);
   t3cnt++;
   if(t3cnt>1000000)
    EXIT();
}

function Test101To199(strMessage, obj, fileName, hashValue) {
    obj.param.filename = fileName;
    obj.param.hash_value = hashValue;

    if (test101 === 1) {
        //update db
        obj['job_id'] = "1006";
        obj['req_code'] = "4";
    } else if (test101 === 2) {
        //delete db
        obj['job_id'] = "1007";
        obj['req_code'] = "3";
    }

    var ResponseJson = JSON.stringify(obj);

    if (strMessage.action === "auth") {
        if (strMessage.param.key === authKey) {
            console.log("Auth OK,auth_key=" + strMessage.param.key);
            //console.log("json=" + ResponseJson);
            g_webSocket.send(ResponseJson);
        }
    } else if (strMessage.result === "success" || strMessage.result === "failure") {
        console.log("strMessage.result=" + JSON.stringify(strMessage));
        if (test101 < 3)
            g_webSocket.send(ResponseJson);
    }

    test101 += 1;

    if (test101 < 4) {
        console.log(ResponseJson);
    } else if(test101 === 4) {
        EXIT();
    }

}

function sendRequestOnce(strMessage, obj, reqCode, fileName, hashValue) {
    //console.log(utf8.decode(fileName));
    obj.req_code = reqCode;
    obj.param.filename = fileName;
    obj.param.hash_value = hashValue;

    var ResponseJson = JSON.stringify(obj);

    if (strMessage.action === "auth") {
        if (strMessage.param.key === authKey) {
            console.log("Auth OK,auth_key=" + strMessage.param.key);
            //console.log("json=" + ResponseJson);
            g_webSocket.send(ResponseJson);
        }
    } else if (strMessage.result === "success" || strMessage.result === "failure") {
        console.log("strMessage.result=" + JSON.stringify(strMessage));
        if (testCntUni < 1)
            g_webSocket.send(ResponseJson);
    }

    testCntUni += 1;

    if (testCntUni < 2) {
        console.log(ResponseJson);
    } else if (testCntUni === 2) {
        EXIT();
    }
}

//Create once with negative hash value.
function Test102(strMessage, obj, reqCode, fileName, hashValue) {
    sendRequestOnce(strMessage, obj, reqCode, fileName, hashValue);
}

//Update once with negative hash value.
function Test103(strMessage, obj, reqCode, fileName, hashValue) {
    sendRequestOnce(strMessage, obj, reqCode, fileName, hashValue);
}

//Delete once with negative hash value.
function Test104(strMessage, obj, reqCode, fileName, hashValue) {
    sendRequestOnce(strMessage, obj, reqCode, fileName, hashValue);
}

//Create once with chinese charactors file path.
function Test106(strMessage, obj, reqCode, fileName, hashValue) {
    sendRequestOnce(strMessage, obj, reqCode, fileName, hashValue);
}

//Update once with chinese charactors file path.
function Test107(strMessage, obj, reqCode, fileName, hashValue) {
    sendRequestOnce(strMessage, obj, reqCode, fileName, hashValue);
}

//Delete once with chinese charactors file path.
function Test108(strMessage, obj, reqCode, fileName, hashValue) {
    sendRequestOnce(strMessage, obj, reqCode, fileName, hashValue);
}

//Create once with illegal file path.
function Test109(strMessage, obj, reqCode, fileName, hashValue) {
    sendRequestOnce(strMessage, obj, reqCode, fileName, hashValue);
}

//Update once with illegal file path.
function Test110(strMessage, obj, reqCode, fileName, hashValue) {
    sendRequestOnce(strMessage, obj, reqCode, fileName, hashValue);
}

//Delete once with illegal file path.
function Test111(strMessage, obj, reqCode, fileName, hashValue) {
    sendRequestOnce(strMessage, obj, reqCode, fileName, hashValue);
}

//Create once with illegal file path (chinese).
function Test112(strMessage, obj, reqCode, fileName, hashValue) {
    sendRequestOnce(strMessage, obj, reqCode, fileName, hashValue);
}

//Update once with illegal file path (chinese).
function Test113(strMessage, obj, reqCode, fileName, hashValue) {
    sendRequestOnce(strMessage, obj, reqCode, fileName, hashValue);
}

//Delete once with illegal file path (chinese).
function Test114(strMessage, obj, reqCode, fileName, hashValue) {
    sendRequestOnce(strMessage, obj, reqCode, fileName, hashValue);
}

//No jobid
function Test115(strMessage, obj, reqCode, fileName, hashValue) {
    obj.job_id = "";
    sendRequestOnce(strMessage, obj, reqCode, fileName, hashValue);
}

//No action
function Test116(strMessage, obj, reqCode, fileName, hashValue) {
    obj.action = "";
    sendRequestOnce(strMessage, obj, reqCode, fileName, hashValue);
}

//No req_code
function Test117(strMessage, obj, reqCode, fileName, hashValue) {
    sendRequestOnce(strMessage, obj, reqCode, fileName, hashValue);
}

//No filepath
function Test118(strMessage, obj, reqCode, fileName, hashValue) {
    sendRequestOnce(strMessage, obj, reqCode, fileName, hashValue);
}

//jobid exceed 260 bytes
function Test119(strMessage, obj, reqCode, fileName, hashValue) {
    obj.job_id = "101101101101101101101101101101101101101101101101101101101101101101101101101101101101101101101101101101101101101101101101101101101101101101101101101101101101101101101101101101101101101101101101101101101101101101101101101101101101101101101101101101101101101101101101101101101101101101101101101101101";
    sendRequestOnce(strMessage, obj, reqCode, fileName, hashValue);
}

//Arbitrary and illegal action string.
function Test120(strMessage, obj, reqCode, fileName, hashValue) {
    obj.action = "hahahaha";
    sendRequestOnce(strMessage, obj, reqCode, fileName, hashValue);
}
function TestFour(strMessage){ //db stress
    var obj = {
        job_id: +"4000"+t3cnt,  //t3cnt init to 0
        action: "database",
        req_code: (t3cnt%2)? "3":"0", //t3cnt=0 => reqcode=0 ; t3cnt=1=>reqcode=3
        param: {
            filename: "C:\\Users\\Developer\\Desktop\\testdir\\npp.7.7.1.Installer.x64.exe",
            hash_value: "606c73be58f9386ea62cf325b87a24eae16e97da2a4f754584c287ad3567f1e92a46672c5c9c7ee19bbfe405bfad9db657694b4852f66e13e83f4f57ec3ac920"
        }
    };
    var ResponseJson = JSON.stringify(obj);

    if (strMessage.action === "auth" || strMessage.result === "success" || strMessage.result === "failure") {
            console.log("strMessage=" + JSON.stringify(strMessage));    
            g_webSocket.send(ResponseJson);
    }
    sleep(1);
    if(t3cnt++>=1000000)
        EXIT();
}
function TestFive(strMessage){ //db stress
    var obj = {
        job_id: +"5000"+t3cnt,  //t3cnt init to 0
        action: "database",
        //t3cnt=0 =>reqcode=0; t3cnt=1=>reqcode=4; t3cnt=2=>regcode=3
        req_code: (!(t3cnt%3))
                   ?"0"
                   :(t3cnt%3-1)
                   ?"3"
                   :"4" 
                   ,
        param: {
            filename: "C:\\Users\\Developer\\Desktop\\testdir\\npp.7.7.1.Installer.x64.exe",
            hash_value: "606c73be58f9386ea62cf325b87a24eae16e97da2a4f754584c287ad3567f1e92a46672c5c9c7ee19bbfe405bfad9db657694b4852f66e13e83f4f57ec3ac920"
        }
    };
    var ResponseJson = JSON.stringify(obj);

    if (strMessage.action === "auth" || strMessage.result === "success" || strMessage.result === "failure") {
            console.log("strMessage=" + JSON.stringify(strMessage));    
            g_webSocket.send(ResponseJson);
    }
    sleep(1);
    if(t3cnt++>=1000000)
        EXIT();
}
var t11cnt=0 //reserve for test11,12,13
function TestEleven(strMessage){
    var obj = {
    job_id: +"11000"+t11cnt,
    action: "switch_mode",
    param: {
        mode: "disable"
        }
    };
    json = JSON.stringify(obj);
    if (strMessage.action === "auth" || strMessage.result === "success" || strMessage.result === "failure") {
        console.log("strMessage=" + JSON.stringify(strMessage));    
        g_webSocket.send(json);
    }
    sleep(1);
    if(t11cnt++>1000000)
        EXIT();
}
function TestTwelve(strMessage){
    var obj = {
    job_id: +"12000"+t11cnt,
    action: "switch_mode",
    param: {
        mode: (t11cnt%2)?"disable":"enable"
        }
    };
    json = JSON.stringify(obj);
    if (strMessage.action === "auth" || strMessage.result === "success" || strMessage.result === "failure") {
        console.log("strMessage=" + JSON.stringify(strMessage));    
        g_webSocket.send(json);
    }
    sleep(1);
    if(t11cnt++>1000000)
        EXIT();
}

function autoTest(parameter,strMessage){
    switch (parameter) {
      case 1:
      	TestOne(strMessage);
        break;
      case 2:
        TestTwo(strMessage);
        break;     
      case 3:
        TestThree(strMessage);
        break;
      case 101: //DB operation combination test (create, update, and delete) with negative hash value.
        fileName = "C:\\Users\\Developer\\Desktop\\testdir\\npp.7.7.1.Installer.x64.exe";
        hashValue = "-606c73be58f9386ea62cf325b87a24eae16e97da2a4f754584c287ad3567f1e92a46672c5c9c7ee19bbfe405bfad9db657694b4852f66e13e83f4f57ec3ac920";
        Test101To199(strMessage, obj, fileName, hashValue);
        break;
      case 102: //DB operation uni-test create with negative hash value.
        fileName = "C:\\Users\\Developer\\Desktop\\testdir\\npp.7.7.1.Installer.x64.exe";
        hashValue = "-606c73be58f9386ea62cf325b87a24eae16e97da2a4f754584c287ad3567f1e92a46672c5c9c7ee19bbfe405bfad9db657694b4852f66e13e83f4f57ec3ac920";
        Test102(strMessage, obj, "0", fileName, hashValue);
        break;
      case 103: //DB operation uni-test update with negative hash value.
        fileName = "C:\\Users\\Developer\\Desktop\\testdir\\npp.7.7.1.Installer.x64.exe";
        hashValue = "-606c73be58f9386ea62cf325b87a24eae16e97da2a4f754584c287ad3567f1e92a46672c5c9c7ee19bbfe405bfad9db657694b4852f66e13e83f4f57ec3ac920";
        Test103(strMessage, obj, "4", fileName, hashValue);
        break;
      case 104: //DB operation uni-test delete with negative hash value.
        fileName = "C:\\Users\\Developer\\Desktop\\testdir\\npp.7.7.1.Installer.x64.exe";
        hashValue = "-606c73be58f9386ea62cf325b87a24eae16e97da2a4f754584c287ad3567f1e92a46672c5c9c7ee19bbfe405bfad9db657694b4852f66e13e83f4f57ec3ac920";
        Test104(strMessage, obj, "3", fileName, hashValue);
        break;
      case 105: //File path contains chinese charactors combination test.
        fileNAme = utf8.encode("C:\\Users\\Developer\\Desktop\\台泥便當狗\\哈哈哈.exe");
        hashValue = "606c73be58f9386ea62cf325b87a24eae16e97da2a4f754584c287ad3567f1e92a46672c5c9c7ee19bbfe405bfad9db657694b4852f66e13e83f4f57ec3ac920";
        Test101To199(strMessage, obj, fileNAme, hashValue);
        break;
      case 106: //File path contains chinese charactors unitest - create.
 
        fileName = "C:\\Users\\Developer\\Desktop\\台泥便當狗\\哈哈哈.exe";
        console.log(fileName);
        hashValue = "606c73be58f9386ea62cf325b87a24eae16e97da2a4f754584c287ad3567f1e92a46672c5c9c7ee19bbfe405bfad9db657694b4852f66e13e83f4f57ec3ac920";
        Test106(strMessage, obj, "0", fileName, hashValue);
        break;
      case 107: //File path contains chinese charactors unitest - update.
        fileName = "C:\\Users\\Developer\\Desktop\\台泥便當狗\\哈哈哈.exe";
        hashValue = "606c73be58f9386ea62cf325b87a24eae16e97da2a4f754584c287ad3567f1e92a46672c5c9c7ee19bbfe405bfad9db657694b4852f66e13e83f4f57ec3ac920";
        Test107(strMessage, obj, "4", fileName, hashValue);
        break;
      case 108: //File path contains chinese charactors unitest - delete.
        fileName = "C:\\Users\\Developer\\Desktop\\台泥便當狗\\哈哈哈.exe";
        hashValue = "606c73be58f9386ea62cf325b87a24eae16e97da2a4f754584c287ad3567f1e92a46672c5c9c7ee19bbfe405bfad9db657694b4852f66e13e83f4f57ec3ac920";
        Test108(strMessage, obj, "3", fileName, hashValue);
        break;
      case 109: //Transfer illegal file path value unitest - create.
        fileName = "amoiejeanffjdfkenncdj";
        hashValue = "606c73be58f9386ea62cf325b87a24eae16e97da2a4f754584c287ad3567f1e92a46672c5c9c7ee19bbfe405bfad9db657694b4852f66e13e83f4f57ec3ac920";
        Test109(strMessage, obj, "0", fileName, hashValue);
        break;
      case 110: //Transfer illegal file path value unitest - update.
        fileName = "amoiejeanffjdfkenncdj";
        hashValue = "606c73be58f9386ea62cf325b87a24eae16e97da2a4f754584c287ad3567f1e92a46672c5c9c7ee19bbfe405bfad9db657694b4852f66e13e83f4f57ec3ac920";
        Test110(strMessage, obj, "4", fileName, hashValue);
        break;
      case 111: //Transfer illegal file path value unitest - delete.
        fileName = "amoiejeanffjdfkenncdj";
        hashValue = "606c73be58f9386ea62cf325b87a24eae16e97da2a4f754584c287ad3567f1e92a46672c5c9c7ee19bbfe405bfad9db657694b4852f66e13e83f4f57ec3ac920";
        Test111(strMessage, obj, "3", fileName, hashValue);
        break;
      case 112: //Transfer illegal file path value (chinese charactors) unitest - create.
        fileName = "這樣會接受嗎";
        hashValue = "606c73be58f9386ea62cf325b87a24eae16e97da2a4f754584c287ad3567f1e92a46672c5c9c7ee19bbfe405bfad9db657694b4852f66e13e83f4f57ec3ac920";
        Test112(strMessage, obj, "0", fileName, hashValue);
        break;
      case 113: //Transfer illegal file path value (chinese charactors) unitest - update.
        fileName = "這樣會接受嗎";
        hashValue = "606c73be58f9386ea62cf325b87a24eae16e97da2a4f754584c287ad3567f1e92a46672c5c9c7ee19bbfe405bfad9db657694b4852f66e13e83f4f57ec3ac920";
        Test113(strMessage, obj, "4", fileName, hashValue);
        break;
      case 114: //Transfer illegal file path value (chinese charactors) unitest - delete.
        fileName = "這樣會接受嗎";
        hashValue = "606c73be58f9386ea62cf325b87a24eae16e97da2a4f754584c287ad3567f1e92a46672c5c9c7ee19bbfe405bfad9db657694b4852f66e13e83f4f57ec3ac920";
        Test114(strMessage, obj, "3", fileName, hashValue);
        break;
      case 115: //json without jobid
        fileName = "C:\\Users\\Developer\\Desktop\\testdir\\npp.7.7.1.Installer.x64.exe";
        hashValue = "606c73be58f9386ea62cf325b87a24eae16e97da2a4f754584c287ad3567f1e92a46672c5c9c7ee19bbfe405bfad9db657694b4852f66e13e83f4f57ec3ac920";
        Test115(strMessage, obj, "3", fileName, hashValue);
        break;
      case 116: //json without action
        fileName = "C:\\Users\\Developer\\Desktop\\testdir\\npp.7.7.1.Installer.x64.exe";
        hashValue = "606c73be58f9386ea62cf325b87a24eae16e97da2a4f754584c287ad3567f1e92a46672c5c9c7ee19bbfe405bfad9db657694b4852f66e13e83f4f57ec3ac920";
        Test116(strMessage, obj, "3", fileName, hashValue);
        break;
      case 117: //json without req_code
        fileName = "C:\\Users\\Developer\\Desktop\\testdir\\npp.7.7.1.Installer.x64.exe";
        hashValue = "606c73be58f9386ea62cf325b87a24eae16e97da2a4f754584c287ad3567f1e92a46672c5c9c7ee19bbfe405bfad9db657694b4852f66e13e83f4f57ec3ac920";
        Test117(strMessage, obj, "", fileName, hashValue);
        break;
      case 118: //json without filepath
        fileName = "";
        hashValue = "606c73be58f9386ea62cf325b87a24eae16e97da2a4f754584c287ad3567f1e92a46672c5c9c7ee19bbfe405bfad9db657694b4852f66e13e83f4f57ec3ac920";
        Test118(strMessage, obj, "3", fileName, hashValue);
        break;
      case 119: //jobid exceed 260 bytes
        fileName = "C:\\Users\\Developer\\Desktop\\testdir\\npp.7.7.1.Installer.x64.exe";
        hashValue = "606c73be58f9386ea62cf325b87a24eae16e97da2a4f754584c287ad3567f1e92a46672c5c9c7ee19bbfe405bfad9db657694b4852f66e13e83f4f57ec3ac920";
        Test119(strMessage, obj, "3", fileName, hashValue);
        break;
      case 120: //Arbitrary and illegal action string.
        fileName = "C:\\Users\\Developer\\Desktop\\testdir\\npp.7.7.1.Installer.x64.exe";
        hashValue = "606c73be58f9386ea62cf325b87a24eae16e97da2a4f754584c287ad3567f1e92a46672c5c9c7ee19bbfe405bfad9db657694b4852f66e13e83f4f57ec3ac920";
        Test120(strMessage, obj, "3", fileName, hashValue);
        break
      case 11:
        TestEleven(strMessage);
        break;
      case 12:
        TestTwelve(strMessage);
        break;
      case 4:
        TestFour(strMessage);
        break;
      case 5:
        TestFive(strMessage);
        break;
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
