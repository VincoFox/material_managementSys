## 元数据配置 [模板]

### enums 素材字段候选项

```json
{
  "topic": {
    "values": ["model-shotting", "host-shotting", "ai deepfake"]
  },
  "owner_team": {
    "values": ["PGC广州", "PGC-MY", "PGC-PH", "PGC-VN", "PGC-TH", "PGC-ID"]
  },
  "video_type": {
    "values": [
      "pugc",
      "kol mix",
      "live",
      "best-selling promotion",
      "attention grabbing"
    ]
  },
  "editor_name": {
    "values": ["龙建东", "张伟斌", "廖彩玲", "黄晓兰", "杨辉", "杨霄测试"]
  },
  "source_type": {
    "values": ["PGC", "UGC"]
  },
  "director_name": {
    "values": ["李燕飞", "蒙可欣", "杨霄测试"]
  },
  "main_category": {
    "values": ["护肤（skincare）", "彩妆（makeup）"]
  },
  "first_level_category": {
    "values": {
      // 此处的 key 为 main_category 中的值，value 为 first_level_category 的候选项
      "彩妆（makeup）": ["暂无", "暂无"],
      "护肤（skincare）": [
        "祛痘（Acne）",
        "清洁（Cleanser）",
        "美白（Whitening）",
        "防晒（Sunscreen）",
        "修复（Repair）",
        "隔离（Isolation）"
      ]
    },
    // 依赖 main_category 字段联动
    "linked_to": "main_category"
  },
  "product_name": {
    "values": {
      // 此处的 key 为 first_level_category 中的值，value 为 product_name 的候选项
      "祛痘（Acne）": [
        "痘痘净（Acne Essence）",
        "祛痘两件套（Acne Set 2pcs）",
        "祛痘三件套（Acne Set 3pcs）",
        "祛痘四件套（Acne Set 4pcs）",
        "祛痘五件套（Acne Set 5pcs）",
        "祛痘六件套（Acne Set 6pcs）",
        "痘泥四件套（AcneMaskSet 4pcs）"
      ],
      "修复（Repair）": [
        "舒缓霜（Soothing）",
        "7X面霜（7X Moist）",
        "7X精华（7X Serum）",
        "7X面膜（7X Mask）",
        "7X洗面奶（7X Cleanser）",
        "7X爽肤水（7X Toner）",
        "7X两件套（7X Set 2pcs）",
        "7X三件套（7X Set 3pcs）",
        "7X四件套（7X Set 4pcs）",
        "7X五件套（7X Set 5pcs）"
      ],
      "清洁（Cleanser）": [
        "泥膜（Clay Mask）",
        "洗面奶（Facial Cleanser）",
        "双管洁面（2X Facial Cleanser）",
        "8d面膜（8dMask）"
      ],
      "美白（Whitening）": [
        "美白霜（Whitening Cream）",
        "美白精华（Whitening Essence）",
        "377面膜（377 Mask）",
        "美白两件套（Whitening Set 2pcs）",
        "美白三件套（Whitening Set 3pcs）",
        "美白四件套（Whitening Set 4pcs）",
        "美白五件套（Whitening Set 5pcs）",
        "美白六件套（Whitening Set 6pcs）"
      ],
      "防晒（Sunscreen）": ["防晒霜（Sunscreen）"],
      "隔离（Isolation）": [
        "隔离霜（Isolation Cream）",
        "隔离两件套（Isolation Set 2pcs）",
        "隔离三件套（Isolation Set 3pcs）",
        "隔离四件套（Isolation Set 4pcs）",
        "隔离防晒套（Isolation & Sunscreen）",
        "隔离洁面套（Isolation Cleanser Set）",
        "VN-隔离洁面礼盒（VN-Dr.Leo Mystery Beauty Box）"
      ]
    },
    // 依赖 first_level_category 字段联动
    "linked_to": "first_level_category"
  },
  "target_country": {
    "values": ["Philippines", "Malaysia", "Thailand", "Vietnam", "Indonesia"]
  },
  "target_platform": {
    "values": ["Tiktok", "Facebook"]
  },
  "material_category": {
    "values": [
      "种草（Influencer marketing）",
      "营销（On sale）",
      "品牌（Branding）"
    ]
  },
  "copyright_platform": {
    "values": ["Tiktok", "Facebook"]
  }
}
```

### metadata 素材 metadata 字段

```json
[
  {
    "field": "copyright_platform",
    "displayName": "版权平台",
    "displayType": "MultiSelect"
  }
]
```

### form_required_fields 素材表单必填字段

```json
{
  "PGC": [
    "main_category",
    "first_level_category",
    "second_level_category",
    "product_name",
    "video_type",
    "material_category",
    "topic",
    "target_country",
    "target_platform",
    "owner_team",
    "editor_name",
    "director_name",
    "source_type",
    "material_name"
  ],
  "UGC": [
    "main_category",
    "first_level_category",
    "second_level_category",
    "product_name",
    "material_category",
    "target_country",
    "target_platform",
    "owner_team",
    "source_type",
    "external_id",
    "material_name"
  ]
}
```

### managers

```json
[
  "roman@drleo.com",
  "yuki@drleo.com",
  "spenceryangxiao@gmail.com",
  "yc3231996@gmail.com",
  "d3tang@hotmail.com"
]
```
