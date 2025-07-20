# 同步调用处理视频
POST https://woodwise-ai-process-735165036066.asia-southeast1.run.app/process_video
Content-Type: application/json
{
    "material_id": 123,
    "video_path": "/path/to/video.mp4"
}

# 查询视频分镜
GET https://woodwise-ai-process-735165036066.asia-southeast1.run.app/semantic_search?query_str="xxxxx"&match_threshold=0.8&match_count=5

# 创建任务示例
POST https://woodwise-ai-process-735165036066.asia-southeast1.run.app/create_task
Content-Type: application/json
{
    "url": "https://woodwise-ai-process-735165036066.asia-southeast1.run.app/process_video",
    "payload": {
        "material_id": 123,
        "video_path": "/path/to/video.mp4"
    }
}

## 查询任务示例，queue_name 参数是可选的
GET https://woodwise-ai-process-735165036066.asia-southeast1.run.app/query_task?task_id=123456789&queue_name=ai-task-queue



## 报表查询API示例

### 1. 查询单个素材指标
POST https://woodwise-ai-process-735165036066.asia-southeast1.run.app/report/query_material
Content-Type: application/json
{
    "material_id": "7477514162471747585",
    "start_date": "2024-01-01",
    "end_date": "2024-01-31"
}

### 1.1 使用Post ID查询指标
POST https://woodwise-ai-process-735165036066.asia-southeast1.run.app/report/query_material
Content-Type: application/json
{
    "post_id": "7473809032172686598",
    "start_date": "2024-01-01",
    "end_date": "2024-01-31"
}

### 2. 查询多个素材指标
POST https://woodwise-ai-process-735165036066.asia-southeast1.run.app/report/query_materials
Content-Type: application/json
{
    "material_ids": ["7477514162471747585", "7471084145009475601"],
    "start_date": "2024-01-01",
    "end_date": "2024-01-31"
}

### 2.1 使用Post IDs查询多个素材指标
POST https://woodwise-ai-process-735165036066.asia-southeast1.run.app/report/query_materials
Content-Type: application/json
{
    "post_ids": ["7473809032172686598", "7483769362845851931"],
    "start_date": "2024-01-01",
    "end_date": "2024-01-31"
}

### 3. 按条件搜索素材列表 - 用于素材搜索页面
POST https://woodwise-ai-process-735165036066.asia-southeast1.run.app/report/query_materials_by_metrics
Content-Type: application/json
{
    "start_date": "2025-02-01",
    "end_date": "2025-03-28",
    "attribute_filters": {
        "ad_platform": ["Tiktok"],
        "country_code": ["MY", "PH"]
    },
    "range_filters": {
        "material_created_at": {
            "min": "2025-04-01",
            "max": "2025-04-30"
        }
    },
    "metric_filters": {
        "roi": {"min": 1.5, "max": 5.0},
        "spend": {"min": 100}
    },
    "order_by": {
        "roi": "desc"
    },
    "limit": 10
}

### 4. 查询Post相关的所有广告主
GET https://woodwise-ai-process-735165036066.asia-southeast1.run.app/report/query_advertisers_by_post?post_id=7271356491472016386



# 设置GCS中bucket的cors，允许直接从客户端通过签名URL上传文件到bucekt，需要做下面CORS配置：
gcloud storage buckets update gs://YOUR_BUCKET_NAME --cors-file="/path/to/cors.json"
gcloud storage buckets describe gs://YOUR_BUCKET_NAME --format="default(cors)"



# 如何获取素材的高光帧数据：
1， 根据POST ID获取到TT material id（需要提供advertiser id）
2，用TT material id获取该素材的转化数据详情。
具体：
1，Docs | TikTok API for Business
{{base_url}}/v1.3/creative/report/get/?report_type=VIDEO_INSIGHT&advertiser_id={{advertiser_id}}&start_date=2025-03-01&end_date=2025-03-30&filtering={"tiktok_item_ids": ["7473809032172686598"]}
返回的结果中，有素材维度的统计信息，和TT material id

2，Docs | TikTok API for Business
{{base_url}}/v1.3/report/video_performance/get/?advertiser_id={{advertiser_id}}&filtering={"material_ids": ["7475194200469618689"]}&report_type=VIDEO
还可以加上日期限制，类似&start_date=2025-03-01&end_date=2025-03-30
返回的数据中有素材的秒级别信息

注意：
TT materail id可以缓存在materail表的external_info这个JSON属性中。
计划中，这个external_info的结构可以如下：
{
    "TT": {
        "tt_material_id":"XXXXX", 
        "advertiser_ids": ["advertiser1", "advertiser2"]
    }
}
在实际利用的时候，可以先判断该materail是否存在tt_material_id，如果不存在再获取，否则不再需要获取tt_material_id，因为他不会变化。


# 关于数仓的mapping material id和post id的任务
数仓JOB会T+1从素材管理系统中拉取数据，并在广告表中建立materail_id和post_id的关系，但只会处理最近7天的数据。所以要求，当上传materail_id（并设置post_id）的时间，必须是在广告开始投放后的7天内，如果超过7天，会造成部分广告数据永远无法关联materail_id，从而导致投放数据统计不全。