import { NextRequest, NextResponse } from "next/server";
import { writeFile } from "fs/promises";
import path from "path";
import { spawn } from "child_process";
import { randomUUID } from "crypto";
import dotenv from "dotenv";
import { GEMINI_API_KEY } from "@/config";

dotenv.config({ path: path.join(process.cwd(), "Receipt_Parsing", ".env") });

export const POST = async (req: NextRequest): Promise<Response> => {
  try {
    const formData = await req.formData();
    const file = formData.get("file") as File;

    if (!file || file.size === 0) {
      return NextResponse.json({ error: "No file uploaded" }, { status: 400 });
    }

    const uploadsDir = path.join(process.cwd(), "Tax_optimizer", "uploads");
    const fileExt = path.extname(file.name);
    const fileName = `${Date.now()}_${randomUUID().slice(0, 5)}${fileExt}`;
    const fullPath = path.join(uploadsDir, fileName);

    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    await writeFile(fullPath, new Uint8Array(buffer));

    console.log("📥 File saved at:", fullPath);
    console.log("📦 File size:", buffer.length, "bytes");

    const pythonPath = "/usr/bin/python3";
    const scriptPath = path.join(process.cwd(), "Tax_optimizer", "form16_parser.py");

    return await new Promise((resolve) => {

      console.log("geminikey")
      console.log(process.env.GEMINI_API_KEY);
      const pyProcess = spawn(pythonPath, [scriptPath, fullPath], {
        env: {
          ...process.env,
          GEMINI_API_KEY: process.env.GEMINI_API_KEY,
          GOOGLE_APPLICATION_CREDENTIALS: process.env.GOOGLE_APPLICATION_CREDENTIALS!,
          DOCUMENT_API_CREDENTIALS: process.env.DOCUMENT_API_CREDENTIALS!,
        },
      });


      let stdoutChunks: string[] = [];
      let stderr = "";

      pyProcess.stdout.on("data", (data) => {
        stdoutChunks.push(data.toString());
      });

      pyProcess.stderr.on("data", (data) => {
        stderr += data.toString();
      });

      pyProcess.on("close", (code) => {
        // Inside pyProcess.on("close", (code) => { ... })
      const stdout = stdoutChunks.join("").trim();

      if (code !== 0) {
        console.error("❌ Python script error:", stderr || stdout);
        resolve(
          NextResponse.json({ error: "Python script failed", details: stderr || stdout }, { status: 500 })
        );
        return;
      }

      try {
        const parsed = JSON.parse(stdout); // Direct parse now!
        console.log("✅ Parsed result:", parsed);
        resolve(NextResponse.json(parsed));
      } catch (jsonErr) {
        console.error("❌ JSON parse failed:", jsonErr);
        resolve(
          NextResponse.json({ error: "Invalid JSON from Python", raw: stdout }, { status: 500 })
        );
      }

        
      });
    });
  } catch (e: any) {
    console.error("❌ Unexpected error in route.ts:", e.message);
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
};


export const dynamic = 'force-dynamic';
