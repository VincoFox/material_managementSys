import { getServerClient } from '@/lib/supabase/server';
import { TASK_CREATE_URL, TASK_VIDEO_STORYBOARD_URL } from '@/config';

export async function startStartTask(url: string, payload: any) {
  return fetch(TASK_CREATE_URL!, {
    method: 'POST',
    body: JSON.stringify({ payload, url, queue_name: 'ai-task-queue' }),
    headers: {
      'Content-Type': 'application/json',
    },
  });
}

export async function startAI(material_id: number, video_path: string) {
  try {
    return startStartTask(TASK_VIDEO_STORYBOARD_URL!, {
      material_id,
      video_path,
    }).then(async (res) => {
      const responseData = await res.json();
      const status = res.status;
      if (res.ok) {
        const supabase = await getServerClient();

        console.log('responseData=========', responseData);
        const { data, error } = await supabase
          .from('material')
          .update({
            ai_process_status: 'Scheduled',
            ai_process_task_id: responseData.task?.name,
          })
          .eq('material_id', material_id);
        if (error) {
          console.error('[startAI]===Failed to update material:', error);
          throw new Error(error.message);
        }
      }
      return { ...responseData, status };
    });
  } catch (e: unknown) {
    console.error('[startAI]====error:', e);
    throw new Error((e as Error).message || 'Internal Server Error');
  }
}
