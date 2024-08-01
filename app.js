const express = require("express");
const proxy = require("express-http-proxy");
const path = require("path");
const { exec } = require('child_process');
const fs = require('fs');
const app = express();

// 提供静态文件服务
app.use(express.static(path.join(__dirname, "public")));

// 运行 npm run download
function runDownloadScript() {
  exec("npm run download", (error, stdout, stderr) => {
    if (error) {
      console.error("执行命令失败:", error);
      return;
    }
    console.log("标准输出:", stdout);
    if (stderr) {
      console.error("标准错误:", stderr);
    }
  });
}

// 处理 /UserAPI/ 的代理
app.use(
  "/UserAPI/",
  proxy("http://www.wamud.com", {
    proxyReqOptDecorator: (proxyReqOpts, srcReq) => {
      // 复制源请求的头信息
      proxyReqOpts.headers["X-Real-IP"] = srcReq.ip;
      proxyReqOpts.headers["X-Forwarded-For"] =
        srcReq.headers["x-forwarded-for"] || srcReq.ip;
      proxyReqOpts.headers["X-Forwarded-Proto"] = srcReq.protocol;
      proxyReqOpts.headers["Host"] = srcReq.headers.host;
      return proxyReqOpts;
    },
    proxyReqPathResolver: (req) => {
      // 保持请求路径不变
      return req.originalUrl;
    },
  })
);

// 处理 /Game/ 的代理
app.use(
  "/Game/",
  proxy("http://www.wamud.com", {
    proxyReqOptDecorator: (proxyReqOpts, srcReq) => {
      // 复制源请求的头信息
      proxyReqOpts.headers["X-Real-IP"] = srcReq.ip;
      proxyReqOpts.headers["X-Forwarded-For"] =
        srcReq.headers["x-forwarded-for"] || srcReq.ip;
      proxyReqOpts.headers["X-Forwarded-Proto"] = srcReq.protocol;
      proxyReqOpts.headers["Host"] = srcReq.headers.host;
      return proxyReqOpts;
    },
    proxyReqPathResolver: (req) => {
      // 保持请求路径不变
      return req.originalUrl;
    },
  })
);

// 处理其他请求返回 404
app.use((req, res) => {
  res.status(404).send("Not Found");
});


// 启动服务器
const PORT = 3000;
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
