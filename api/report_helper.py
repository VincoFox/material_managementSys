import json
from google.cloud import bigquery
from google.oauth2 import service_account
from typing import List, Dict, Any, Tuple, Optional
from datetime import datetime, date
import os
from dotenv import load_dotenv

load_dotenv()

class BigqueryReportService:
    def __init__(self, project_id=None, credentials_json_str=None):
        """
        初始化 BigQuery 服务
        可选参数:
        :param project_id: Google Cloud 项目 ID，如不提供则使用环境变量
        :param credentials_json_str: 服务账号凭证的 JSON 字符串，如不提供则使用环境变量
        """
        self.project_id = project_id
        self.credentials_json_str = credentials_json_str
        self._create_client()
        
    def _create_client(self):
        """创建BigQuery客户端"""
        try:
            # 如果提供了凭证，使用提供的凭证
            if self.credentials_json_str:
                # 将JSON字符串转换为字典对象
                credentials_info = json.loads(self.credentials_json_str)
                credentials = service_account.Credentials.from_service_account_info(credentials_info)
                self.client = bigquery.Client(
                    credentials=credentials,
                    project=self.project_id if self.project_id else credentials.project_id,
                )
            else:
                # 否则直接使用环境变量中的凭证
                # 环境变量 GOOGLE_APPLICATION_CREDENTIALS 指向凭证文件
                # 环境变量 GOOGLE_CLOUD_PROJECT 包含项目ID
                self.client = bigquery.Client()
                # 获取项目ID（用于SQL查询中）
                self.project_id = os.environ.get('GOOGLE_CLOUD_PROJECT') or self.client.project
        except Exception as e:
            raise Exception(f"创建BigQuery客户端失败: {str(e)}")
    
    def get_material_metrics(self, material_id: str = None, start_date: str = None, end_date: str = None, post_id: str = None) -> Dict[str, Any]:
        """
        查询单个素材ID或Post ID在指定日期区间的指标汇总和时间趋势
        
        Args:
            material_id: 素材ID (如果post_id提供，此参数将被忽略)
            start_date: 开始日期，格式为'YYYY-MM-DD'
            end_date: 结束日期，格式为'YYYY-MM-DD'
            post_id: Post ID (如果提供，将使用此ID代替material_id作为查询条件)
            
        Returns:
            包含汇总指标和时间趋势的字典
        """
        # 确定查询条件
        if post_id:
            id_condition = f"post_id = '{post_id}'"
        else:
            id_condition = f"material_id = '{material_id}'"
            
        # 查询汇总指标
        summary_query = f"""
        SELECT
            SUM(total_onsite_shopping_value) AS gmv,
            SUM(spend) AS spend,
            SUM(impressions) AS impressions,
            SUM(total_onsite_shopping_value) / NULLIF(SUM(spend), 0) AS roi
        FROM 
            `{self.project_id}.Yingkou_ADS.tt_ad_report_day`
        WHERE 
            {id_condition}
            AND stat_date BETWEEN '{start_date}' AND '{end_date}'
        """
        
        # 查询时间趋势
        trend_query = f"""
        SELECT
            stat_date,
            SUM(total_onsite_shopping_value) AS gmv,
            SUM(spend) AS spend,
            SUM(impressions) AS impressions,
            SUM(total_onsite_shopping_value) / NULLIF(SUM(spend), 0) AS roi
        FROM 
            `{self.project_id}.Yingkou_ADS.tt_ad_report_day`
        WHERE 
            {id_condition}
            AND stat_date BETWEEN '{start_date}' AND '{end_date}'
        GROUP BY 
            stat_date
        ORDER BY 
            stat_date ASC
        """
        
        try:
            # 执行汇总查询
            summary_job = self.client.query(summary_query)
            summary_result = next(summary_job.result())
            
            # 执行时间趋势查询
            trend_job = self.client.query(trend_query)
            trend_results = []
            
            for row in trend_job.result():
                trend_results.append({
                    'stat_date': row['stat_date'].strftime('%Y-%m-%d') if isinstance(row['stat_date'], (datetime, date)) else row['stat_date'],
                    'gmv': float(row['gmv']) if row['gmv'] is not None else 0.0,
                    'spend': float(row['spend']) if row['spend'] is not None else 0.0,
                    'impressions': int(row['impressions']) if row['impressions'] is not None else 0,
                    'roi': float(row['roi']) if row['roi'] is not None else 0.0
                })
            
            return {
                'summary': {
                    'gmv': float(summary_result['gmv']) if summary_result['gmv'] is not None else 0.0,
                    'spend': float(summary_result['spend']) if summary_result['spend'] is not None else 0.0,
                    'impressions': int(summary_result['impressions']) if summary_result['impressions'] is not None else 0,
                    'roi': float(summary_result['roi']) if summary_result['roi'] is not None else 0.0
                },
                'trends': trend_results
            }
            
        except Exception as e:
            raise Exception(f"查询素材指标失败: {str(e)}")
    
    def get_materials_metrics(self, material_ids: List[str] = None, start_date: str = None, end_date: str = None, post_ids: List[str] = None) -> List[Dict[str, Any]]:
        """
        查询多个素材ID或Post ID在指定日期区间的指标汇总
        
        Args:
            material_ids: 素材ID列表 (如果post_ids提供，此参数将被忽略)
            start_date: 开始日期，格式为'YYYY-MM-DD'
            end_date: 结束日期，格式为'YYYY-MM-DD'
            post_ids: Post ID列表 (如果提供，将使用此列表代替material_ids作为查询条件)
            
        Returns:
            包含各素材指标的列表
        """
        # 确定查询条件
        if post_ids and len(post_ids) > 0:
            id_list = [f"'{id}'" for id in post_ids]
            id_condition = f"post_id IN ({', '.join(id_list)})"
            group_by_field = "post_id"
            id_field = "post_id"
        else:
            id_list = [f"'{id}'" for id in material_ids]
            id_condition = f"material_id IN ({', '.join(id_list)})"
            group_by_field = "material_id"
            id_field = "material_id"
        
        query = f"""
        SELECT
            {id_field},
            SUM(total_onsite_shopping_value) AS gmv,
            SUM(spend) AS spend,
            SUM(impressions) AS impressions,
            SUM(total_onsite_shopping_value) / NULLIF(SUM(spend), 0) AS roi
        FROM 
            `{self.project_id}.Yingkou_ADS.tt_ad_report_day`
        WHERE 
            {id_condition}
            AND stat_date BETWEEN '{start_date}' AND '{end_date}'
        GROUP BY 
            {group_by_field}
        """
        
        try:
            query_job = self.client.query(query)
            results = []
            
            for row in query_job.result():
                results.append({
                    id_field: row[id_field],
                    'gmv': float(row['gmv']) if row['gmv'] is not None else 0.0,
                    'spend': float(row['spend']) if row['spend'] is not None else 0.0,
                    'impressions': int(row['impressions']) if row['impressions'] is not None else 0,
                    'roi': float(row['roi']) if row['roi'] is not None else 0.0
                })
            
            return results
            
        except Exception as e:
            raise Exception(f"查询多素材指标失败: {str(e)}")
    
    def search_materials(
        self,
        start_date: str, 
        end_date: str,
        attribute_filters: Dict[str, List[str]] = None,
        range_filters: Dict[str, Dict[str, str]] = None,
        metric_filters: Dict[str, Dict[str, float]] = None,
        order_by: Dict[str, str] = None,
        limit: int = 100
    ) -> List[Dict[str, Any]]:
        """
        根据条件搜索素材列表
        
        Args:
            start_date: 开始日期，格式为'YYYY-MM-DD'
            end_date: 结束日期，格式为'YYYY-MM-DD'
            attribute_filters: 属性过滤条件，格式为{属性名: [值1, 值2, ...]}
            range_filters: 范围过滤条件，格式为{字段名: {'min': 最小值, 'max': 最大值}}
                支持日期范围过滤，如{"material_created_at": {"min": "2025-04-01", "max": "2025-04-30"}}
            metric_filters: 指标过滤条件，格式为{指标名: {'min': 最小值, 'max': 最大值}}
            order_by: 排序条件，格式为{排序字段: 'asc'/'desc'}
            limit: 返回结果限制数量
            
        Returns:
            符合条件的素材列表
        """
        where_clauses = [
            f"stat_date BETWEEN '{start_date}' AND '{end_date}'",
            "material_id IS NOT NULL AND TRIM(material_id) != ''"
        ]
        having_clauses = []
        
        # 处理属性过滤条件
        if attribute_filters:
            for attr, values in attribute_filters.items():
                if values and len(values) > 0:
                    if len(values) == 1:
                        where_clauses.append(f"{attr} = '{values[0]}'")
                    else:
                        values_str = ", ".join([f"'{v}'" for v in values])
                        where_clauses.append(f"{attr} IN ({values_str})")
        
        # 处理范围过滤条件，支持日期和其他类型的范围查询
        if range_filters:
            for field, conditions in range_filters.items():
                if 'min' in conditions and 'max' in conditions:
                    where_clauses.append(f"{field} BETWEEN '{conditions['min']}' AND '{conditions['max']}'")
                elif 'min' in conditions:
                    where_clauses.append(f"{field} >= '{conditions['min']}'")
                elif 'max' in conditions:
                    where_clauses.append(f"{field} <= '{conditions['max']}'")
        
        # 处理指标过滤条件
        if metric_filters:
            for metric, conditions in metric_filters.items():
                if metric.lower() == "roi":
                    if 'min' in conditions:
                        having_clauses.append(f"roi >= {conditions['min']}")
                    if 'max' in conditions:
                        having_clauses.append(f"roi <= {conditions['max']}")
                elif metric.lower() == "gmv":
                    if 'min' in conditions:
                        having_clauses.append(f"gmv >= {conditions['min']}")
                    if 'max' in conditions:
                        having_clauses.append(f"gmv <= {conditions['max']}")
                elif metric.lower() == "spend":
                    if 'min' in conditions:
                        having_clauses.append(f"spend >= {conditions['min']}")
                    if 'max' in conditions:
                        having_clauses.append(f"spend <= {conditions['max']}")
                elif metric.lower() == "impressions":
                    if 'min' in conditions:
                        having_clauses.append(f"impressions >= {conditions['min']}")
                    if 'max' in conditions:
                        having_clauses.append(f"impressions <= {conditions['max']}")
        
        # 构建排序条件
        order_clause = ""
        if order_by:
            for field, direction in order_by.items():
                if field.lower() == "roi":
                    order_clause = f"ORDER BY roi {direction}"
                elif field.lower() == "gmv":
                    order_clause = f"ORDER BY gmv {direction}"
                elif field.lower() == "spend":
                    order_clause = f"ORDER BY spend {direction}"
                elif field.lower() == "impressions":
                    order_clause = f"ORDER BY impressions {direction}"
                elif field.lower() == "post_date":
                    order_clause = f"ORDER BY post_date {direction}"
        
        # 构建完整查询
        query = f"""
        SELECT
            material_id,
            MAX(material_category) AS material_category,
            MAX(material_type) AS material_type,
            MAX(video_type) AS video_type,
            MAX(topic) AS topic,
            MAX(director_name) AS director_name,
            MAX(editor_name) AS editor_name,
            MAX(post_date) AS post_date,
            SUM(total_onsite_shopping_value) AS gmv,
            SUM(spend) AS spend,
            SUM(impressions) AS impressions,
            SUM(total_onsite_shopping_value) / NULLIF(SUM(spend), 0) AS roi
        FROM 
            `{self.project_id}.Yingkou_ADS.tt_ad_report_day`
        WHERE 
            {" AND ".join(where_clauses)}
        GROUP BY 
            material_id
        {f"HAVING {' AND '.join(having_clauses)}" if having_clauses else ""}
        {order_clause}
        LIMIT {limit}
        """
        
        try:
            query_job = self.client.query(query)
            results = []
            
            for row in query_job.result():
                results.append({
                    'material_id': row['material_id'],
                    'material_category': row['material_category'],
                    'material_type': row['material_type'],
                    'video_type': row['video_type'],
                    'topic': row['topic'],
                    'director_name': row['director_name'],
                    'editor_name': row['editor_name'],
                    'post_date': row['post_date'].strftime('%Y-%m-%d') if isinstance(row['post_date'], (datetime, date)) else row['post_date'],
                    'gmv': float(row['gmv']) if row['gmv'] is not None else 0.0,
                    'spend': float(row['spend']) if row['spend'] is not None else 0.0,
                    'impressions': int(row['impressions']) if row['impressions'] is not None else 0,
                    'roi': float(row['roi']) if row['roi'] is not None else 0.0
                })
            
            return results
            
        except Exception as e:
            raise Exception(f"搜索素材列表失败: {str(e)}")
            
    def get_post_advertisers(self, post_id: str, start_date: str = None, end_date: str = None) -> List[Dict[str, Any]]:
        """
        查询与指定post_id相关的所有advertiser_id列表，包含各广告主的GMV、ROI、spend等指标
        
        Args:
            post_id: 发布ID
            start_date: 开始日期，格式为'YYYY-MM-DD'，可选（如不提供，将查询所有时间数据）
            end_date: 结束日期，格式为'YYYY-MM-DD'，可选（如不提供，将查询所有时间数据）
            
        Returns:
            与该post_id相关的所有广告主的ID和指标，格式为：
            [
                {
                    'advertiser_id': '广告主ID',
                    'gmv': 总GMV值,
                    'spend': 总花费,
                    'impressions': 总曝光量,
                    'roi': ROI值
                },
                ...
            ]
        """
        # 构建日期条件
        date_condition = ""
        if start_date and end_date:
            date_condition = f"AND stat_date BETWEEN '{start_date}' AND '{end_date}'"
        
        query = f"""
        SELECT
            advertiser_id,
            SUM(total_onsite_shopping_value) AS gmv,
            SUM(spend) AS spend,
            SUM(impressions) AS impressions,
            SUM(total_onsite_shopping_value) / NULLIF(SUM(spend), 0) AS roi
        FROM 
            `{self.project_id}.Yingkou_ADS.tt_ad_report_day`
        WHERE 
            post_id = '{post_id}'
            AND advertiser_id IS NOT NULL
            AND TRIM(advertiser_id) != ''
            {date_condition}
        GROUP BY 
            advertiser_id
        ORDER BY 
            gmv DESC
        """
        
        try:
            query_job = self.client.query(query)
            results = []
            
            for row in query_job.result():
                results.append({
                    'advertiser_id': row['advertiser_id'],
                    'gmv': float(row['gmv']) if row['gmv'] is not None else 0.0,
                    'spend': float(row['spend']) if row['spend'] is not None else 0.0,
                    'impressions': int(row['impressions']) if row['impressions'] is not None else 0,
                    'roi': float(row['roi']) if row['roi'] is not None else 0.0
                })
            
            return results
            
        except Exception as e:
            raise Exception(f"查询Post相关广告主失败: {str(e)}")


# 测试代码
def main():
    """
    测试BigqueryReportService的功能
    """
    import os
    from datetime import datetime, timedelta

    # current_dir = os.path.dirname(os.path.abspath(__file__))
    # credentials_path = os.path.join(current_dir, "config", "gen-lang-client.json")
    # with open(credentials_path, 'r') as f:
    #     credentials_json_str = f.read()
    # service = BigqueryReportService(project_id="gen-lang-client-0786739350", credentials_json_str=credentials_json_str)
    
    # 初始化服务，直接使用环境变量
    service = BigqueryReportService()
    
    # 设置测试参数
    today = datetime.now().date()
    start_date = (today - timedelta(days=150)).strftime("%Y-%m-%d")
    end_date = today.strftime("%Y-%m-%d")
    
    # # 测试场景1：单个素材ID查询
    # print("===== 测试场景1：单个素材ID查询 =====")
    # try:
    #     material_id = "260"  # 替换为真实的素材ID
    #     post_id = "7457833789973138706"
    #     print(f"查询素材 {material_id} 从 {start_date} 到 {end_date} 的指标")
    #     result = service.get_material_metrics(post_id=post_id, start_date=start_date, end_date=end_date)
    #     print("汇总指标:")
    #     print(f"GMV: {result['summary']['gmv']}")
    #     print(f"支出: {result['summary']['spend']}")
    #     print(f"曝光数: {result['summary']['impressions']}")
    #     print(f"ROI: {result['summary']['roi']}")
    #     print(f"时间趋势数据点数: {len(result['trends'])}")
    # except Exception as e:
    #     print(f"测试场景1失败: {str(e)}")
    
    # # 测试场景2：多个素材ID查询
    # print("\n===== 测试场景2：多个素材ID查询 =====")
    # try:
    #     material_ids = ["260", "260"]  # 替换为真实的素材ID
    #     print(f"查询素材 {', '.join(material_ids)} 从 {start_date} 到 {end_date} 的指标")
    #     results = service.get_materials_metrics(material_ids=material_ids, start_date=start_date, end_date=end_date)
    #     for item in results:
    #         print(f"素材ID: {item['material_id']}")
    #         print(f"  GMV: {item['gmv']}")
    #         print(f"  支出: {item['spend']}")
    #         print(f"  曝光数: {item['impressions']}")
    #         print(f"  ROI: {item['roi']}")
    # except Exception as e:
    #     print(f"测试场景2失败: {str(e)}")
    
    # # 测试场景3：条件搜索素材列表
    # print("\n===== 测试场景3：条件搜索素材列表 =====")
    # try:
    #     # 构建搜索条件
    #     attribute_filters = {
    #         "ad_platform": ["Tiktok"],
    #         "country_code": ["MY", "PH"]
    #     }
        
    #     metric_filters = {
    #         "roi": {"min": 1.5, "max": 5.0},
    #         "spend": {"min": 100}
    #     }
        
    #     order_by = {"roi": "desc"}
        
    #     print("搜索条件:")
    #     print(f"  日期范围: {start_date} 到 {end_date}")
    #     print(f"  属性过滤: {attribute_filters}")
    #     print(f"  指标过滤: {metric_filters}")
    #     print(f"  排序: 按 ROI 降序")
        
    #     results = service.search_materials(
    #         start_date=start_date,
    #         end_date=end_date,
    #         attribute_filters=attribute_filters,
    #         metric_filters=metric_filters,
    #         order_by=order_by,
    #         limit=10
    #     )
        
    #     print(f"找到 {len(results)} 个符合条件的素材")
    #     for i, item in enumerate(results, 1):
    #         print(f"{i}. 素材ID: {item['material_id']}")
    #         print(f"   类别: {item['material_category']}")
    #         print(f"   类型: {item['material_type']}")
    #         print(f"   视频类型: {item['video_type']}")
    #         print(f"   主题: {item['topic']}")
    #         print(f"   GMV: {item['gmv']}")
    #         print(f"   支出: {item['spend']}")
    #         print(f"   曝光数: {item['impressions']}")
    #         print(f"   ROI: {item['roi']}")
    # except Exception as e:
    #     print(f"测试场景3失败: {str(e)}")
    
    # 测试场景4：查询Post相关的广告主
    print("\n===== 测试场景4：查询Post相关的广告主及其指标 =====")
    try:
        post_id = "7473809032172686598"  # 替换为真实的post_id
        print(f"查询Post {post_id} 从 {start_date} 到 {end_date} 相关的所有广告主及其指标")
        
        advertisers = service.get_post_advertisers(
            post_id=post_id,
            start_date=start_date,
            end_date=end_date
        )
        
        print(f"找到 {len(advertisers)} 个广告主:")
        for i, advertiser in enumerate(advertisers, 1):
            print(f"{i}. 广告主ID: {advertiser['advertiser_id']}")
            print(f"   GMV: {advertiser['gmv']}")
            print(f"   支出: {advertiser['spend']}")
            print(f"   曝光数: {advertiser['impressions']}")
            print(f"   ROI: {advertiser['roi']}")
    except Exception as e:
        print(f"测试场景4失败: {str(e)}")
    
    # 测试场景5：使用范围过滤条件查询素材
    print("\n===== 测试场景5：使用范围过滤条件查询素材 =====")
    try:
        # 构建搜索条件
        attribute_filters = {
            "ad_platform": ["Tiktok"]
        }
        
        range_filters = {
            "material_created_at": {"min": "2024-01-01", "max": "2025-05-01"}  # 查询2023年创建的素材
        }
        
        metric_filters = {
            "roi": {"min": 1.0}
        }
        
        order_by = {"roi": "desc"}
        
        print("搜索条件:")
        print(f"  日期范围: {start_date} 到 {end_date}")
        print(f"  属性过滤: {attribute_filters}")
        print(f"  范围过滤: {range_filters}")
        print(f"  指标过滤: {metric_filters}")
        print(f"  排序: 按 ROI 降序")
        
        results = service.search_materials(
            start_date=start_date,
            end_date=end_date,
            attribute_filters=attribute_filters,
            range_filters=range_filters,
            metric_filters=metric_filters,
            order_by=order_by,
            limit=10
        )
        
        print(f"找到 {len(results)} 个符合条件的素材")
        for i, item in enumerate(results, 1):
            print(f"{i}. 素材ID: {item['material_id']}")
            print(f"   类别: {item['material_category']}")
            print(f"   类型: {item['material_type']}")
            print(f"   视频类型: {item['video_type']}")
            print(f"   GMV: {item['gmv']}")
            print(f"   支出: {item['spend']}")
            print(f"   ROI: {item['roi']}")
    except Exception as e:
        print(f"测试场景5失败: {str(e)}")


if __name__ == "__main__":
    main()
