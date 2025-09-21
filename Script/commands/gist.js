const fs = require("fs-extra");
const axios = require("axios");

async function baseApiUrl() {
  const base = await axios.get(
    "https://raw.githubusercontent.com/Blankid018/D1PT0/main/baseApiUrl.json"
  );
  return base.data.api;
}

module.exports.config = {
  name: "gist",
  version: "6.9.0",
  role: 2,
  author: "dipto",
  description: "Convert code into a gist link",
  category: "convert",
  guide: {
    en: "[filename] | reply with code + filename"
  },
  countDown: 1
};

module.exports.onStart = async function ({ api, event, args }) {
  const admin = ["61557991443492"]; // owner UID
  const fileName = args[0];

  if (!admin.includes(event.senderID)) {
    return api.sendMessage(
      "⚠ | You do not have permission to use this command.",
      event.threadID,
      event.messageID
    );
  }

  if (!fileName) {
    return api.sendMessage(
      "❌ | Please provide a file name.\nExample: gist test",
      event.threadID,
      event.messageID
    );
  }

  const path = `${__dirname}/${fileName}.js`;

  try {
    let code = "";

    if (event.type === "message_reply") {
      code = event.messageReply.body;
    } else {
      code = await fs.promises.readFile(path, "utf-8");
    }

    const en = encodeURIComponent(code);

    const response = await axios.post(`${await baseApiUrl()}/gist`, {
      code: en,
      nam: `${fileName}.js`
    });

    const diptoUrl = response.data.data;
    return api.sendMessage(diptoUrl, event.threadID, event.messageID);

  } catch (error) {
    console.error("❌ Gist Error:", error);
    return api.sendMessage(
      "⚠ | Command not found or API problem.",
      event.threadID,
      event.messageID
    );
  }
};
