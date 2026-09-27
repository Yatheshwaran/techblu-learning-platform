export async function POST(request: Request) {
  try {
    const body = await request.json();

    const response = await fetch("http://localhost:5000/api/execute", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
    });

    const text = await response.text();

    return new Response(text, {
      status: response.status,
      headers: {
        "Content-Type":
          response.headers.get("Content-Type") ||
          "application/json",
      },
    });
  } catch (error) {
    console.error("Compiler proxy error:", error);

    return Response.json(
      {
        success: false,
        error: "Could not connect to the TechBlu compiler backend.",
      },
      { status: 500 }
    );
  }
}