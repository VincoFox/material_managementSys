import functions_framework
from flask import request, jsonify
from genai_helper import VideoAiProcessor
from task_helper import TaskService
from report_helper import BigqueryReportService
import os

@functions_framework.http
def hello_http(request):
    """
    主 HTTP 处理函数，根据请求路径和方法分发到对应的 API 处理逻辑。
    
    支持的路由:
    - GET /semantic_search: 对素材进行语义搜索 API
    - POST /process_video: 视频处理 API
    - POST /create_task: 创建任务 API
    - GET /query_task: 查询任务状态 API
    - POST /report/query_material: 查询单个素材指标
    - POST /report/query_materials: 查询多个素材指标
    - POST /report/query_materials_by_metrics: 按条件搜索素材列表
    - GET /report/query_advertisers_by_post: 查询Post相关的所有广告主
    
    Args:
        request (flask.Request): Flask 请求对象
        
    Returns:
        tuple: (JSON 响应, HTTP 状态码)
    """
    # 初始化处理器
    processor = VideoAiProcessor()

    # 路由分发
    if request.path == '/semantic_search' and request.method == 'GET':
        return handle_semantic_search(request, processor)
    
    elif request.path == '/process_video' and request.method == 'POST':
        return handle_process_video(request, processor)
    
    elif request.path == '/create_task' and request.method == 'POST':
        return handle_task_create(request)
    
    elif request.path == '/query_task' and request.method == 'GET':
        return handle_task_query(request)
    
    elif request.path == '/report/query_material' and request.method == 'POST':
        return handle_query_material(request)
    
    elif request.path == '/report/query_materials' and request.method == 'POST':
        return handle_query_materials(request)
    
    elif request.path == '/report/query_materials_by_metrics' and request.method == 'POST':
        return handle_query_materials_by_metrics(request)
    
    elif request.path == '/report/query_advertisers_by_post' and request.method == 'GET':
        return handle_query_advertisers_by_post(request)
    
    else:
        return jsonify({'error': 'Not Found', 'message': 'Invalid path or method'}), 404


def handle_semantic_search(request, processor):
    """
    处理语义搜索请求。
    
    参数:
        query_str (str): 搜索查询字符串 (必需)
        match_threshold (float): 匹配阈值 (可选，默认 0.7)
        match_count (int): 返回结果数量 (可选，默认 10)
        
    Returns:
        tuple: (JSON 响应, HTTP 状态码)
    """
    # 获取查询参数
    query_str = request.args.get('query_str')
    try:
        match_threshold = float(request.args.get('match_threshold', 0.7))
        match_count = int(request.args.get('match_count', 10))
    except ValueError:
        return jsonify({'error': 'Invalid parameter type', 
                       'message': 'match_threshold must be float, match_count must be int'}), 400

    # 参数验证
    if not query_str:
        return jsonify({'error': 'Missing parameter', 'message': 'query_str is required'}), 400
    
    if match_threshold < 0 or match_threshold > 1:
        return jsonify({'error': 'Invalid parameter', 
                       'message': 'match_threshold must be between 0 and 1'}), 400
    
    if match_count <= 0:
        return jsonify({'error': 'Invalid parameter', 
                       'message': 'match_count must be positive'}), 400

    try:
        # 执行语义搜索，与 VideoAiProcessor 方法签名对齐
        results = processor.semantic_search(
            query_str=query_str,
            match_threshold=match_threshold,
            match_count=match_count
        )
        
        return jsonify({
            'status': 'success',
            'results': results,
            'count': len(results),
            'query': {
                'query_str': query_str,
                'match_threshold': match_threshold,
                'match_count': match_count
            }
        }), 200
        
    except Exception as e:
        return jsonify({'error': 'Server error', 'message': str(e)}), 500

def handle_process_video(request, processor):
    """
    处理视频处理请求。
    
    参数 (JSON):
        material_id (int): 素材 ID (必需)
        video_path (str): 视频文件路径 (必需)
        
    Returns:
        tuple: (JSON 响应, HTTP 状态码)
    """
    # 获取 JSON 数据
    request_json = request.get_json(silent=True)
    
    if not request_json:
        return jsonify({'error': 'Invalid payload', 'message': 'JSON required'}), 400

    material_id = request_json.get('material_id')
    video_path = request_json.get('video_path')

    # 参数验证
    if material_id is None:
        return jsonify({'error': 'Missing parameter', 'message': 'material_id is required'}), 400
    
    if not isinstance(material_id, int):
        return jsonify({'error': 'Invalid parameter', 
                       'message': 'material_id must be an integer'}), 400
    
    if not video_path:
        return jsonify({'error': 'Missing parameter', 'message': 'video_path is required'}), 400

    try:
        # 执行视频处理，与 VideoAiProcessor 方法签名对齐
        processed_shots = processor.run(
            material_id=material_id,
            video_path=video_path
        )
        
        return jsonify({
            'status': 'success',
            'message': f'Processed and saved {processed_shots} shots',
            'material_id': material_id,
            'video_path': video_path,
            'processed_shots': processed_shots
        }), 200
        
    except Exception as e:
        return jsonify({'error': 'Server error', 'message': str(e)}), 500

def handle_task_create(request):
    """
    处理任务创建请求。
    
    参数 (JSON):
        queue_name (str): 队列名称 (可选，默认使用环境变量)
        url (str): 处理任务的端点 URL (必需)
        payload (dict): 要发送的请求数据 (可选)
        http_method (str): HTTP 方法，支持 'GET' 或 'POST'，默认为 'POST' (可选)
        
    Returns:
        tuple: (JSON 响应, HTTP 状态码)
    """
    # 获取 JSON 数据
    request_json = request.get_json(silent=True)
    
    if not request_json:
        return jsonify({'error': 'Invalid payload', 'message': 'JSON required'}), 400

    queue_name = request_json.get('queue_name')
    url = request_json.get('url')
    payload = request_json.get('payload')
    http_method = request_json.get('http_method', 'POST')

    # 参数验证
    if not url:
        return jsonify({'error': 'Missing parameter', 'message': 'url is required'}), 400
    
    if http_method not in ['GET', 'POST']:
        return jsonify({'error': 'Invalid parameter', 'message': 'http_method must be GET or POST'}), 400

    try:
        # 创建任务服务
        task_service = TaskService(queue_name=queue_name, location="asia-southeast1")
        
        # 创建任务
        task = task_service.create_task(
            url=url,
            payload=payload,
            http_method=http_method
        )
        
        return jsonify({
            'status': 'success',
            'message': '任务创建成功',
            'task': task
        }), 200
        
    except Exception as e:
        return jsonify({'error': 'Server error', 'message': str(e)}), 500

def handle_task_query(request):
    """
    处理任务查询请求。
    
    参数 (Query Parameters):
        queue_name (str): 队列名称 (可选，默认使用环境变量)
        task_id (str): 任务 ID (必需)
        
    Returns:
        tuple: (JSON 响应, HTTP 状态码)
    """
    # 获取查询参数
    queue_name = request.args.get('queue_name')
    task_id = request.args.get('task_id')

    # 参数验证
    if not task_id:
        return jsonify({'error': 'Missing parameter', 'message': 'task_id is required'}), 400

    try:
        # 创建任务服务
        task_service = TaskService(queue_name=queue_name, location="asia-southeast1")
        
        # 查询任务
        task = task_service.query_task(task_id)
        
        return jsonify({
            'status': 'success',
            'task': task
        }), 200
        
    except Exception as e:
        return jsonify({'error': 'Server error', 'message': str(e)}), 500

def handle_query_material(request):
    """
    处理单个素材指标查询请求。
    
    参数 (JSON):
        material_id (str): 素材ID (可选，如果提供post_id则忽略)
        post_id (str): Post ID (可选，优先级高于material_id)
        start_date (str): 开始日期，格式为'YYYY-MM-DD' (必需)
        end_date (str): 结束日期，格式为'YYYY-MM-DD' (必需)
        
    Returns:
        tuple: (JSON 响应, HTTP 状态码)
    """
    # 获取 JSON 数据
    request_json = request.get_json(silent=True)
    
    if not request_json:
        return jsonify({'error': 'Invalid payload', 'message': 'JSON required'}), 400

    material_id = request_json.get('material_id')
    post_id = request_json.get('post_id')
    start_date = request_json.get('start_date')
    end_date = request_json.get('end_date')

    # 参数验证
    if not all([start_date, end_date]):
        return jsonify({'error': 'Missing parameters', 
                       'message': 'start_date and end_date are required'}), 400
                       
    if not material_id and not post_id:
        return jsonify({'error': 'Missing parameters', 
                       'message': 'Either material_id or post_id is required'}), 400

    try:
        # 初始化 BigQuery 服务，使用环境变量
        service = BigqueryReportService()
        
        # 执行查询
        result = service.get_material_metrics(
            material_id=material_id,
            post_id=post_id,
            start_date=start_date,
            end_date=end_date
        )
        
        return jsonify({
            'status': 'success',
            'data': result
        }), 200
        
    except Exception as e:
        return jsonify({'error': 'Server error', 'message': str(e)}), 500

def handle_query_materials(request):
    """
    处理多个素材指标查询请求。
    
    参数 (JSON):
        material_ids (list): 素材ID列表 (可选，如果提供post_ids则忽略)
        post_ids (list): Post ID列表 (可选，优先级高于material_ids)
        start_date (str): 开始日期，格式为'YYYY-MM-DD' (必需)
        end_date (str): 结束日期，格式为'YYYY-MM-DD' (必需)
        
    Returns:
        tuple: (JSON 响应, HTTP 状态码)
    """
    # 获取 JSON 数据
    request_json = request.get_json(silent=True)
    
    if not request_json:
        return jsonify({'error': 'Invalid payload', 'message': 'JSON required'}), 400

    material_ids = request_json.get('material_ids')
    post_ids = request_json.get('post_ids')
    start_date = request_json.get('start_date')
    end_date = request_json.get('end_date')

    # 参数验证
    if not all([start_date, end_date]):
        return jsonify({'error': 'Missing parameters', 
                       'message': 'start_date and end_date are required'}), 400
    
    if not material_ids and not post_ids:
        return jsonify({'error': 'Missing parameters', 
                       'message': 'Either material_ids or post_ids is required'}), 400
    
    if material_ids and not isinstance(material_ids, list):
        return jsonify({'error': 'Invalid parameter', 
                       'message': 'material_ids must be a list'}), 400
                       
    if post_ids and not isinstance(post_ids, list):
        return jsonify({'error': 'Invalid parameter', 
                       'message': 'post_ids must be a list'}), 400

    try:
        # 初始化 BigQuery 服务，使用环境变量
        service = BigqueryReportService()
        
        # 执行查询
        results = service.get_materials_metrics(
            material_ids=material_ids,
            post_ids=post_ids,
            start_date=start_date,
            end_date=end_date
        )
        
        return jsonify({
            'status': 'success',
            'data': results
        }), 200
        
    except Exception as e:
        return jsonify({'error': 'Server error', 'message': str(e)}), 500

def handle_query_materials_by_metrics(request):
    """
    处理按条件搜索素材列表请求。
    
    参数 (JSON):
        start_date (str): 开始日期，格式为'YYYY-MM-DD' (必需)
        end_date (str): 结束日期，格式为'YYYY-MM-DD' (必需)
        attribute_filters (dict): 属性过滤条件，格式为{属性名: [值1, 值2, ...]} (可选)
        range_filters (dict): 范围过滤条件，格式为{字段名: {'min': 最小值, 'max': 最大值}} (可选)
            支持日期范围过滤，如{"material_created_at": {"min": "2025-04-01", "max": "2025-04-30"}}
        metric_filters (dict): 指标过滤条件，格式为{指标名: {'min': 最小值, 'max': 最大值}} (可选)
        order_by (dict): 排序条件，格式为{排序字段: 'asc'/'desc'} (可选)
        limit (int): 返回结果限制数量 (可选，默认100)
        
    Returns:
        tuple: (JSON 响应, HTTP 状态码)
    """
    # 获取 JSON 数据
    request_json = request.get_json(silent=True)
    
    if not request_json:
        return jsonify({'error': 'Invalid payload', 'message': 'JSON required'}), 400

    start_date = request_json.get('start_date')
    end_date = request_json.get('end_date')
    attribute_filters = request_json.get('attribute_filters')
    range_filters = request_json.get('range_filters')
    metric_filters = request_json.get('metric_filters')
    order_by = request_json.get('order_by')
    limit = request_json.get('limit', 100)

    # 参数验证
    if not all([start_date, end_date]):
        return jsonify({'error': 'Missing parameters', 
                       'message': 'start_date and end_date are required'}), 400

    try:
        # 初始化 BigQuery 服务，使用环境变量
        service = BigqueryReportService()
        
        # 执行查询
        results = service.search_materials(
            start_date=start_date,
            end_date=end_date,
            attribute_filters=attribute_filters,
            range_filters=range_filters,
            metric_filters=metric_filters,
            order_by=order_by,
            limit=limit
        )
        
        return jsonify({
            'status': 'success',
            'data': results
        }), 200
        
    except Exception as e:
        return jsonify({'error': 'Server error', 'message': str(e)}), 500

def handle_query_advertisers_by_post(request):
    """
    处理查询Post相关广告主请求。
    
    参数 (Query Parameters):
        post_id (str): Post ID (必需)
        start_date (str): 开始日期，格式为'YYYY-MM-DD' (可选)
        end_date (str): 结束日期，格式为'YYYY-MM-DD' (可选)
        
    Returns:
        tuple: (JSON 响应, HTTP 状态码)
    """
    # 获取查询参数
    post_id = request.args.get('post_id')
    start_date = request.args.get('start_date')
    end_date = request.args.get('end_date')

    # 参数验证
    if not post_id:
        return jsonify({'error': 'Missing parameter', 'message': 'post_id is required'}), 400
    
    # 如果提供了start_date但没有提供end_date，或者提供了end_date但没有提供start_date
    if (start_date and not end_date) or (end_date and not start_date):
        return jsonify({'error': 'Missing parameter', 'message': 'Both start_date and end_date must be provided together'}), 400

    try:
        # 初始化 BigQuery 服务，使用环境变量
        service = BigqueryReportService()
        
        # 执行查询
        advertisers = service.get_post_advertisers(
            post_id=post_id,
            start_date=start_date,
            end_date=end_date
        )
        
        return jsonify({
            'status': 'success',
            'data': {
                'post_id': post_id,
                'date_range': {
                    'start_date': start_date,
                    'end_date': end_date
                } if start_date and end_date else None,
                'advertisers': advertisers,
                'count': len(advertisers)
            }
        }), 200
        
    except Exception as e:
        return jsonify({'error': 'Server error', 'message': str(e)}), 500