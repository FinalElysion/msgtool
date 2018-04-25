let $ = require("jquery");

import CommonUtil from './common';
import Rx from 'rxjs/Rx';

let RYManager = {}
RYManager.receiveNewMsg$ = new Rx.Subject();
RYManager.sendNewMsg$ = new Rx.Subject();
RYManager.isConnected$ = new Rx.Subject();
RYManager.conversation$ = new Rx.Subject();
RYManager.history$ = new Rx.Subject();
RYManager.isConnected = false;
RYManager.targetId = null;

const Token888 = "/PXsY1S7j254XvyCQv/UVvEhB4CcKsu7PxeOg1Ourh4vTi9QSFQp8dKzIW8rFGImtVE+B3aiL894zjAWIwA5Fg==";
const Token12345 = "giqFfvOz1lXyzj/Y1MpNldu79zcHFSLPlYK6sOd6tI2SPa+ltjYIWDRF7uXbCTwE43JJXi+vHMS7eyvscv5J6A==";
let appKey = "3argexb63muce";
let token = Token888;
RYManager.userId = "888888";
let instance = null;

/**
 * 自动连接初始化
 */
RYManager.initConfig =  function() {
    CommonUtil.devLog("初始化连接配置");
    initEmoji();
    RongIMLib.RongIMClient.init(appKey);
    instance = RongIMClient.getInstance();

    //连接状态监听器
    return new Promise(function (resolve, reject) {
        RongIMClient.setConnectionStatusListener({
            onChanged: function (status) {
                switch (status) {
                    case RongIMLib.ConnectionStatus.CONNECTED:
                        CommonUtil.devLog('链接成功');
                        break;
                    case RongIMLib.ConnectionStatus.CONNECTING:
                        CommonUtil.devLog('正在链接');
                        break;
                    case RongIMLib.ConnectionStatus.DISCONNECTED:
                        CommonUtil.devLog('断开连接');
                        break;
                    case RongIMLib.ConnectionStatus.KICKED_OFFLINE_BY_OTHER_CLIENT:
                        CommonUtil.devLog('其他设备登录'); 
                        break;
                    case RongIMLib.ConnectionStatus.DOMAIN_INCORRECT:
                        CommonUtil.devLog('域名不正确');
                        break;
                    case RongIMLib.ConnectionStatus.NETWORK_UNAVAILABLE:
                        CommonUtil.devLog('网络不可用');
                        break;
                }
                resolve(status);
            }
        });
    });
}

/**
 * 连接
 */
RYManager.connect = function(id) {
    RYManager.userId = id;
    if(id=="888888"){
        token = Token888;
    }else{
        token = Token12345;
    }
    RYManager.initConfig();
    //消息监听器
    RongIMClient.setOnReceiveMessageListener({
        // 接收到的消息
        onReceived: function (message) {
            if (message.content.extra.userId == RYManager.userId) {
                CommonUtil.devLog("接收到自己曾经发送的信息", message.content.content)
            }else if(!RYManager.targetId || RYManager.targetId!=message.content.extra.userId){
                CommonUtil.devLog("接收到其他用户发来的信息", message.content.content)
            }else{
                CommonUtil.devLog("新消息", message);
                RYManager.receiveNewMsg$.next(message);
            }           
            RYManager.getConversation();
        }
    });

    //开始链接
    RongIMClient.connect(token, {
        onSuccess: function (userId) {
            CommonUtil.devLog("链接成功，用户id：" + userId);
            RYManager.isConnected$.next(true);
            RYManager.isConnected = true; 
            RYManager.getConversation();
        },
        onTokenIncorrect: function () {
            CommonUtil.devLog('token无效');
        },
        onError: function (errorCode) {
            var info = '';
            switch (errorCode) {
                case RongIMLib.ErrorCode.TIMEOUT:
                    info = '超时';
                    break;
                case RongIMLib.ErrorCode.UNKNOWN_ERROR:
                    info = '未知错误';
                    break;
                case RongIMLib.ErrorCode.UNACCEPTABLE_PaROTOCOL_VERSION:
                    info = '不可接受的协议版本';
                    break;
                case RongIMLib.ErrorCode.IDENTIFIER_REJECTED:
                    info = 'appkey不正确';
                    break;
                case RongIMLib.ErrorCode.SERVER_UNAVAILABLE:
                    info = '服务器不可用';
                    break;
            }
            CommonUtil.devLog(errorCode);
        }
    });
}

/**
 * 获取会话信息
*/
RYManager.getConversation = function () {
    var conversationTypes = null;  //具体格式设置需要补充
    var limit = 150; //获取会话的数量，不传或传null为全部，暂不支持分页
    var start = new Date().getTime();
    instance.getConversationList({
        onSuccess: function (list) {
            RYManager.conversation$.next(list);
            CommonUtil.devLog("成功获取 " + list.length + " 个会话");
        },
        onError: function (error) {
            CommonUtil.devLog(error);
        }
    }, conversationTypes, limit);
}

function initEmoji(){
    RYManager.RongIMEmoji = RongIMLib.RongIMEmoji;

    var config = {
        size: 24,
        lang: 'zh'
    };
    RYManager.RongIMEmoji.init(config);
}

    

    /**
     * 获取历史消息
     */
    RYManager.getHistory = function(receiveId) {
        RongIMClient.getInstance().getHistoryMessages(RongIMLib.ConversationType.PRIVATE,receiveId, new Date().getTime(), 10, {
            onSuccess: function (list, hasMsg) {
                RYManager.targetId = receiveId;
                CommonUtil.devLog(list, hasMsg);
                RYManager.history$.next([list, hasMsg]);
            },
            onError: function (error) {
                CommonUtil.devLog(error);
            }
        });
    }
    /**
     * 发送消息
     */
    RYManager.sendTextMessage = function (sendMsg) {
        if (sendMsg.replace(/(^\s*)|(\s*$)/g, "").length == 0) return;
        
        var content = {
            content: sendMsg,
            extra: {
                "userId": RYManager.userId,
                "userName": ""
            }
        };

        var conversationtype = RongIMLib.ConversationType.PRIVATE; // 私聊
        var msg = new RongIMLib.TextMessage(content);
        instance.sendMessage(conversationtype, RYManager.targetId, msg, {
            onSuccess: function (message) {
                CommonUtil.devLog("发送文字消息成功," + "我(" + RYManager.userId + "):" + sendMsg);
                CommonUtil.devLog(message);
                RYManager.sendNewMsg$.next(message); 
                RYManager.getConversation();
            },
            onError: function (errorCode, message) {
                var info = '';
                switch (errorCode) {
                    case RongIMLib.ErrorCode.TIMEOUT:
                        info = '超时';
                        break;
                    case RongIMLib.ErrorCode.UNKNOWN_ERROR:
                        info = '未知错误';
                        break;
                    case RongIMLib.ErrorCode.REJECTED_BY_BLACKLIST:
                        info = '在黑名单中，无法向对方发送消息';
                        break;
                    case RongIMLib.ErrorCode.NOT_IN_DISCUSSION:
                        info = '不在讨论组中';
                        break;
                    case RongIMLib.ErrorCode.NOT_IN_GROUP:
                        info = '不在群组中';
                        break;
                    case RongIMLib.ErrorCode.NOT_IN_CHATROOM:
                        info = '不在聊天室中';
                        break;
                    default:
                        info = x;
                        break;
                }
                CommonUtil.devLog('发送失败:' + info);
            }
        });
    }

export default RYManager; 

