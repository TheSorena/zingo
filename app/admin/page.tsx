import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { BetaAnalyticsDataClient } from '@google-analytics/data';
import { Analytics } from './components/Analytics';

async function getAnalyticsData() {
  try {
    if (!process.env.GA_CLIENT_EMAIL || !process.env.GA_PRIVATE_KEY || !process.env.GA_PROPERTY_ID) {
      console.error('Missing required Google Analytics credentials');
      return null;
    }

    const analyticsDataClient = new BetaAnalyticsDataClient({
      credentials: {
        client_email: process.env.GA_CLIENT_EMAIL,
        private_key: process.env.GA_PRIVATE_KEY.replace(/\\n/g, '\n'),
      },
    });

    const [response] = await analyticsDataClient.runReport({
      property: process.env.GA_PROPERTY_ID,
      dateRanges: [
        {
          startDate: '30daysAgo',
          endDate: 'today',
        },
      ],
      metrics: [
        { name: 'screenPageViews' },
        { name: 'sessions' },
        { name: 'totalUsers' },
      ],
    });

    return response;
  } catch (error) {
    console.error('Analytics Error:', error);
    return null;
  }
}

async function isAuthenticated() {
  const cookieStore = cookies();
  const authCookie = cookieStore.get('admin-auth');
  return authCookie?.value === 'authenticated';
}

export default async function Page() {
  if (!await isAuthenticated()) {
    redirect('/admin/login');
  }

  const analyticsData = await getAnalyticsData();

  if (!analyticsData) {
    return (
      <div className="p-8" dir="rtl">
        <h1 className="text-2xl font-bold mb-6 text-right">پنل مدیریت</h1>
        <p className="text-red-500 text-right">خطا در دریافت اطلاعات آنالیتیکس</p>
        <p className="text-gray-600 text-right mt-2">لطفاً تنظیمات گوگل آنالیتیکس را بررسی کنید</p>
      </div>
    );
  }

  return (
    <div className="p-8" dir="rtl">
      <h1 className="text-2xl font-bold mb-6 text-right">پنل مدیریت</h1>
      <Analytics data={analyticsData} />
    </div>
  );
} 