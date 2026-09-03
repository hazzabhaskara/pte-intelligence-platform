import { NextResponse } from 'next/server';
import { getDatabase, queryAll } from '@/lib/db';
import { exec } from 'child_process';
import util from 'util';
import path from 'path';

const execPromise = util.promisify(exec);

export async function GET() {
  try {
    const backups = queryAll(`
      SELECT backup_id, backup_type, file_path, file_size_bytes, checksum_sha256, created_at
      FROM backups
      ORDER BY created_at DESC
      LIMIT 10
    `);

    return NextResponse.json({ success: true, backups });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function POST() {
  try {
    const scriptPath = path.resolve(process.cwd(), 'scripts', 'backup_manager.py');
    const { stdout, stderr } = await execPromise(`python "${scriptPath}"`);

    const db = getDatabase();
    const latestBackup = db.prepare('SELECT * FROM backups ORDER BY created_at DESC LIMIT 1').get();

    return NextResponse.json({
      success: true,
      message: 'Backup lokal berhasil dibuat.',
      backup: latestBackup,
      stdout
    });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
