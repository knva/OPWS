# 使用官方 Node.js 20 镜像作为基础镜像
FROM node:20

# 创建并设置工作目录
WORKDIR /usr/src/app

# 复制 package.json 和 package-lock.json 文件
COPY package*.json ./

# 安装应用程序的依赖
RUN npm install

# 复制应用程序的源代码
COPY . .

# 暴露应用程序运行所需的端口（根据需要调整）
EXPOSE 3000

# 启动应用程序
CMD ["node", "app.js"]
