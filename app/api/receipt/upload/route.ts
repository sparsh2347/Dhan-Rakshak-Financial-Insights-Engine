import { NextRequest, NextResponse } from "next/server";
import { writeFile } from "fs/promises";
import path from "path";
import { spawn } from "child_process";
import { randomUUID } from "crypto";
import { GEMINI_API_KEY } from "@/config";
import os from "os";
import dotenv from "dotenv";
dotenv.config({ path: path.join(process.cwd(), "dhanrakshakh", ".env") });

export const POST = async (req: NextRequest) : Promise<Response> => {
  try {
    const formData = await req.formData();
    const file = formData.get("file") as File;

    if (!file || file.size === 0) {
      return NextResponse.json({ error: "No file uploaded" }, { status: 400 });
    }

    // Ensure uploads dir exists
    const uploadsDir = path.join(process.cwd(), "Receipt_Parsing", "uploads");
    const fileExt = path.extname(file.name);
    const fileName = `${Date.now()}_${randomUUID().slice(0, 5)}${fileExt}`;
    const fullPath = path.join(uploadsDir, fileName);

    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    await writeFile(fullPath, new Uint8Array(buffer));

    // console.log("📥 File saved at:", fullPath);
    // console.log("📦 File size:", buffer.length, "bytes");

    const pythonPath = "/usr/bin/python3"; // or just "python3" if env is set up
    const scriptPath = path.join(process.cwd(), "Receipt_Parsing", "extract.py");

    return await new Promise((resolve) => {
      // console.log("🔑 Loaded ENV Variables:");
      // console.log("GEMINI_API_KEY:", process.env.GEMINI_API_KEY + "...");
      // console.log("GOOGLE_APPLICATION_CREDENTIALS:", process.env.GOOGLE_APPLICATION_CREDENTIALS);
      // console.log("DOCUMENT_API_CREDENTIALS:", process.env.DOCUMENT_API_CREDENTIALS);

      const pyProcess = spawn(pythonPath, [scriptPath, fullPath], {
        env: {
          ...process.env,
          GEMINI_API_KEY: GEMINI_API_KEY,
          GOOGLE_APPLICATION_CREDENTIALS: process.env.GOOGLE_APPLICATION_CREDENTIALS!,
          DOCUMENT_API_CREDENTIALS: process.env.DOCUMENT_API_CREDENTIALS!,
        },
      });
      let stdoutChunks: string[] = [];
      let stderr="";
      pyProcess.stdout.on("data", (data) => {
        stdoutChunks.push(data.toString());
      });
      
      pyProcess.stderr.on("data", (data) => {
        stderr += data.toString();
      });
      
      pyProcess.on("close", (code) => {
        const stdout = stdoutChunks.join("").trim(); // ← ensure trailing newline isn't breaking JSON
        // console.log("before")
        // console.log(stdout)
        // console.log("after")

        if (code !== 0) {
          console.error("❌ Python script error:", stderr || stdout);
          resolve(
            NextResponse.json({ error: "Python script failed", details: stderr || stdout }, { status: 500 })
          );
        } else {
          try {
            const jsonStart = stdout.indexOf('{');
            const jsonEnd = stdout.lastIndexOf('}');
            const jsonString = stdout.slice(jsonStart, jsonEnd + 1);
            const parsed = JSON.parse(jsonString);
            console.log("✅ Final parsed receipt data:", parsed);
            resolve(NextResponse.json(parsed));
            // const match = stdout.match(/\{[\s\S]*\}/); // ← match first JSON-like object
            // // const match=stdout;
            // if (!match || !match[0]) throw new Error("No valid JSON found");

            // const parsed = JSON.parse(match[0]); // <- parse string to JS object
            // console.log("✅ Final parsed receipt data:", parsed);
            // resolve(NextResponse.json(parsed)); // may be this where it is failing can you check 
            
          } catch (err) {
            console.error("❌ Failed to parse Python output:",stdout);
            resolve(NextResponse.json({ error: "Invalid JSON output", raw: stdout }, { status: 500 }));
          }
        }
      });
      // console.log(stdout);
    });
  } catch (e: any) {
    console.error("❌ Unexpected error in route.ts:", e.message);
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
};


export const dynamic = 'force-dynamic';
