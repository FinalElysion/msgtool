import Rx from 'rxjs/Rx';
import CommonUtil from './common';
import RYManager from './RYManager';

let $ = require("jquery");
let selectedItem = null;
let ViewManager = {};
let emojiPanel;
let emojiContainer;

ViewManager.initEmoji = function(){
	let emojis = getEmojiDetailList();
	bindClickEmoji(emojis);
}

ViewManager.initViewEvent = function (){
	$(document).ready(function(){

		emojiPanel = document.getElementById("chatbox-emoji-panel");
		emojiContainer = document.getElementById("emoji-container");
		ViewManager.setListEvent(); 

		$("#chatbox-emoji-btn").click(function(event){
			event.stopPropagation();
			emojiContainer.style.visibility = "visible";
		})

		$("#connect-btn").click(function(){
			RYManager.connect($("#user-id").val());
		})

		$("#talkMsg").keydown(function (event) {
	        if (event.keyCode == "13") {
	            if (!RYManager.isConnected) {
	                alert("请先链接");
	            } else if(!RYManager.targetId){
	            	alert("请选择一个用户进行对话");
	            }else{
	                RYManager.sendTextMessage(getInputMsg());
	            }
	        }
	    });

	    $(".btn-send-message").click(function () {
	        $this = $(this);
	        if (!me._talk.isConnected) {
	            alert("请先链接");
	        } else {
	            RYManager.sendTextMessage(getInputMsg());
	        }
	        return false;
	    });

	    /*
			处理 bootstrap popover点击触发两次的问题
		*/
		$(document).on('click', function (e) {
			emojiContainer.style.visibility = "hidden";
		    $('[data-toggle="popover"],[data-original-title]').each(function () {
		        if (!$(this).is(e.target) && $(this).has(e.target).length === 0 && $('.popover').has(e.target).length === 0) {
		            (($(this).popover('hide').data('bs.popover') || {}).inState || {}).click = false  // fix for BS 3.3.6
		        }
		    }); 
		});

	})
}

ViewManager.setListEvent = function(){
	$(".user").click(function(e){
		if(selectedItem){
			$(selectedItem).removeClass("selected-item");
		}
		selectedItem = e.currentTarget;
		$(e.currentTarget).addClass("selected-item");
		let targetid = $(e.currentTarget).attr("targetid");
		$(".target-user").html(targetid + ":聊天中");
		RYManager.getHistory(targetid);
	})
}

ViewManager.addHistory2MsgResult = function(list) {
	$("#chatbox-emoji-btn")[0].style.visibility = "visible";
	$("#talkResult").empty();
    list.forEach(function (message, index) {
        ViewManager.showMsgToResult(message, (RYManager.userId == message.senderUserId));
    })
}

ViewManager.refreshUserList = function(list){
	$("#msg-list").empty();
	for (var i = 0; i < list.length; i++) {
        var temp = list[i];
        var tempDate = new Date(temp.sentTime);
        //tempDate.getFullYear() + "/" + (tempDate.getMonth() + 1) + "/" + tempDate.getDate()
        var tempTime = tempDate.getHours() + ":" + tempDate.getMinutes() + " " + (tempDate.getMonth() + 1) + "/" + tempDate.getDate() ;
        ViewManager.addListItem(temp.targetId, temp.latestMessage.content.extra.userName,temp.latestMessage.content.content, tempTime);
    }
    ViewManager.setListEvent();
    selectCurrentList();
}

ViewManager.addListItem = function(targetId, userName, msg, time) {
	//if(targetId =="3") return;
    var name = userName ? userName : targetId;
   
    var temp = document.getElementById("msg-list").innerHTML; 
    
    document.getElementById("msg-list").innerHTML = [temp,
    	'<div class="user" targetid="' + targetId + '">',
			'<img src="assets/1.jpg">',
			'<div class="name">' + targetId +'<span>' +time+'<span></div>',
			'<div class="last-msg">' + msg +'</div>',
		'</div>'].join('');

    $("#msg-list")[0].scrollTop = $("#msg-list")[0].scrollHeight;
}


/**
 *  send true ->add to right side
 */
ViewManager.showMsgToResult = function(message, send) {
    if (send) {
        document.getElementById("talkResult").innerHTML += ['<div class=" talk-bubble-container talk-right-bubble-container">',
            '<div >',
            RYManager.RongIMEmoji.symbolToEmoji(message.content.content),
            '</div>',
            '<p class="arrow arrow-right"></p>',
            '<span class="talk-user-me">我</span>',
            '</div>'].join('');
            resetInputMsg();
    } else {
    	let name = message.senderUserId;//.content.extra.userName ? message.content.extra.userName :'匿名' ;
        document.getElementById("talkResult").innerHTML += [

        '<div>',
         	'<span class="talk-user-service">'+ name+'</span>',
	        '<div class=" talk-bubble-container talk-left-bubble-container">',
	            '<div >',
	            	RYManager.RongIMEmoji.symbolToEmoji(message.content.content),
	            '</div>',
	            '<p class="arrow arrow-left"></p>',  
	        '</div>',
        '</div>'].join('');
    }
    $("#talkResult")[0].scrollTop = $("#talkResult")[0].scrollHeight;
}
ViewManager.hideConnect = function (){
	$(".button-content")[0].style.visibility = "hidden";
}

/**
 * 给表情绑定点击事件 并添加到表情panel
 */
function bindClickEmoji(emojis) {
	
    for (var i = 0; i < emojis.length; i++) {
        var emojiHtml = emojis[i];
        emojiPanel.appendChild(emojiHtml);
        emojiHtml.onclick = clickEmoji;
    }
}
/**
 * 获取表情列表
 */
function getEmojiDetailList() {
	console.log(RYManager);
    var shadowDomList = [];
    for (var i = 0; i < RYManager.RongIMEmoji.list.length; i++) {
        var value = RYManager.RongIMEmoji.list[i];
        shadowDomList.push(value.node);
    }
    return shadowDomList;
}
/**
 * 点击表情处理
 */
function clickEmoji(event) {
    var e = event || window.event;
    var target = e.target || e.srcElement;
    if (document.all && !document.addEventListener === false) {
        devLog(target);
    }
    $("#talkMsg").val($("#talkMsg").val() + target.getAttribute("name"));
    var talkMsg = document.getElementById('talkMsg');
	talkMsg.focus();
    emojiContainer.style.visibility = "hidden";

}

function selectCurrentList(){
	console.log(RYManager.targetId);
	selectedItem = $('.user[targetid="'+RYManager.targetId +'"]')[0];
	$(selectedItem).addClass("selected-item");
}

/**
 * 获取输入内容
 */
function getInputMsg() {
    return $("#talkMsg").val();
}
/**
 * 重置输入框
 */
function resetInputMsg() {
    return $("#talkMsg").val('');
}
export default ViewManager; 
