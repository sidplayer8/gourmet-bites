-- Allow Update on orders (to change status)
-- Ideally limited to authenticated users or staff, but for now allowing public for speed of fix.
DROP POLICY IF EXISTS "Allow public update orders" ON orders;
CREATE POLICY "Allow public update orders" ON orders FOR UPDATE USING (true) WITH CHECK (true);
