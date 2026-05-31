export default defineEventHandler((event) => {
    setResponseHeaders(event, {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods":
            "GET, HEAD, PUT, PATCH, POST, DELETE, OPTIONS",
        "Access-Control-Allow-Headers":
            "Content-Type, Authorization, X-Requested-With, Accept, Origin",
        "Access-Control-Max-Age": "86400",
    });

    if (event.method === "OPTIONS") {
        setResponseStatus(event, 204);
        return "";
    }
});
