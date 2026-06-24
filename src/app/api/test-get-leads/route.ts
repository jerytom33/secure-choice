import fs from 'fs';
import path from 'path';

export async function GET() {
  try {
    const mockPath = path.join(process.cwd(), 'src', 'lib', 'mock_db.json');
    if (!fs.existsSync(mockPath)) {
      return new Response(JSON.stringify({ health: [], life: [], general: [], consultation: [] }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    const content = fs.readFileSync(mockPath, 'utf-8');
    const db = JSON.parse(content);
    return new Response(JSON.stringify(db), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (err) {
    return new Response(JSON.stringify({ error: String(err) }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}
