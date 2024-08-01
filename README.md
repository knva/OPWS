### 武神传说代理页面 OPWS

Original Pure WSMUD

#### 特性
- **自动加载脚本**：网站在运行时会自动加载所需的脚本，无需手动干预，确保页面和功能始终可用。
- **官方接口**：使用官方接口进行操作，保证了页面的稳定性和兼容性。
- **无加载烦恼**：彻底解决无法加载页面的问题，提供流畅的用户体验。

#### 脚本
- `wsmud_pluginss.user.js`：插件脚本
- `wsmud_raid.js`：Raid功能脚本
- `wsmud_trigger.js`：触发器脚本
- `wsmud_login1.js`：登录功能脚本
- `wsmud_funny2.js`：趣味脚本（未使用）

#### 使用方法

一般情况下不需要构建项目，直接运行 `npm run dev` 即可。 

1. **构建项目**：
    ```bash
    npm run build
    ```

2. **启动开发服务器**：
    ```bash
    npm run dev
    ```

3. **打开浏览器**：访问
    ```
    localhost:3000
    ```

Docker

```
docker build -t opws .
docker run -p 3000:3000 opws
```