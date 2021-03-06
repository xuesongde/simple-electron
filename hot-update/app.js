const { app, BrowserWindow } = require("electron");
const path = require("path");
const url = require("url");
const fs = require("fs");

let window = null;

var https = require("https");
var http = require("http");
var request = require("request");
var AdmZip = require("adm-zip");

var getHttpsData = function(filepath, success, error) {
  // 回调缺省时候的处理
  success = success || function() {};
  error = error || function() {};

  var url =
    "https://raw.githubusercontent.com/xuesongde/simple-electron/master/hot-update/" +
    filepath +
    "?r=" +
    Math.random();

  https.get(url, function(res) {
    var statusCode = res.statusCode;

    if (statusCode !== 200) {
      // 出错回调
      error();
      // 消耗响应数据以释放内存
      res.resume();
      return;
    }

    res.setEncoding("utf8");
    var rawData = "";
    res.on("data", function(chunk) {
      rawData += chunk;
    });

    // 请求结束
    res
      .on("end", function() {
        // 成功回调
        success(rawData);
      })
      .on("error", function(e) {
        // 出错回调
        error();
      });
  });
};
const downLoad = () => {
  //循环多线程下载
  for (let i = 0; i < 1; i++) {
    let fileName = "source.zip";
    let url = "http://localhost:3030/" + fileName;
    let stream = fs.createWriteStream("./source.zip");
    request(url)
      .pipe(stream)
      .on("close", function(err) {
        const unzip = new AdmZip("./source.zip");
        unzip.extractAllTo("./", /*overwrite*/ true);
        console.log("更新完毕");
      });
  }
};
function success(data) {
  const dataObj = JSON.parse(data);
  fs.readFile("./package.json", function read(err, data) {
    if (err) {
      throw err;
    }
    const localVersion = JSON.parse(data).version;
    debugger;
    if (localVersion !== dataObj.version) {
      // your app need to update
      downLoad();
    }
  });
}
function error() {
  console.error("something going wrong when download");
}
// Wait until the app is ready
app.once("ready", () => {
  // Create a new window
  window = new BrowserWindow({
    // Set the initial width to 800px
    width: 10000000,
    // Set the initial height to 600px
    height: 10000000,
    simpleFullscreen: true,
    // Set the default background color of the window to match the CSS
    // background color of the page, this prevents any white flickering
    backgroundColor: "#D6D8DC",
    // Don't show the window until it's ready, this prevents any white flickering
    show: false
  });
  getHttpsData("package.json", success, error);
  // Load a URL in the window to the local index.html path
  window.loadURL(
    url.format({
      pathname: path.join(__dirname, "index.html"),
      protocol: "file:",
      slashes: true
    })
  );

  // window.loadURL("http://10.0.74.61/");

  // Show window when page is ready
  window.once("ready-to-show", () => {
    window.show();
  });
});
