# 枚举值 配置
{

    "country": {
        values: ["菲律宾", "马来西亚", "泰国"], 
        default: "菲律宾"
    },
    "platform": {
        values: ["Facebook", "TT"], 
        default: "TT"
    },
    "director": {
        values: [{"id": "编导001", "name": "编导1"}], 
        default: "编导001"
    },
    "main_category": {
        values: ["全部","彩妆", "护肤"], 
        default: null
    },
    "first_level_category": {
        values: {
            "彩妆": ["彩妆品1", "彩妆品2"],
            "护肤": ["彩妆品3", "彩妆品4"],
            "全部": ["彩妆品1", "彩妆品2", "彩妆品3", "彩妆品4"]
        }, 
        linked_to: "主类目",
        default: null
    },
    "second_level_category": {
        values: {
            "彩妆品1": ["彩妆品11", "彩妆品12"],
            "彩妆品2": ["彩妆品21", "彩妆品22"],
            "彩妆品3": ["彩妆品31", "彩妆品32"],
            "彩妆品4": ["彩妆品41", "彩妆品42"],
            "全部": ["彩妆品11", "彩妆品12", "彩妆品21", "彩妆品22", "彩妆品31", "彩妆品32", "彩妆品41", "彩妆品42"]
        },
        linked_to: "一级类目",
        default: null
    }
}


# metadata显示列表
[
    {"id": "country", "display_name": "国家", "required": true, "multiple_select": false},
    {"id": "platform", "display_name": "渠道", "required": true, "multiple_select": false},
    {"id": "director", "display_name": "编导", "required": true, "multiple_select": false}
]


# metadata sample:
{
    "country": "菲律宾",
    "platform": "TT",
    "director": {"id": "编导001", "name": "编导1"}
}