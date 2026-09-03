import { NextResponse } from 'next/server';
import { exec } from 'node:child_process';
import { promisify } from 'node:util';
import path from 'node:path';

const execAsync = promisify(exec);

export async function GET() {
  try {
    const scriptPath = path.resolve(process.cwd(), 'scripts', 'hardware_probe.py');
    const { stdout } = await execAsync(`python "${scriptPath}"`, { timeout: 10000 });
    const data = JSON.parse(stdout);
    return NextResponse.json({ success: true, data });
  } catch (error: any) {
    return NextResponse.json({
      success: false,
      error: error.message || 'Failed to execute hardware probe'
    }, { status: 500 });
  }
}
