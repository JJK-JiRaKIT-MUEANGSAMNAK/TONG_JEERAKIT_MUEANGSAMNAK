import { describe, it, expect } from 'vitest';
import * as fs from 'fs';
import * as path from 'path';

describe('Security Migrations Static Analysis', () => {
  const getMigration = (filename: string) => {
    const fullPath = path.join(__dirname, '../supabase/migrations', filename);
    return fs.readFileSync(fullPath, 'utf8');
  };

  it('PERMISSIONS: ไม่มี ADMIN ใน migrations', () => {
    const m1 = getMigration('20260924000001_business_schema_and_finance_security.sql');
    expect(m1).not.toMatch(/'ADMIN'/);
    expect(m1).not.toMatch(/role = 'ADMIN'/);
  });

  it('PERMISSIONS: role CHECK OWNER/USER', () => {
    const m1 = getMigration('20260924000001_business_schema_and_finance_security.sql');
    expect(m1).toMatch(/CHECK\s*\(\s*role\s*IN\s*\('OWNER',\s*'USER'\)\s*\)/i);
  });

  it('PERMISSIONS: ไม่มี authenticated FOR ALL', () => {
    const m1 = getMigration('20260924000001_business_schema_and_finance_security.sql');
    const lines = m1.split('\n').filter(l => l.includes('ON public.permissions') && l.includes('FOR ALL'));
    expect(lines.length).toBe(0);
  });

  it('FINANCE PRIVILEGES: REVOKE ALL ก่อน GRANT', () => {
    const m1 = getMigration('20260924000001_business_schema_and_finance_security.sql');
    const tables = ['bills', 'payment_batches', 'statement_transactions', 'audit_logs'];
    for (const t of tables) {
      expect(m1).toMatch(new RegExp(`REVOKE ALL PRIVILEGES ON TABLE public\\.${t} FROM PUBLIC;`, 'i'));
      expect(m1).toMatch(new RegExp(`REVOKE ALL PRIVILEGES ON TABLE public\\.${t} FROM anon;`, 'i'));
      expect(m1).toMatch(new RegExp(`REVOKE ALL PRIVILEGES ON TABLE public\\.${t} FROM authenticated;`, 'i'));
    }
  });

  it('FINANCE PRIVILEGES: GRANT authenticated', () => {
    const m1 = getMigration('20260924000001_business_schema_and_finance_security.sql');
    expect(m1).toMatch(/GRANT SELECT,\s*INSERT,\s*UPDATE ON TABLE public\.bills TO authenticated;/i);
    expect(m1).not.toMatch(/GRANT.*DELETE.*ON TABLE public\.bills TO authenticated/i);
    expect(m1).not.toMatch(/GRANT.*TRUNCATE.*ON TABLE public\.bills TO authenticated/i);
    expect(m1).toMatch(/GRANT SELECT ON TABLE public\.payment_batches TO authenticated;/i);
    expect(m1).toMatch(/GRANT SELECT ON TABLE public\.statement_transactions TO authenticated;/i);
    expect(m1).toMatch(/GRANT SELECT ON TABLE public\.audit_logs TO authenticated;/i);
  });

  it('FINANCE PRIVILEGES: anon/PUBLIC ไม่มี grant บน 4 tables', () => {
    const m1 = getMigration('20260924000001_business_schema_and_finance_security.sql');
    const tables = ['bills', 'payment_batches', 'statement_transactions', 'audit_logs'];
    for (const t of tables) {
      expect(m1).not.toMatch(new RegExp(`GRANT.*ON TABLE public\\.${t} TO anon`, 'i'));
      expect(m1).not.toMatch(new RegExp(`GRANT.*ON TABLE public\\.${t} TO PUBLIC`, 'i'));
    }
  });

  it('STOCK MOVEMENTS: actor identity check', () => {
    const m1 = getMigration('20260924000001_business_schema_and_finance_security.sql');
    expect(m1).toMatch(/ON public\.stock_movements FOR INSERT TO authenticated WITH CHECK \(actor_user_id = auth\.uid\(\)::text\)/i);
  });

  it('STOCK MOVEMENTS: ไม่มี FOR ALL', () => {
    const m1 = getMigration('20260924000001_business_schema_and_finance_security.sql');
    const lines = m1.split('\n').filter(l => l.includes('ON public.stock_movements') && l.includes('FOR ALL'));
    expect(lines.length).toBe(0);
  });

  it('STOCK MOVEMENTS: ไม่มี UPDATE/DELETE policy', () => {
    const m1 = getMigration('20260924000001_business_schema_and_finance_security.sql');
    expect(m1).not.toMatch(/POLICY.*ON public\.stock_movements FOR UPDATE/i);
    expect(m1).not.toMatch(/POLICY.*ON public\.stock_movements FOR DELETE/i);
  });

  it('SYSTEM SECRETS: server-side only (ไม่มี authenticated/anon)', () => {
    const m5 = getMigration('20260924000005_settings_schema.sql');
    expect(m5).not.toMatch(/POLICY.*ON public\.system_secrets/i);
  });

  it('AI SOCIAL: status ไม่มี PUBLISHED และมี DRAFT/PENDING_APPROVAL/APPROVED/REJECTED', () => {
    const m6 = getMigration('20260924000006_ai_social_schema.sql');
    expect(m6).not.toMatch(/'PUBLISHED'/);
    expect(m6).toMatch(/CHECK\s*\(\s*status\s*IN\s*\('DRAFT',\s*'PENDING_APPROVAL',\s*'APPROVED',\s*'REJECTED'\)\s*\)/i);
  });

  it('AI SOCIAL: ไม่มี authenticated FOR ALL', () => {
    const m6 = getMigration('20260924000006_ai_social_schema.sql');
    const lines = m6.split('\n').filter(l => l.includes('ON public.ai_social_drafts') && l.includes('FOR ALL'));
    expect(lines.length).toBe(0);
  });
});
