import { listenAndServe, ServerRequest } from "https://deno.land/std@0.65.0/http/mod.ts";
import { readAll } from "https://deno.land/std@0.167.0/streams/read_all.ts";

interface MessagePayload {
  message: string;
}

const BINDING = ":8000";

const decoder = new TextDecoder();
const messages: string[] = [];

function jsonResponse<TBody>(body: TBody, status = 200) {
  return {
    status,
    headers: new Headers({
      "Content-Type": "application/json",
    }),
    body: JSON.stringify(body),
  };
}

function textResponse(body: string, status = 200) {
  return {
    status,
    headers: new Headers({
      "Content-Type": "text/plain",
    }),
    body,
  };
}

async function addMessage({ body }: ServerRequest) {
  const { message }: MessagePayload = JSON.parse(
    decoder.decode(await readAll(body)),
  );
  console.log(`saving message: ${message}`)

  messages.push(message);

  return jsonResponse({ success: true }, 201);
}

function getMessages() {
  return jsonResponse(messages);
}

function methodNotAllowed({ method, url }: ServerRequest) {
  return textResponse(
    `${method} method not allowed for resource ${url}`,
    405,
  );
}

function notFound({ url }: ServerRequest) {
  return textResponse(`No resource found for ${url}`, 404);
}

function internalServerError({ message }: Error) {
  return textResponse(message, 500);
}


console.log(`Listening on ${BINDING}...`);


await listenAndServe(BINDING, async (req) => {
  let res = notFound(req);

  try {
    if (req.url === "/messages") {
      switch (req.method) {
        case "POST":
          res = await addMessage(req);
          break;
        case "GET":
          res = getMessages();
          break;
        default:
          res = methodNotAllowed(req);
      }
    }
  } catch (e) {
    res = internalServerError(e);
  }


  req.respond(res);
});