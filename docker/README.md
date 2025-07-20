# 为web项目准备Dockerfile
用命令：npm install --package-lock-only，从package.json生成package-lock.json
设置next.config.js，开启standalone模式，具体参考模版文件
设置Dockerfile，采用两阶段build

# 构建镜像
docker build -t <镜像名>:<标签> <上下文路径>

# 在api和web目录下执行
docker build -t yc3231996/yingkou-assethub-web:latest .

# push到docker hub
docker push yc3231996/yingkou-assethub-web:latest

# 在docker目录下执行
docker-compose up -d
注意用docker compose up命令时，不会去拉取latest镜像，如果latest镜像有变化，需要先用docker compose pull命令拉取镜像，再使用docker compose up命令启动服务。因为docker compose pull命令会强制拉取最新镜像，而docker compose up命令不会。


# 部署
在服务上的docker目录下手动建.env文件



# UCloud上关于扩容：
https://docs.ucloud.cn/uhost/guide/disk
注意操作系统对应的命令。先在后台扩容，然后登陆进去扩容。