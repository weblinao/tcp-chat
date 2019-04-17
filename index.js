const net = require('net');
let count = 0; // 当前连接数
let users = {}

/**
 * 创建服务器
 */
let server = net.createServer((conn) => {
  conn.setEncoding('utf8');
  conn.write(`
    > welcome to node-chat ,${count} other people are connected at this time. please write your name and press enter:
  `);

  count++;

  let nickname = ''; // 昵称
  let currInput = ''; // 当前输入
  let isFirstInput = true; // 是否第一次输入
  conn.on('data', data => {
    currInput += data;
    if (data.includes('\n')) { // 按下回车 -> 一次输入完毕
      currInput = currInput.replace('\r\n', '');

      if (isFirstInput) { // 第一次输入为昵称
        if (users[currInput]) { // 检查是否已存在用户
          currInput = '';
          conn.write('\033[93m> nickname already in use. try again:\033[93m ');
          return;
        } else {
          isFirstInput = false;
          nickname = currInput;
          users[nickname] = conn; // 保存用户

          // 通知所有用户
          broadcast('\033[90m > ' + nickname + ' jonined the room\033[93m\n');
        }
      } else { // 否则是聊天内容
        // 发送给除自己外所有人
        broadcast('\033[96m > ' + nickname + ' :\033[93m ' + currInput + '\n', true);
      }
      currInput = '';
    }
  });
  conn.on('close', () => {
    count--;
    delete users[nickname];
    broadcast('\033[90m > ' + nickname + ' left th room\033[93m\n');
  });

  /**
   * 广播消息
   * @param {string} msg 消息内容
   * @param {boolean} exceptMyself 是否包括自己
   */
  function broadcast (msg, exceptMyself = false) {
    for (let userName in users) {
      if (!exceptMyself || userName !== nickname) {
        users[userName].write(msg);
      }
    }
  }
});

/**
 * 监听
 */
server.listen(3000, () => {
  console.log('\033[96m   server listening on *:3000\033[39m');
})