let CommonUtil = {};
var _isDev = true;

CommonUtil.devLog = function(msg1, msg2, msg3) {
    if (_isDev) {
        if (msg3) {
            console.log(msg1, msg2, msg3);
        } else if (msg2) {
            console.log(msg1, msg2);
        } else
            console.log(msg1);
    }
}

export default CommonUtil;