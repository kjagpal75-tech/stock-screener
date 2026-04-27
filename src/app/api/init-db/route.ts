import { NextResponse } from 'next/server';
import { query } from '@/lib/db';
import { readFileSync } from 'fs';
import { join } from 'path';

export async function GET() {
  try {
    const schemaPath = join(process.cwd(), 'src/lib/schema.sql');
    const schema = readFileSync(schemaPath, 'utf-8');
    
    const statements = schema.split(';').filter(s => s.trim());
    
    for (const statement of statements) {
      await query(statement);
    }
    
    // Add new columns if they don't exist (for existing databases)
    try {
      await query(`ALTER TABLE stocks ADD COLUMN IF NOT EXISTS exchange VARCHAR(20)`);
      await query(`CREATE INDEX IF NOT EXISTS idx_stocks_exchange ON stocks(exchange)`);
    } catch (alterError) {
      // Ignore errors if columns already exist
      console.log('Columns may already exist:', alterError);
    }
    
    return NextResponse.json({ success: true, message: 'Database schema initialized successfully' });
  } catch (error) {
    console.error('Error initializing database:', error);
    return NextResponse.json({ success: false, error: String(error) }, { status: 500 });
  }
}
