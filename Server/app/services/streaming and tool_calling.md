A (streaming and tool call - combined) response, at the server-side is not a single process,
but we are essentially running a loop, The models streams back either text or a signal for a tool call.
You handle it and decide whether to loop again or stop.

Phase 1 - The first streaming request
prompt - you -> groq, with stream = True and tools = tools_array

The model gets the prompt and decides to one of the two things:

1. Stream back text tokens directly i,e decides to invoke no tool calls.
2. streams back tool call deltas

So,
Streaming and tool calling, both can't happen at the same time, in a single turn.
If the model decides to call a tool, it won't produce text and vice versa. So, you are only handling
one thing at a time.

Phase 2 - Accumulating Tool call deltas
This is the tricky part. Tool calls in a stream response are also sent in deltas, not all at once,
so you need to accumulate the various parts of a tool call. The function name and arguments come fragmented
and they are what we need to accumulate across various chunks.

Each chunk comes with an index to tell you which tool call they belong to, think of it as an id for a tool call,
as we can have multiple tool calls in out tools array

So, keep a dict keyed by index (the tool call index)
concatenate function name and arguments strings at the coming of each chunk.

Only parse the arguments JSON for a function after the stream is fully done.
Do not try to parse args into json or do anything with the tool_call, wait till the finish_reason = "tool_calls"

Phase 3 - Checking finish_reason
Each chunk has a finish_reason. Most chunks have it as None - only the last chunk ll carry the real
semantic signal.

various values -

1. stop - the model is done, no tools needed, stream is complete.
2. tool_calls - the model wants to call on or more tools -> stop streaming and act

Phase 4 - Executing Tools
When the model ends with reason = tool_calls, Parse arguments to json and execute the actual function

Do's -
Execute tools yourself.
Return a string as the result.
Handle errors and even then return a string as the model needs something to continue.

Dont's -
Never trust model arguments. Always validat before passing to real functions.
LEt the tool executor block the async event loop

Phase 5 - Rebuilding the message history
After the tool execution, two items need to be appended to the message history.

1. The assistant message consiting of the tool call(s) it requested, this must include the tool_calls array
   with the id, function name and args exactly as groq sent.
   i,e, { role: "assistant", tool_calls = [ { id, function_name, function_arguments }, { ... } ] }

2. One tool msg per tool call - {
   tool_call_id: tool_call.id, role: "tool"
   }

The assistant msg must come before the tool call result message. And every result message must match one of the
tool calls in the assistant message

Phase 6 - The Loop

After appending the tool results, you send the entire updated message history back to Groq again — with streaming enabled again. Now the model reads its own tool call, your result, and generates a final response.
This again streams back text (usually), and you yield those tokens to your client.

The model could theoretically call another tool here too, which is why the proper pattern is a while loop that only exits when finish_reason == "stop". Most simple cases are just two passes (one tool call, one final response), but don't hardcode that assumption.

FastAPI / SSE Specific Do's and Don'ts
Do:

Use StreamingResponse with media-type: text/event-stream
Add the header X-Accel-Buffering: no — without this, nginx will buffer your chunks and the client won't see them in real time
Add Cache-Control: no-cache as well
Use async def for your generator and sprinkle await asyncio.sleep(0) after each yield — this yields control back to the event loop so FastAPI can actually flush the chunk to the client. Without this, you'll get all chunks dumped at once at the end.

Do not:

Use a regular def generator with a sync Groq client inside an async context without an executor — you'll block the event loop
Forget that the Groq Python client's streaming is synchronous by default — if you want true async, use httpx directly or wrap the sync call in run_in_executor
Stream raw text to the client without a structured envelope — always include a type field (like text, tool_call, done) so your frontend knows what it's receiving

-- Groq api documentation on tool calling
