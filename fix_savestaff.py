import re

# Read the file
with open('admin_dashboard.html', 'r', encoding='utf-8') as f:
    content = f.read()

# Find and replace the saveStaff function
old_function = r'async function saveStaff\(\) \{[^}]*?(?:let password[^}]*?\}\s*\}\s*\})'

new_function = '''async function saveStaff() {
            const name = document.getElementById('staffName').value.trim();
            const email = document.getElementById('staffEmail').value.trim();
            const phone = document.getElementById('staffPhone').value.trim();
            const roleId = document.getElementById('staffRoleSelect').value;
            
            if (!name || !email || !roleId) {
                showToast('Please fill in all required fields', 'error');
                return;
            }
            
            try {
                // Simply add staff record - no auth creation needed
                // Staff will login using customer login (Google/SMS)
                const { error: staffError } = await _supabase.from('staff').insert([{
                    name,
                    email,
                    phone: phone || null,
                    role_id: roleId
                }]);
                
                if (staffError) throw staffError;
                
                showToast(`Staff member added! ${name} can now login using customer login (Google/SMS)`, 'success');
                
                closeStaffModal();
                fetchStaff();
            } catch (err) {
                console.error('Save staff error:', err);
                showToast('Failed to add staff: ' + err.message, 'error');
            }
        }'''

# Try to find the exact pattern
pattern = r'(async function saveStaff\(\) \{.*?console\.error\(\'Save staff error:\', err\);.*?showToast\(.*?\);.*?\}.*?\})'

result = re.sub(pattern, new_function, content, flags=re.DOTALL)

with open('admin_dashboard.html', 'w', encoding='utf-8') as f:
    f.write(result)

print("Fixed saveStaff function!")
