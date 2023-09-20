import { notFound, parseBucketPath } from "@/utils/bucket";

export async function onRequestGet(context) {
  const [bucket, path] = parseBucketPath(context);
  if (!bucket) return notFound();

  const obj = await bucket.get(path);
  if (obj === null) return notFound();

  const url = new URL(context.request.url);

  // Check if the URL contains "/download/"
  if (url.pathname.includes('/download/')) {
    const fileUrl = url.href.replace('/download/', '/'); // Remove "/download/" from the URL

    // Fetch the content from the raw link and set appropriate headers for download
    const response = await fetch(fileUrl);

    if (response.status === 404) {
      return new Response('File not found', { status: 404 });
    }

    const headers = new Headers(response.headers);
    headers.set('Content-Disposition', 'attachment'); // Set content disposition to "attachment"

    return new Response(response.body, {
      status: response.status,
      statusText: response.statusText,
      headers: headers,
    });
  } else {
    // Regular view behavior with appropriate headers
    const headers = new Headers();
    obj.writeHttpMetadata(headers);
    if (path.startsWith("_$flaredrive$/thumbnails/"))
      headers.set("Cache-Control", "max-age=31536000");

    return new Response(obj.body, { headers });
  }
}
