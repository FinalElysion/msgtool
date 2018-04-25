require('bootstrap/scss/bootstrap.scss');
require('bootstrap');
require('../assets/main.scss');

import RYManager from './RYManager';
import CommonUtil from './common';
import ViewManager from './ViewManager';
import Rx from 'rxjs/Rx';

let $ = require("jquery");

// window.RYManager =RYManager;
RYManager.isConnected$.subscribe(x => {
	if(x){
		ViewManager.initEmoji();
		ViewManager.hideConnect(); 
	}
	console.log("连接状态:" + x);
});

RYManager.conversation$.subscribe(list => {
	console.log("会话",list);
    ViewManager.refreshUserList(list);
});

RYManager.history$.subscribe(result=>{
	let list = result[0];
	let hasNew = result[1];
	console.log(list);
	ViewManager.addHistory2MsgResult(list);
})

RYManager.sendNewMsg$.subscribe(msg=>{
	ViewManager.showMsgToResult(msg,true);
})

RYManager.receiveNewMsg$.subscribe(msg=>{
	ViewManager.showMsgToResult(msg,false);
})

ViewManager.initViewEvent();


