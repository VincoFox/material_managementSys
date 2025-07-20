# 素材表
CREATE TABLE material (
    material_id SERIAL PRIMARY KEY,
    material_name VARCHAR(255) NOT NULL,
    material_type VARCHAR(50) NOT NULL,
    material_category VARCHAR(50),
    video_type VARCHAR(50),
    source_type VARCHAR(50),
    product_name VARCHAR(255),
    topic VARCHAR(255),
    owner_team VARCHAR(100),
    main_category VARCHAR(100),
    first_level_category VARCHAR(100),
    second_level_category VARCHAR(100),
    status VARCHAR(50) DEFAULT 'NotUsed',
    labels TEXT[],
    metadata JSONB,
    director_id INTEGER,
    director_name VARCHAR(100),
    editor_id INTEGER,
    editor_name VARCHAR(100),
    target_country VARCHAR(50),
    target_platform VARCHAR(50),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    user_id INTEGER NOT NULL,
    external_id VARCHAR(100),
    file_size BIGINT,
    duration INTEGER,
    file_path TEXT,
    resolution VARCHAR(50),
    ai_process_status VARCHAR(100) DEFAULT 'NotProcessed',
    ai_process_task_id TEXT,
    ai_process_msg TEXT,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    is_deleted BOOLEAN DEFAULT FALSE
);

-- 添加列注释
COMMENT ON COLUMN material.material_name IS '素材名称，一般用作文件名';
COMMENT ON COLUMN material.material_type IS '素材类型，比如video/picture';
COMMENT ON COLUMN material.material_category IS '素材类别，如：种草、营销、品牌';
COMMENT ON COLUMN material.video_type IS '视频类型，如:达人二剪、长短剧、PPT模版';
COMMENT ON COLUMN material.source_type IS '来源类型，如PGC/UGC';
COMMENT ON COLUMN material.product_name IS '相关产品名称';
COMMENT ON COLUMN material.topic IS '内容策划主题';
COMMENT ON COLUMN material.owner_team IS '素材归属团队';
COMMENT ON COLUMN material.main_category IS '主要类别，如：彩妆、护肤等';
COMMENT ON COLUMN material.first_level_category IS '一级类别，如：洁面、防晒等';
COMMENT ON COLUMN material.second_level_category IS '二级类别，如：痘痘净、泥膜';
COMMENT ON COLUMN material.status IS '素材状态：未投放(NotUsed)、已投放(Used)、投放失败(Failed)';
COMMENT ON COLUMN material.labels IS '标签数组';
COMMENT ON COLUMN material.metadata IS '该素材的元数据信息';
COMMENT ON COLUMN material.director_id IS '编导ID';
COMMENT ON COLUMN material.director_name IS '编导姓名';
COMMENT ON COLUMN material.editor_id IS '剪辑ID';
COMMENT ON COLUMN material.editor_name IS '剪辑姓名';
COMMENT ON COLUMN material.target_country IS '素材目标国家，如：中国、美国、日本等';
COMMENT ON COLUMN material.target_platform IS '素材目标平台，如：TikTok、Instagram、Facebook等';
COMMENT ON COLUMN material.created_at IS '素材上传时间';
COMMENT ON COLUMN material.user_id IS '上传者user id';
COMMENT ON COLUMN material.external_id IS '外部系统关联ID，比如UGC流程中提供的TT的post id，具备唯一性';
COMMENT ON COLUMN material.file_size IS '文件大小(bytes)';
COMMENT ON COLUMN material.duration IS '视频时长(秒)';
COMMENT ON COLUMN material.file_path IS '文件存储路径，完整的URI';
COMMENT ON COLUMN material.resolution IS '视频分辨率';
COMMENT ON COLUMN material.ai_process_status IS 'AI处理进度状态：未拆解(NotProcessed)、已调度(Scheduled)、拆解中(Processing)、拆解完成(Processed)、拆解失败(Failed)';
COMMENT ON COLUMN material.ai_process_task_id IS 'AI处理任务ID/Name字符串类型，用于查询任务状态';
COMMENT ON COLUMN material.ai_process_msg IS 'AI处理结果信息，包含错误信息等';

-- 创建索引
CREATE INDEX idx_material_material_type ON material(material_type);
CREATE INDEX idx_material_status ON material(status);
CREATE INDEX idx_material_created_at ON material(created_at);
CREATE INDEX idx_material_external_id ON material(external_id);
ALTER TABLE material ADD CONSTRAINT uq_material_external_id UNIQUE (external_id);


-- 投放信息表
CREATE TABLE material_ad_info (
    id SERIAL PRIMARY KEY,
    material_id INTEGER NOT NULL REFERENCES material(material_id),
    platform VARCHAR(50) NOT NULL,
    status VARCHAR(50) DEFAULT 'Scheduled',
    task_id TEXT,
    error TEXT,
    ad_id VARCHAR(100),
    post_id VARCHAR(100),
    campaign_id VARCHAR(100),
    adgroup_id VARCHAR(100),
    video_id VARCHAR(100),
    cover_image TEXT,
    platform_account_id VARCHAR(100),
    ad_text TEXT,
    call_to_action VARCHAR(100),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 添加列注释
COMMENT ON COLUMN material_ad_info.platform IS '广告平台';
COMMENT ON COLUMN material_ad_info.status IS '在广告平台中的状态,Scheduled:已调度,VideoUploaded:视频上传中,CoverImgGenerated:封面图生成中,AdCreated:广告创建中,Completed:投放完成,Failed:投放失败';
COMMENT ON COLUMN material_ad_info.task_id IS 'AI处理任务ID/Name字符串类型，用于查询任务状态';
COMMENT ON COLUMN material_ad_info.error IS '最近的错误信息';
COMMENT ON COLUMN material_ad_info.ad_id IS '广告计划ID';
COMMENT ON COLUMN material_ad_info.post_id IS '广告平台中对应的作品ID';
COMMENT ON COLUMN material_ad_info.campaign_id IS '广告系列ID';
COMMENT ON COLUMN material_ad_info.adgroup_id IS '广告组ID';
COMMENT ON COLUMN material_ad_info.video_id IS '广告平台中的视频ID';
COMMENT ON COLUMN material_ad_info.cover_image IS '封面图ID或URI';
COMMENT ON COLUMN material_ad_info.platform_account_id IS '到平台的账号标识，TT中push spark ad中的identity';
COMMENT ON COLUMN material_ad_info.ad_text IS '广告文案';
COMMENT ON COLUMN material_ad_info.call_to_action IS '行动召唤按钮文本';

-- 创建索引
CREATE INDEX idx_ad_info_material_id ON material_ad_info(material_id);
CREATE INDEX idx_ad_info_platform ON material_ad_info(platform);
CREATE INDEX idx_ad_info_status ON material_ad_info(status);



# 配置表
CREATE TABLE configuration (
    id SERIAL PRIMARY KEY,
    config_name VARCHAR(100) NOT NULL,
    config_json JSONB NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(config_name)
);

-- 添加列注释
COMMENT ON COLUMN configuration.config_name IS '配置名称';
COMMENT ON COLUMN configuration.config_json IS '配置内容';

-- 创建索引
CREATE INDEX idx_configuration_config_name ON configuration(config_name);



-- 分镜表 （metadata + 向量）
create extension if not exists vector
with
  schema public;

CREATE TABLE video_storyboard (
    shot_id SERIAL PRIMARY KEY,          -- 自增主键
    material_id INT NOT NULL,                        -- 关联 materials 表
    start_time FLOAT NOT NULL,                    -- 开始时间（秒）
    end_time FLOAT NOT NULL,                      -- 结束时间（秒）
    shot_content TEXT,                   -- 镜头内容描述
    subtitle TEXT,                       -- 字幕
    narration TEXT,                      -- 旁白
    tags JSONB,                          -- 标签，JSONB 类型
    content_vector VECTOR,           -- 向量，
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP, -- 创建时间
);

-- 为常用字段添加索引
CREATE INDEX idx_shots_video_id ON Shots (video_id);
CREATE INDEX idx_shots_start_time ON Shots (start_time);
CREATE INDEX idx_shots_tags ON Shots USING GIN (tags);  -- GIN 索引支持 JSONB 查询
CREATE INDEX idx_shots_content_vector ON Shots USING ivfflat (content_vector vector_l2_ops);  -- 向量索引



-- -- 搜索函数
-- -- Match documents using cosine distance (<=>)
-- create or replace function match_videos (
--   query_embedding vector(768),
--   match_threshold float,
--   match_count int
-- )
-- returns setof video_storyboard
-- language sql
-- as $$
--   select *
--   from video_storyboard
--   where video_storyboard.content_vector <=> query_embedding < 1 - match_threshold
--   order by video_storyboard.content_vector <=> query_embedding asc
--   limit least(match_count, 50);
-- $$;


-- 搜索函数，返回视频分镜信息
-- Match documents using cosine distance (<=>)
create or replace function match_videos (
  query_embedding vector(1536),
  match_threshold float,
  match_count int
)
returns table (
  shot_id int,
  material_id int,
  start_time float,
  end_time float,
  shot_content text,
  subtitle text,
  narration text,
  tags jsonb,
  created_at timestamp,
  similarity float
)
language sql
as $$
  select 
    video_storyboard.shot_id,
    video_storyboard.material_id,
    video_storyboard.start_time,
    video_storyboard.end_time,
    video_storyboard.shot_content,
    video_storyboard.subtitle,
    video_storyboard.narration,
    video_storyboard.tags,
    video_storyboard.created_at,
    1 - (video_storyboard.content_vector <=> query_embedding) as similarity
  from video_storyboard
  where video_storyboard.content_vector <=> query_embedding < 1 - match_threshold
  order by video_storyboard.content_vector <=> query_embedding asc
  limit least(match_count, 50);
$$;