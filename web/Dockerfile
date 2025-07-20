# ------------------------
# 第一阶段：构建阶段（完整依赖）
# ------------------------
    FROM node:22-alpine3.20 AS builder

    WORKDIR /app
        
    # 复制依赖清单（利用 Docker 缓存层）
    COPY package.json package-lock.json* ./
    
    # 安装完整依赖（含 devDependencies）
    RUN npm ci --prefer-offline --no-audit && \
        # 清理npm缓存
        # npm cache clean --force
        rm -rf /root/.npm/_cacache
    
    # 复制源代码
    COPY . .
    
    # 生产环境构建（显式设置 NODE_ENV）
    RUN NODE_ENV=production npm run build
    
    # ------------------------
    # 第二阶段：运行阶段（最小化生产镜像）
    # ------------------------
    FROM node:22-alpine3.20 AS runner
    
    WORKDIR /app
    ENV NODE_ENV=production \
        PORT=3000
    
    # 从构建阶段复制必要文件
    # Next.js的standalone输出模式会将所有依赖打包到 .next/standalone 目录中，包括 node_modules
    # 所以运行阶段没必要再运行 npm ci --only=production
    COPY --from=builder /app/.next/standalone ./
    COPY --from=builder /app/.next/static ./.next/static
    COPY --from=builder /app/public ./public
    
    # 清理系统缓存
    RUN rm -rf /var/cache/apk/*
    
    # 暴露端口并启动，standalone模式不能使用npm start
    EXPOSE 3000
    CMD ["node", "server.js"]