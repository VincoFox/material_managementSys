// @ts-ignore
import * as js_sdk from 'tiktok-business-api-sdk-official';
import { TT_API_TOKEN, BC_ID, ADVERTISER_ID, TT_CAMPAIGN_ID } from '@/config';

const accessToken = TT_API_TOKEN;
const advertiser_id = ADVERTISER_ID; // 广告主 ID
const identity_type = 'BC_AUTH_TT'; // 身份类型
const ad_format = 'SINGLE_VIDEO'; // 广告格式

// 获取 Business Center 下的账号列表
async function getBusinessCenterAccounts() {
  const identityApi = new js_sdk.IdentityApi();
  return new Promise((resolve, reject) => {
    console.log(
      'getBusinessCenterAccounts========',
      advertiser_id,
      accessToken
    );
    identityApi.identityGet(
      advertiser_id,
      accessToken,
      { identity_type },
      (error: any, data: any, response: any) => {
        if (error) {
          console.error('获取授权账户列表失败:', error);
          reject(error);
        } else {
          console.log('授权账户列表:', data);
          resolve(data);
        }
      }
    );
  });
}

async function uploadAdVideo(file_name: string, video_url: string) {
  const uploadOpts = {
    advertiser_id,
    upload_type: 'UPLOAD_BY_URL',
    file_name,
    video_url,
  };

  const fileApi = new js_sdk.FileApi();
  return new Promise((resolve, reject) => {
    console.log('uploadVideo========', advertiser_id, accessToken, uploadOpts);
    fileApi.adVideoUpload(
      accessToken,
      uploadOpts,
      (error: any, data: any, response: any) => {
        if (error) {
          console.error('上传视频错误:', error);
          reject(error);
        } else {
          console.log('上传视频:', data);
          resolve(data);
        }
      }
    );
  });
}

async function getVideoImage(video_id: string) {
  return fetch(
    `https://business-api.tiktok.com/open_api/v1.3/file/video/suggestcover/?poster_number=1&advertiser_id=${advertiser_id}&video_id=${video_id}`,
    {
      headers: {
        'Access-Token': accessToken!,
        'Content-Type': 'application/json',
      },
    }
  ).then((res) => res.json());
}

async function createSparkAd(
  videoId: string,
  image_id: string,
  adgroup_id: string,
  product_id: string,
  params: {
    ad_text: string;
    identity_id: string;
  }
) {
  const adApi = new js_sdk.AdApi();
  const adBody = {
    advertiser_id,
    adgroup_id,
    creatives: [
      {
        identity_authorized_bc_id: BC_ID,
        identity_type, // 指定身份类型为 TikTok 用户
        ad_format,
        vertical_video_strategy: ad_format,
        dark_post_status: 'ON',
        call_to_action: 'ORDER_NOW', // 可选的 CTA
        video_id: videoId, // 使用上传的视频 ID 或已有帖子视频 ID
        image_ids: [image_id],
        item_group_ids: [product_id],
        ad_name: 'test',
        // ad_text: 'hari terakhir',
        ...params,
      },
    ],
  };
  // 产品id:1729539481481872500

  return new Promise((resolve, reject) => {
    console.log('adCreate========', adBody);
    adApi.adCreate(
      accessToken,
      { body: adBody },
      (error: any, data: any, response: any) => {
        if (error) {
          console.error('创建广告失败:', error);
          reject(error);
        } else {
          console.log('创建广告:', data);
          resolve(data);
        }
      }
    );
  });
}

async function pullSparkAd(
  post_id: string,
  adgroup_id: string,
  product_id: string,
  params: {
    ad_text: string;
    identity_id: string;
  }
) {
  const adApi = new js_sdk.AdApi();
  const adBody = {
    advertiser_id,
    adgroup_id,
    creatives: [
      {
        identity_authorized_bc_id: BC_ID,
        identity_type, // 指定身份类型为 TikTok 用户
        ad_format,
        vertical_video_strategy: ad_format,
        dark_post_status: 'ON',
        call_to_action: 'ORDER_NOW', // 可选的 CTA
        item_group_ids: [product_id],
        tiktok_item_id: post_id,
        ad_name: 'test',
        // ad_text: 'hari terakhir',
        ...params,
      },
    ],
  };
  // 产品id:1729539481481872500

  return new Promise((resolve, reject) => {
    console.log('adCreate========', adBody);
    adApi.adCreate(
      accessToken,
      { body: adBody },
      (error: any, data: any, response: any) => {
        if (error) {
          console.error('创建广告失败:', error);
          reject(error);
        } else {
          console.log('创建广告:', data);
          resolve(data);
        }
      }
    );
  });
}

async function getSparkAd(ad_ids: string[]) {
  const adApi = new js_sdk.AdApi();
  console.log('getSparkAd========', advertiser_id, accessToken, ad_ids);
  return new Promise((resolve, reject) => {
    adApi.adGet(
      advertiser_id,
      accessToken,
      {
        fields: ['ad_id', 'secondary_status', 'adgroup_id'],
        filtering: { ad_ids },
      },
      (error: any, data: any, response: any) => {
        if (error) {
          console.error('获取广告失败:', error);
          reject(error);
        } else {
          console.log('获取广告:', data);
          resolve(data);
        }
      }
    );
  });
}

// 创建广告系列(Campaign)
async function createCampaign(campaign_name: string) {
  const campaignApi = new js_sdk.CampaignCreationApi();
  const campaignBody = {
    advertiser_id,
    campaign_name: campaign_name,
    objective_type: 'PRODUCT_SALES',
    campaign_product_source: 'STORE',
    budget_mode: 'BUDGET_MODE_DAY',
    budget: 10.0, // 预算金额，单位为广告账户的货币最小单位
  };

  return new Promise((resolve, reject) => {
    console.log('createCampaign========', campaignBody);
    campaignApi.campaignCreate(
      accessToken,
      { body: campaignBody },
      (error: any, data: any) => {
        if (error) {
          console.error('创建广告系列失败:', error);
          reject(error);
        } else {
          console.log('创建广告系列成功:', data);
          resolve(data);
        }
      }
    );
  });
}

// 创建广告组(Adgroup)
async function createAdGroup(params: {
  adgroup_name: string;
  schedule_start_time: string;
  location_ids: string[];
  store_id: string;
}) {
  const adgroupApi = new js_sdk.AdgroupApi();
  const adgroupBody = {
    advertiser_id,
    campaign_id: TT_CAMPAIGN_ID,
    adgroup_name: params.adgroup_name,
    placements: ['PLACEMENT_TIKTOK'],
    age_groups: [
      'AGE_18_24',
      'AGE_25_34',
      'AGE_35_44',
      'AGE_45_54',
      'AGE_55_100',
    ],
    location_ids: params.location_ids,
    gender: 'GENDER_UNLIMITED',
    budget_mode: 'BUDGET_MODE_DAY',
    budget: 10.0,
    schedule_type: 'SCHEDULE_FROM_NOW',
    schedule_start_time: params.schedule_start_time,
    optimization_goal: 'CLICK',
    bid_price: 0.01,
    billing_event: 'CPC',
    pacing: 'PACING_MODE_SMOOTH',
  };
  // # if types=="VSA":
  Object.assign(adgroupBody, {
    shopping_ads_type: 'VIDEO',
    product_source: 'STORE',
    store_id: params.store_id,
    store_authorized_bc_id: BC_ID,
    promotion_type: 'VIDEO_SHOPPING',
  });

  return new Promise((resolve, reject) => {
    console.log('createAdGroup========', adgroupBody);
    adgroupApi.adgroupCreate(
      accessToken,
      { body: adgroupBody },
      (error: any, data: any) => {
        if (error) {
          console.error('创建广告组失败:', error);
          reject(error);
        } else {
          console.log('创建广告组成功:', data);
          resolve(data);
        }
      }
    );
  });
}

async function adStatusUpdate(ad_ids: string[]) {
  const adgroupApi = new js_sdk.AdApi();
  // 枚举值：DISABLE（暂停），ENABLE（启用），DELETE（删除）。
  return new Promise((resolve, reject) => {
    console.log('adStatusUpdate========', ad_ids);
    adgroupApi.adStatusUpdate(
      accessToken,
      {
        body: {
          ad_ids,
          advertiser_id,
          operation_status: 'DISABLE',
        },
      },
      (error: any, data: any) => {
        if (error) {
          console.error('广告状态更新失败:', error);
          reject(error);
        } else {
          console.log('广告状态更新成功:', data);
          resolve(data);
        }
      }
    );
  });
}

async function adgroupStatusUpdate(adgroup_ids: string) {
  const adgroupApi = new js_sdk.AdgroupApi();
  // 枚举值：DISABLE（暂停），ENABLE（启用），DELETE（删除）。
  return new Promise((resolve, reject) => {
    console.log('adgroupStatusUpdate========', adgroup_ids);
    adgroupApi.adgroupStatusUpdate(
      accessToken,
      {
        body: {
          adgroup_ids,
          advertiser_id,
          operation_status: 'DISABLE',
        },
      },
      (error: any, data: any) => {
        if (error) {
          console.error('广告组状态更新失败:', error);
          reject(error);
        } else {
          console.log('广告组状态更新成功:', data);
          resolve(data);
        }
      }
    );
  });
}

async function getIdentityVideoList(identity_id: string) {
  return fetch(
    `https://business-api.tiktok.com/open_api/v1.3/identity/video/get/?identity_type=BC_AUTH_TT&item_type=VIDEO&count=20&advertiser_id=${advertiser_id}&identity_authorized_bc_id=${BC_ID}&identity_id=${identity_id}`,
    {
      headers: {
        'Access-Token': accessToken!,
        'Content-Type': 'application/json',
      },
    }
  ).then((res) => res.json());
}

export {
  getBusinessCenterAccounts,
  uploadAdVideo,
  getVideoImage,
  createSparkAd,
  getSparkAd,
  adStatusUpdate,
  createCampaign,
  createAdGroup,
  adgroupStatusUpdate,
  getIdentityVideoList,
  pullSparkAd,
};
