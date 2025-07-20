import os
from supabase import create_client, Client
from dotenv import load_dotenv
from google import genai
from google.genai.types import HttpOptions, Part
import json
from prompt import PROCESS_VIDEO_PROMPT

load_dotenv()


# 提供对视频进行AI处理的功能，包括：
# 1. 分析视频生成分镜信息并插入数据库
# 2. 根据关键词搜索视频分镜信息
class VideoAiProcessor:
    def __init__(self):
        self.genai_client = genai.Client(http_options=HttpOptions(api_version="v1"))
        self.supabase_client = create_client(os.environ.get("SUPABASE_URL"), os.environ.get("SUPABASE_KEY"))
        self.video_process_schema = {
            "type": "object",
            "required": ["video_brief", "shots"],
            "properties": {
                "video_brief": {
                "type": "string",
                "description": "视频简介"
                },
                "metadata": {
                "type": "object",
                "description": "视频基本信息, JSON格式"
                },
                "shots": {
                "type": "array",
                "description": "分镜信息",
                "items": {
                    "type": "object",
                    "properties": {
                        "start_time": {
                            "type": "number",
                            "description": "镜头开始时间（秒）"
                        },
                        "end_time": {
                            "type": "number",
                            "description": "镜头结束时间（秒）"
                        },
                        "shot_content": {
                            "type": "string",
                            "description": "镜头内容描述"
                        },
                        "subtitle": {
                            "type": "string",
                            "description": "字幕内容"
                        },
                        "narration": {
                            "type": "string",
                            "description": "旁白内容"
                        },
                        "tags": {
                            "type": "object",
                            "description": "标签, JSON格式"
                        }
                    },
                    "required": ["start_time", "end_time"]
                }
                }
            }
        }
    
    # text-embedding-005是英文模型，输出768维，EmbedContentResponse：response.embeddings[0].values
    # text-multilingual-embedding-002为多语言模型，输出1536维
    def get_embedding(self, texts: list):
        return self.genai_client.models.embed_content(
            model="text-multilingual-embedding-002",
            contents=texts
        )
    
    # 分析视频，生成分镜信息
    def analyze_video(self, video_path: str):
        uri = f"gs://{video_path}"
        contents = [Part.from_uri(file_uri=uri, mime_type="video/mp4"), PROCESS_VIDEO_PROMPT]

        response = self.genai_client.models.generate_content(
            model="gemini-2.0-flash-001",
            contents=contents,
            config={
                "response_mime_type": "application/json",
                "response_schema": self.video_process_schema,
            },
        )
        print(f"video {video_path} processed: {response.text}")
        return json.loads(response.text)
    
    # 保存分镜信息
    def save_storyboard(self, shot_data):
        self.supabase_client.table("video_storyboard").upsert(shot_data).execute()
        print(f"已保存镜头: {shot_data}")

    # 清楚某个素材的所有分镜信息
    def clear_storyboard(self, material_id: int):
        self.supabase_client.table("video_storyboard").delete().eq("material_id", material_id).execute()
        print(f"已清除素材 {material_id} 的所有分镜信息")

    # 根据关键词搜索视频分镜信息
    def semantic_search(self, query_str: str, match_threshold: float = 0.7, match_count: int = 10):
        # 获取查询字符串的向量表示
        query_embedding = self.get_embedding([query_str])
        # 提取向量值
        embedding_vector = query_embedding.embeddings[0].values
        
        # 使用supabase的match_videos函数进行相似度搜索
        response = self.supabase_client.rpc(
            "match_videos", 
            {
                "query_embedding": embedding_vector,
                "match_threshold": match_threshold,
                "match_count": match_count
            }
        ).execute()
        
        # 返回搜索结果
        return response.data

    # 更新素材处理状态
    def update_material_status(self, material_id: int, status: str, msg: str = None):
        """
        更新素材处理状态
        
        Args:
            material_id (int): 素材 ID
            status (str): 状态值 ("Processing", "Completed", "Failed")
            msg (str, optional): 处理消息，将更新到 ai_process_msg 字段
        """
        update_data = {"ai_process_status": status}
        if msg is not None:
            update_data["ai_process_msg"] = msg
        
        self.supabase_client.table("material").update(update_data).eq("material_id", material_id).execute()
        print(f"素材 {material_id} 的状态已更新为 {status}" + (f"，消息：{msg}" if msg else ""))


    # 分析视频，生成分镜信息，并保存到数据库
    # material_id 素材id
    # video_path 视频在GCS上的路径
    def run(self, material_id: int, video_path: str):
        try:
            # 更新状态为处理中
            self.update_material_status(material_id, "Processing")
            
            # 检查material_id是否存在        
            material = self.supabase_client.table("material").select("*").eq("material_id", material_id).execute()
            if len(material.data) == 0:
                # 更新状态为失败
                self.update_material_status(material_id, "Failed")
                raise ValueError(f"material_id {material_id} not found")

            # 处理视频内容
            result = self.analyze_video(video_path)
            
            # 准备用于embedding的文本数组
            texts_to_embed = []
            
            # 遍历shots，为每个shot准备embedding文本
            for shot in result["shots"]:
                shot_text = ""
                if "shot_content" in shot and shot["shot_content"]:
                    shot_text += shot["shot_content"] + "\n"
                if "subtitle" in shot and shot["subtitle"]:
                    shot_text += shot["subtitle"] + "\n"
                if "narration" in shot and shot["narration"]:
                    shot_text += shot["narration"]
                
                texts_to_embed.append(shot_text.strip())
            
            # 批量获取embeddings
            embeddings = self.get_embedding(texts_to_embed)
            
            # 清楚素材的所有分镜信息
            self.clear_storyboard(material_id)

            # 保存每个shot到数据库
            for i, shot in enumerate(result["shots"]):
                shot_data = {
                    "material_id": material_id,
                    "start_time": shot["start_time"],
                    "end_time": shot["end_time"],
                    "content_vector": embeddings.embeddings[i].values
                }
                
                # 添加可选字段
                if "shot_content" in shot and shot["shot_content"]:
                    shot_data["shot_content"] = shot["shot_content"]
                if "subtitle" in shot and shot["subtitle"]:
                    shot_data["subtitle"] = shot["subtitle"]
                if "narration" in shot and shot["narration"]:
                    shot_data["narration"] = shot["narration"]
                if "tags" in shot and shot["tags"]:
                    shot_data["tags"] = shot["tags"]
                
                # 保存到数据库
                self.save_storyboard(shot_data)
            
            # 更新状态为已完成
            self.update_material_status(material_id, "Completed")
            
            return len(result["shots"])
            
        except Exception as e:
            # 更新状态为失败，并记录错误信息
            error_msg = str(e)
            self.update_material_status(material_id, "Failed", error_msg)
            # 重新抛出异常，让上层处理
            raise e


if __name__ == "__main__":
    processor = VideoAiProcessor()

    video_path = "shorts_analysis/test/20250324/豆豆净1.mp4"
    # processor.analyze_video(video_path)
    processed_count = processor.run(149, video_path)
    print(f"已处理并保存 {processed_count} 个镜头")

    # result = processor.semantic_search("带银色项链的男子，站在镜头前", 0.1, 2)
    # print(result)
