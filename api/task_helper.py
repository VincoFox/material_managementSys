from google.cloud import tasks_v2
from google.protobuf import timestamp_pb2
import datetime
import json
import os
from dotenv import load_dotenv

# 加载环境变量
load_dotenv()

# 利用google cloud tasks 创建任务和查询任务
class TaskService:
    def __init__(self, queue_name=None, project_id=None, location=None):
        """
        初始化 TaskService 实例
        
        Args:
            queue_name (str): 任务队列名称
            project_id (str, optional): Google Cloud 项目 ID，默认从环境变量获取
            location (str, optional): 任务队列所在的区域，默认从环境变量获取
        """
        self.client = tasks_v2.CloudTasksClient()
        
        # 从环境变量读取项目ID和位置信息（如果未提供）
        self.project_id = project_id or os.getenv("GOOGLE_CLOUD_PROJECT")
        self.location = location or os.getenv("GOOGLE_CLOUD_TASK_LOCATION")
        self.queue_name = queue_name or os.getenv("GOOGLE_CLOUD_TASK_QUEUE_NAME")
        
        # 验证必要参数
        if not self.project_id:
            raise ValueError("项目ID未提供，请设置 GOOGLE_CLOUD_PROJECT 环境变量或在初始化时传入")
        if not self.location:
            raise ValueError("位置信息未提供，请设置 GOOGLE_CLOUD_LOCATION 环境变量或在初始化时传入")
        
        self.parent = self.client.queue_path(self.project_id, self.location, self.queue_name)
    
    def create_task(self, url, payload=None, headers=None, scheduled_time=None, http_method='POST'):
        """
        创建一个 HTTP 任务
        
        Args:
            url (str): 处理任务的端点 URL
            payload (dict, optional): 要发送的请求数据
            headers (dict, optional): HTTP 请求头
            scheduled_time (datetime, optional): 任务计划执行时间
            http_method (str, optional): HTTP 方法，支持 'GET' 或 'POST'，默认为 'POST'
        
        Returns:
            dict: 创建的任务详情
        """
        # 将http_method参数转换为枚举类型
        if http_method.upper() == 'GET':
            method = tasks_v2.HttpMethod.GET
        else:
            method = tasks_v2.HttpMethod.POST
            
        task = {
            'http_request': {
                'http_method': method,
                'url': url,
            }
        }
        
        # 添加请求头
        if headers:
            task['http_request']['headers'] = headers
        else:
            task['http_request']['headers'] = {
                'Content-Type': 'application/json',
            }
        
        # 添加请求体 (仅对POST请求)
        if payload and http_method.upper() == 'POST':
            if isinstance(payload, dict):
                payload = json.dumps(payload).encode('utf-8')
            task['http_request']['body'] = payload
        
        # 如果是GET请求且有payload，将参数添加到URL中
        if payload and http_method.upper() == 'GET':
            if isinstance(payload, dict):
                query_params = '&'.join([f"{k}={v}" for k, v in payload.items()])
                if '?' in url:
                    task['http_request']['url'] = f"{url}&{query_params}"
                else:
                    task['http_request']['url'] = f"{url}?{query_params}"
        
        # 设置执行时间
        if scheduled_time:
            timestamp = timestamp_pb2.Timestamp()
            timestamp.FromDatetime(scheduled_time)
            task['schedule_time'] = timestamp
        
        # 创建任务
        response = self.client.create_task(
            request={"parent": self.parent, "task": task}
        )
        
        return {
            'name': response.name,
            'created_time': response.create_time.isoformat(),
            'scheduled_time': response.schedule_time.isoformat() if response.schedule_time else None
        }
    
    def query_task(self, task_id):
        """
        查询任务状态
        
        Args:
            task_id (str): 任务 ID 或完整的任务名称路径
        
        Returns:
            dict: 任务详情
        """
        # 如果只提供了任务 ID，构建完整的任务路径
        if not task_id.startswith('projects/'):
            task_name = self.client.task_path(
                self.project_id, 
                self.location, 
                self.queue_name, 
                task_id
            )
        else:
            task_name = task_id
        
        # 获取任务详情
        try:
            response = self.client.get_task(request={"name": task_name})
            
            # 格式化返回结果
            result = {
                'name': response.name,
                'state': self._get_task_state(response),
                'created_time': response.create_time.isoformat(),
                'scheduled_time': response.schedule_time.isoformat() if response.schedule_time else None
            }
            
            # 添加任务尝试信息（如果有）
            if response.view and hasattr(response, 'status'):
                result['status'] = response.status
            
            return result
            
        except Exception as e:
            return {'error': str(e)}
    
    def _get_task_state(self, task):
        """辅助方法：获取任务状态"""
        if hasattr(task, 'view') and task.view and hasattr(task, 'status'):
            return task.status
        else:
            # 判断任务是否已调度但尚未执行
            now = datetime.datetime.now(datetime.timezone.utc)
            if task.schedule_time and task.schedule_time > now:
                return "SCHEDULED"
            return "UNKNOWN"



if __name__ == "__main__":
    # 示例：创建一个任务服务实例
    task_service = TaskService(queue_name="ai-task-queue",location="asia-southeast1")
    
    # 示例2：创建一个5分钟后执行的任务（使用scheduled_time）
    # future_time = datetime.datetime.now(datetime.timezone.utc) + datetime.timedelta(minutes=5)
    # scheduled_task = task_service.create_task(
    #     url="https://woodwise-ai-process-735165036066.asia-southeast1.run.app/process_video",
    #     payload={"material_id": 388, "video_path": "shorts_analysis/test4.mp4"},
    #     scheduled_time=future_time
    # )
    # print(f"已创建定时任务: {scheduled_task['name']}")
    # print(f"定时任务计划执行时间: {scheduled_task['scheduled_time']}")
    
    # # 示例3：创建一个GET请求任务
    # get_task = task_service.create_task(
    #     url="https://woodwise-ai-process-735165036066.asia-southeast1.run.app/semantic_search",
    #     payload={"query_str": "job-12345"},
    #     http_method="GET",
    #     scheduled_time=future_time
    # )
    # print(f"已创建GET任务: {get_task['name']}")

    # 查询任务状态
    print(task_service.query_task("projects/gen-lang-client-0786739350/locations/asia-southeast1/queues/ai-task-queue/tasks/608653967871718635"))