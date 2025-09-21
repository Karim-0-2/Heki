const OWNER_UID = "61557991443492";

module.exports.config = {
  name: "file",
  version: "1.0.1",
  hasPermssion: 2,
  credits: "nazrul",
  description: "Delete the file or folder in the commands folder",
  commandCategory: "Admin",
  usages: "\ncommands start <text>\ncommands ext <text>\ncommands <text>\ncommands [leave blank]\ncommands help\nNOTE: <text> is the character you want to enter",
  cooldowns: 5
};

module.exports.handleReply = ({ api, event, handleReply }) => {
  // ✅ UID restriction
  if (event.senderID != OWNER_UID) {
    return api.sendMessage("❌ You are not allowed to use this command.", event.threadID, event.messageID);
  }
  if (event.senderID != handleReply.author) return;

  const fs = require("fs-extra");
  const arrnum = event.body.split(" ");
  let msg = "";
  const nums = arrnum.map(n => parseInt(n));

  for (let num of nums) {
    if (isNaN(num) || num < 1 || num > handleReply.files.length) {
      msg += `⚠️ Invalid number: ${num}\n`;
      continue;
    }

    const target = handleReply.files[num - 1];
    try {
      const fileOrdir = fs.statSync(__dirname + '/' + target);
      let typef = "";

      if (fileOrdir.isDirectory()) {
        typef = "[Folder🗂️]";
        fs.rmSync(__dirname + '/' + target, { recursive: true, force: true });
      } else if (fileOrdir.isFile()) {
        typef = "[File📄]";
        fs.unlinkSync(__dirname + "/" + target);
      }

      msg += typef + ' ' + target + "\n";
    } catch (err) {
      msg += `⚠️ Skipped: ${target} (error: ${err.message})\n`;
    }
  }

  api.sendMessage("⚡️Deleted the following files in the commands folder:\n\n" + msg, event.threadID, event.messageID);
};

module.exports.run = async function({ api, event, args }) {
  // ✅ UID restriction
  if (event.senderID != OWNER_UID) {
    return api.sendMessage("❌ You are not allowed to use this command.", event.threadID, event.messageID);
  }

  const fs = require("fs-extra");
  let files = fs.readdirSync(__dirname + "/") || [];
  let msg = "", i = 1;

  if (args[0] == 'help') {
    let msg = `
How to use the command:
•Key: start <text>
•Effect: Filter out files to be deleted with an optional starting character
•Example: commands rank
•Key: ext <text>
•Effect: Filter out files to be deleted with optional extension
•Effect: filter out files in the name with custom text
•Example: commands a
•Key: leave blank
•Effect: filter out all files in the cache
•Example: commands
•Key: help
•Effect: see how to use the command
•Example: commands help`;
    return api.sendMessage(msg, event.threadID, event.messageID);
  } else if (args[0] == "start" && args[1]) {
    var word = args.slice(1).join(" ");
    files = files.filter(file => file.startsWith(word));
    if (files.length == 0) return api.sendMessage(`⚡️No files start with: ${word}`, event.threadID, event.messageID);
    var key = `⚡️Found ${files.length} file(s) starting with: ${word}`;
  } else if (args[0] == "ext" && args[1]) {
    var ext = args[1];
    files = files.filter(file => file.endsWith(ext));
    if (files.length == 0) return api.sendMessage(`⚡️No files end with: ${ext}`, event.threadID, event.messageID);
    var key = `⚡️Found ${files.length} file(s) ending with: ${ext}`;
  } else if (!args[0]) {
    if (files.length == 0) return api.sendMessage("⚡️No files or folders in commands folder", event.threadID, event.messageID);
    var key = "⚡️All files in commands folder:";
  } else {
    var word = args.slice(0).join(" ");
    files = files.filter(file => file.includes(word));
    if (files.length == 0) return api.sendMessage(`⚡️No files include: ${word}`, event.threadID, event.messageID);
    var key = `⚡️Found ${files.length} file(s) including: ${word}`;
  }

  files.forEach(file => {
    const fileOrdir = fs.statSync(__dirname + '/' + file);
    let typef = fileOrdir.isDirectory() ? "[Folder🗂️]" : "[File📄]";
    msg += (i++) + '. ' + typef + ' ' + file + '\n';
  });

  api.sendMessage(`⚡️Reply with the number(s) to delete corresponding files (can separate multiple with spaces).\n${key}\n\n${msg}`, event.threadID, (e, info) => global.client.handleReply.push({
    name: this.config.name,
    messageID: info.messageID,
    author: event.senderID,
    files
  }));
};
