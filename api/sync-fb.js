import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://bqrozmqorvxpwjfmgkfk.supabase.co';
const SUPABASE_KEY = 'sb_publishable_7Z1DuZXAl9jtDFgGbZJEVg_FJnZbI_l';

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

export default async function handler(req, res) {
  // Set CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  try {
    // Robustly extract parameters from query or body (supports GET, POST JSON, form-encoded)
    let data = { ...(req.query || {}) };
    if (req.body) {
      if (typeof req.body === 'string') {
        try {
          const json = JSON.parse(req.body);
          data = { ...data, ...json };
        } catch {
          try {
            const params = Object.fromEntries(new URLSearchParams(req.body));
            data = { ...data, ...params };
          } catch {}
        }
      } else if (typeof req.body === 'object') {
        data = { ...data, ...req.body };
      }
    }

    const rawId = data.id || data.post_id || data.news_id || Date.now().toString();
    const rawMessage = data.message || data.content || data.title || data.story || 'Bản tin hoạt động từ Fanpage Tuổi trẻ THPT Quang Trung - Đông Giang';
    const rawPicture = data.picture || data.image_url || data.full_picture || data.image || '/images/fb/chunhatxanh_2026.jpg';

    // Format news_id
    const newsId = rawId.startsWith('fb-') ? rawId : `fb-${rawId}`;

    // Clean title from first line of message (max 150 chars)
    const firstLine = rawMessage.split('\n')[0].trim();
    const title = firstLine.length > 5 ? firstLine.substring(0, 150) : 'Bản tin hoạt động Đoàn trường THPT Quang Trung - Đông Giang';

    // Clean excerpt
    const excerpt = rawMessage.length > 180 ? rawMessage.substring(0, 180) + '...' : rawMessage;

    const row = {
      news_id: newsId,
      title: title,
      excerpt: excerpt,
      content: rawMessage,
      image_url: rawPicture,
      category: 'news',
      author_name: 'Tuổi trẻ THPT Quang Trung - Đông Giang',
      tags: ['Facebook', 'Đoàn Trường', 'Tuổi Trẻ Quang Trung'],
      urgency: 'normal',
      is_pinned: false,
      is_hidden: false,
      views: 1,
      is_deleted: false
    };

    const { data: inserted, error } = await supabase
      .from('news')
      .upsert(row, { onConflict: 'news_id' })
      .select();

    if (error) {
      console.error('Supabase error:', error);
      return res.status(500).json({ error: error.message });
    }

    return res.status(200).json({
      success: true,
      message: 'Synced post successfully to Supabase',
      post: inserted ? inserted[0] : row
    });
  } catch (err) {
    console.error('Handler error:', err);
    return res.status(500).json({ error: err.message });
  }
}
