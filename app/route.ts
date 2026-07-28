export async function GET(request: Request) {
  return Response.redirect(new URL("/home.html", request.url), 302);
}
