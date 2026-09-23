import { NextRequest } from 'next/server';
import { apiUrl } from '../../../../lib/config';
import { handleListRoute } from '../../../../lib/list-route';

export async function GET(request: NextRequest) {
  return handleListRoute(
    request,
    (page) =>
      `${apiUrl}/api/poster/by/filtres/27/0/created/${page}/4F5A9C3D9A86FA54EACEDDD635185/`,
    'Error fetching best series:'
  );
}
